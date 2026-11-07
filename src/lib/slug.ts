/** "Mkaa Safi wa Kisasa!" -> "mkaa-safi-wa-kisasa". Strips accents, keeps letters and digits, joins with hyphens. */
export function slugify(input: string, maxLength = 80): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, maxLength).replace(/-+$/g, "");
}

/** First free slug: "mkaa", then "mkaa-2", "mkaa-3"... `taken` answers whether a candidate is already in use. */
export async function uniqueSlug(base: string, taken: (candidate: string) => Promise<boolean>): Promise<string> {
  const root = base || "bidhaa";
  if (!(await taken(root))) return root;
  for (let i = 2; i < 1000; i++) {
    const suffix = `-${i}`;
    const candidate = `${root.slice(0, 80 - suffix.length)}${suffix}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("could not find a free slug");
}
