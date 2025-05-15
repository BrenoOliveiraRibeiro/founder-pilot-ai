
import { toast as sonnerToast, type ToastOptions } from "sonner";

type ToastProps = ToastOptions & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
};

const useToast = () => {
  const toast = ({ title, description, variant, ...props }: ToastProps) => {
    let baseStyle = {};
    
    switch (variant) {
      case "destructive":
        baseStyle = {
          className: "border-destructive bg-destructive text-destructive-foreground",
          descriptionClassName: "text-destructive-foreground",
        };
        break;
      case "success":
        baseStyle = {
          className: "border-green-600 bg-green-50 text-green-900",
          descriptionClassName: "text-green-800",
        };
        break;
      case "info":
        baseStyle = {
          className: "border-primary bg-primary/10 text-foreground",
          descriptionClassName: "text-foreground",
        };
        break;
      case "warning":
        baseStyle = {
          className: "border-yellow-600 bg-yellow-50 text-yellow-900",
          descriptionClassName: "text-yellow-800",
        };
        break;
      default:
        baseStyle = {};
        break;
    }
    
    return sonnerToast(title, {
      description,
      ...baseStyle,
      ...props,
    });
  };
  
  return { toast };
};

export { useToast, sonnerToast as toast };
