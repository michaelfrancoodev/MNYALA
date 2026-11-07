import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Mnyala Admin" },
  robots: { index: false, follow: false },
};

/** The admin is in English; the public site is Kiswahili. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
