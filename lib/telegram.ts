// Minimal Telegram Bot API client for admin notifications and approvals.
// Everything is a no-op until TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID
// are set, so the site works the same with or without the bot.

import { fmt, usd } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viralexchange.io";

type InlineButton = { text: string; callback_data?: string; url?: string };

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID);
}

export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as { ok: boolean; result?: T; description?: string } | null;
  if (!json?.ok) {
    console.error(`telegram ${method} failed:`, json?.description ?? res.status);
    return null;
  }
  return json.result ?? null;
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Callback payloads for listing decisions: "lst:a:<id>" approve, "lst:r:<id>" reject (max 64 bytes). */
export const listingCallback = (action: "a" | "r", id: string) => `lst:${action}:${id}`;

export type ListingForReview = {
  id: string;
  channel_name: string;
  channel_url: string;
  niche: string | null;
  subscribers: number | null;
  monthly_views: number | null;
  monthly_revenue_usd: number | null;
  asking_price_usd: number | null;
  monetization: string | null;
  seller_contact_name: string | null;
  seller_contact_email: string | null;
};

export function listingReviewText(l: ListingForReview) {
  const stats = [
    l.subscribers ? `${fmt(l.subscribers)} subs` : null,
    l.monthly_views ? `${fmt(l.monthly_views)} views/mo` : null,
    l.monthly_revenue_usd ? `${usd(Number(l.monthly_revenue_usd))}/mo revenue` : null,
  ].filter(Boolean);
  return [
    "<b>New listing to review</b>",
    "",
    `<b>${escapeHtml(l.channel_name)}</b>${l.niche ? ` · ${escapeHtml(l.niche)}` : ""}`,
    ...(stats.length ? [stats.join(" · ")] : []),
    `Asking: ${l.asking_price_usd ? usd(Number(l.asking_price_usd)) : "not set"}${l.monetization ? ` · ${escapeHtml(l.monetization)}` : ""}`,
    `Seller: ${escapeHtml([l.seller_contact_name, l.seller_contact_email].filter(Boolean).join(" · ") || "unknown")}`,
    escapeHtml(l.channel_url),
  ].join("\n");
}

/** Pings the admin about a new submission with Approve / Reject buttons. Never throws. */
export async function notifyNewListing(l: ListingForReview) {
  if (!telegramConfigured()) return;
  const keyboard: InlineButton[][] = [
    [
      { text: "✅ Approve", callback_data: listingCallback("a", l.id) },
      { text: "✖ Reject", callback_data: listingCallback("r", l.id) },
    ],
    [{ text: "Review in admin", url: `${SITE_URL}/admin` }],
  ];
  try {
    await tg("sendMessage", {
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text: listingReviewText(l),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: keyboard },
    });
  } catch (e) {
    console.error("notifyNewListing failed:", e);
  }
}

/** Tells the admin a seller changed the asking price. Never throws. */
export async function notifyPriceChange(l: { channel_name: string; status: string }, from: number | null, to: number) {
  if (!telegramConfigured()) return;
  try {
    await tg("sendMessage", {
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text: [
        "<b>Asking price changed</b>",
        "",
        `<b>${escapeHtml(l.channel_name)}</b> (${escapeHtml(l.status === "draft" ? "under review" : l.status === "available" ? "live" : "in negotiation")})`,
        `${from ? usd(from) : "not set"} → ${usd(to)}`,
      ].join("\n"),
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Open admin", url: `${SITE_URL}/admin` }]] },
    });
  } catch (e) {
    console.error("notifyPriceChange failed:", e);
  }
}
