// Transactional email via Resend (replaces the old Google Apps Script mailer).
// No-op until RESEND_API_KEY is set, and never throws: an email failure must
// never fail the submission that triggered it.

import { fmt, nicheShort, usd } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://viralexchange.io";
const FROM = process.env.EMAIL_FROM || "ViralExchange <deals@viralexchange.io>";
const ADMIN = process.env.ADMIN_EMAIL || "deals@viralexchange.io";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const isEmail = (s: string | null | undefined): s is string => Boolean(s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()));

type Mail = { to: string | string[]; subject: string; text: string; html: string; replyTo?: string };

async function send(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(mail.to) ? mail.to : [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) console.error("email send failed:", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("email send failed:", e);
  }
}

// Dark mode for mail apps that honour prefers-color-scheme (Apple Mail, Outlook
// for Mac, Hey). Inline styles stay the light default everywhere else; Gmail's
// apps ignore this and auto-invert instead. Colors match the site's dark theme.
const DARK_STYLES = `<style>
:root{color-scheme:light dark;supported-color-schemes:light dark}
@media (prefers-color-scheme: dark){
.vx-bg{background:#101113!important}
.vx-card{background:#16181b!important;border-color:#26292e!important}
.vx-h,.vx-wm,.vx-v{color:#eceef0!important}
.vx-p{color:#a9adb5!important}
.vx-k,.vx-foot,.vx-foot a{color:#8a9099!important}
.vx-rows,.vx-rows td{border-color:#26292e!important}
.vx-btn{background:#eceef0!important;color:#101113!important}
}
</style>`;

