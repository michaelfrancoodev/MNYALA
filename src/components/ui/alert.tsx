import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "error";

const tones: Record<Tone, string> = {
  info: "border-line-strong bg-surface text-ink",
  success: "border-brand bg-brand-tint text-ink",
  error: "border-danger bg-danger-tint text-ink",
};

/** Errors are announced immediately (role=alert); the rest politely (role=status). */
export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md border-l-4 px-4 py-3 text-base", tones[tone], className)}
    >
      {children}
    </div>
  );
}
