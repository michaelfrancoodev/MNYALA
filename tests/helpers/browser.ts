/** A cookie-keeping HTTP client that behaves like a browser with JavaScript turned off. */

export type Page = { status: number; headers: Headers; body: string; location: string | null; setCookies: string[] };

const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'" };
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (m) => entities[m] ?? m);

export type FormField = { name: string; value: string };

/** Extracts all inputs, textareas and selects from the first <form> that contains `mustContain`. */
export function findForm(html: string, mustContain: string): FormField[] {
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((m) => m[0]);
  const form = forms.find((f) => new RegExp(`name="${mustContain.replace(/[$]/g, "\\$")}"`).test(f));
  if (!form) throw new Error(`no form containing a field named "${mustContain}"`);
  const fields: FormField[] = [];
  for (const m of form.matchAll(/<input\b[^>]*>/g)) {
    const tag = m[0];
    const name = /\bname="([^"]*)"/.exec(tag)?.[1];
    const type = /\btype="([^"]*)"/.exec(tag)?.[1] ?? "text";
    if (!name || ["submit", "button", "checkbox", "radio", "file"].includes(type)) continue;
    fields.push({ name: decode(name), value: decode(/\bvalue="([^"]*)"/.exec(tag)?.[1] ?? "") });
  }
  for (const m of form.matchAll(/<textarea\b[^>]*\bname="([^"]*)"[^>]*>([\s\S]*?)<\/textarea>/g)) {
    fields.push({ name: decode(m[1]!), value: decode(m[2]!) });
  }
  return fields;
}

export class Browser {
  readonly jar = new Map<string, string>();
  constructor(
    readonly base: string,
    private readonly extraHeaders: Record<string, string> = {},
  ) {}

  cookie(name: string): string | undefined {
    return this.jar.get(name);
  }

  private store(setCookies: string[]) {
    for (const c of setCookies) {
      const [pair = "", ...attrs] = c.split(";").map((p) => p.trim());
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      const maxAge = attrs.find((a) => /^max-age=/i.test(a))?.split("=")[1];
      const expires = attrs.find((a) => /^expires=/i.test(a))?.slice(8);
      const dead = value === "" || maxAge === "0" || (expires && Date.parse(expires) < Date.now());
      if (dead) this.jar.delete(name);
      else this.jar.set(name, value);
    }
  }

  async request(path: string, init: RequestInit & { headers?: Record<string, string> } = {}): Promise<Page> {
    const cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    const res = await fetch(new URL(path, this.base), {
      redirect: "manual",
      ...init,
      headers: { ...(cookie ? { cookie } : {}), ...this.extraHeaders, ...init.headers },
    });
    const setCookies = res.headers.getSetCookie();
    this.store(setCookies);
    return { status: res.status, headers: res.headers, body: await res.text(), location: res.headers.get("location"), setCookies };
  }

  get(path: string, headers: Record<string, string> = {}) {
    return this.request(path, { headers });
  }

  /** Follows redirects (like a browser) and returns the final page. */
  async visit(path: string, maxHops = 5): Promise<Page> {
    let page = await this.get(path);
    for (let i = 0; i < maxHops && page.location && page.status >= 300 && page.status < 400; i++) {
      page = await this.get(new URL(page.location, this.base).pathname + new URL(page.location, this.base).search);
    }
    return page;
  }

  /** Loads `path`, takes the form containing `identifyBy`, fills `values`, and posts it back like a browser would. */
  async submit(path: string, identifyBy: string, values: Record<string, string | string[]>, headers: Record<string, string> = {}): Promise<Page> {
    const page = await this.get(path);
    const fields = findForm(page.body, identifyBy);
    return this.postFields(path, fields, values, headers);
  }

  async postFields(path: string, fields: FormField[], values: Record<string, string | string[]>, headers: Record<string, string> = {}): Promise<Page> {
    const fd = new FormData();
    const used = new Set<string>();
    const add = (name: string, v: string | string[]) => (Array.isArray(v) ? v.forEach((x) => fd.append(name, x)) : fd.append(name, v));
    for (const f of fields) {
      if (f.name in values) add(f.name, values[f.name]!);
      else fd.append(f.name, f.value);
      used.add(f.name);
    }
    for (const [k, v] of Object.entries(values)) if (!used.has(k)) add(k, v);
    return this.request(path, { method: "POST", body: fd, headers: { origin: new URL(this.base).origin, ...headers } });
  }
}

/** Visible text of an HTML page, for assertions about what a person would read. */
export function textOf(html: string): string {
  return decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}
