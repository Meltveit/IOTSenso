import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "destructive";
};

export default function StatCard({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn(
      variant === "destructive" && "bg-destructive/10 border-destructive text-destructive-foreground"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "text-sm font-medium",
          variant === "destructive" && "text-destructive"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4 text-muted-foreground",
          variant === "destructive" && "text-destructive"
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          variant === "destructive" && "text-destructive"
        )}>
          {value}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
