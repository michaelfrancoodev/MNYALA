import { describe, expect, it } from "vitest";
import { MESSAGE_MAX, cleanText, contactSchema } from "@/lib/validators/contact";

const ok = { fullName: "Asha Mwakyusa", email: "asha@example.com", phone: "0758 730 108", subject: "mkaa", message: "Habari, nahitaji mkaa wa kilo 30." };

function errorsOf(input: Record<string, unknown>): Record<string, string> {
  const r = contactSchema.safeParse(input);
  if (r.success) return {};
  return Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
}

describe("contactSchema", () => {
  it("accepts a normal message and normalises it", () => {
    const r = contactSchema.parse({ ...ok, fullName: "  Asha   Mwakyusa ", email: " asha@example.com " });
    expect(r).toMatchObject({ fullName: "Asha Mwakyusa", email: "asha@example.com", phone: "+255758730108", subject: "mkaa" });
  });

  it("treats the phone as optional", () => {
    expect(contactSchema.parse({ ...ok, phone: "" }).phone).toBeNull();
    expect(contactSchema.parse({ ...ok, phone: "   " }).phone).toBeNull();
  });

  it("explains each problem in Kiswahili, next to the field it belongs to", () => {
    expect(errorsOf({ ...ok, fullName: "" }).fullName).toBe("Tafadhali andika jina lako kamili.");
    expect(errorsOf({ ...ok, fullName: "A" }).fullName).toBe("Tafadhali andika jina lako kamili.");
    expect(errorsOf({ ...ok, email: "" }).email).toBe("Tafadhali andika barua pepe yako.");
    expect(errorsOf({ ...ok, email: "not-an-email" }).email).toBe("Barua pepe si sahihi.");
    expect(errorsOf({ ...ok, phone: "12" }).phone).toMatch(/Namba ya simu si sahihi/);
    expect(errorsOf({ ...ok, subject: "" }).subject).toBe("Chagua kichwa cha ujumbe.");
    expect(errorsOf({ ...ok, subject: "hack" }).subject).toBe("Chagua kichwa cha ujumbe.");
    expect(errorsOf({ ...ok, message: "Hi" }).message).toMatch(/angalau herufi 10/);
  });

  it("rejects over-long input instead of failing later in the database (the old app returned a 500)", () => {
    expect(errorsOf({ ...ok, fullName: "x".repeat(500) }).fullName).toMatch(/refu mno/);
    expect(errorsOf({ ...ok, email: "a".repeat(250) + "@b.co" }).email).toBeTruthy();
    expect(errorsOf({ ...ok, message: "x".repeat(MESSAGE_MAX + 1) }).message).toMatch(/refu mno/);
    expect(errorsOf({ ...ok, phone: "0".repeat(40) }).phone).toBeTruthy();
    expect(errorsOf({ ...ok, message: "x".repeat(MESSAGE_MAX) })).toEqual({});
  });

  it("counts the trimmed message, so spaces cannot satisfy the minimum", () => {
    expect(errorsOf({ ...ok, message: "          a          " }).message).toBeTruthy();
  });

  it("removes NUL and control characters that PostgreSQL cannot store", () => {
    const r = contactSchema.parse({ ...ok, fullName: "As\u0000ha\u0007 Mw", message: "Habari\u0000 yako\u001b[31m rafiki" });
    expect(r.fullName).toBe("Asha Mw");
    expect(r.message).not.toMatch(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/);
  });

  it("keeps line breaks and normalises Windows newlines", () => {
    expect(cleanText("a\r\nb\rc\nd\te")).toBe("a\nb\nc\nd\te");
  });

  it("accepts only a well-formed product slug", () => {
    expect(contactSchema.parse({ ...ok, product: "mkaa-safi-wa-kisasa" }).product).toBe("mkaa-safi-wa-kisasa");
    expect(contactSchema.parse({ ...ok, product: "" }).product).toBeUndefined();
    expect(contactSchema.safeParse({ ...ok, product: "../../etc" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, product: "A B" }).success).toBe(false);
  });

  it("keeps markup as plain text (it is escaped wherever it is shown)", () => {
    const r = contactSchema.parse({ ...ok, message: "<script>alert(1)</script> habari yako" });
    expect(r.message).toContain("<script>");
  });
});
