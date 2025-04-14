"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCardSkeleton } from "./skeletons";
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Wallet, Clock } from "lucide-react";

interface PaymentMethod {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

const PAYMENT_ICONS: Record<string, any> = {
  "card": CreditCard,
  "cash": Wallet,
  "later": Clock,
};

export function PaymentMethodsCard() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId, serviceId, workerId, dateRange } = useFiltersStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(shopId && { shopId }),
          ...(serviceId && { serviceId }),
          ...(workerId && { workerId }),
          ...(dateRange.from && { from: dateRange.from.toISOString() }),
          ...(dateRange.to && { to: dateRange.to.toISOString() })
        });

        const response = await fetch(`/api/sales/payment-methods?${params}`);
        const data = await response.json();
        setMethods(data);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Error al cargar los métodos de pago");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId, serviceId, workerId, dateRange]);

  if (isLoading) return <TableCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-3">
          {methods.map((method) => {
            const Icon = PAYMENT_ICONS[method.method] || CreditCard;
            return (
              <div key={method.method} className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {method.method === 'card' && 'Tarjeta'}
                    {method.method === 'cash' && 'Efectivo'}
                    {method.method === 'later' && 'Pago Pendiente'}
                  </p>
                  <div className="flex items-center text-2xl font-bold">
                    {method.percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {method.count} transacciones · {formatCurrency(method.total)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 