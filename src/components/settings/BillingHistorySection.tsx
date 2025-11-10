// Filsti: src/components/settings/BillingHistorySection.tsx

"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Invoice {
  id: string;
  number: string;
  created: number;
  amount_due: number;
  amount_paid: number;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

interface BillingHistorySectionProps {
  userProfile: User;
}

export default function BillingHistorySection({
  userProfile,
}: BillingHistorySectionProps) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile.stripeCustomerId) {
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [user, userProfile]);

  const loadInvoices = async () => {
    if (!user || !userProfile.stripeCustomerId) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `/api/stripe/invoices?customerId=${userProfile.stripeCustomerId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Betalt</Badge>;
      case "open":
        return <Badge variant="secondary">Åpen</Badge>;
      case "void":
        return <Badge variant="outline">Annullert</Badge>;
      case "uncollectible":
        return <Badge variant="destructive">Uinnkrevbar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!userProfile.stripeCustomerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faktureringshistorikk</CardTitle>
          <CardDescription>
            Ingen fakturaer tilgjengelig ennå
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aktiver abonnement for å se faktureringshistorikk.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faktureringshistorikk</CardTitle>
        <CardDescription>
          Se og last ned tidligere fakturaer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Ingen fakturaer funnet</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fakturanummer</TableHead>
                  <TableHead>Dato</TableHead>
                  <TableHead>Beløp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number || invoice.id}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created * 1000), "d. MMM yyyy", {
                        locale: nb,
                      })}
                    </TableCell>
                    <TableCell>{formatAmount(invoice.amount_due)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {invoice.invoice_pdf && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        {invoice.hosted_invoice_url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Åpne
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}