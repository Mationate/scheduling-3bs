"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { ActivityCardSkeleton } from "./skeletons";

interface Activity {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clients/analytics");
        const data = await response.json();
        setActivities(data.recentActivity);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        toast.error("Error al cargar la actividad reciente");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <ActivityCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.clientName}</p>
                <p className="text-xs text-muted-foreground">{activity.serviceName}</p>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(activity.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 