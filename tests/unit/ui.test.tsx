import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("TextField", () => {
  it("links the label to the input", () => {
    const html = renderToStaticMarkup(<TextField label="Email" name="email" />);
    const id = /<input[^>]*?\sid="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`for="${id}"`);
  });

  it("marks the field invalid and points aria-describedby at the visible error", () => {
    const html = renderToStaticMarkup(<TextField label="Email" error="Barua pepe si sahihi." />);
    const id = /<input[^>]*?\sid="([^"]+)"/.exec(html)?.[1];
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(`aria-describedby="${id}-error"`);
    expect(html).toContain(`id="${id}-error"`);
    expect(html).toContain("Barua pepe si sahihi.");
  });

  it("shows the hint only when there is no error", () => {
    const withHint = renderToStaticMarkup(<TextField label="Simu" hint="Mfano: 0758 730 108" />);
    expect(withHint).toContain("Mfano: 0758 730 108");
    const withError = renderToStaticMarkup(<TextField label="Simu" hint="Mfano" error="Si sahihi" />);
    expect(withError).not.toContain("Mfano");
  });

  it("does not set aria-invalid when valid", () => {
    expect(renderToStaticMarkup(<TextField label="Jina" />)).not.toContain("aria-invalid");
  });

  it("supports required with a visible but screen-reader-hidden marker", () => {
    const html = renderToStaticMarkup(<TextField label="Jina" required />);
    expect(html).toContain("required");
    expect(html).toContain('aria-hidden="true"');
  });
});

describe("TextAreaField and SelectField", () => {
  it("wire label, error and aria attributes the same way", () => {
    const ta = renderToStaticMarkup(<TextAreaField label="Ujumbe" error="Mfupi sana" />);
    expect(ta).toContain("<textarea");
    expect(ta).toContain('aria-invalid="true"');
    const sel = renderToStaticMarkup(
      <SelectField label="Kichwa" error="Chagua kimoja">
        <option value="a">A</option>
      </SelectField>,
    );
    expect(sel).toContain("<select");
    expect(sel).toContain("Chagua kimoja");
  });
});

describe("Alert", () => {
  it("announces errors immediately and other tones politely", () => {
    expect(renderToStaticMarkup(<Alert tone="error">x</Alert>)).toContain('role="alert"');
    expect(renderToStaticMarkup(<Alert tone="success">x</Alert>)).toContain('role="status"');
    expect(renderToStaticMarkup(<Alert>x</Alert>)).toContain('role="status"');
  });
});

describe("Button", () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    expect(renderToStaticMarkup(<Button>Hifadhi</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button type="submit">Tuma</Button>)).toContain('type="submit"');
  });
});
