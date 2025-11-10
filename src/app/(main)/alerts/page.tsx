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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import type { Alert, AlertType } from "@/lib/types";

// Dummy data for demonstration purposes
const alerts: Alert[] = [];

const getAlertTypeText = (type: AlertType) => {
  switch (type) {
    case 'critical': return 'Kritisk';
    case 'warning': return 'Advarsel';
    case 'info': return 'Info';
    case 'battery': return 'Batterinivå';
    case 'upper_limit': return 'Øvre grense';
    case 'lower_limit': return 'Nedre grense';
    default: return 'Ukjent';
  }
};

export default function AlertsPage() {

    const statusVariantMap: { [key in AlertType]: 'destructive' | 'default' | 'outline' } = {
        critical: 'destructive',
        warning: 'default',
        info: 'default',
        battery: 'default',
        upper_limit: 'default',
        lower_limit: 'default',
    };

    const statusColorClass = {
        critical: 'bg-destructive text-destructive-foreground',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
        battery: 'bg-orange-500 text-white',
        upper_limit: 'bg-yellow-500 text-white',
        lower_limit: 'bg-yellow-500 text-white',
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Varslingshistorikk</CardTitle>
                    <CardDescription>En komplett logg over alle utløste varsler.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Filtrer
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filtrer etter type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>Kritisk</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked>Advarsel</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked>Info</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked>Batteri</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked>Øvre grense</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked>Nedre grense</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {alerts.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sensor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Melding</TableHead>
                                <TableHead>Tidsstempel</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-mono text-xs">{alert.sensorId}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[alert.type]} className={cn(statusColorClass[alert.type])}>
                                            {getAlertTypeText(alert.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{alert.message}</TableCell>
                                    <TableCell>{alert.timestamp ? format(alert.timestamp.toDate(), "dd.MM.yyyy HH:mm") : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="font-semibold">Ingen varsler å vise</p>
                        <p className="text-sm">Alle systemer opererer som normalt.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
