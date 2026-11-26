/**
 * Only allow same-site paths as a post-login destination. Blocks open
 * redirects like ?next=https://evil.example or ?next=//evil.example.
 */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
