import { cookies } from "next/headers";
import * as en from "./en";
import * as sw from "./sw";

export type Locale = "sw" | "en";

export const COOKIE_NAME = "mnyala_lang";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get(COOKIE_NAME)?.value;
  return val === "en" ? "en" : "sw";
}

export function getDictionary(locale: Locale) {
  return locale === "en" ? en : sw;
}
