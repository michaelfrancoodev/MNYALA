import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold " +
  "transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 " +
  "active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary: "border border-brand-dark bg-brand text-white hover:bg-brand-dark shadow-xs hover:shadow-md hover:shadow-brand/20",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-brand-tint hover:border-brand hover:text-brand-dark shadow-xs",
  danger: "border border-danger bg-danger text-white hover:bg-[#82201a] shadow-xs",
  ghost: "border border-transparent bg-transparent text-ink-soft hover:bg-brand-tint hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm rounded-lg",
  md: "min-h-11 px-5 py-2.5 text-base rounded-xl",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className, type = "button", ...rest }: Props) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}
