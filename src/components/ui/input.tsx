import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-12 w-full rounded-md border px-3.5 py-2 text-base md:text-sm tabular-nums transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      surface: {
        light: "border-line bg-surface text-ink focus-visible:ring-focus",
        dark: "scheme-dark border-line-on-dark bg-mangrove-mid text-sand placeholder:text-sand/55 focus-visible:ring-focus",
      },
    },
    defaultVariants: {
      surface: "light",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, surface, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ surface, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input, inputVariants };
