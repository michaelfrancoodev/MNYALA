import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <header className="mb-8">
        <p className="font-serif text-3xl font-semibold text-brand-dark">Mnyala</p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Admin</p>
      </header>
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">{children}</div>
      <p className="mt-6 text-sm text-muted">
        <Link href="/">Back to the website</Link>
      </p>
    </main>
  );
}
