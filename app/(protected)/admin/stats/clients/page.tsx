import { Metadata } from "next";
import { AnalyticsHeader } from "./_components/analytics-header";
import { OverviewCards } from "./_components/overview-cards";
import { ClientsChart } from "./_components/clients-chart";
import { TopClients } from "./_components/top-clients";
import { VisitsDistribution } from "./_components/visits-distribution";
import { RecentActivity } from "./_components/recent-activity";
import { TrendsCard } from "./_components/trends-card";

export const metadata: Metadata = {
  title: "Analytics | Clientes",
  description: "Análisis y estadísticas de clientes",
};

export default function ClientAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader />
      <OverviewCards />
      <TrendsCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClientsChart />
        <VisitsDistribution />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopClients />
        <RecentActivity />
      </div>
    </div>
  );
} 