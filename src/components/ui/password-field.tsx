"use client";

import { useId, useState } from "react";
import { PASSWORD_MIN, validatePassword } from "@/lib/password-policy";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  errors?: string[];
  /** Show the live checklist (use on fields where a new password is being chosen). */
  checklist?: boolean;
  context?: { email?: string; name?: string };
  required?: boolean;
};

function Rule({ met, children }: { met: boolean; children: string }) {
  return (
    <li className={cn("flex items-center gap-2", met ? "text-brand-dark" : "text-muted")}>
      <span
        aria-hidden="true"
        className={cn("inline-block size-3.5 shrink-0 rounded-sm border", met ? "border-brand bg-brand" : "border-line-strong bg-surface")}
      />
      <span>
        {children}
        <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
      </span>
    </li>
  );
}

export function PasswordField({ label, name, autoComplete, errors = [], checklist = false, context, required = true }: Props) {
  const id = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const hasError = errors.length > 0;
  const problems = checklist ? validatePassword(value, context) : [];
  const lengthOk = value.length >= PASSWORD_MIN;
  const letterOk = /\p{L}/u.test(value);
  const numberOk = /\d/.test(value);
  const notCommon = value.length === 0 ? false : !problems.some((p) => /too common/.test(p));

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? `${id}-error` : checklist ? `${id}-rules` : undefined}
          className={cn(
            "block w-full min-w-0 rounded-l-md border bg-surface px-3 py-2 text-base text-ink",
            hasError ? "border-danger" : "border-line-strong",
          )}
          spellCheck={false}
          autoCapitalize="none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="min-w-16 rounded-r-md border border-l-0 border-line-strong bg-paper px-3 text-sm font-semibold text-ink-soft hover:bg-brand-tint"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {checklist && !hasError ? (
        <ul id={`${id}-rules`} className="space-y-1 pt-1 text-sm">
          <Rule met={lengthOk}>{`At least ${PASSWORD_MIN} characters`}</Rule>
          <Rule met={letterOk}>A letter</Rule>
          <Rule met={numberOk}>A number</Rule>
          <Rule met={notCommon && lengthOk}>Not a common password</Rule>
        </ul>
      ) : null}
      {hasError ? (
        <ul id={`${id}-error`} className="space-y-0.5 text-sm font-semibold text-danger">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
