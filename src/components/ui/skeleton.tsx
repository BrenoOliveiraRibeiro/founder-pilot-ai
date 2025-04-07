
import { cn } from "@/lib/utils"
import React from "react"

function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted relative overflow-hidden", className)}
      {...props}
    >
      {children || (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
      )}
    </div>
  )
}

export { Skeleton }
