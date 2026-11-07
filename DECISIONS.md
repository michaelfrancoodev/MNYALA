# Decisions

Each entry: date, gap or deviation, decision, reason.

## 2026-10-18

1. **ORM: Drizzle instead of Prisma.** Drizzle is plain TypeScript with no binary engines, so migrations can be
   generated and tested anywhere, including locked-down CI.
2. **Toolchain versions.** TypeScript 5.9.3, ESLint 9, `@types/node` 22. Newer majors (TypeScript 7, ESLint 10) exist
   but the Next.js ESLint plugins are not yet validated against them. Revisit when they are.
3. **Supply-chain policy.** `pnpm-workspace.yaml` sets `minimumReleaseAge: 20160` (14 days). It already rejected one
   package (nodemailer 10.1.3, published the same day) and pnpm resolved an older release instead.
   Only `sharp`, `@node-rs/argon2`, `esbuild` and `unrs-resolver` may run install scripts.
4. **Fonts are self-hosted through `@fontsource-variable/*` npm packages**, not `next/font/google`, so the build never
   needs to reach Google and production pages make no third-party requests.
5. **Single root layout.** The admin area sets `lang="en"` on its own wrapper element; the public site keeps
   `<html lang="sw">`. This avoids multiple root layouts and keeps one global not-found page.
6. **Native `<dialog>`** is used for confirmation dialogs instead of a Radix dependency (focus trap, Esc and
   backdrop are built in), to keep the dependency list short.
7. **Design direction.** No gradients, glass effects, emoji, or icon-in-a-circle card grids. Warm paper background,
   dark green-black ink, one brand green, 2 to 6 px radii, thin rules instead of shadows, a serif for headings
   (Source Serif 4) and a humanist sans for text (Source Sans 3). Real company photographs only.
   The bright amber #f5a623 fails contrast on light backgrounds (checked in tests), so a deeper "ember" tone is used.

## P2 (authentication)

8. **No sliding sessions.** Next.js Server Components cannot set cookies, so extending a cookie on every request is not
   possible without extra machinery. A session instead ends 14 days after sign-in or after 7 days without use, whichever
   comes first. The user is always loaded from the database on each request, so deactivating someone or changing their
   role takes effect immediately.
9. **`src/proxy.ts` only forwards the requested path** (`x-pathname`) so the admin layout can send a signed-out visitor
   back to the page they wanted. It is not a security control: every page and every action checks the session itself.
10. **Password policy lives in `src/lib/password-policy.ts`** (pure, no native code) so the browser shows the same live
    checklist the server enforces. Minimum 10 characters, a letter and a number, not on a list of common passwords
    (also after stripping trailing digits and symbols), and not containing the person's email or name. Sign-in never
    checks strength, so a password accepted earlier can always be used.
11. **Client address** is only trusted behind our own proxy (`TRUST_PROXY=true`) and is the LAST `X-Forwarded-For` entry.
    Without a known address, only per-email limits apply, so strangers cannot lock everyone out of one shared bucket.
12. **Development email** goes to `data/outbox/*.json` when `MAIL_HOST` is unset. Production refuses to start without
    `MAIL_HOST`, so this can never be active in production.
13. **End-to-end tests** drive the real built server over HTTP with a cookie-keeping client that submits forms the way a
    browser without JavaScript does, and receive email through a real SMTP server run inside the test. Playwright was
    not usable in the build environment (browser downloads are blocked); real-browser checks remain a manual step.
