"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImagePicker } from "@/components/admin/image-picker";
import { uploadGalleryAction } from "@/server/actions/gallery";

export function GalleryUploadForm({ maxUploadMb }: { maxUploadMb: number }) {
  const [state, action] = useActionState(uploadGalleryAction, null);
  const message = state ? state.message : undefined;
  const isError = state && !state.ok;

  return (
    <form action={action} className="rounded-lg border border-line bg-surface p-6 space-y-5" noValidate>
      <h2 className="text-xl font-semibold">Upload Pictures</h2>
      {message ? <Alert tone={isError ? "error" : "success"}>{message}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
        <SelectField
          label="Category"
          name="category"
          required
          defaultValue="production"
          error={state && !state.ok ? state.fieldErrors?.category?.[0] : undefined}
          hint="Where these photos belong."
        >
          <option value="production">Uzalishaji (Production)</option>
          <option value="product">Bidhaa (Products)</option>
          <option value="delivery">Usafirishaji (Delivery & Logistics)</option>
          <option value="community">Jamii & Mazingira (Community & Environment)</option>
        </SelectField>

        <div className="pt-7 flex items-center gap-2">
          <input
            type="checkbox"
            id="gallery-published"
            name="published"
            defaultChecked={true}
            className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
          />
          <label htmlFor="gallery-published" className="text-sm font-semibold text-ink">
            Publish on public gallery immediately
          </label>
        </div>
      </div>

      <ImagePicker
        name="images"
        label="Select Pictures (up to 10)"
        maxMb={maxUploadMb}
        multiple={true}
        error={state && !state.ok ? state.fieldErrors?.images?.[0] : undefined}
      />

      <div className="pt-2">
        <SubmitButton pendingLabel="Uploading and optimizing...">
          Upload Pictures
        </SubmitButton>
      </div>
    </form>
  );
}
