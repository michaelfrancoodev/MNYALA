import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Mnyala Co. Ltd", template: "%s | Mnyala Co. Ltd" },
  description:
    "Mkaa safi, majiko, mbegu za mbono na mboji kutoka Mbeya, Tanzania.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
