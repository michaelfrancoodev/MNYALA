"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImagePicker } from "@/components/admin/image-picker";
import { saveProductAction } from "@/server/actions/products";
import type { ActionState } from "@/server/actions/core";

const first = (state: ActionState | null, key: string) => (state && !state.ok ? state.fieldErrors?.[key]?.[0] : undefined);
const val = (state: ActionState | null, key: string, fallback: string = "") =>
  state && !state.ok && state.values?.[key] !== undefined ? state.values[key] : fallback;

export function ProductForm({
  product,
  maxUploadMb,
}: {
  product?: {
    id: string;
    name: string;
    slug: string;
    category: "charcoal" | "stove" | "seeds" | "manure";
    summary: string;
    features: string[];
    priceTzs: number | null;
    priceUnit: string | null;
    isPublished: boolean;
    file?: string | null;
    alt?: string | null;
  } | null;
  maxUploadMb: number;
}) {
  const [state, action] = useActionState(saveProductAction, null);
  const message = state && !state.ok ? state.message : undefined;

  const existingImage = product?.file
    ? { src: `/uploads/${product.file}-480.webp`, alt: product.alt ?? product.name }
    : null;

  return (
    <form action={action} className="max-w-2xl space-y-6" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

      <TextField
        label="Product Name"
        name="name"
        required
        defaultValue={val(state, "name", product?.name ?? "")}
        error={first(state, "name")}
        hint="For example: Mkaa Safi wa Kupikia (Gunia la kg 50)"
      />

      <TextField
        label="URL Slug (Optional)"
        name="slug"
        defaultValue={val(state, "slug", product?.slug ?? "")}
        error={first(state, "slug")}
        hint="Leave blank to generate automatically from the product name."
      />

      <SelectField
        label="Category"
        name="category"
        required
        defaultValue={val(state, "category", product?.category ?? "charcoal")}
        error={first(state, "category")}
      >
        <option value="charcoal">Mkaa Endelevu (Sustainable Charcoal)</option>
        <option value="stove">Jiko Banifu (Clean Cookstove)</option>
        <option value="seeds">Mbegu & Miche ya Miti (Tree Seeds & Seedlings)</option>
        <option value="manure">Mboji Asilia (Organic Manure)</option>
      </SelectField>

      <TextAreaField
        label="Summary"
        name="summary"
        required
        defaultValue={val(state, "summary", product?.summary ?? "")}
        error={first(state, "summary")}
        hint="Short description shown on product cards and listings (10 to 300 characters)."
      />

      <TextAreaField
        label="Key Features & Specifications"
        name="features"
        defaultValue={val(state, "features", product?.features ? product.features.join("\n") : "")}
        error={first(state, "features")}
        hint="Write one point per line (up to 10 points). For example: Moshi kidogo sana / Joto kali linalodumu masaa 5."
        rows={4}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Price in TZS (Optional)"
          name="priceTzs"
          type="number"
          min="0"
          step="1"
          defaultValue={val(state, "priceTzs", product?.priceTzs != null ? String(product.priceTzs) : "")}
          error={first(state, "priceTzs")}
          hint="Leave blank for 'Wasiliana kwa bei'."
        />

        <TextField
          label="Price Unit (Optional)"
          name="priceUnit"
          defaultValue={val(state, "priceUnit", product?.priceUnit ?? "")}
          error={first(state, "priceUnit")}
          hint="For example: kwa gunia, kwa kilo, kwa mche."
        />
      </div>

      <ImagePicker
        name="image"
        label="Product Picture"
        maxMb={maxUploadMb}
        error={first(state, "image")}
        existing={existingImage}
      />

      {product?.file ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="removeImage"
            name="removeImage"
            className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
          />
          <label htmlFor="removeImage" className="text-sm font-semibold text-ink">
            Remove current picture without replacing
          </label>
        </div>
      ) : null}

      <TextField
        label="Picture Description (Alt Text)"
        name="imageAlt"
        defaultValue={val(state, "imageAlt", product?.alt ?? "")}
        error={first(state, "imageAlt")}
        hint="Describe what the picture shows for accessibility and SEO."
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          defaultChecked={state && !state.ok ? state.values?.published === "on" : (product?.isPublished ?? false)}
          className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
        />
        <label htmlFor="published" className="text-sm font-semibold text-ink">
          Publish on public website immediately
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton pendingLabel={product ? "Saving..." : "Creating..."}>
          {product ? "Save Changes" : "Create Product"}
        </SubmitButton>
        <Link
          href="/admin/products"
          className="rounded-md border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
