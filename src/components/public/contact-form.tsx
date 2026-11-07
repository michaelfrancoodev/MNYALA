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
      <div className="rounded-lg border border-brand bg-brand-tint p-6" role="status">
        <h2 className="text-2xl font-semibold">Asante</h2>
        <p className="mt-2 text-lg">{state.message}</p>
        <p className="mt-5">
          <a href="/wasiliana" className="font-semibold">
            Tuma ujumbe mwingine
          </a>
        </p>
      </div>
    );
  }

  const failed = state && !state.ok ? state : null;
  const sureField = (key: string) => errors[key]?.[0];

  return (
    <form action={action} className="space-y-5" noValidate>
      <div ref={summary} tabIndex={-1} className="outline-none">
        {failed?.message ? <Alert tone="error">{failed.message}</Alert> : null}
        {failed && !failed.message && Object.keys(errors).length > 0 ? (
          <Alert tone="error">Tafadhali sahihisha makosa yaliyoonyeshwa hapa chini.</Alert>
        ) : null}
      </div>

      <TextField
        label="Jina kamili"
        name="fullName"
        autoComplete="name"
        required
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
        defaultValue={values.email}
        error={sureField("email")}
        maxLength={254}
      />
      <TextField
        label="Namba ya simu (si lazima)"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        hint="Mfano: 0758 730 108"
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
      <TextAreaField
        label="Ujumbe"
        name="message"
        required
        rows={6}
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

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="Inatuma..." size="md">
          Tuma ujumbe
        </SubmitButton>
        <p className="text-sm text-muted">
          Kwa kutuma, unakubali taarifa hizi zitumike kukujibu.{" "}
          <a href="/faragha" className="font-semibold">
            Soma sera ya faragha
          </a>
          .
        </p>
      </div>
    </form>
  );
}
