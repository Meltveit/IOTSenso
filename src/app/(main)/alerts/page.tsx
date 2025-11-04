import { mockAlerts } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

export default function AlertsPage() {
    const alerts = mockAlerts;
    const statusColors = {
        warning: 'bg-accent text-accent-foreground',
        critical: 'bg-destructive text-destructive-foreground',
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Alert History</CardTitle>
                    <CardDescription>A comprehensive log of all triggered alerts.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                        </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                        Warning
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked>
                        Critical
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sensor Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Triggered Value</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alerts.map((alert) => (
                            <TableRow key={alert.id}>
                                <TableCell className="font-medium">{alert.sensorName}</TableCell>
                                <TableCell>
                                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'default'} className={cn(statusColors[alert.type])}>
                                        {alert.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{alert.value}</TableCell>
                                <TableCell>{format(alert.timestamp, "PPP p")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
