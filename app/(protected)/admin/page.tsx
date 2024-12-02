import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Building2, Users, Scissors, Calendar } from "lucide-react";

export default async function AdminPage() {


  const stats = [
    {
      title: "Total Shops",
      value: 2,
      icon: Building2,
      color: "text-sky-500",
    },
    {
      title: "Total Workers",
      value: 10,
      icon: Users,
      color: "text-violet-500",
    },
    {
      title: "Total Services",
      value: 10,
      icon: Scissors,
      color: "text-pink-700",
    },
    {
      title: "Total Bookings",
      value: 10,
      icon: Calendar,
      color: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("h-5 w-5", stat.color)} />
              <h3 className="font-semibold">{stat.title}</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}