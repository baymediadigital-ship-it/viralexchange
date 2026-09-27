export function fmt(n: number | null | undefined): string {
  if (!n || isNaN(n)) return "—";
  n = Math.round(n);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

export function usd(n: number | null | undefined): string {
  if (!n) return "—";
  return "$" + Math.round(n).toLocaleString();
}

export function initials(name: string): string {
  return (
    name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "VX"
  );
}

export type ParsedYouTubeRef = { type: "id" | "handle"; value: string };

export function parseYouTubeURL(raw: string): ParsedYouTubeRef {
  raw = raw.trim();
  const patterns = [
    /youtube\.com\/@([\w.-]+)/,
    /youtube\.com\/c\/([\w.-]+)/,
    /youtube\.com\/user\/([\w.-]+)/,
    /youtube\.com\/channel\/(UC[\w-]+)/,
  ];
  for (const r of patterns) {
    const m = raw.match(r);
    if (m) return { type: m[1].startsWith("UC") ? "id" : "handle", value: m[1] };
  }
  if (/^UC[\w-]{22}$/.test(raw)) return { type: "id", value: raw };
  if (raw.startsWith("@")) return { type: "handle", value: raw.slice(1) };
  return { type: "handle", value: raw.replace(/^@/, "") };
}
