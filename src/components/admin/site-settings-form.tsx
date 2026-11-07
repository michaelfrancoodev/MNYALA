"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveSiteSettingsAction } from "@/server/actions/settings";
import type { SiteSettings } from "@/server/services/site";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(saveSiteSettingsAction, null);

  return (
    <form action={action} className="max-w-2xl space-y-6" noValidate>
      {state && !state.ok && state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-line pb-2">Contact Details on Public Website</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Official Phone"
            name="contact.phone"
            defaultValue={settings.phone ?? ""}
            placeholder="0758 730 108"
          />

          <TextField
            label="WhatsApp Number"
            name="contact.whatsapp"
            defaultValue={settings.whatsapp ?? ""}
            placeholder="255758730108"
          />
        </div>

        <TextField
          label="Public Email"
          name="contact.email"
          type="email"
          defaultValue={settings.email ?? ""}
          placeholder="info@mnyala.co.tz"
        />

        <TextAreaField
          label="Office Physical Address"
          name="contact.address"
          defaultValue={settings.address ?? ""}
          placeholder="Mwanjelwa, Mbeya, Tanzania"
          rows={2}
        />

        <TextField
          label="Working Hours"
          name="contact.hours"
          defaultValue={settings.hours ?? ""}
          placeholder="Jumatatu - Jumamosi: Saa 2:00 Asubuhi - 11:30 Jioni"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-line">
        <h3 className="text-base font-semibold border-b border-line pb-2">Social Media Links</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Facebook URL / Handle"
            name="social.facebook"
            defaultValue={settings.facebook ?? ""}
            placeholder="https://facebook.com/mnyalatz"
          />

          <TextField
            label="Instagram URL / Handle"
            name="social.instagram"
            defaultValue={settings.instagram ?? ""}
            placeholder="https://instagram.com/mnyalatz"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-line">
        <h3 className="text-base font-semibold border-b border-line pb-2">Environmental Impact Highlights</h3>
        <p className="text-xs text-muted">
          Shown on the public home page and about page. Blank entries are hidden automatically.
        </p>

        {[1, 2, 3, 4].map((i) => {
          const stat = settings.stats[i - 1];
          return (
            <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-2 bg-paper p-3 rounded-md border border-line">
              <TextField
                label={`Metric ${i} Figure`}
                name={`stats.${i}.value`}
                defaultValue={stat?.value ?? ""}
                placeholder="e.g. Tani 500+"
              />
              <TextField
                label={`Metric ${i} Label`}
                name={`stats.${i}.label`}
                defaultValue={stat?.label ?? ""}
                placeholder="e.g. Mkaa safi uliosambazwa"
              />
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <SubmitButton pendingLabel="Saving settings...">
          Save Site Settings
        </SubmitButton>
      </div>
    </form>
  );
}
