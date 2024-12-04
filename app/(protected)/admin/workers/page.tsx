import { db } from "@/lib/db";
import { format } from "date-fns";
import { WorkersDataTable } from "./_components/workers-table";

export default async function WorkersPage() {
  const workers = await db.worker.findMany({
    include: {
      shop: true,
    },
  });

  const formattedWorkers = workers.map(worker => ({
    id: worker.id,
    name: worker.name,
    phone: worker.phone || "",
    mail: worker.mail || "",
    avatar: worker.avatar || "",
    status: worker.status,
    shopName: worker.shop?.name || "Unassigned",
    createdAt: format(new Date(worker.createdAt), "PP")
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Workers Management</h2>
      <WorkersDataTable initialData={formattedWorkers} />
    </div>
  );
} 