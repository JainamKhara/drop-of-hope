import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error" | "success";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base: SHARP EDGES, DARK LABELS, MEDICAL PRECISION
          "flex h-12 w-full border-2 bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-85 md:text-sm",
          {
            default:
              "border-[hsl(0,80%,50%)] focus-visible:border-[hsl(0,80%,50%)] focus-visible:ring-[hsl(0,80%,50%)]/30",
            error:
              "border-[hsl(14,100%,50%)] focus-visible:ring-[hsl(14,100%,50%)]/30",
            success:
              "border-[hsl(120,71%,43%)] focus-visible:ring-[hsl(120,71%,43%)]/30",
          }[variant],
          "rounded-sm", // Crisp edges
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
