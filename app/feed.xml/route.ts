import { articles } from "@/lib/articles";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const items = [...articles]
    .sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date))
    .map((a) => `<item><title>${esc(a.title)}</title><link>${SITE.url}/guias/${a.slug}/</link><guid>${SITE.url}/guias/${a.slug}/</guid><pubDate>${new Date(a.date + "T06:00:00Z").toUTCString()}</pubDate><description>${esc(a.description)}</description></item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE.name)}</title><link>${SITE.url}/</link><description>${esc(SITE.description)}</description><language>es-es</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
