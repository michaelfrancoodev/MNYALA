"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** A slide-in menu built on the native <dialog>: focus trap, Esc to close and backdrop come for free. */
export function MobileNav({ children, badgeCount }: { children: ReactNode; badgeCount?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => ref.current?.showModal()} aria-haspopup="dialog" className="relative">
        <span>Menu</span>
        {typeof badgeCount === "number" && badgeCount > 0 ? (
          <span className="size-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
        ) : null}
      </Button>
      <dialog
        ref={ref}
        aria-label="Navigation"
        className="m-0 h-full max-h-none w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-surface p-0 backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex min-h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xl font-bold text-ink">Mnyala Admin</p>
            <Button variant="ghost" size="sm" onClick={() => ref.current?.close()}>
              Close
            </Button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
