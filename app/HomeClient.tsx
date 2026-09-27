"use client";

import { useEffect } from "react";
import "./home.css";
import { fmt, initials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { submitListing as submitListingAction } from "@/lib/actions/listings";

export default function HomeClient() {
  useEffect(() => {
    function setStatus(msg: string, loading = false) {
      const el = document.getElementById("status-msg");
      if (!el) return;
      el.innerHTML = loading
        ? `<div class="spinner"></div><span>${msg}</span>`
        : `<span style="color:var(--red)">${msg}</span>`;
      el.style.display = msg ? "flex" : "none";
    }

    async function fetchChannel() {
      const url = (document.getElementById("url-input") as HTMLInputElement).value.trim();
      if (!url) {
        setStatus("Please paste your YouTube channel URL.");
        return;
      }
      setStatus("Fetching channel data...", true);
      (document.getElementById("fetch-btn") as HTMLButtonElement).disabled = true;
      try {
        const r = await fetch(`/api/youtube/channel-stats?url=${encodeURIComponent(url)}`);
        const d = await r.json();
        if (d.error) throw new Error(d.error);
        renderChannel(d, url);
        setStatus("");
      } catch (e) {
        setStatus("Error: " + (e as Error).message);
      }
      (document.getElementById("fetch-btn") as HTMLButtonElement).disabled = false;
    }

    function renderChannel(d: any, originalUrl: string) {
      const subs = d.subscribers || 0;
      const vids = d.videos || 0;
      const views = d.views || 0;
      const avgV = d.avgViewsPerVideo || 0;
      const eng = subs > 0 ? ((avgV / subs) * 100).toFixed(1) + "%" : "—";
      const ageMonths = d.ageMonths || null;
      const estMonthly = d.estimatedMonthlyViews || null;
      document.getElementById("ch-name")!.textContent = d.name;
      document.getElementById("ch-handle")!.textContent = d.handle || originalUrl;
      if (d.thumbnail) {
        document.getElementById("ch-avatar")!.innerHTML =
          `<img src="${d.thumbnail}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
      } else {
        document.getElementById("ch-init")!.textContent = initials(d.name);
      }
      document.getElementById("f-subs")!.textContent = fmt(subs);
      document.getElementById("f-vids")!.textContent = fmt(vids);
      document.getElementById("f-views")!.textContent = fmt(views);
      document.getElementById("f-avg")!.textContent = fmt(avgV);
      document.getElementById("f-eng")!.textContent = eng;
      if (ageMonths) document.getElementById("f-age")!.textContent = (ageMonths / 12).toFixed(1) + " yrs";
      document.getElementById("mv-val")!.textContent = estMonthly ? fmt(estMonthly) + "/mo" : "—";
      (window as any)._ch = {
        name: d.name,
        handle: d.handle || originalUrl,
        subs,
        vids,
        views,
        avgV,
        eng,
        ageMonths,
        estMonthly,
        confirmedMonthly: null,
      };
      document.getElementById("fetched-panel")!.style.display = "block";
      setTimeout(
        () => document.getElementById("fetched-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        200,
      );
    }

    function confirmMonthly() {
      const val = parseInt((document.getElementById("mv-override") as HTMLInputElement).value);
      if (!val || isNaN(val)) return;
      (window as any)._ch.confirmedMonthly = val;
      document.getElementById("mv-val")!.textContent = fmt(val) + "/mo";
      const box = document.getElementById("mv-box")!;
      box.className = "mv-box confirmed";
      box.querySelector(".mvl")!.textContent = "Monthly views — confirmed ✓";
      box.querySelector(".mvn")!.textContent = "We'll use your confirmed figure in the listing.";
    }

    const submitBtnIcon =
      '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Submit my channel';

    async function submitListing() {
      const d = (window as any)._ch || {};
      if (!d.name) {
        alert("Please fetch your channel first.");
        return;
      }
      const btn = document.querySelector(".submit-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML =
        '<div class="spinner" style="border-top-color:#050805;width:14px;height:14px;border-width:2px;"></div> Submitting...';

      const result = await submitListingAction({
        channelName: d.name,
        channelUrl: (document.getElementById("url-input") as HTMLInputElement).value.trim(),
        niche: (document.getElementById("f-niche") as HTMLInputElement).value,
        subNiche: (document.getElementById("f-subniche") as HTMLInputElement).value,
        subscribers: d.subs,
        monthlyViews: d.confirmedMonthly || d.estMonthly || undefined,
        engagementRate: parseFloat(d.eng) || undefined,
        monetization: (document.getElementById("f-mono") as HTMLSelectElement).value,
        accountAgeMonths: d.ageMonths || undefined,
        language: (document.getElementById("f-lang") as HTMLInputElement).value || "English",
        askingPriceUsd: (document.getElementById("f-price") as HTMLInputElement).value
          ? parseInt((document.getElementById("f-price") as HTMLInputElement).value)
          : undefined,
        sellerContactName: (document.getElementById("f-name") as HTMLInputElement).value.trim(),
        sellerContactEmail: (document.getElementById("f-contact") as HTMLInputElement).value.trim(),
      });

      if (result.error) {
        alert(result.error);
        btn.disabled = false;
        btn.innerHTML = submitBtnIcon;
        return;
      }

      document.getElementById("form-main")!.style.display = "none";
      document.getElementById("success-screen")!.style.display = "block";
    }

    function resetAll() {
      (document.getElementById("url-input") as HTMLInputElement).value = "";
      document.getElementById("fetched-panel")!.style.display = "none";
      document.getElementById("form-main")!.style.display = "block";
      document.getElementById("success-screen")!.style.display = "none";
      document.getElementById("status-msg")!.style.display = "none";
      (window as any)._ch = null;
      const btn = document.querySelector(".submit-btn") as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = submitBtnIcon;
      }
    }

    function animateCount(id: string, target: number, prefix: string) {
      const el = document.getElementById(id);
      if (!el) return;
      const steps = 40,
        dur = 1200;
      let step = 0,
        cur = 0;
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity 0.4s ease,transform 0.4s ease";
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 100);
      const t = setInterval(() => {
        step++;
        cur = Math.min(cur + target / steps, target);
        el.textContent = prefix + (prefix === "$" && cur >= 1000 ? Math.round(cur).toLocaleString() : Math.round(cur));
        if (step >= steps) clearInterval(t);
      }, dur / steps);
    }

    async function loadData() {
      const supabase = createClient();
      try {
        const [listingsRes, dealsRes] = await Promise.all([
          supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "available"),
          supabase
            .from("deals_public_pipeline")
            .select("channel_name,niche,subscribers_snapshot,closed_price_usd,stage,close_date")
            .eq("stage", "closed"),
        ]);
        if (listingsRes.error) throw listingsRes.error;
        if (dealsRes.error) throw dealsRes.error;

        const listed = listingsRes.count || 0;
        const closed = dealsRes.data || [];
        const vol = closed.reduce((s, d) => s + (Number(d.closed_price_usd) || 0), 0);

        animateCount("t-sold", closed.length, "");
        animateCount("t-vol", vol, "$");
        animateCount("t-listed", listed, "");
        animateCount("nc-sold", closed.length, "");
        animateCount("nc-listed", listed, "");
        if (vol > 0) {
          const bigEl = document.getElementById("big-vol");
          if (bigEl) bigEl.innerHTML = `<em>$${Math.round(vol).toLocaleString()}</em>`;
        }
        const grid = document.getElementById("deals-grid");
        if (!grid) return;
        if (closed.length === 0) {
          grid.innerHTML =
            '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--fg-hint);font-family:var(--font-mono),monospace;font-size:13px;">First closed deal coming soon</div>';
        } else {
          grid.innerHTML = closed
            .map(
              (d) =>
                `<div class="deal-card lg"><div class="deal-niche">${d.niche || ""}</div><div class="deal-channel">${d.channel_name || ""}</div><div class="deal-stats"><div class="deal-stat"><div class="dsl">Subscribers</div><div class="dsv">${fmt(d.subscribers_snapshot)}</div></div><div class="deal-stat"><div class="dsl">Closed price</div><div class="dsv price">${d.closed_price_usd ? "$" + Number(d.closed_price_usd).toLocaleString() : "—"}</div></div></div><div class="sold-badge">✓ Sold${d.close_date ? " · " + d.close_date : ""}</div></div>`,
            )
            .join("");
        }
      } catch (e) {
        console.log(e);
      }
    }

    async function loadMarquee() {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("deals_public_pipeline")
          .select("channel_name,closed_price_usd")
          .eq("stage", "closed")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        const track = document.getElementById("marquee-track");
        if (!track) return;
        const fallback: [string, string, string][] = [
          ["T", "TechPulse Daily", "$18,500"],
          ["F", "FoodieNaija", "$4,200"],
          ["S", "StudyWithMe Hub", "$12,000"],
          ["G", "GreenTech Builds", "$9,000"],
          ["B", "BodyCam Premium", "$5,000"],
          ["C", "Celebrix", "$35,000"],
        ];
        const items: [string, string, string][] =
          data && data.length > 0
            ? data.map((d) => {
                const name = (d.channel_name || "").trim();
                const price = d.closed_price_usd ? "$" + Number(d.closed_price_usd).toLocaleString() : "—";
                return [name.charAt(0).toUpperCase(), name, price];
              })
            : fallback;
        const all = [...items, ...items];
        track.innerHTML = all
          .map(([i, n, p]) => `<div class="brand-pill lg"><div class="brand-icon">${i}</div>${n} &nbsp;&middot;&nbsp; Sold ${p}</div>`)
          .join("");
      } catch (e) {
        console.log("Marquee:", e);
      }
    }

    (window as any).fetchChannel = fetchChannel;
    (window as any).confirmMonthly = confirmMonthly;
    (window as any).submitListing = submitListing;
    (window as any).resetAll = resetAll;

    loadData();
    loadMarquee();
  }, []);

  return (
    <div className="home-page">
      <div className="dot-grid"></div>

      {/* NAV */}
      <nav>
        <div className="nav-pill lg">
          <a href="/" className="logo">
            <div className="logo-img">
              <img src="/logo.jpg" alt="VX" />
            </div>
            <div className="logo-name">VIRALEXCHANGE</div>
          </a>
          <div className="nav-links">
            <a href="/valuation" className="nav-link hi">
              Free valuation
            </a>
            <a href="#deals" className="nav-link">
              Closed deals
            </a>
            <a href="/deals" className="nav-link">
              Pipeline
            </a>
            <a href="https://t.me/+uM8whHPwYFhjY2Y8" target="_blank" className="nav-link">
              Buyers Lounge
            </a>
            <a href="#submit" className="nav-cta">
              Sell a channel
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero fade-up" style={{ zIndex: 1 }}>
        <div className="glow-hero"></div>
        <div className="hero-badge lg">
          The #1 YouTube Channel Marketplace
          <div className="hero-badge-inner">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3" fill="currentColor" style={{ animation: "pulse 2s infinite" }} />
            </svg>
            Live
          </div>
        </div>
        <h1>
          Buy &amp; sell YouTube
          <br />
          channels <em>with confidence</em>
        </h1>
        <p className="hero-sub">
          We connect serious channel sellers with verified buyers. Secure escrow, fast closings, zero hassle.
        </p>
        <div className="hero-btns">
          <a href="#submit" className="btn-p">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sell my channel
          </a>
          <a href="https://t.me/+uM8whHPwYFhjY2Y8" target="_blank" className="btn-g lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
            </svg>
            Browse listings
          </a>
        </div>

        {/* MARQUEE */}
        <div className="marquee-wrap" style={{ width: "100%" }}>
          <div className="marquee-track" id="marquee-track">
            <div className="brand-pill lg">
              <div className="brand-icon">·</div>Loading...
            </div>
          </div>
        </div>

        {/* TRUST BAR */}
        <div className="container" style={{ width: "100%", padding: 0 }}>
          <div
            className="trust-bar fade-up-2"
            id="trust-bar"
            style={{ opacity: 1, transform: "translateY(0)", transition: "opacity 0.6s ease,transform 0.6s ease" }}
          >
            <div className="trust-item">
              <div className="trust-num" id="t-sold">
                —
              </div>
              <div className="trust-label">Channels sold</div>
            </div>
            <div className="trust-item">
              <div className="trust-num" id="t-vol">
                —
              </div>
              <div className="trust-label">Transaction volume</div>
            </div>
            <div className="trust-item">
              <div className="trust-num" id="t-listed">
                —
              </div>
              <div className="trust-label">Active listings</div>
            </div>
            <div className="trust-item">
              <div className="trust-num" id="t-response">
                24h
              </div>
              <div className="trust-label">Avg response time</div>
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS */}
      <div className="section" id="process">
        <div className="container">
          <div className="section-badge lg">
            How it works{" "}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>{" "}
            <span className="hi">4 steps</span>
          </div>
          <h2>
            Simple process,
            <br />
            <em>serious results</em>
          </h2>
          <p className="section-sub">From submission to payment — we handle everything so you can focus on what&apos;s next.</p>
          <div className="process-grid">
            <div className="proc-card lg">
              <div className="proc-num">STEP 01</div>
              <div className="proc-icon">📋</div>
              <div className="proc-title">Submit your channel</div>
              <div className="proc-desc">
                Paste your YouTube link and our tool auto-fetches all stats instantly. Fill in your asking price and we take it
                from there.
              </div>
              <div className="proc-time">Under 2 minutes</div>
            </div>
            <div className="proc-card lg">
              <div className="proc-num">STEP 02</div>
              <div className="proc-icon">✅</div>
              <div className="proc-title">We verify &amp; list</div>
              <div className="proc-desc">
                Our team reviews your channel within 24 hours. Once verified, it goes live to our network of active buyers
                immediately.
              </div>
              <div className="proc-time">Within 24 hours</div>
            </div>
            <div className="proc-card lg">
              <div className="proc-num">STEP 03</div>
              <div className="proc-icon">🤝</div>
              <div className="proc-title">Negotiate &amp; agree</div>
              <div className="proc-desc">
                We handle all buyer inquiries and negotiations on your behalf. You only hear from us when there&apos;s an offer
                worth considering.
              </div>
              <div className="proc-time">Within 7 days</div>
            </div>
            <div className="proc-card lg">
              <div className="proc-num">STEP 04</div>
              <div className="proc-icon">💰</div>
              <div className="proc-title">Close via escrow</div>
              <div className="proc-desc">All deals close through secure escrow. Funds held safely until the channel transfer is complete.</div>
              <div className="proc-time">Within 48 hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section">
        <div className="container">
          <div className="section-badge lg">
            Why ViralExchange{" "}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>{" "}
            <span className="hi">Our edge</span>
          </div>
          <h2>
            Built for deals that
            <br />
            <em>actually close</em>
          </h2>
          <p className="section-sub">Every feature designed to protect your channel, your privacy, and your payout.</p>
          <div className="feat-grid">
            <div className="feat-card lg">
              <div className="feat-icon">🔒</div>
              <div className="feat-title">Privacy First</div>
              <div className="feat-desc">
                Your channel name and link stay completely private. Buyers see stats only until they are verified serious and
                sign an NDA.
              </div>
              <div className="feat-divider"></div>
              <div className="feat-stat">100%</div>
              <div className="feat-stat-lbl">private until deal stage</div>
            </div>
            <div className="feat-card lg">
              <div className="feat-icon">⚡</div>
              <div className="feat-title">Instant Valuation</div>
              <div className="feat-desc">
                Get a data-driven estimate in 60 seconds based on real market multiples — subscribers, engagement, niche, and
                revenue.
              </div>
              <div className="feat-divider"></div>
              <div className="feat-stat">60s</div>
              <div className="feat-stat-lbl">to get your valuation</div>
            </div>
            <div className="feat-card lg">
              <div className="feat-icon">🛡️</div>
              <div className="feat-title">Secure Escrow</div>
              <div className="feat-desc">
                Every deal closes through verified escrow. Funds are held safely by a neutral third party until the channel
                transfer is complete.
              </div>
              <div className="feat-divider"></div>
              <div className="feat-stat">Zero</div>
              <div className="feat-stat-lbl">failed transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* NUMBERS */}
      <div className="numbers">
        <div className="glow-sm" style={{ top: "20%", left: "50%", transform: "translateX(-50%)" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="big-num" id="big-vol">
            <em>$—</em>
          </div>
          <div className="big-label">Total transaction volume brokered</div>
          <div className="num-cards-wrap lg">
            <div className="num-card">
              <div className="num-card-val" id="nc-sold">
                —
              </div>
              <div className="num-card-lbl">Channels successfully sold</div>
            </div>
            <div className="num-card" style={{ borderLeft: "1px solid var(--border)" }}>
              <div className="num-card-val" id="nc-listed">
                —
              </div>
              <div className="num-card-lbl">Active listings right now</div>
            </div>
          </div>
        </div>
      </div>

      {/* CLOSED DEALS */}
      <div className="section" id="deals">
        <div className="container">
          <div className="section-badge lg">
            Track record{" "}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>{" "}
            <span className="hi">Recent closes</span>
          </div>
          <h2>
            Real channels,
            <br />
            <em>real transactions</em>
          </h2>
          <p className="section-sub">Updated live from our deal tracker. Every sale verified and completed through escrow.</p>
          <div className="deals-grid" id="deals-grid">
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--fg-hint)", fontFamily: "var(--font-mono),monospace", fontSize: 13 }}>
              Loading deals...
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <a href="/deals" className="btn-g lg" style={{ display: "inline-flex" }}>
              View full pipeline →
            </a>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag lg" style={{ display: "inline-flex" }}>
              Testimonials <span className="st-accent">&nbsp;·&nbsp; From sellers</span>
            </div>
            <h2 style={{ marginTop: 16 }}>
              Trusted by creators
              <br />
              <em>across every niche</em>
            </h2>
          </div>
          <div className="test-grid">
            <div className="test-card lg">
              <div className="test-quote">
                &quot;ViralExchange got my channel in front of serious buyers within 48 hours. Closed at asking price. The escrow
                process was completely seamless.&quot;
              </div>
              <div className="test-div"></div>
              <div className="test-author">
                <div className="test-av">L</div>
                <div>
                  <div className="test-name">Leohavemercy</div>
                  <div className="test-role">Finance &nbsp;·&nbsp; 5K subs &nbsp;·&nbsp; Sold for $8,000</div>
                </div>
              </div>
            </div>
            <div className="test-card lg mid">
              <div className="test-quote">
                &quot;I had no idea my channel was worth $230K. The free valuation tool changed everything. Listed on Tuesday, had
                an offer by Thursday.&quot;
              </div>
              <div className="test-div"></div>
              <div className="test-author">
                <div className="test-av">K</div>
                <div>
                  <div className="test-name">Kaz</div>
                  <div className="test-role">Celebrity Gossip &nbsp;·&nbsp; 284K subs</div>
                </div>
              </div>
            </div>
            <div className="test-card lg">
              <div className="test-quote">
                &quot;The privacy-first approach is what sold me. My audience never knew I was selling until the new owner took
                over. Flawless handover.&quot;
              </div>
              <div className="test-div"></div>
              <div className="test-author">
                <div className="test-av">V</div>
                <div>
                  <div className="test-name">Vinesh</div>
                  <div className="test-role">Cartoon Recaps &nbsp;·&nbsp; 47.5K subs &nbsp;·&nbsp; Sold for $12,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BUYERS LOUNGE */}
      <div className="section">
        <div className="container">
          <div className="lounge lg">
            <div className="glow-sm" style={{ top: -60, left: "50%", transform: "translateX(-50%)" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="section-badge lg" style={{ display: "inline-flex", marginBottom: 20 }}>
                Buyers Lounge{" "}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>{" "}
                <span className="hi">Join free</span>
              </div>
              <h3>
                First access to every
                <br />
                <em>new verified listing</em>
              </h3>
              <p>New channels posted to our private Telegram the moment they are verified. Be first in line before anyone else sees them.</p>
              <a
                href="https://t.me/+uM8whHPwYFhjY2Y8"
                target="_blank"
                className="btn-p"
                style={{ display: "inline-flex", marginBottom: 14 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                </svg>
                Join Buyers Lounge on Telegram
              </a>
              <div style={{ fontSize: 13, color: "var(--fg-hint)" }}>
                Already a member?{" "}
                <a href="/deals" style={{ color: "var(--green)", textDecoration: "none" }}>
                  View live deal pipeline →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT FORM */}
      <div className="form-section" id="submit">
        <div className="container">
          <div className="form-wrap">
            <div className="form-left">
              <div className="section-badge lg">
                Sell your channel{" "}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>{" "}
                <span className="hi">Free listing</span>
              </div>
              <h2>
                Ready to exit?
                <br />
                <em>Let&apos;s get you paid.</em>
              </h2>
              <p style={{ color: "var(--fg-sub)", fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                Paste your YouTube link and our tool fetches all the stats automatically. No spreadsheets, no back-and-forth.
              </p>
              <div className="form-feats">
                <div className="feat-row">
                  <div className="feat-dot"></div>Stats auto-fetched from YouTube API
                </div>
                <div className="feat-row">
                  <div className="feat-dot"></div>Listed to verified buyers within 24 hours
                </div>
                <div className="feat-row">
                  <div className="feat-dot"></div>Zero upfront fees — commission on close only
                </div>
                <div className="feat-row">
                  <div className="feat-dot"></div>Secure escrow on every transaction
                </div>
                <div className="feat-row">
                  <div className="feat-dot"></div>Channel details kept private until deal stage
                </div>
              </div>
            </div>

            <div className="form-card lg">
              <div id="form-main">
                <div className="fc-title">Submit your channel</div>
                <div className="fc-sub">Takes under 2 minutes</div>
                <label>YouTube channel URL</label>
                <div className="url-row">
                  <input type="text" id="url-input" placeholder="https://youtube.com/@yourchannel" />
                  <button className="fetch-btn" id="fetch-btn" onClick={() => (window as any).fetchChannel()}>
                    Fetch →
                  </button>
                </div>
                <div id="status-msg"></div>
                <div id="fetched-panel">
                  <div className="ch-header">
                    <div className="ch-avatar" id="ch-avatar">
                      <span id="ch-init"></span>
                    </div>
                    <div>
                      <div className="ch-name" id="ch-name">
                        —
                      </div>
                      <div className="ch-handle" id="ch-handle">
                        —
                      </div>
                    </div>
                  </div>
                  <div className="fetched-grid">
                    <div className="fstat">
                      <div className="fl">Subscribers</div>
                      <div className="fv" id="f-subs">
                        —
                      </div>
                    </div>
                    <div className="fstat">
                      <div className="fl">Total videos</div>
                      <div className="fv w" id="f-vids">
                        —
                      </div>
                    </div>
                    <div className="fstat">
                      <div className="fl">Total views</div>
                      <div className="fv w" id="f-views">
                        —
                      </div>
                    </div>
                    <div className="fstat">
                      <div className="fl">Avg views/video</div>
                      <div className="fv w" id="f-avg">
                        —
                      </div>
                    </div>
                    <div className="fstat">
                      <div className="fl">Engagement</div>
                      <div className="fv" id="f-eng">
                        —
                      </div>
                    </div>
                    <div className="fstat">
                      <div className="fl">Channel age</div>
                      <div className="fv" id="f-age">
                        —
                      </div>
                    </div>
                  </div>
                  <div className="mv-box" id="mv-box">
                    <div className="mvl">Monthly views</div>
                    <div className="mvv" id="mv-val">
                      —
                    </div>
                    <div className="mvn">Estimated from total views. Override with your actual YouTube Studio figure below.</div>
                    <div className="mv-row">
                      <input type="number" id="mv-override" placeholder="Actual monthly views (optional)" />
                      <button className="btn-sm" onClick={() => (window as any).confirmMonthly()}>
                        Confirm
                      </button>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="sec-label">Channel details</div>
                  <label>Niche / Category</label>
                  <input type="text" id="f-niche" placeholder="e.g. Technology, Finance" />
                  <label>Sub-niche</label>
                  <input type="text" id="f-subniche" placeholder="e.g. AI & Gadgets" />
                  <label>Content language</label>
                  <input type="text" id="f-lang" placeholder="e.g. English" />
                  <label>Monetization</label>
                  <select id="f-mono" defaultValue="">
                    <option value="">Select...</option>
                    <option>AdSense monetized</option>
                    <option>Brand deals only</option>
                    <option>AdSense + Merch</option>
                    <option>Not monetized</option>
                    <option>Paid subscriptions</option>
                  </select>
                  <label>Asking price (USD)</label>
                  <input type="number" id="f-price" placeholder="e.g. 18500" />
                  <label>Monthly revenue (USD)</label>
                  <input type="number" id="f-rev" placeholder="e.g. 3200" />
                  <div className="divider"></div>
                  <div className="sec-label">Your contact</div>
                  <label>Name / Alias</label>
                  <input type="text" id="f-name" placeholder="How should we address you?" />
                  <label>Telegram / Email</label>
                  <input type="text" id="f-contact" placeholder="@yourhandle or email" />
                  <label>Anything else to know?</label>
                  <textarea id="f-notes" placeholder="Channel history, reason for selling..."></textarea>
                  <button className="submit-btn" onClick={() => (window as any).submitListing()}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Submit my channel
                  </button>
                </div>
              </div>
              <div id="success-screen">
                <div className="success-ring">✓</div>
                <h3>You&apos;re in the pipeline.</h3>
                <p>We&apos;ve received your channel and will be in touch within 24 hours via your preferred contact.</p>
                <button className="btn-ghost" onClick={() => (window as any).resetAll()}>
                  Submit another channel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <div className="logo-img">
                <img src="/logo.jpg" alt="VX" />
              </div>
              <div className="logo-name">VIRALEXCHANGE</div>
            </a>
            <p>The #1 marketplace for buying and selling YouTube channels. Secure, private, and professional.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="/valuation">Free valuation</a>
            <a href="/deals">Deal pipeline</a>
            <a href="#submit">Sell a channel</a>
            <a href="https://t.me/+uM8whHPwYFhjY2Y8" target="_blank">
              Buyers Lounge
            </a>
          </div>
          <div className="footer-col">
            <h4>Process</h4>
            <a href="#deals">Closed deals</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:deals@viralexchange.io">deals@viralexchange.io</a>
            <a href="https://t.me/+uM8whHPwYFhjY2Y8" target="_blank">
              Telegram
            </a>
            <a href="https://x.com/viralexchangeHQ" target="_blank">
              @viralexchangeHQ
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">&copy; 2026 ViralExchange. All rights reserved.</div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
