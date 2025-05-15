
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InsightsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="w-full h-14">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
        </Skeleton>
      ))}
    </div>
  );
};
