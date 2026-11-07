"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { MESSAGE_MAX } from "@/lib/validators/contact";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import { submitContactAction } from "@/server/actions/contact";

type Defaults = { subject: keyof typeof MESSAGE_SUBJECT | ""; message: string; product: string };

export function ContactForm({ defaults, renderedAt }: { defaults: Defaults; renderedAt: number }) {
  const [state, action] = useActionState(submitContactAction, null);
  const summary = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(defaults.message.length);

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const values = state && !state.ok ? (state.values ?? {}) : {};
  const hasErrors = state !== null && !state.ok;

  // After a failed send, move keyboard and screen-reader focus to the explanation.
  useEffect(() => {
    if (hasErrors) summary.current?.focus();
  }, [state, hasErrors]);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-8 shadow-xs" role="status">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Ujumbe Umepokelewa!</h2>
            <p className="text-sm text-emerald-800">Asante kwa kuwasiliana na Mnyala Co. Ltd.</p>
          </div>
        </div>
        <p className="mt-4 text-base text-emerald-900 leading-relaxed">{state.message}</p>
        <p className="mt-6">
          <a
            href="/wasiliana"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
          >
            Tuma ujumbe mwingine &rarr;
          </a>
        </p>
      </div>
    );
  }

  const failed = state && !state.ok ? state : null;
  const sureField = (key: string) => errors[key]?.[0];

  return (
    <form action={action} className="space-y-6" noValidate>
      <div ref={summary} tabIndex={-1} className="outline-none">
        {failed?.message ? <Alert tone="error">{failed.message}</Alert> : null}
        {failed && !failed.message && Object.keys(errors).length > 0 ? (
          <Alert tone="error">Tafadhali sahihisha makosa yaliyoonyeshwa hapa chini.</Alert>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Jina kamili"
          name="fullName"
          autoComplete="name"
          required
          placeholder="Mfano: Juma Shabani"
          defaultValue={values.fullName}
          error={sureField("fullName")}
          maxLength={120}
        />
        <TextField
          label="Barua pepe"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="juma@example.com"
          defaultValue={values.email}
          error={sureField("email")}
          maxLength={254}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Namba ya simu (si lazima)"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          hint="Mfano: 0758 730 108"
          placeholder="07XX XXX XXX"
          defaultValue={values.phone}
          error={sureField("phone")}
          maxLength={30}
        />
        <SelectField
          label="Kichwa cha ujumbe"
          name="subject"
          required
          defaultValue={values.subject ?? defaults.subject}
          error={sureField("subject")}
        >
          <option value="" disabled>
            Chagua kimoja
          </option>
          {(Object.keys(MESSAGE_SUBJECT) as Array<keyof typeof MESSAGE_SUBJECT>).map((key) => (
            <option key={key} value={key}>
              {MESSAGE_SUBJECT[key]}
            </option>
          ))}
        </SelectField>
      </div>

      <TextAreaField
        label="Ujumbe"
        name="message"
        required
        rows={5}
        placeholder="Andika ujumbe au mahitaji yako ya bidhaa..."
        defaultValue={values.message ?? defaults.message}
        error={sureField("message")}
        hint={`${count} kati ya herufi ${MESSAGE_MAX}`}
        onChange={(e) => setCount(e.target.value.length)}
      />

      <input type="hidden" name="product" value={values.product ?? defaults.product} />
      <input type="hidden" name="t" value={renderedAt} />
      {/* Honeypot: invisible to people and assistive technology, tempting to scripts. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Tovuti yako (usijaze)
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-line/80 pt-5">
        <SubmitButton pendingLabel="Inatuma ujumbe..." size="md" className="w-full sm:w-auto">
          Tuma Ujumbe Sasa
        </SubmitButton>
        <p className="text-xs text-muted">
          Taarifa zako zitalindwa kwa mujibu wa{" "}
          <a href="/faragha" className="font-semibold text-brand-dark hover:underline">
            Sera ya Faragha
          </a>
          .
        </p>
      </div>
    </form>
  );
}
