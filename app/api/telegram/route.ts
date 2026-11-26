import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, tg } from "@/lib/telegram";
import { emailDecisionIfReviewed, loadListingForDecision } from "@/lib/listingDecision";

// Telegram webhook: handles taps on the Approve / Reject buttons sent by
// notifyNewListing, plus /start so the owner can find their chat ID.
//
// Two checks before anything happens:
//  1. Telegram's secret-token header must match TELEGRAM_WEBHOOK_SECRET
//     (set when registering the webhook), so only Telegram can call this.
//  2. Button taps must come from TELEGRAM_ADMIN_CHAT_ID, so nobody else who
//     finds the bot can approve listings.

type Update = {
  message?: { chat: { id: number }; from?: { id: number }; text?: string };
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { chat: { id: number }; message_id: number; text?: string };
  };
};

const ACTIONS = { a: { status: "available", label: "✅ Approved. Now live on /listings." }, r: { status: "rejected", label: "✖ Rejected. The seller sees “Not approved”." } } as const;

function secretMatches(given: string | null) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("Forbidden", { status: 403 });
  }

  const update = (await request.json().catch(() => null)) as Update | null;
  const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  // /start: tell an unconfigured owner their chat ID; otherwise stay quiet to strangers.
  if (update?.message?.text?.startsWith("/start")) {
    const chatId = update.message.chat.id;
    const text = !adminId
      ? `Your chat ID is <code>${chatId}</code>. Put it in TELEGRAM_ADMIN_CHAT_ID to receive listing approvals here.`
      : String(chatId) === adminId
        ? "You're set up. New listings will arrive here for approval."
        : "This bot is private.";
    await tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
    return Response.json({ ok: true });
  }

  const cq = update?.callback_query;
  if (!cq?.data) return Response.json({ ok: true });

  if (!adminId || String(cq.from.id) !== adminId) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Not allowed." });
    return Response.json({ ok: true });
  }

  const [kind, action, id] = cq.data.split(":");
  if (kind !== "lst" || (action !== "a" && action !== "r") || !id) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    return Response.json({ ok: true });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Server is missing its Supabase key.", show_alert: true });
    return Response.json({ ok: true });
  }

  const before = await loadListingForDecision(supabase, id);

  // Only act on submissions still under review, so a stale button can't
  // re-open a rejected listing or un-sell a sold one.
  const { data, error } = await supabase
    .from("listings")
    .update({ status: ACTIONS[action].status })
    .eq("id", id)
    .eq("status", "draft")
    .select("channel_name")
    .maybeSingle();

  const outcome = error
    ? "Couldn't update it. Try the admin page."
    : data
      ? ACTIONS[action].label
      : "Already handled (it's no longer under review).";

  if (error) console.error("telegram listing update failed:", error);
  if (data) await emailDecisionIfReviewed(before, ACTIONS[action].status);

  await tg("answerCallbackQuery", { callback_query_id: cq.id, text: outcome });
  if (cq.message) {
    await tg("editMessageText", {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: `${escapeHtml(cq.message.text ?? "")}\n\n<b>${escapeHtml(outcome)}</b>`,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
  return Response.json({ ok: true });
}
