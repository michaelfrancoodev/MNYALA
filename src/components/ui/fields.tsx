import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const control =
  "block w-full rounded-md border bg-surface px-3 py-2 text-base text-ink " +
  "placeholder:text-muted disabled:bg-paper disabled:text-muted";

type Common = { label: string; hint?: ReactNode; error?: string; wrapperClassName?: string };

function Shell({
  id,
  label,
  hint,
  error,
  required,
  wrapperClassName,
  children,
}: Common & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: ReactNode, error?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function TextField({
  label, hint, error, wrapperClassName, className, id: idProp, required, ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} wrapperClassName={wrapperClassName}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, error ? "border-danger" : "border-line-strong", className)}
        {...rest}
      />
    </Shell>
  );
}

export function TextAreaField({
  label, hint, error, wrapperClassName, className, id: idProp, required, ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} wrapperClassName={wrapperClassName}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "min-h-32", error ? "border-danger" : "border-line-strong", className)}
        {...rest}
      />
    </Shell>
  );
}

export function SelectField({
  label, hint, error, wrapperClassName, className, id: idProp, required, children, ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} wrapperClassName={wrapperClassName}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, error ? "border-danger" : "border-line-strong", className)}
        {...rest}
      >
        {children}
      </select>
    </Shell>
  );
}
