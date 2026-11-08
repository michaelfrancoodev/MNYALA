import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
        <Image src="/brand/emblem.webp" alt="Mnyala Logo" width={44} height={44} priority className="size-11 shrink-0" />
        <div>
          <p className="font-serif text-3xl font-extrabold text-brand-dark leading-tight">Mnyala</p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Admin Portal</p>
        </div>
      </header>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8">{children}</div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
          &larr; Back to the website
        </Link>
      </p>
    </main>
  );
}
