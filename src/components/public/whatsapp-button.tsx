import { whatsappLink } from "@/lib/contact-links";
import { COMMON } from "@/messages/sw";

/** Fixed to the corner so a customer can reach the business from any page in one tap. */
export function WhatsAppButton({ number }: { number?: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, "Habari Mnyala, nahitaji msaada.")}
      aria-label="Tuma ujumbe kwa WhatsApp"
      className="fixed bottom-4 right-4 z-30 inline-flex min-h-12 items-center rounded-md border border-brand-dark bg-brand px-5 font-semibold text-white no-underline hover:bg-brand-dark sm:bottom-6 sm:right-6"
    >
      {COMMON.whatsapp}
    </a>
  );
}
