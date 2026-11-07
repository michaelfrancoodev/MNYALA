/**
 * The current time in milliseconds. A named function so a server-rendered page can stamp "when this page was built"
 * (used by the contact form's too-fast check) without calling Date.now() directly inside a component body.
 */
export function nowMs(): number {
  return Date.now();
}
