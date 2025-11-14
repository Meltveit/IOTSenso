// Filsti: src/components/sensors/SensorDetailsClient.tsx

"use client";

import { useState, useEffect } from "react";
import type { Sensor, SensorStatus } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertCircle, BrainCircuit, Check, Loader2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { recommendThresholds, RecommendThresholdsOutput } from "@/ai/flows/smart-threshold-recommendation";
import { predictiveMaintenanceAnalysis, PredictiveMaintenanceOutput } from "@/ai/flows/predictive-maintenance-analysis";
import { Progress } from "../ui/progress";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const chartConfig = {
  value: {
    label: "Verdi",
    color: "hsl(var(--chart-1))",
  },
  humidityValue: {
    label: "Fuktighet",
    color: "hsl(var(--chart-5))",
  },
  weightValue: {
    label: "Vekt",
    color: "hsl(var(--chart-2))",
  },
  temperatureValue: {
    label: "Temperatur",
    color: "hsl(var(--chart-3))",
  },
  upper: {
    label: "Øvre grense",
    color: "hsl(var(--chart-3))",
  },
  lower: {
    label: "Nedre grense",
    color: "hsl(var(--chart-4))",
  },
  warning: {
    label: "Advarsel",
    color: "hsl(var(--chart-2))",
  },
  critical: {
    label: "Kritisk",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export default function SensorDetailsClient({
  initialSensor,
}: {
  initialSensor: Sensor;
}) {
  const [sensor, setSensor] = useState(initialSensor);
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveMaintenanceOutput | null>(null);

  // State for toggling chart lines visibility
  const [visibleLines, setVisibleLines] = useState({
    value: true,
    humidityValue: true,
    weightValue: true,
    temperatureValue: true,
  });

  // Oppdater sensor state når initialSensor endres (real-time updates)
  useEffect(() => {
    setSensor(initialSensor);
  }, [initialSensor]);

  const statusColors: Record<SensorStatus, string> = {
    ok: "bg-green-500/20 text-green-700 border-green-500/30",
    pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    warning: "bg-accent/20 text-accent-foreground border-accent/30",
    critical: "bg-destructive/20 text-destructive border-destructive/30",
    offline: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  };

  const handleSaveSettings = async () => {
    if (!user) {
      toast({
        title: "Feil",
        description: "Du må være innlogget for å lagre innstillinger.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const sensorRef = doc(db, "users", user.uid, "sensors", sensor.id);
      
      await updateDoc(sensorRef, {
        thresholds: sensor.thresholds,
        updatedAt: new Date(),
      });

      toast({
        title: "Innstillinger lagret",
        description: "Terskelverdi-innstillingene er oppdatert.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Kunne ikke lagre",
        description: "Det oppsto en feil ved lagring. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestThresholds = async () => {
    setIsLoadingThresholds(true);
    try {
      const result = await recommendThresholds({
        sensorType: sensor.type,
        historicalData: JSON.stringify(sensor.data),
        industry: "manufacturing",
      });
      
      setSensor(prev => ({
        ...prev,
        thresholds: {
          ...prev.thresholds,
          warning: result.warningThreshold,
          critical: result.criticalThreshold,
        }
      }));
      
      toast({
        title: "AI-forslag anvendt",
        description: result.explanation,
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        title: "Kunne ikke hente forslag",
        description: "Det oppsto en feil ved AI-analyse.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingThresholds(false);
    }
  };

  const handlePredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await predictiveMaintenanceAnalysis({
        sensorData: JSON.stringify(sensor.data),
        equipmentType: sensor.equipmentType || "standard",
        maintenanceHistory: JSON.stringify(sensor.maintenanceHistory || []),
      });
      
      setAnalysisResult(result);
      
      toast({
        title: "Analyse fullført",
        description: `Konfidensgrad: ${(result.confidenceLevel * 100).toFixed(0)}%`,
      });
    } catch (error) {
      console.error("Error running predictive analysis:", error);
      toast({
        title: "Analyse feilet",
        description: "Det oppsto en feil ved kjøring av analyse.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Determine available measurements based on sensor type
  const getMeasurements = () => {
    const measurements: Array<{ key: string; label: string; unit: string }> = [];

    switch (sensor.type) {
      case 'temp_humidity':
        measurements.push(
          { key: 'value', label: 'Temperatur', unit: '°C' },
          { key: 'humidityValue', label: 'Fuktighet', unit: '%' }
        );
        break;
      case 'water_weight':
        measurements.push(
          { key: 'value', label: 'Vannstand', unit: 'cm' },
          { key: 'weightValue', label: 'Vekt', unit: 'kg' }
        );
        break;
      case 'weight_temp':
        measurements.push(
          { key: 'value', label: 'Vekt', unit: 'kg' },
          { key: 'temperatureValue', label: 'Temperatur', unit: '°C' }
        );
        break;
      case 'co2_humidity':
        measurements.push(
          { key: 'co2Value', label: 'CO2', unit: 'ppm' },
          { key: 'humidityValue', label: 'Fuktighet', unit: '%' }
        );
        break;
      default:
        measurements.push({ key: 'value', label: 'Verdi', unit: sensor.unit });
    }

    return measurements;
  };

  const availableMeasurements = getMeasurements();

  // Formater data for grafen
  const chartData = sensor.data?.map(reading => ({
    timestamp: reading.timestamp instanceof Date
      ? reading.timestamp.getTime()
      : reading.timestamp?.toDate?.().getTime() || Date.now(),
    value: reading.value,
    humidityValue: reading.humidityValue,
    weightValue: reading.weightValue,
    temperatureValue: reading.temperatureValue,
    co2Value: reading.co2Value,
    formattedTime: format(
      reading.timestamp instanceof Date
        ? reading.timestamp
        : reading.timestamp?.toDate?.() || new Date(),
      "dd.MM HH:mm"
    ),
  })) || [];

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline">{sensor.name}</CardTitle>
              <Badge className={cn("border", statusColors[sensor.status])}>
                {sensor.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>{sensor.location || "Ingen plassering angitt"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="text-5xl font-bold font-headline text-primary">
                {sensor.currentValue.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{sensor.unit}</div>

              {sensor.humidityValue !== undefined && sensor.type === 'temp_humidity' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-3xl font-bold font-headline text-blue-600">
                    {sensor.humidityValue.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Fuktighet</div>
                </div>
              )}

              {sensor.weightValue !== undefined && sensor.type === 'water_weight' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-3xl font-bold font-headline text-green-600">
                    {sensor.weightValue.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Vekt</div>
                </div>
              )}

              {sensor.temperatureValue !== undefined && sensor.type === 'weight_temp' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-3xl font-bold font-headline text-orange-600">
                    {sensor.temperatureValue.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Temperatur</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{sensor.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Batteri</div>
                <div className="font-medium">{sensor.batteryLevel}%</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Sist kommunikasjon</div>
                <div className="font-medium text-sm">
                  {sensor.lastCommunication
                    ? format(
                        sensor.lastCommunication instanceof Date
                          ? sensor.lastCommunication
                          : sensor.lastCommunication.toDate(),
                        "dd.MM.yyyy HH:mm"
                      )
                    : "Aldri"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Result */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">AI Analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Konfidensgrad</span>
                  <span className="text-sm text-muted-foreground">
                    {(analysisResult.confidenceLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={analysisResult.confidenceLevel * 100} />
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Feilprediksjon:</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.failurePrediction}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Anbefalte tiltak:</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.recommendedActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Chart Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-headline">Historisk data</CardTitle>
                <CardDescription>Siste 50 målinger</CardDescription>
              </div>
              {availableMeasurements.length > 1 && (
                <div className="flex flex-col gap-2">
                  {availableMeasurements.map((measurement) => (
                    <div key={measurement.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`toggle-${measurement.key}`}
                        checked={visibleLines[measurement.key as keyof typeof visibleLines]}
                        onCheckedChange={(checked) =>
                          setVisibleLines((prev) => ({
                            ...prev,
                            [measurement.key]: checked === true,
                          }))
                        }
                      />
                      <label
                        htmlFor={`toggle-${measurement.key}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {measurement.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="formattedTime"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  
                  {/* Threshold lines */}
                  {/* Warning thresholds */}
                  {sensor.thresholds.warning?.upper !== undefined && (
                    <ReferenceLine
                      y={sensor.thresholds.warning.upper}
                      stroke="hsl(var(--chart-2))"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      label={{ value: `Advarsel øvre: ${sensor.thresholds.warning.upper}`, position: "right", fill: "hsl(var(--chart-2))" }}
                    />
                  )}
                  {sensor.thresholds.warning?.lower !== undefined && (
                    <ReferenceLine
                      y={sensor.thresholds.warning.lower}
                      stroke="hsl(var(--chart-2))"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      label={{ value: `Advarsel nedre: ${sensor.thresholds.warning.lower}`, position: "right", fill: "hsl(var(--chart-2))" }}
                    />
                  )}
                  {/* Critical thresholds */}
                  {sensor.thresholds.critical?.upper !== undefined && (
                    <ReferenceLine
                      y={sensor.thresholds.critical.upper}
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      label={{ value: `Kritisk øvre: ${sensor.thresholds.critical.upper}`, position: "right", fill: "hsl(var(--destructive))" }}
                    />
                  )}
                  {sensor.thresholds.critical?.lower !== undefined && (
                    <ReferenceLine
                      y={sensor.thresholds.critical.lower}
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      label={{ value: `Kritisk nedre: ${sensor.thresholds.critical.lower}`, position: "right", fill: "hsl(var(--destructive))" }}
                    />
                  )}

                  {/* Render Area components for each visible measurement */}
                  {visibleLines.value && (
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                      animationDuration={1000}
                      name={availableMeasurements.find(m => m.key === 'value')?.label || 'Verdi'}
                    />
                  )}
                  {visibleLines.humidityValue && sensor.type === 'temp_humidity' && (
                    <Area
                      type="monotone"
                      dataKey="humidityValue"
                      stroke="hsl(var(--chart-5))"
                      strokeWidth={2}
                      fill="url(#colorHumidity)"
                      animationDuration={1000}
                      name="Fuktighet"
                    />
                  )}
                  {visibleLines.weightValue && sensor.type === 'water_weight' && (
                    <Area
                      type="monotone"
                      dataKey="weightValue"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      fill="url(#colorWeight)"
                      animationDuration={1000}
                      name="Vekt"
                    />
                  )}
                  {visibleLines.temperatureValue && sensor.type === 'weight_temp' && (
                    <Area
                      type="monotone"
                      dataKey="temperatureValue"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      fill="url(#colorTemperature)"
                      animationDuration={1000}
                      name="Temperatur"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sensorinnstillinger</CardTitle>
            <CardDescription>Juster terskelverdier manuelt eller med AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Terskler for {sensor.type === 'temp_humidity' ? 'Temperatur' : sensor.type === 'water_weight' ? 'Vannstand' : sensor.type === 'weight_temp' ? 'Vekt' : 'CO2'} ({sensor.unit})
              </h3>

              {/* Warning thresholds */}
              <div className="space-y-3 p-3 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20">
                <Label className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Advarsel-terskel</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warning-lower" className="flex items-center gap-2 text-xs">
                      <TrendingDown className="h-3 w-3" />
                      Nedre grense
                    </Label>
                    <Input
                      id="warning-lower"
                      type="number"
                      step="0.1"
                      value={sensor.thresholds.warning.lower || ""}
                      placeholder="Valgfritt"
                      onChange={(e) =>
                        setSensor({
                          ...sensor,
                          thresholds: {
                            ...sensor.thresholds,
                            warning: {
                              ...sensor.thresholds.warning,
                              lower: e.target.value ? Number(e.target.value) : undefined
                            }
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Varsel hvis under
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warning-upper" className="flex items-center gap-2 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      Øvre grense
                    </Label>
                    <Input
                      id="warning-upper"
                      type="number"
                      step="0.1"
                      value={sensor.thresholds.warning.upper || ""}
                      placeholder="Valgfritt"
                      onChange={(e) =>
                        setSensor({
                          ...sensor,
                          thresholds: {
                            ...sensor.thresholds,
                            warning: {
                              ...sensor.thresholds.warning,
                              upper: e.target.value ? Number(e.target.value) : undefined
                            }
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Varsel hvis over
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical thresholds */}
              <div className="space-y-3 p-3 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <Label className="text-sm font-medium text-red-700 dark:text-red-400">Kritisk terskel</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="critical-lower" className="flex items-center gap-2 text-xs">
                      <TrendingDown className="h-3 w-3" />
                      Nedre grense
                    </Label>
                    <Input
                      id="critical-lower"
                      type="number"
                      step="0.1"
                      value={sensor.thresholds.critical.lower || ""}
                      placeholder="Valgfritt"
                      onChange={(e) =>
                        setSensor({
                          ...sensor,
                          thresholds: {
                            ...sensor.thresholds,
                            critical: {
                              ...sensor.thresholds.critical,
                              lower: e.target.value ? Number(e.target.value) : undefined
                            }
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Kritisk hvis under
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="critical-upper" className="flex items-center gap-2 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      Øvre grense
                    </Label>
                    <Input
                      id="critical-upper"
                      type="number"
                      step="0.1"
                      value={sensor.thresholds.critical.upper || ""}
                      placeholder="Valgfritt"
                      onChange={(e) =>
                        setSensor({
                          ...sensor,
                          thresholds: {
                            ...sensor.thresholds,
                            critical: {
                              ...sensor.thresholds.critical,
                              upper: e.target.value ? Number(e.target.value) : undefined
                            }
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Kritisk hvis over
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary thresholds for multi-value sensors */}
            {(sensor.type === 'temp_humidity' || sensor.type === 'water_weight' || sensor.type === 'weight_temp' || sensor.type === 'co2_humidity') && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  Terskler for {sensor.type === 'temp_humidity' ? 'Fuktighet (%)' : sensor.type === 'water_weight' ? 'Vekt (kg)' : sensor.type === 'weight_temp' ? 'Temperatur (°C)' : 'Fuktighet (%)'}
                </h3>

                {/* Secondary Warning thresholds */}
                <div className="space-y-3 p-3 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20">
                  <Label className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Advarsel-terskel</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondary-warning-lower" className="flex items-center gap-2 text-xs">
                        <TrendingDown className="h-3 w-3" />
                        Nedre grense
                      </Label>
                      <Input
                        id="secondary-warning-lower"
                        type="number"
                        step="0.1"
                        value={sensor.thresholds.secondary?.warning?.lower || ""}
                        placeholder="Valgfritt"
                        onChange={(e) =>
                          setSensor({
                            ...sensor,
                            thresholds: {
                              ...sensor.thresholds,
                              secondary: {
                                ...sensor.thresholds.secondary,
                                warning: {
                                  ...sensor.thresholds.secondary?.warning,
                                  lower: e.target.value ? Number(e.target.value) : undefined
                                }
                              }
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Varsel hvis under
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-warning-upper" className="flex items-center gap-2 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Øvre grense
                      </Label>
                      <Input
                        id="secondary-warning-upper"
                        type="number"
                        step="0.1"
                        value={sensor.thresholds.secondary?.warning?.upper || ""}
                        placeholder="Valgfritt"
                        onChange={(e) =>
                          setSensor({
                            ...sensor,
                            thresholds: {
                              ...sensor.thresholds,
                              secondary: {
                                ...sensor.thresholds.secondary,
                                warning: {
                                  ...sensor.thresholds.secondary?.warning,
                                  upper: e.target.value ? Number(e.target.value) : undefined
                                }
                              }
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Varsel hvis over
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secondary Critical thresholds */}
                <div className="space-y-3 p-3 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                  <Label className="text-sm font-medium text-red-700 dark:text-red-400">Kritisk terskel</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondary-critical-lower" className="flex items-center gap-2 text-xs">
                        <TrendingDown className="h-3 w-3" />
                        Nedre grense
                      </Label>
                      <Input
                        id="secondary-critical-lower"
                        type="number"
                        step="0.1"
                        value={sensor.thresholds.secondary?.critical?.lower || ""}
                        placeholder="Valgfritt"
                        onChange={(e) =>
                          setSensor({
                            ...sensor,
                            thresholds: {
                              ...sensor.thresholds,
                              secondary: {
                                ...sensor.thresholds.secondary,
                                critical: {
                                  ...sensor.thresholds.secondary?.critical,
                                  lower: e.target.value ? Number(e.target.value) : undefined
                                }
                              }
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Kritisk hvis under
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-critical-upper" className="flex items-center gap-2 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Øvre grense
                      </Label>
                      <Input
                        id="secondary-critical-upper"
                        type="number"
                        step="0.1"
                        value={sensor.thresholds.secondary?.critical?.upper || ""}
                        placeholder="Valgfritt"
                        onChange={(e) =>
                          setSensor({
                            ...sensor,
                            thresholds: {
                              ...sensor.thresholds,
                              secondary: {
                                ...sensor.thresholds.secondary,
                                critical: {
                                  ...sensor.thresholds.secondary?.critical,
                                  upper: e.target.value ? Number(e.target.value) : undefined
                                }
                              }
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Kritisk hvis over
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                className="flex-1 gap-2" 
                variant="outline" 
                onClick={handleSuggestThresholds} 
                disabled={isLoadingThresholds}
              >
                {isLoadingThresholds ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI-forslag
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Lagre endringer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Analyse</CardTitle>
            <CardDescription>
              Kjør prediktiv analyse for å forutse potensielle problemer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full gap-2" 
              onClick={handlePredictiveAnalysis} 
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              Kjør prediktiv analyse
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}