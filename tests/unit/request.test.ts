import { describe, expect, it } from "vitest";
import { clientIp, ipKey, isSameOrigin, userAgent } from "@/server/request";

const h = (o: Record<string, string>) => new Headers(o);

describe("clientIp", () => {
  it("is unknown unless we are behind our own proxy", () => {
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.9" }), false)).toBeNull();
  });

  it("uses the LAST forwarded address, the one our proxy appended, not a client-supplied first one", () => {
    expect(clientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }), true)).toBe("203.0.113.9");
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.9" }), true)).toBe("203.0.113.9");
  });

  it("accepts IPv6 and rejects garbage", () => {
    expect(clientIp(h({ "x-forwarded-for": "2001:db8::1" }), true)).toBe("2001:db8::1");
    expect(clientIp(h({ "x-forwarded-for": "not-an-ip" }), true)).toBeNull();
    expect(clientIp(h({ "x-forwarded-for": "1.2.3.4, <script>" }), true)).toBeNull();
    expect(clientIp(h({}), true)).toBeNull();
  });

  it("ipKey gives unknown addresses a shared bucket name", () => {
    expect(ipKey(null)).toBe("unknown");
    expect(ipKey("1.2.3.4")).toBe("1.2.3.4");
  });
});

describe("isSameOrigin (CSRF guard for route handlers)", () => {
  const app = "https://mnyala.co.tz";
  it.each([
    ["https://mnyala.co.tz", true],
    ["https://mnyala.co.tz:443", true],
    ["http://mnyala.co.tz", false],
    ["https://evil.test", false],
    ["https://mnyala.co.tz.evil.test", false],
    ["null", false],
    ["", false],
    ["garbage", false],
  ])("Origin %j -> %s", (origin, ok) => {
    expect(isSameOrigin(h(origin ? { origin } : {}), app)).toBe(ok);
  });

  it("rejects a request with no Origin header at all", () => {
    expect(isSameOrigin(h({}), app)).toBe(false);
  });
});

describe("userAgent", () => {
  it("truncates and tolerates absence", () => {
    expect(userAgent(h({ "user-agent": "x".repeat(1000) }))).toHaveLength(300);
    expect(userAgent(h({}))).toBeNull();
  });
});
