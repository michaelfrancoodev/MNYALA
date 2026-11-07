/**
 * Structured data for search engines. The JSON is produced by us from known fields, and every "<" is
 * escaped so a value can never close the script tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  // eslint-disable-next-line react/no-danger -- the only way to emit raw JSON in a script tag; input is escaped above
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
