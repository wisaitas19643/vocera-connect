import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base = "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 hover:bg-brand-900 text-white rounded-full",
  secondary: "border border-brand-700 text-brand-700 hover:bg-brand-50 bg-white rounded-full",
  ghost: "text-brand-700 hover:bg-brand-50 rounded-full gap-2",
};

const sizes: Record<Variant, Record<Size, string>> = {
  primary: { sm: "px-4 py-1.5 text-sm", md: "px-6 py-2.5" },
  secondary: { sm: "px-4 py-1.5 text-sm", md: "px-6 py-2.5" },
  ghost: { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2" },
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[variant][size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
