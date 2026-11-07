/** Digits only, no leading plus or zeros that the wa.me format does not accept. */
export function whatsappDigits(number: string): string {
  return number.replace(/\D/g, "");
}

export function whatsappLink(number: string, message?: string): string {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "+255 758 730 108" or "0758 730 108" -> "tel:+255758730108" */
export function telLink(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export function mailtoLink(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}
