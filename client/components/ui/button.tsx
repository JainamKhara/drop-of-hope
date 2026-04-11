import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base class - SHARP EDGES, KINETIC INTERACTIONS
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-[hsl(0,80%,50%)] bg-transparent text-[hsl(0,80%,50%)] dark:text-white hover:bg-[hsl(0,80%,50%)] hover:text-white hover:border-4 hover:shadow-lg active:border-2 active:bg-transparent active:text-[hsl(0,80%,50%)] dark:active:text-white active:shadow-none",
        destructive:
          "border-2 border-[hsl(14,100%,50%)] bg-transparent text-[hsl(14,100%,50%)] dark:text-white hover:bg-[hsl(14,100%,50%)] hover:text-white hover:border-4 hover:shadow-lg",
        outline:
          "border-2 border-foreground/30 bg-transparent text-foreground hover:bg-[hsl(0,0%,95%)] hover:border-4 hover:border-foreground/60 hover:text-[hsl(0,80%,50%)]",
        secondary:
          "bg-[hsl(0,0%,95%)] text-[hsl(0,0%,3.6%)] hover:bg-[hsl(0,0%,90%)]",
        ghost: "text-foreground hover:bg-[hsl(0,0%,95%)] hover:text-[hsl(0,80%,50%)]",
        link: "text-[hsl(0,80%,50%)] underline-offset-4 hover:underline",
        success:
          "border-2 border-[hsl(120,71%,43%)] bg-transparent text-[hsl(120,71%,43%)] dark:text-white hover:bg-[hsl(120,71%,43%)] hover:text-white hover:border-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
      corners: {
        sharp: "rounded-none", // 0px - Brutalist
        crisp: "rounded-sm", // 2px - Medical precision
        soft: "rounded-md", // Only for special cases
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      corners: "crisp", // Default to sharp
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, corners, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, corners, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
