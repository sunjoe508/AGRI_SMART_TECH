
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

// Enhanced toast with better defaults and styling
export const useToast = () => {
  const originalToast = useToastOriginal();
  
  return {
    ...originalToast,
    toast: (props: any) => {
      return originalToast.toast({
        duration: 4000,
        ...props,
      });
    }
  };
};

export const toast = (props: any) => {
  return toastOriginal({
    duration: 4000,
    ...props,
  });
};
