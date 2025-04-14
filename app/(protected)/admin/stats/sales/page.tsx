import { Metadata } from "next";
import { ServiceDistribution } from "./_components/service-distribution";
import { SalesHeader } from "./_components/sales-header";
import { OverviewCards } from "./_components/overview-cards";
import { RevenueChart } from "./_components/revenue-chart";
import { TopServices } from "./_components/top-services";
import { TopWorkers } from "./_components/top-workers";
import { PaymentMethodsCard } from "./_components/payment-methods-card";

export const metadata: Metadata = {
  title: "Analytics | Ventas",
  description: "Análisis y estadísticas de ventas",
};

export default function SalesAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <SalesHeader />
      <OverviewCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart />
        <ServiceDistribution />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopServices />
        <TopWorkers />
      </div>
      <PaymentMethodsCard />
    </div>
  );
} 