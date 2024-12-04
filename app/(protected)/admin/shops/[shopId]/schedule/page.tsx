import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScheduleManager } from "./_components/schedule-manager";

export default async function ShopSchedulePage({
  params
}: {
  params: { shopId: string }
}) {
  const shop = await db.shop.findUnique({
    where: { id: params.shopId },
    include: {
      schedules: true,
      breaks: true,
    },
  });

  if (!shop) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Gestión de Horarios - {shop.name}</h2>
      <ScheduleManager 
        shopId={shop.id}
        initialSchedules={shop.schedules}
        initialBreaks={shop.breaks}
      />
    </div>
  );
} 