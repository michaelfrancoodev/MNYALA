/** Whole Tanzanian shillings, written the way customers read them: "TSh 25,000". */
export function formatTzs(amount: number): string {
  return `TSh ${Math.round(amount).toLocaleString("en-US")}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
});
const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "short", year: "numeric" });

/** "17 Oct 2026, 14:30" in East Africa Time, whatever the server's own time zone is. */
export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** The calendar day (YYYY-MM-DD) of an instant in East Africa Time, for grouping and reports. */
export function dayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Dar_es_Salaam", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return parts;
}
