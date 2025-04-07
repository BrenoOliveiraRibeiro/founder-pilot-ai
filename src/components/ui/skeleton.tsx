
import { cn } from "@/lib/utils"
import React from "react"

function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Skeleton }
