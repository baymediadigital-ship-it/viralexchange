/**
 * One-time import of the legacy Google Sheets data into Supabase.
 * Not part of the deployed app -- run once locally, then delete/archive.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/migrate-legacy-data.ts data/buyer-listings.csv data/deal-tracker.csv
 *
 * Get the two CSVs via Google Sheets -> File -> Download -> CSV (a stable
 * snapshot, not the live published URL) for each of the two tabs.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [listingsPath, dealsPath] = process.argv.slice(2);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}
if (!listingsPath || !dealsPath) {
  console.error("Usage: npx tsx scripts/migrate-legacy-data.ts <listings.csv> <deals.csv>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.trim().split("\n")) {
    const cols: string[] = [];
    let cur = "",
      inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

// "2.4M" / "8.5K" / "22800" -> integer
function parseCount(raw: string): number | null {
  if (!raw) return null;
  const s = raw.trim().replace(/,/g, "");
  const m = s.match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  const suffix = (m[2] || "").toUpperCase();
  if (suffix === "K") n *= 1e3;
  if (suffix === "M") n *= 1e6;
  if (suffix === "B") n *= 1e9;
  return Math.round(n);
}

// "$18,000" / "1,000,000" -> number
function parseMoney(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

// "3.7 years" / "5months" / "17.7 years" -> months
function parseAgeMonths(raw: string): number | null {
  if (!raw) return null;
  const m = raw.match(/([\d.]+)\s*(year|month)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  return Math.round(/year/i.test(m[2]) ? n * 12 : n);
}

// "4.355" / "42.20%" / "76.80%" -> percentage number
function parseEngagement(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace("%", ""));
  return isNaN(n) ? null : n;
}

function mapListingStatus(raw: string): { status: string; unmapped: boolean } {
  const s = (raw || "").toLowerCase();
  if (s.includes("available")) return { status: "available", unmapped: false };
  if (s.includes("pending") || s.includes("negotiat")) return { status: "pending_sale", unmapped: false };
  if (s.includes("sold") || s.includes("closed")) return { status: "sold", unmapped: false };
  if (s.includes("withdraw")) return { status: "withdrawn", unmapped: false };
  if (!s.trim()) return { status: "available", unmapped: false }; // blank rows treated as available (legacy default)
  return { status: "available", unmapped: true };
}

function mapDealStage(raw: string): { stage: string; unmapped: boolean } {
  const s = (raw || "").toLowerCase();
  if (s.includes("closed")) return { stage: "closed", unmapped: false };
  if (s.includes("escrow")) return { stage: "due_diligence", unmapped: false };
  if (s.includes("due")) return { stage: "due_diligence", unmapped: false };
  if (s.includes("negotiat")) return { stage: "negotiating", unmapped: false };
  if (s.includes("inquiry") || s.includes("inquire")) return { stage: "inquiry", unmapped: false };
  if (!s.trim()) return { stage: "inquiry", unmapped: false };
  return { stage: "inquiry", unmapped: true };
}

// The legacy "Monthly Views" column is overloaded: index.html's submit flow
// wrote an actual view-count estimate there, but valuation.html's flow wrote
// a dollar revenue string into the exact same column. They're textually
// distinguishable (revenue starts with $/~$), so split deterministically.
function splitMonthlyMetric(raw: string): { views: number | null; revenue: number | null } {
  if (!raw) return { views: null, revenue: null };
  if (raw.trim().startsWith("$") || raw.trim().startsWith("~$")) {
    return { views: null, revenue: parseMoney(raw) };
  }
  return { views: parseCount(raw), revenue: null };
}

async function migrateListings() {
  const csv = readFileSync(listingsPath, "utf8");
  const rows = parseCSV(csv);
  const headerIdx = rows.findIndex((r) => r[1] && r[1].trim() === "Channel Name");
  if (headerIdx < 0) {
    console.error("Could not find the 'Channel Name' header row in the listings CSV.");
    return;
  }
  const dataRows = rows.slice(headerIdx + 1);
  const toInsert: Record<string, unknown>[] = [];
  const skipped: string[][] = [];

  for (const r of dataRows) {
    const name = (r[1] || "").trim();
    if (!name) continue;
    if (/^(HOW TO PROCEED|Express|Due diligence|Deal closed)/i.test(name)) continue;

    const { views, revenue } = splitMonthlyMetric(r[5] || "");
    const { status, unmapped } = mapListingStatus(r[11] || "");
    if (unmapped) skipped.push(r);

    toInsert.push({
      channel_name: name,
      niche: (r[2] || "").trim() || "Uncategorized",
      sub_niche: (r[3] || "").trim() || null,
      subscribers: parseCount(r[4] || ""),
      monthly_views: views,
      monthly_revenue_usd: revenue,
      raw_monthly_metric_legacy: r[5] || null,
      engagement_rate: parseEngagement(r[6] || ""),
      monetization: (r[7] || "").trim() || null,
      account_age_months: parseAgeMonths(r[8] || ""),
      language: (r[9] || "").trim() || null,
      asking_price_usd: parseMoney(r[10] || ""),
      status,
      raw_status_legacy: r[11] || null,
      channel_url: (r[12] || "").trim() || "https://youtube.com",
    });
  }

  console.log(`Listings: parsed ${toInsert.length} rows, ${skipped.length} with an unmapped status (defaulted to 'available', check raw_status_legacy).`);
  if (skipped.length) console.log("Unmapped status rows:", skipped.map((r) => `${r[1]} -> "${r[11]}"`));

  const { error, count } = await supabase.from("listings").insert(toInsert, { count: "exact" });
  if (error) console.error("Listings insert failed:", error);
  else console.log(`Inserted ${count} listings.`);
}

async function migrateDeals() {
  const csv = readFileSync(dealsPath, "utf8");
  const rows = parseCSV(csv).slice(3); // skip the 3 title/header rows
  const toInsert: Record<string, unknown>[] = [];
  const skipped: string[][] = [];

  for (const r of rows) {
    const channel = (r[0] || "").trim();
    if (!channel) continue;

    const { stage, unmapped } = mapDealStage(r[5] || "");
    if (unmapped) skipped.push(r);

    toInsert.push({
      channel_name: channel,
      niche: (r[1] || "").trim() || null,
      subscribers_snapshot: parseCount(r[2] || ""),
      asking_price_usd: parseMoney(r[3] || ""),
      offer_price_usd: parseMoney(r[4] || ""),
      stage,
      closed_price_usd: parseMoney(r[6] || ""),
      close_date: (r[7] || "").trim() || null,
      notes: (r[8] || "").trim() || null,
    });
  }

  console.log(`Deals: parsed ${toInsert.length} rows, ${skipped.length} with an unmapped stage (defaulted to 'inquiry', check notes/console output above).`);
  if (skipped.length) console.log("Unmapped stage rows:", skipped.map((r) => `${r[0]} -> "${r[5]}"`));

  const { error, count } = await supabase.from("deals").insert(toInsert, { count: "exact" });
  if (error) console.error("Deals insert failed:", error);
  else console.log(`Inserted ${count} deals.`);
}

async function main() {
  await migrateListings();
  await migrateDeals();
}

main();
