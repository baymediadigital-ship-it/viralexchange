"use client";

import { useEffect } from "react";
import "../deals.css";

const BUYER_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSI1IjqNXOzxRYu-339b0KMc_N-r2nHnvPy0xHM8B5_f9EJxCciMS_apZqI6Qf9_Rf4VH4jpaurvtZO/pub?gid=1998923427&single=true&output=csv";
const DEAL_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSI1IjqNXOzxRYu-339b0KMc_N-r2nHnvPy0xHM8B5_f9EJxCciMS_apZqI6Qf9_Rf4VH4jpaurvtZO/pub?gid=1265722642&single=true&output=csv";
const TG = "https://t.me/+uM8whHPwYFhjY2Y8";

type Listing = { name: string; niche: string; subs: string; views: string; eng: string; mono: string; age: string; price: string; avail: string };
type Deal = { channel: string; niche: string; subs: string; price: string; offer: string; stage: string; closed: string; date: string };

export default function DealsClient() {
  useEffect(() => {
    let allListings: Listing[] = [];
    let allDeals: Deal[] = [];

    function parseCSV(text: string) {
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

    function stageClass(s: string) {
      const sl = (s || "").toLowerCase();
      if (sl.includes("closed")) return "s-closed";
      if (sl.includes("escrow")) return "s-escrow";
      if (sl.includes("due")) return "s-due";
      if (sl.includes("negot")) return "s-negotiating";
      return "s-inquiry";
    }

    function stageLabel(s: string) {
      const sl = (s || "").toLowerCase();
      if (sl.includes("closed")) return "Closed";
      if (sl.includes("escrow")) return "Escrow";
      if (sl.includes("due")) return "Due Diligence";
      if (sl.includes("negot")) return "Negotiating";
      return "Inquiry";
    }

    function renderListings(items: Listing[]) {
      const grid = document.getElementById("listings-grid");
      if (!grid) return;
      if (!items.length) {
        grid.innerHTML = '<div class="empty">No listings match your filter</div>';
        return;
      }
      grid.innerHTML = items
        .map((r) => {
          const avail = (r.avail || "").toLowerCase().includes("available");
          const sClass = avail ? "status-available" : "status-pending";
          const sLabel = avail ? "🟢 Available" : "⏳ Pending";
          const niche = (r.niche || "Channel").split("/")[0].trim();
          return `<div class="listing-card lg" data-niche="${(r.niche || "").toLowerCase()}">
      <div class="lc-status ${sClass}">${sLabel}</div>
      <div class="lc-niche">${r.niche || "—"}</div>
      <div class="lc-name-wrap">
        <div class="lc-name-blurred">Verified ${niche} Channel</div>
        <div class="lc-lock-badge">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          NDA required
        </div>
      </div>
      <div class="lc-stats">
        <div class="lcs-box"><div class="lcs-label">Subscribers</div><div class="lcs-val">${r.subs || "—"}</div></div>
        <div class="lcs-box"><div class="lcs-label">Monthly views</div><div class="lcs-val">${r.views || "—"}</div></div>
        <div class="lcs-box"><div class="lcs-label">Engagement</div><div class="lcs-val">${r.eng || "—"}</div></div>
        <div class="lcs-box"><div class="lcs-label">Asking price</div><div class="lcs-val price">${r.price || "—"}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="lc-interest" onclick="window.open('${TG}','_blank')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
          Express interest
        </button>
        <div class="lc-privacy-note">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Channel name revealed after NDA signing
        </div>
      </div>
    </div>`;
        })
        .join("");
    }

    function filterListings(niche: string, el: HTMLElement) {
      document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("on"));
      el.classList.add("on");
      const filtered = niche === "all" ? allListings : allListings.filter((r) => (r.niche || "").toLowerCase().includes(niche));
      renderListings(filtered);
    }

    function searchListings(q: string) {
      const filtered = allListings.filter((r) => ((r as any).name + r.niche).toLowerCase().includes(q.toLowerCase()));
      renderListings(filtered);
    }

    function renderPipeline(deals: Deal[]) {
      const body = document.getElementById("pipeline-body");
      if (!body) return;
      if (!deals.length) {
        body.innerHTML =
          '<div style="padding:40px;text-align:center;color:var(--fg-hint);font-family:var(--font-mono),monospace;font-size:12px;">No deals in pipeline yet</div>';
        return;
      }
      body.innerHTML = deals
        .map(
          (d) => `
    <div class="pipeline-row">
      <div><div class="pr-name" style="filter:blur(4px);user-select:none;">${d.stage && d.stage.toLowerCase().includes("closed") ? d.channel || "—" : "Verified Channel"}</div><div class="pr-niche">${d.niche || ""}</div></div>
      <div class="pr-cell">${d.subs || "—"}</div>
      <div class="pr-cell" style="color:var(--green);">${d.price || "—"}</div>
      <div><span class="stage-pill ${stageClass(d.stage)}">${stageLabel(d.stage)}</span></div>
      <div class="pr-cell" style="color:var(--blue);">${d.closed || "—"}</div>
    </div>`,
        )
        .join("");
    }

    async function loadData() {
      try {
        const [br, dr] = await Promise.all([
          fetch(BUYER_CSV + "&t=" + Date.now() + "&r=" + Math.random()),
          fetch(DEAL_CSV + "&t=" + Date.now() + "&r=" + Math.random()),
        ]);
        const buyerRows = parseCSV(await br.text());
        const dealRows = parseCSV(await dr.text());

        const listings = (() => {
          const hi = buyerRows.findIndex((r) => r[1] && r[1].trim() === "Channel Name");
          const start = hi >= 0 ? hi + 1 : 7;
          return buyerRows
            .slice(start)
            .map((r) => {
              if (!r[1] || !r[1].trim()) return null;
              const n = r[0] ? r[0].toString() : "";
              const n2 = r[1] ? r[1].toString() : "";
              if (n.match(/HOW|Express|Due|Deal|verify/i) || n2.match(/HOW|Express|Due|Deal|verify/i)) return null;
              if (!r[2] && !r[11]) return null;
              return r.length >= 11
                ? { name: r[1], niche: r[2], subs: r[4], views: r[5], eng: r[6], mono: r[7], age: r[8], price: r[10], avail: r[11] || "" }
                : null;
            })
            .filter((r): r is Listing => !!r)
            .filter((r) => r.name && r.name.trim() && r.name !== "Channel Name");
        })();

        allListings = listings;
        renderListings(listings);

        const deals = dealRows
          .slice(3)
          .map((r) =>
            r.length >= 6
              ? {
                  channel: (r[0] || "").trim(),
                  niche: (r[1] || "").trim(),
                  subs: (r[2] || "").trim(),
                  price: (r[3] || "").trim(),
                  offer: (r[4] || "").trim(),
                  stage: (r[5] || "").trim(),
                  closed: (r[6] || "").trim(),
                  date: (r[7] || "").trim(),
                }
              : null,
          )
          .filter((r): r is Deal => !!r)
          .filter((r) => r.channel);
        allDeals = deals;
        renderPipeline(deals);

        const closed = deals.filter((d) => (d.stage || "").toLowerCase().includes("closed"));
        const active = deals.filter((d) => !["closed", ""].includes((d.stage || "").toLowerCase()));
        const vol = closed.reduce((s, d) => s + (parseFloat((d.closed || "").replace(/[^0-9.]/g, "")) || 0), 0);
        const avail = listings.filter((r) => (r.avail || "").toLowerCase().includes("available")).length;

        document.getElementById("stat-listed")!.textContent = String(avail || "0");
        document.getElementById("stat-active")!.textContent = String(active.length || "0");
        document.getElementById("stat-closed")!.textContent = String(closed.length || "0");
        document.getElementById("stat-vol")!.textContent = vol ? "$" + Math.round(vol).toLocaleString() : "$0";
      } catch (err) {
        console.error("loadData error:", err);
        const grid = document.getElementById("listings-grid");
        const body = document.getElementById("pipeline-body");
        if (grid) grid.innerHTML = '<div class="empty">Failed to load listings. Please refresh.</div>';
        if (body) body.innerHTML = '<div class="empty">Failed to load deals.</div>';
      }
    }

    (window as any).filterListings = filterListings;
    (window as any).searchListings = searchListings;

    loadData();
  }, []);

  return (
    <div className="deals-page">
      <nav>
        <div className="nav-pill lg">
          <a href="/" className="logo">
            <div className="logo-img">
              <img src="/logo.jpg" alt="VX" />
            </div>
            <div className="logo-name">VIRALEXCHANGE</div>
          </a>
          <div className="nav-links">
            <a href="/">Sell a channel</a>
            <a href="/deals" className="active">
              Pipeline
            </a>
            <a href="/valuation" className="nav-val">
              Free valuation
            </a>
            <a href="/#submit" className="nav-cta nav-links">
              Submit channel
            </a>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="dot-grid"></div>
        <div
          className="glow"
          style={{ width: 500, height: 300, background: "radial-gradient(ellipse,rgba(34,197,94,0.08) 0%,transparent 70%)", top: 0, left: "50%", transform: "translateX(-50%)" }}
        ></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag lg">
            Live pipeline <span className="st-accent">· Updated every 5 min</span>
          </div>
          <h1>
            Deal
            <br />
            <em>pipeline</em>
          </h1>
          <p className="hero-sub">Live view of all active listings, deals in progress, and recently closed transactions on ViralExchange.</p>
          <div className="hero-stats">
            <div className="hs lg">
              <div className="hs-val" id="stat-listed">
                —
              </div>
              <div className="hs-label">Active listings</div>
            </div>
            <div className="hs lg">
              <div className="hs-val" id="stat-active">
                —
              </div>
              <div className="hs-label">Deals in progress</div>
            </div>
            <div className="hs lg">
              <div className="hs-val" id="stat-closed">
                —
              </div>
              <div className="hs-label">Closed deals</div>
            </div>
            <div className="hs lg">
              <div className="hs-val" id="stat-vol">
                —
              </div>
              <div className="hs-label">Total volume</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          {/* AVAILABLE LISTINGS */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Available <em style={{ color: "var(--green)" }}>listings</em>
            </h2>
            <p style={{ fontSize: 13, color: "var(--fg-hint)" }}>Verified channels actively available for acquisition</p>
          </div>
          <div className="filters">
            <div className="filter-tabs">
              <div className="filter-tab on" onClick={(e) => (window as any).filterListings("all", e.currentTarget)}>
                All niches
              </div>
              <div className="filter-tab" onClick={(e) => (window as any).filterListings("finance", e.currentTarget)}>
                Finance
              </div>
              <div className="filter-tab" onClick={(e) => (window as any).filterListings("tech", e.currentTarget)}>
                Tech
              </div>
              <div className="filter-tab" onClick={(e) => (window as any).filterListings("health", e.currentTarget)}>
                Health
              </div>
              <div className="filter-tab" onClick={(e) => (window as any).filterListings("gaming", e.currentTarget)}>
                Gaming
              </div>
              <div className="filter-tab" onClick={(e) => (window as any).filterListings("lifestyle", e.currentTarget)}>
                Lifestyle
              </div>
            </div>
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="search-inp"
                id="search-inp"
                placeholder="Search channels..."
                onChange={(e) => (window as any).searchListings(e.target.value)}
              />
            </div>
          </div>
          <div className="listings-grid" id="listings-grid">
            <div className="empty loading">Loading listings...</div>
          </div>

          {/* DEAL TRACKER */}
          <div style={{ marginBottom: 20, marginTop: 16 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Deal <em style={{ color: "var(--green)" }}>tracker</em>
            </h2>
            <p style={{ fontSize: 13, color: "var(--fg-hint)" }}>All deals across every stage of the pipeline</p>
          </div>
          <div className="pipeline-wrap lg">
            <div className="pipeline-header">
              <div className="ph-cell">Channel</div>
              <div className="ph-cell">Subscribers</div>
              <div className="ph-cell">Price</div>
              <div className="ph-cell">Stage</div>
              <div className="ph-cell">Closed</div>
            </div>
            <div id="pipeline-body">
              <div style={{ padding: 40, textAlign: "center", color: "var(--fg-hint)", fontFamily: "var(--font-mono),monospace", fontSize: 12 }} className="loading">
                Loading pipeline...
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bottom-cta lg">
            <div className="bc-glow"></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "clamp(22px,4vw,36px)", marginBottom: 10 }}>
                Want to be in this
                <br />
                <em>pipeline?</em>
              </h2>
              <p style={{ color: "var(--fg-sub)", fontSize: 15, marginBottom: 24, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.65 }}>
                Submit your channel today. Verified and listed within 24 hours to our buyer network.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/#submit" className="btn-hero">
                  Submit my channel →
                </a>
                <a href="/valuation" className="btn-glass lg" style={{ borderRadius: 100 }}>
                  Get free valuation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span className="footer-copy">&copy; 2026 ViralExchange &nbsp;&middot;&nbsp; Live pipeline data</span>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/valuation">Free valuation</a>
            <a href="mailto:deals@viralexchange.io">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
