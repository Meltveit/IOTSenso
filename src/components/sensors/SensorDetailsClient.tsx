"use client";

import { use, useState } from "react";
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
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertCircle, BrainCircuit, Check, Loader2, Sparkles } from "lucide-react";
import { recommendThresholds, RecommendThresholdsOutput } from "@/ai/flows/smart-threshold-recommendation";
import { predictiveMaintenanceAnalysis, PredictiveMaintenanceOutput } from "@/ai/flows/predictive-maintenance-analysis";
import { Progress } from "../ui/progress";
import { useToast } from "@/hooks/use-toast";


const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  warning: {
    label: "Warning",
    color: "hsl(var(--chart-2))",
  },
  critical: {
    label: "Critical",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export default function SensorDetailsClient({
  initialSensor,
}: {
  initialSensor: Sensor;
}) {
  const [sensor, setSensor] = useState(initialSensor);
  const { toast } = useToast();

  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveMaintenanceOutput | null>(null);

  const statusColors: Record<SensorStatus, string> = {
    ok: "bg-green-500/20 text-green-700 border-green-500/30",
    pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    warning: "bg-accent/20 text-accent-foreground border-accent/30",
    critical: "bg-destructive/20 text-destructive border-destructive/30",
    offline: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  };

  const handleSuggestThresholds = async () => {
    setIsLoadingThresholds(true);
    try {
      const result = await recommendThresholds({
        sensorType: sensor.type,
        historicalData: JSON.stringify(sensor.data),
        industry: "manufacturing", // This could be dynamic
      });
      setSensor(prev => ({
        ...prev,
        thresholds: {
          warning: result.warningThreshold,
          critical: result.criticalThreshold,
        }
      }));
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
  }


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
            <div className="h-80 w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={sensor.data}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) => format(new Date(tick), "HH:mm")}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ReferenceLine
                    y={sensor.thresholds.warning}
                    label={{ value: "Warning", position: "insideTopRight", fill: "hsl(var(--chart-2))" }}
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    y={sensor.thresholds.critical}
                    label={{ value: "Critical", position: "insideTopRight", fill: "hsl(var(--destructive))" }}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                  />
                  <Area
                    dataKey="value"
                    type="natural"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.4}
                    stroke="hsl(var(--chart-1))"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        {analysisResult && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="h-6 w-6"/>Predictive Maintenance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Failure Prediction</Label>
                        <p className="text-sm text-muted-foreground">{analysisResult.failurePrediction}</p>
                    </div>
                     <div>
                        <Label>Recommended Actions</Label>
                        <p className="text-sm text-muted-foreground">{analysisResult.recommendedActions}</p>
                    </div>
                     <div>
                        <Label>Confidence Level</Label>
                        <div className="flex items-center gap-2">
                            <Progress value={analysisResult.confidenceLevel * 100} className="w-[60%]" />
                            <span className="text-sm font-medium">{(analysisResult.confidenceLevel * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sensor Configuration</CardTitle>
            <CardDescription>Adjust sensor thresholds manually or with AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warning">Warning Threshold</Label>
              <Input
                id="warning"
                type="number"
                value={sensor.thresholds.warning}
                onChange={(e) =>
                  setSensor({
                    ...sensor,
                    thresholds: { ...sensor.thresholds, warning: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="critical">Critical Threshold</Label>
              <Input
                id="critical"
                type="number"
                value={sensor.thresholds.critical}
                onChange={(e) =>
                    setSensor({
                      ...sensor,
                      thresholds: { ...sensor.thresholds, critical: Number(e.target.value) },
                    })
                  }
              />
            </div>
             <Button className="w-full gap-2" variant="outline" onClick={handleSuggestThresholds} disabled={isLoadingThresholds}>
                {isLoadingThresholds ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI-Suggest Thresholds
            </Button>
            <Button className="w-full gap-2">
                <Check className="h-4 w-4"/>
                Save Changes
            </Button>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                 <CardTitle className="font-headline">AI Analysis</CardTitle>
                <CardDescription>Run predictive analysis to foresee potential issues.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button className="w-full gap-2" onClick={handlePredictiveAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                    Run Predictive Analysis
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
