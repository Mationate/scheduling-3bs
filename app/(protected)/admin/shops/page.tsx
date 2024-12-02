import { db } from "@/lib/db";
import { format } from "date-fns";
import { ShopsDataTable } from "./_components/shops-table";

export default async function ShopsPage() {
  const shops = await db.shop.findMany({
    include: {
      workers: true,
    },
  });

  const formattedShops = shops.map(shop => ({
    id: shop.id,
    name: shop.name,
    phone: shop.phone || "",
    mail: shop.mail || "",
    address: shop.address || "",
    workersCount: shop.workers.length,
    createdAt: format(new Date(shop.createdAt), "PP")
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Shops Management</h2>
      <ShopsDataTable initialData={formattedShops} />
    </div>
  );
}