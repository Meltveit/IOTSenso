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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertCircle, BrainCircuit, Check, Loader2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { recommendThresholds } from "@/ai/flows/smart-threshold-recommendation";
import { predictiveMaintenanceAnalysis, PredictiveMaintenanceOutput } from "@/ai/flows/predictive-maintenance-analysis";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  upperLimit: {
    label: "Upper Limit",
    color: "hsl(var(--destructive))",
  },
  lowerLimit: {
    label: "Lower Limit",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ExtendedThresholds {
  upperLimit: number;
  lowerLimit: number;
  warning: number;
  critical: number;
}

export default function SensorDetailsClient({
  initialSensor,
}: {
  initialSensor: Sensor;
}) {
  const [sensor, setSensor] = useState(initialSensor);
  const { toast } = useToast();
  const { user } = useAuth();

  // Extended thresholds state
  const [thresholds, setThresholds] = useState<ExtendedThresholds>({
    upperLimit: (initialSensor.thresholds as any)?.upperLimit || initialSensor.thresholds.critical + 10,
    lowerLimit: (initialSensor.thresholds as any)?.lowerLimit || 0,
    warning: initialSensor.thresholds.warning,
    critical: initialSensor.thresholds.critical,
  });

  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveMaintenanceOutput | null>(null);

  // Update local sensor state when initialSensor changes (real-time updates)
  useEffect(() => {
    setSensor(initialSensor);
  }, [initialSensor]);

  const statusColors: Record<SensorStatus, string> = {
    ok: "bg-green-500/20 text-green-700 border-green-500/30",
    pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    warning: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    critical: "bg-red-500/20 text-red-700 border-red-500/30",
    offline: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  };

  const handleSaveThresholds = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save changes.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get the user ID from the sensor path
      const sensorRef = doc(db, "users", user.uid, "sensors", sensor.id);
      
      await updateDoc(sensorRef, {
        thresholds: {
          upperLimit: thresholds.upperLimit,
          lowerLimit: thresholds.lowerLimit,
          warning: thresholds.warning,
          critical: thresholds.critical,
        },
        updatedAt: new Date(),
      });

      toast({
        title: "Saved!",
        description: "Threshold settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving thresholds:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save threshold settings. Please try again.",
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
      
      setThresholds({
        upperLimit: result.criticalThreshold + 10,
        lowerLimit: 0,
        warning: result.warningThreshold,
        critical: result.criticalThreshold,
      });

      toast({
        title: "AI Suggestion Applied",
        description: "New thresholds have been set based on AI analysis.",
      });
    } catch (error) {
      console.error("AI threshold recommendation failed:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get threshold recommendations.",
      });
    } finally {
      setIsLoadingThresholds(false);
    }
  };

  const handlePredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await predictiveMaintenanceAnalysis({
        sensorData: JSON.stringify(sensor.data),
        equipmentType: sensor.equipmentType || 'Unknown',
        maintenanceHistory: JSON.stringify(sensor.maintenanceHistory),
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI predictive analysis failed:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not perform predictive analysis.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format chart data with proper timestamps
  const chartData = sensor.data.map(d => ({
    timestamp: d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp),
    value: d.value,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline">{sensor.name}</CardTitle>
              <Badge variant="outline" className={cn(statusColors[sensor.status])}>
                {sensor.status}
              </Badge>
            </div>
            <CardDescription>{sensor.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) => format(new Date(tick), "HH:mm")}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      labelFormatter={(value) => format(new Date(value), "PPpp")}
                    />} 
                  />
                  
                  {/* Upper Limit Line */}
                  <ReferenceLine
                    y={thresholds.upperLimit}
                    label={{ 
                      value: `Max: ${thresholds.upperLimit}`, 
                      position: "insideTopRight", 
                      fill: "hsl(var(--destructive))",
                      fontSize: 12
                    }}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                  
                  {/* Lower Limit Line */}
                  <ReferenceLine
                    y={thresholds.lowerLimit}
                    label={{ 
                      value: `Min: ${thresholds.lowerLimit}`, 
                      position: "insideBottomRight", 
                      fill: "hsl(var(--chart-3))",
                      fontSize: 12
                    }}
                    stroke="hsl(var(--chart-3))"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />

                  {/* Warning Line */}
                  <ReferenceLine
                    y={thresholds.warning}
                    label={{ 
                      value: `⚠ ${thresholds.warning}`, 
                      position: "insideTopLeft", 
                      fill: "hsl(var(--chart-2))",
                      fontSize: 12
                    }}
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />

                  {/* Critical Line */}
                  <ReferenceLine
                    y={thresholds.critical}
                    label={{ 
                      value: `🔴 ${thresholds.critical}`, 
                      position: "insideTopLeft", 
                      fill: "hsl(var(--destructive))",
                      fontSize: 12
                    }}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Current Value Display */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-3xl font-bold">{sensor.currentValue.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{sensor.unit}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Battery</p>
                <p className="text-3xl font-bold">{sensor.batteryLevel}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Readings</p>
                <p className="text-3xl font-bold">{sensor.data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <Badge variant={analysisResult.risk === 'high' ? 'destructive' : analysisResult.risk === 'medium' ? 'default' : 'secondary'}>
                  {analysisResult.risk.toUpperCase()} RISK
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {analysisResult.predictedFailureDate && (
                <div>
                  <h4 className="font-semibold mb-2">Predicted Issues</h4>
                  <p className="text-sm text-muted-foreground">
                    Potential failure predicted around: {new Date(analysisResult.predictedFailureDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {(analysisResult.confidenceLevel * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sensor Configuration</CardTitle>
            <CardDescription>Set upper and lower limits with warning thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upper Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="upperLimit" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  Upper Limit (Max)
                </Label>
                <span className="text-sm font-medium">{thresholds.upperLimit} {sensor.unit}</span>
              </div>
              <Input
                id="upperLimit"
                type="number"
                value={thresholds.upperLimit}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    upperLimit: Number(e.target.value),
                  })
                }
                className="border-red-200 focus:border-red-500"
              />
              <p className="text-xs text-muted-foreground">
                Alert when value exceeds this limit
              </p>
            </div>

            {/* Critical Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="critical">Critical Threshold</Label>
                <span className="text-sm font-medium">{thresholds.critical} {sensor.unit}</span>
              </div>
              <Input
                id="critical"
                type="number"
                value={thresholds.critical}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    critical: Number(e.target.value),
                  })
                }
                className="border-orange-200 focus:border-orange-500"
              />
            </div>

            {/* Warning Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="warning">Warning Threshold</Label>
                <span className="text-sm font-medium">{thresholds.warning} {sensor.unit}</span>
              </div>
              <Input
                id="warning"
                type="number"
                value={thresholds.warning}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    warning: Number(e.target.value),
                  })
                }
                className="border-yellow-200 focus:border-yellow-500"
              />
            </div>

            {/* Lower Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lowerLimit" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  Lower Limit (Min)
                </Label>
                <span className="text-sm font-medium">{thresholds.lowerLimit} {sensor.unit}</span>
              </div>
              <Input
                id="lowerLimit"
                type="number"
                value={thresholds.lowerLimit}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    lowerLimit: Number(e.target.value),
                  })
                }
                className="border-blue-200 focus:border-blue-500"
              />
              <p className="text-xs text-muted-foreground">
                Alert when value falls below this limit
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                className="w-full gap-2" 
                variant="outline" 
                onClick={handleSuggestThresholds} 
                disabled={isLoadingThresholds}
              >
                {isLoadingThresholds ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI-Suggest Thresholds
              </Button>
              
              <Button 
                className="w-full gap-2" 
                onClick={handleSaveThresholds}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Analysis</CardTitle>
            <CardDescription>Run predictive analysis to foresee potential issues.</CardDescription>
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
              Run Predictive Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}