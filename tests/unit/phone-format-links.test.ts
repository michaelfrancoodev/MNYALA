import { describe, expect, it } from "vitest";
import { mailtoLink, telLink, whatsappDigits, whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import { normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it.each([
    ["0758 730 108", "+255758730108"],
    ["0758-730-108", "+255758730108"],
    ["0758730108", "+255758730108"],
    ["+255 758 730 108", "+255758730108"],
    ["+255758730108", "+255758730108"],
    ["255758730108", "+255758730108"],
    ["00255758730108", "+255758730108"],
    ["758730108", "+255758730108"],
    ["(0758) 730.108", "+255758730108"],
    ["  0712345678  ", "+255712345678"],
    ["022 2123456", "+255222123456"],
    ["+254 712 345 678", "+254712345678"],
    ["+44 20 7946 0958", "+442079460958"],
    ["0044 20 7946 0958", "+442079460958"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([
    "", "   ", "abc", "0758 730 10", "07587301080", "+255 75 873", "+0758730108", "12345", "0000000000",
    "0758-730-108 ext 5", "<script>", "+255758730108; DROP TABLE", "++255758730108", "+2557587301089999999",
  ])("rejects %j", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it("is idempotent", () => {
    const once = normalizePhone("0758 730 108")!;
    expect(normalizePhone(once)).toBe(once);
  });
});

describe("contact links", () => {
  it("whatsapp keeps digits only", () => {
    expect(whatsappDigits("+255 758-730-108")).toBe("255758730108");
    expect(whatsappLink("+255 758 730 108")).toBe("https://wa.me/255758730108");
  });
  it("encodes the prefilled message so it cannot break out of the URL", () => {
    const url = whatsappLink("255758730108", "Habari & hello? #1 \"x\"");
    expect(url).toBe("https://wa.me/255758730108?text=Habari%20%26%20hello%3F%20%231%20%22x%22");
  });
  it("tel and mailto are safe", () => {
    expect(telLink("+255 758 730 108")).toBe("tel:+255758730108");
    expect(telLink("0758 730 108 <x>")).toBe("tel:0758730108");
    expect(mailtoLink("info@mnyala.co.tz")).toBe("mailto:info@mnyala.co.tz");
    expect(mailtoLink("a@b.co", "Ombi la bei & zaidi")).toBe("mailto:a@b.co?subject=Ombi%20la%20bei%20%26%20zaidi");
  });
});

describe("formatTzs", () => {
  it("groups thousands and never shows decimals", () => {
    expect(formatTzs(25000)).toBe("TSh 25,000");
    expect(formatTzs(0)).toBe("TSh 0");
    expect(formatTzs(1250000)).toBe("TSh 1,250,000");
    expect(formatTzs(999.6)).toBe("TSh 1,000");
  });
});

import { dayKey, formatDate, formatDateTime } from "@/lib/format";

describe("dates are shown in East Africa Time whatever the server's zone is", () => {
  it("formatDateTime", () => {
    expect(formatDateTime(new Date("2026-10-17T11:30:00Z"))).toBe("17 Oct 2026, 14:30");
    expect(formatDateTime(new Date("2026-01-01T23:59:00Z"))).toBe("2 Jan 2026, 02:59");
  });
  it("formatDate", () => {
    expect(formatDate(new Date("2026-10-17T22:30:00Z"))).toBe("18 Oct 2026");
  });
  it("dayKey groups by the local calendar day, so late evening sales count on the right day", () => {
    expect(dayKey(new Date("2026-10-17T20:59:00Z"))).toBe("2026-10-17");
    expect(dayKey(new Date("2026-10-17T21:00:00Z"))).toBe("2026-10-18");
  });
});
