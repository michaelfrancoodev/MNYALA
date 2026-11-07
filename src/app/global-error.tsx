"use client";

/** Last resort: shown only if the root layout itself fails. Kept free of anything that could fail again. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="sw">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1.5rem", maxWidth: "40rem", margin: "0 auto" }}>
        <h1>Samahani, kuna tatizo</h1>
        <p>Hatukuweza kuonyesha ukurasa huu. Jaribu tena baada ya muda mfupi.</p>
        <button type="button" onClick={reset} style={{ padding: "0.6rem 1.2rem", fontSize: "1rem" }}>
          Jaribu tena
        </button>
      </body>
    </html>
  );
}
