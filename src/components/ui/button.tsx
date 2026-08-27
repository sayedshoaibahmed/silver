import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ss-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-mangrove text-sand hover:bg-mangrove-mid",
        gold: "bg-gold text-mangrove hover:bg-gold-hover",
        outline:
          "border border-line bg-transparent text-mangrove-fg hover:bg-sand-deep",
        "outline-on-dark":
          "border border-line-on-dark bg-transparent text-sand hover:bg-mangrove-mid",
        whatsapp: "bg-whatsapp text-sand hover:bg-whatsapp-hover",
        ghost: "text-ink hover:bg-sand-deep",
        call: "border border-ink bg-transparent text-ink hover:bg-black/5 dark:border-mangrove-fg dark:text-mangrove-fg dark:hover:bg-sand-deep",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-md px-8 text-base",
        full: "h-12 w-full rounded-md px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
