"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateGalleryItemAction } from "@/server/actions/gallery";
import type { ActionState } from "@/server/actions/core";

const first = (state: ActionState | null, key: string) => (state && !state.ok ? state.fieldErrors?.[key]?.[0] : undefined);
const val = (state: ActionState | null, key: string, fallback: string = "") =>
  state && !state.ok && state.values?.[key] !== undefined ? state.values[key] : fallback;

export function GalleryEditForm({
  item,
}: {
  item: {
    id: string;
    title: string;
    description: string | null;
    category: "product" | "production" | "delivery" | "community";
    alt: string;
    isPublished: boolean;
    file: string;
  };
}) {
  const [state, action] = useActionState(updateGalleryItemAction, null);
  const message = state && !state.ok ? state.message : undefined;

  return (
    <form action={action} className="max-w-2xl space-y-6" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}
      <input type="hidden" name="id" value={item.id} />

      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/uploads/${item.file}-960.webp`}
          alt={item.alt}
          className="max-h-72 w-auto rounded-lg border border-line object-cover"
        />
      </div>

      <TextField
        label="Title"
        name="title"
        required
        defaultValue={val(state, "title", item.title)}
        error={first(state, "title")}
      />

      <SelectField
        label="Category"
        name="category"
        required
        defaultValue={val(state, "category", item.category)}
        error={first(state, "category")}
      >
        <option value="production">Uzalishaji (Production)</option>
        <option value="product">Bidhaa (Products)</option>
        <option value="delivery">Usafirishaji (Delivery & Logistics)</option>
        <option value="community">Jamii & Mazingira (Community & Environment)</option>
      </SelectField>

      <TextAreaField
        label="Description (Optional)"
        name="description"
        defaultValue={val(state, "description", item.description ?? "")}
        error={first(state, "description")}
        hint="Optional caption shown when viewing the photo."
        rows={3}
      />

      <TextField
        label="Picture Description (Alt Text for Accessibility)"
        name="alt"
        required
        defaultValue={val(state, "alt", item.alt)}
        error={first(state, "alt")}
        hint="Describes the photo content for screen readers."
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="item-published"
          name="published"
          defaultChecked={state && !state.ok ? state.values?.published === "on" : item.isPublished}
          className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
        />
        <label htmlFor="item-published" className="text-sm font-semibold text-ink">
          Visible on public gallery
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton pendingLabel="Saving...">Save Changes</SubmitButton>
        <Link
          href="/admin/gallery"
          className="rounded-md border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
