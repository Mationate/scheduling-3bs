import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-1" />
        <Skeleton className="h-3 w-[140px]" />
      </CardContent>
    </Card>
  );
}

export function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export function TrendsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[100px]" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[140px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
              <Skeleton className="h-4 w-[60px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 