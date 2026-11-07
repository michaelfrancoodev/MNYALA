"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { COMMON } from "@/messages/sw";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <h1 className="text-4xl font-semibold">{COMMON.errorTitle}</h1>
      <p className="mt-4 text-lg text-ink-soft">{COMMON.errorText}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonClasses("primary")}>
          {COMMON.tryAgain}
        </button>
        <Link href="/" className={buttonClasses("secondary")}>
          {COMMON.backHome}
        </Link>
      </div>
    </div>
  );
}