/** One plain, on-brand layout: heading, paragraphs, optional detail rows and a button. */
function layout(opts: { heading: string; paragraphs: string[]; rows?: [string, string][]; cta?: { label: string; href: string } }) {
  const rows = opts.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="vx-rows" style="margin:20px 0;border:1px solid #e3e5e8;border-radius:10px;border-collapse:separate">${opts.rows
        .map(
          ([k, v], i) =>
            `<tr><td class="vx-k" style="padding:10px 14px;font-size:13px;color:#6b717a;${i ? "border-top:1px solid #e3e5e8;" : ""}">${esc(k)}</td><td class="vx-v" style="padding:10px 14px;font-size:14px;color:#1b1d21;text-align:right;${i ? "border-top:1px solid #e3e5e8;" : ""}">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const cta = opts.cta
    ? `<p style="margin:24px 0 0"><a class="vx-btn" href="${esc(opts.cta.href)}" style="display:inline-block;background:#1b1d21;color:#ffffff;text-decoration:none;font-size:14px;padding:11px 18px;border-radius:7px">${esc(opts.cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">${DARK_STYLES}</head><body class="vx-bg" style="margin:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 16px"><img src="${SITE_URL}/logo.jpg" width="28" height="28" alt="" style="border-radius:7px;vertical-align:middle"> <span class="vx-wm" style="font-size:15px;color:#1b1d21;vertical-align:middle;margin-left:6px">ViralExchange</span></td></tr>
<tr><td class="vx-card" style="background:#ffffff;border:1px solid #e3e5e8;border-radius:12px;padding:28px">
<h1 class="vx-h" style="margin:0 0 12px;font-size:21px;font-weight:500;letter-spacing:-0.02em;color:#1b1d21">${esc(opts.heading)}</h1>
${opts.paragraphs.map((p) => `<p class="vx-p" style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#4a4f57">${esc(p)}</p>`).join("")}
${rows}${cta}
</td></tr>
<tr><td class="vx-foot" style="padding:16px 4px;font-size:12px;line-height:1.5;color:#a3a8af">ViralExchange · Every deal closes through escrow · <a href="${SITE_URL}" style="color:#a3a8af">viralexchange.io</a><br>We will never ask you to send money or login details by email.</td></tr>
</table></td></tr></table></body></html>`;
}

const plain = (heading: string, paragraphs: string[], rows: [string, string][] = [], link?: string) =>
  [heading, "", ...paragraphs, ...(rows.length ? ["", ...rows.map(([k, v]) => `${k}: ${v}`)] : []), ...(link ? ["", link] : []), "", "ViralExchange · viralexchange.io"].join("\n");

type ListingMail = {
  channel_name: string;
  channel_url?: string | null;
  niche?: string | null;
  subscribers?: number | null;
  asking_price_usd?: number | null;
  seller_contact_name?: string | null;
  seller_contact_email?: string | null;
  seller_notes?: string | null;
};

/** Seller confirmation + a copy to the admin inbox when a channel is submitted. */
export async function emailListingSubmitted(l: ListingMail, sellerEmail: string | null) {
  const asking = l.asking_price_usd ? usd(Number(l.asking_price_usd)) : "Not set";
  if (isEmail(sellerEmail)) {
    const heading = `We've got ${l.channel_name}`;
    const paragraphs = [
      `Thanks${l.seller_contact_name ? `, ${l.seller_contact_name}` : ""}. Your channel is in our review queue. We check every channel within 24 hours, then show it to verified buyers with the name kept private.`,
      "You can follow its status, and change your asking price, from your account.",
    ];
    const rows: [string, string][] = [
      ["Channel", l.channel_name],
      ["Asking price", asking],
      ["Status", "Under review"],
    ];
    await send({
      to: sellerEmail,
      replyTo: ADMIN,
      subject: `We've received ${l.channel_name}`,
      html: layout({ heading, paragraphs, rows, cta: { label: "View my listing", href: `${SITE_URL}/account` } }),
      text: plain(heading, paragraphs, rows, `${SITE_URL}/account`),
    });
  }
  const adminRows: [string, string][] = [
    ["Channel", l.channel_name],
    ["Niche", l.niche || "—"],
    ["Subscribers", l.subscribers ? l.subscribers.toLocaleString() : "—"],
    ["Asking", asking],
    ["Seller", [l.seller_contact_name, l.seller_contact_email, sellerEmail].filter(Boolean).join(" · ") || "—"],
    ["Link", l.channel_url || "—"],
    ...(l.seller_notes ? ([["Seller notes", l.seller_notes]] as [string, string][]) : []),
  ];
  await send({
    to: ADMIN,
    ...(isEmail(sellerEmail) ? { replyTo: sellerEmail } : {}),
    subject: `New listing to review: ${l.channel_name}`,
    html: layout({ heading: "New listing to review", paragraphs: [], rows: adminRows, cta: { label: "Review in admin", href: `${SITE_URL}/admin` } }),
    text: plain("New listing to review", [], adminRows, `${SITE_URL}/admin`),
  });
}

/** Tells the seller their listing was approved or not. */
export async function emailListingDecision(l: ListingMail, sellerEmail: string | null, decision: "approved" | "rejected") {
  if (!isEmail(sellerEmail)) return;
  const approved = decision === "approved";
  const heading = approved ? `${l.channel_name} is live` : `About ${l.channel_name}`;
  const paragraphs = approved
    ? [
        "Good news: your channel passed review and is now listed for verified buyers. The channel name stays private until a buyer is serious and has signed an NDA.",
        "We'll reach out when an offer is worth considering. You can change your asking price from your account at any time.",
      ]
    : [
        "Thanks for submitting your channel. We've reviewed it and can't list it right now.",
        "This is usually about monetization status, channel age or recent performance. Reply to this email if you'd like to know more, or submit again once things change.",
      ];
  await send({
    to: sellerEmail,
    replyTo: ADMIN,
    subject: approved ? `Your listing is live: ${l.channel_name}` : `Your ViralExchange listing: ${l.channel_name}`,
    html: layout({ heading, paragraphs, cta: { label: approved ? "View my listing" : "Go to my account", href: `${SITE_URL}/account` } }),
    text: plain(heading, paragraphs, [], `${SITE_URL}/account`),
  });
}

/** Applicant confirmation + a copy to the admin inbox for acquisition applications. */
export async function emailAcquisitionApplication(a: {
  name: string;
  email: string;
  contact?: string | null;
  budgetLabel: string;
  niche: string;
  experience: string;
  goals?: string | null;
}) {
  const heading = `Thanks, ${a.name}`;
  const paragraphs = [
    "We've received your application to acquire a channel. We review every application within 24 hours and will reach out to talk through what you're looking for.",
    "Every acquisition closes through escrow, and your money doesn't move until the channel transfer is complete.",
  ];
  const rows: [string, string][] = [
    ["Budget", a.budgetLabel],
    ["Preferred niche", a.niche],
    ["Experience", a.experience],
  ];
  if (isEmail(a.email)) {
    await send({
      to: a.email,
      replyTo: ADMIN,
      subject: "We've received your application",
      html: layout({ heading, paragraphs, rows }),
      text: plain(heading, paragraphs, rows),
    });
  }
  const adminRows: [string, string][] = [
    ["Name", a.name],
    ["Email", a.email],
    ["Contact", a.contact || "—"],
    ...rows,
    ["Goals", a.goals || "—"],
  ];
  await send({
    to: ADMIN,
    ...(isEmail(a.email) ? { replyTo: a.email } : {}),
    subject: `New acquisition application: ${a.name} (${a.budgetLabel})`,
    html: layout({ heading: "New acquisition application", paragraphs: [], rows: adminRows }),
    text: plain("New acquisition application", [], adminRows),
  });
}

/** Buyer confirmation + admin notification when someone expresses interest in a listing. */
export async function emailListingInquiry(i: {
  listing: { id: string; niche: string | null; subscribers: number | null; monthly_views: number | null; asking_price_usd: number | null };
  name: string;
  email: string;
  budget: string | null;
  message: string | null;
}) {
  const label = `Verified ${nicheShort(i.listing.niche)} channel`;
  const rows: [string, string][] = [
    ["Listing", label],
    ["Subscribers", i.listing.subscribers ? fmt(i.listing.subscribers) : "—"],
    ["Asking", i.listing.asking_price_usd ? usd(Number(i.listing.asking_price_usd)) : "Open to offers"],
  ];
  const heading = `Thanks, ${i.name}`;
  const paragraphs = [
    `We've got your interest in the ${label}. We'll be in touch within 24 hours.`,
    "Next, we'll confirm who you are and ask you to sign an NDA. Then we share the channel name, link and full analytics. Every deal closes through escrow.",
  ];
  await send({
    to: i.email,
    replyTo: ADMIN,
    subject: `Your interest in the ${label}`,
    html: layout({ heading, paragraphs, rows }),
    text: plain(heading, paragraphs, rows),
  });
  const adminRows: [string, string][] = [
    ...rows,
    ["Monthly views", i.listing.monthly_views ? fmt(i.listing.monthly_views) : "—"],
    ["Listing ID", i.listing.id],
    ["Buyer", i.name],
    ["Email", i.email],
    ["Budget", i.budget || "—"],
    ["Message", i.message || "—"],
  ];
  await send({
    to: ADMIN,
    replyTo: i.email,
    subject: `New buyer interest: ${label} (${i.name})`,
    html: layout({ heading: "New buyer interest", paragraphs: [], rows: adminRows, cta: { label: "Open admin", href: `${SITE_URL}/admin` } }),
    text: plain("New buyer interest", [], adminRows, `${SITE_URL}/admin`),
  });
}
