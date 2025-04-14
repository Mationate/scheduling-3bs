"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsHeader } from "./_components/stats-header";
import { ServiceStatsTable } from "./_components/service-stats-table";
import { ArrivalStatsTable } from "./_components/arrival-stats-table";
import { StatsOverview } from "./_components/stats-overview";

export default function ShopStatsPage() {
  return (
    <div className="p-6 space-y-6">
      <StatsHeader />
      
      <StatsOverview />
      
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Servicios por Profesional</TabsTrigger>
          <TabsTrigger value="arrivals">Control de Llegadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card className="p-4">
            <ServiceStatsTable />
          </Card>
        </TabsContent>
        
        <TabsContent value="arrivals">
          <Card className="p-4">
            <ArrivalStatsTable />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 