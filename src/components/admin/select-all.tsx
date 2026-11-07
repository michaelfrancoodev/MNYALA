"use client";

import { useRef } from "react";

/** Ticks or unticks every checkbox called `name` in the same form. Each row checkbox still works on its own without this. */
export function SelectAll({ name, label = "Select all on this page" }: { name: string; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      className="size-5 accent-[#2d7a3e]"
      onChange={(e) => {
        const form = ref.current?.form;
        if (!form) return;
        for (const box of form.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${name}"]`)) box.checked = e.target.checked;
      }}
    />
  );
}
