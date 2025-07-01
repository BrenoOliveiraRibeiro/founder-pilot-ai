
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface DashedButtonProps extends React.ComponentProps<typeof Button> {
  variant?: "dashed";
}

export const DashedButton = forwardRef<HTMLButtonElement, DashedButtonProps>(
  ({ className, variant, ...props }, ref) => {
    if (variant === "dashed") {
      return (
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "border-dashed border-2 bg-transparent hover:bg-muted/50",
            className
          )}
          {...props}
        />
      );
    }
    
    return <Button ref={ref} className={className} {...props} />;
  }
);

DashedButton.displayName = "DashedButton";
