"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** For the most serious deletions: the person must type the name. The server checks it again. */
export function TypeToConfirmDelete({
  action,
  id,
  name,
  triggerLabel,
  title,
  description,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name: string;
  triggerLabel: string;
  title: string;
  description: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();
  return (
    <>
      <Button variant="secondary" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-label={title}
        onClose={() => setTyped("")}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(92vw,30rem)] rounded-lg border border-line bg-surface p-0 backdrop:bg-black/50"
      >
        <form action={action} className="p-6">
          <input type="hidden" name="id" value={id} />
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-3 text-ink-soft">{description}</p>
          <label htmlFor={inputId} className="mt-5 block text-sm font-semibold">
            Type <span className="rounded-sm bg-paper px-1.5 py-0.5 font-mono">{name}</span> to confirm
          </label>
          <input
            id={inputId}
            name="confirmName"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-1.5 block min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-base"
          />
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => ref.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={!matches}>
              Delete permanently
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
