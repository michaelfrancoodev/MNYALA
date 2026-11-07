"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/server/actions/locale";
import type { Locale } from "@/messages/i18n";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ current, className }: { current: Locale; className?: string }) {
  const [isPending, startTransition] = useTransition();

  const toggle = (target: Locale) => {
    if (target === current || isPending) return;
    startTransition(async () => {
      await setLocaleAction(target);
    });
  };

  return (
    <div
      role="group"
      aria-label="Chagua lugha / Select language"
      className={cn("inline-flex items-center rounded-xl border border-line-strong bg-surface p-1 shadow-2xs text-xs font-bold", className)}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggle("sw")}
        className={cn(
          "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
          current === "sw" ? "bg-brand text-white shadow-xs" : "text-ink-soft hover:text-ink hover:bg-slate-100",
        )}
      >
        SW
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggle("en")}
        className={cn(
          "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
          current === "en" ? "bg-brand text-white shadow-xs" : "text-ink-soft hover:text-ink hover:bg-slate-100",
        )}
      >
        EN
      </button>
    </div>
  );
}
