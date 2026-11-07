"use client";

import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

/**
 * A button that asks before doing something that cannot be undone. The question names what will be affected.
 * Built on the native <dialog> (focus trap, Esc, backdrop). The action itself runs on the server and checks the role there.
 */
export function ConfirmAction({
  action, triggerLabel, title, description, confirmLabel, fields = {}, size = "sm", variant = "danger", triggerVariant = "secondary", triggerClassName, targetForm,
}: {
  action: (formData: FormData) => void | Promise<void>;
  triggerLabel: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  fields?: Record<string, string>;
  size?: "sm" | "md";
  variant?: "danger" | "primary";
  triggerVariant?: "secondary" | "danger" | "ghost";
  triggerClassName?: string;
  /** Id of a form elsewhere on the page whose fields (for example ticked checkboxes) the action should receive. */
  targetForm?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant={triggerVariant} size={size} onClick={() => ref.current?.showModal()} aria-haspopup="dialog" className={triggerClassName}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-label={title}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(92vw,28rem)] rounded-lg border border-line bg-surface p-0 backdrop:bg-black/50"
      >
        {targetForm ? (
          <div className="p-6">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="mt-3 text-ink-soft">{description}</div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => ref.current?.close()} autoFocus>
                Cancel
              </Button>
              <Button type="submit" form={targetForm} formAction={action} variant={variant} onClick={() => ref.current?.close()}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        ) : (
          <form action={action} className="p-6">
            {Object.entries(fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="mt-3 text-ink-soft">{description}</div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => ref.current?.close()} autoFocus>
                Cancel
              </Button>
              <SubmitButton variant={variant} pendingLabel="Working...">
                {confirmLabel}
              </SubmitButton>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
