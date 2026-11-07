"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** A slide-in menu built on the native <dialog>: focus trap, Esc to close and backdrop come for free. */
export function MobileNav({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        Menu
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
            <p className="font-serif text-xl font-semibold text-brand-dark">Mnyala</p>
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
