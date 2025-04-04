
import * as React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnboardingTooltipProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function OnboardingTooltip({
  id,
  title,
  description,
  children,
  side = "top",
  align = "center",
}: OnboardingTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check local storage to see if tooltip has been dismissed
    const dismissedTooltips = localStorage.getItem("dismissed_tooltips");
    const parsedDismissed = dismissedTooltips ? JSON.parse(dismissedTooltips) : [];
    
    if (!parsedDismissed.includes(id)) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setDismissed(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsOpen(false);
    
    // Store dismissal in local storage
    const dismissedTooltips = localStorage.getItem("dismissed_tooltips");
    const parsedDismissed = dismissedTooltips ? JSON.parse(dismissedTooltips) : [];
    
    if (!parsedDismissed.includes(id)) {
      parsedDismissed.push(id);
      localStorage.setItem("dismissed_tooltips", JSON.stringify(parsedDismissed));
    }
    
    setDismissed(true);
  };

  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="p-4 max-w-xs border-none bg-primary text-primary-foreground shadow-lg animate-fade-in"
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-xs text-primary-foreground/90">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
