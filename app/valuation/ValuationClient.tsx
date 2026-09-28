"use client";

import { useEffect } from "react";
import "../valuation.css";
import { fmt, usd, initials } from "@/lib/format";
import { submitValuationLead } from "@/lib/actions/valuationLeads";
import { IconClock, IconCheck } from "@/components/Icon";
import { submitListing as submitListingAction } from "@/lib/actions/listings";

const NM: Record<string, number> = { finance: 1.4, tech: 1.3, health: 1.25, education: 1.2, entertainment: 1.0, gaming: 0.95, lifestyle: 0.9, food: 0.9, other: 1.0 };
const NL: Record<string, string> = {
  finance: "Finance/Business — highest buyer demand",
  tech: "Technology/AI — premium niche",
  health: "Health & Fitness — high demand",
  education: "Education — steady demand",
  entertainment: "Entertainment — standard multiple",
  gaming: "Gaming — moderate demand",
  lifestyle: "Lifestyle/Vlog — variable",
  food: "Food — moderate demand",
  other: "General — standard multiple",
};
const MM: Record<string, number> = { adsense: 1.0, brand: 0.85, both: 1.2 };
const ML: Record<string, string> = { adsense: "AdSense — predictable revenue", brand: "Brand deals — solid but variable", both: "AdSense + Brand deals — premium" };
const TM: Record<string, { low: number; high: number; label: string; conf: string }> = {
  "6plus": { low: 12, high: 24, label: "6+ months · 12–24×", conf: "High" },
  "3to6": { low: 5, high: 8, label: "3–6 months · 5–8×", conf: "Medium" },
  "1to3": { low: 4, high: 6, label: "1–3 months · 4–6×", conf: "Indicative" },
};

export default function ValuationClient() {
  useEffect(() => {
    let _ch: any = null;

    function setStatus(msg: string, loading = false) {
      const el = document.getElementById("status-msg");
      if (!el) return;
      el.innerHTML = loading ? `<div class="spinner"></div><span>${msg}</span>` : `<span style="color:var(--red)">${msg}</span>`;
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
        renderCh(d, url);
        setStatus("");
      } catch (e) {
        setStatus("Error: " + (e as Error).message);
      }
      (document.getElementById("fetch-btn") as HTMLButtonElement).disabled = false;
    }

    function renderCh(d: any, originalUrl: string) {
      const subs = d.subscribers || 0;
      const views = d.views || 0;
      const eng = d.engagementPct || 0;
      const ageMonths = d.ageMonths || 0;
      document.getElementById("ch-name")!.textContent = d.name;
      document.getElementById("ch-handle")!.textContent = d.handle || "";
      if (d.thumbnail) document.getElementById("ch-avatar")!.innerHTML = `<img src="${d.thumbnail}" alt="">`;
      else document.getElementById("ch-init")!.textContent = initials(d.name);
      document.getElementById("f-subs")!.textContent = fmt(subs);
      document.getElementById("f-views")!.textContent = fmt(views);
      document.getElementById("f-eng")!.textContent = eng.toFixed(1) + "%";
      document.getElementById("f-age")!.textContent = ageMonths >= 12 ? (ageMonths / 12).toFixed(1) + " yrs" : ageMonths + " mo";
      _ch = { name: d.name, handle: d.handle || "", subs, views, eng, ageMonths, url: originalUrl.trim() };
      document.getElementById("ch-panel")!.style.display = "block";
      setTimeout(() => document.getElementById("ch-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
    }

    function goToEmail() {
      if (!_ch) {
        alert("Please fetch your channel first.");
        return;
      }
      if ((document.getElementById("f-mono") as HTMLSelectElement).value === "none") {
        showStep("step-dq");
        return;
      }
      const rev = parseFloat((document.getElementById("f-rev") as HTMLInputElement).value) || 0;
      if (rev <= 0) {
        alert("Please enter your monthly revenue.");
        return;
      }
      const r = calcVal();
      document.getElementById("b-num")!.textContent = usd(r.low) + " — " + usd(r.high);
      showStep("step2");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submitEmail() {
      const email = (document.getElementById("email-input") as HTMLInputElement).value.trim();
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email.");
        return;
      }
      const r = calcVal();
      await submitValuationLead({
        email,
        channelName: _ch.name,
        channelUrl: _ch.url,
        subscribers: _ch.subs,
        valuationLowUsd: r.low,
        valuationHighUsd: r.high,
        tier: r.tierLabel,
        niche: (document.getElementById("f-niche") as HTMLSelectElement).value,
        confidence: r.conf,
      });
      showStep("step3");
      renderResult(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function calcVal() {
      const mono = (document.getElementById("f-mono") as HTMLSelectElement).value;
      const dur = (document.getElementById("f-dur") as HTMLSelectElement).value;
      const niche = (document.getElementById("f-niche") as HTMLSelectElement).value;
      const rev = parseFloat((document.getElementById("f-rev") as HTMLInputElement).value) || 0;
      const { subs, eng, ageMonths } = _ch;
      const tier = TM[dur];
      const nm = NM[niche] || 1.0;
      const mm = MM[mono] || 1.0;
      const low = Math.round(rev * tier.low * nm * mm);
      const high = Math.round(rev * tier.high * nm * mm);
      const subScore = Math.min(100, Math.round((Math.log10(Math.max(subs, 1)) / 7) * 100));
      const engScore = eng >= 5 ? 95 : eng >= 3 ? 80 : eng >= 2 ? 65 : eng >= 1 ? 45 : 25;
      const nicheScore = Math.round(nm * 71);
      const ageScore = ageMonths >= 36 ? 90 : ageMonths >= 24 ? 75 : ageMonths >= 12 ? 60 : ageMonths >= 6 ? 45 : 25;
      const monoScore = mono === "both" ? 95 : mono === "adsense" ? 78 : 65;
      const tierScore = dur === "6plus" ? 90 : dur === "3to6" ? 60 : 35;
      return {
        low,
        high,
        conf: tier.conf,
        tierLabel: tier.label,
        factors: [
          { name: "Revenue tier", score: tierScore, color: tierScore >= 70 ? "var(--green)" : "var(--amber)", note: tier.label },
          { name: "Subscribers", score: subScore, color: subScore >= 70 ? "var(--green)" : "var(--amber)", note: fmt(subs) + " subscribers" },
          { name: "Engagement", score: engScore, color: engScore >= 70 ? "var(--green)" : "var(--amber)", note: _ch.eng.toFixed(1) + "% avg engagement" },
          { name: "Niche", score: nicheScore, color: nicheScore >= 70 ? "var(--green)" : "var(--amber)", note: NL[niche] || "" },
          { name: "Monetization", score: monoScore, color: monoScore >= 70 ? "var(--green)" : "var(--amber)", note: ML[mono] || "" },
          { name: "Channel age", score: ageScore, color: ageScore >= 70 ? "var(--green)" : "var(--amber)", note: ageMonths >= 12 ? (ageMonths / 12).toFixed(1) + " years established" : ageMonths + " months old" },
        ],
      };
    }

    function renderResult(r: ReturnType<typeof calcVal>) {
      document.getElementById("r-num")!.textContent = usd(r.low) + " — " + usd(r.high);
      document.getElementById("r-conf")!.textContent = r.conf + " confidence";
      document.getElementById("r-tier")!.textContent = r.tierLabel;
      document.getElementById("factors")!.innerHTML = r.factors
        .map(
          (f) => `
    <div class="factor-row">
      <div class="f-name">${f.name}</div>
      <div class="f-bar-bg"><div class="f-bar" style="background:${f.color}" data-w="${f.score}"></div></div>
      <div class="f-score" style="color:${f.color}">${f.score}</div>
      <div class="f-note">${f.note}</div>
    </div>`,
        )
        .join("");
      setTimeout(() => document.querySelectorAll<HTMLElement>(".f-bar").forEach((b) => (b.style.width = b.dataset.w + "%")), 200);
    }

    function goToListing() {
      const niche = (document.getElementById("f-niche") as HTMLSelectElement).value;
      (document.getElementById("s4-niche") as HTMLSelectElement).value = niche;
      const mono = (document.getElementById("f-mono") as HTMLSelectElement).value;
      const md = document.getElementById("s4-mono") as HTMLSelectElement;
      if (mono === "adsense") md.value = "AdSense monetized";
      else if (mono === "brand") md.value = "Brand deals only";
      else if (mono === "both") md.value = "AdSense + Brand deals";
      showStep("step4");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submitListing() {
      const price = (document.getElementById("s4-price") as HTMLInputElement).value;
      const contact = (document.getElementById("s4-contact") as HTMLInputElement).value.trim();
      if (!price || parseInt(price) <= 0) {
        alert("Please enter your asking price.");
        return;
      }
      if (!contact) {
        alert("Please enter your contact details.");
        return;
      }
      const btn = document.getElementById("s4-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="border-top-color:#050805;width:14px;height:14px;border-width:2px;"></div> Submitting...';
      const niche = (document.getElementById("s4-niche") as HTMLSelectElement).value;
      const subniche = (document.getElementById("s4-subniche") as HTMLInputElement).value;
      const mono = (document.getElementById("s4-mono") as HTMLSelectElement).value;
      const rev = parseFloat((document.getElementById("f-rev") as HTMLInputElement).value) || 0;
      const priceFormatted = "$" + parseInt(price).toLocaleString();
      const name = (document.getElementById("s4-name") as HTMLInputElement).value.trim();
      await submitListingAction({
        channelName: _ch.name || "",
        channelUrl: _ch.url || "",
        niche,
        subNiche: subniche,
        subscribers: _ch.subs,
        monthlyRevenueUsd: rev || undefined,
        engagementRate: _ch.eng,
        monetization: mono,
        accountAgeMonths: _ch.ageMonths,
        language: "English",
        askingPriceUsd: parseInt(price),
        sellerContactName: name || "Seller",
        sellerContactEmail: contact,
      });
      const r = calcVal();
      document.getElementById("success-card")!.innerHTML = `
    <div class="sc-row"><span class="sc-label">Channel</span><span class="sc-val">${_ch.name}</span></div>
    <div class="sc-row"><span class="sc-label">Asking price</span><span class="sc-val green">${priceFormatted}</span></div>
    <div class="sc-row"><span class="sc-label">Estimated value</span><span class="sc-val green">${usd(r.low)} — ${usd(r.high)}</span></div>
    <div class="sc-row"><span class="sc-label">Status</span><span class="sc-val">Pending verification</span></div>`;
      showStep("step-success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showStep(id: string) {
      document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));
      document.getElementById(id)?.classList.add("active");
    }

    function resetAll() {
      const fields = ["url-input", "email-input", "f-rev", "s4-price", "s4-contact"];
      fields.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) el.value = "";
      });
      _ch = null;
      showStep("step1");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function onMonoChange(this: HTMLSelectElement) {
      const hide = this.value === "none";
      ["dur-wrap", "rev-wrap", "niche-wrap"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = hide ? "none" : "block";
      });
    }

    const monoEl = document.getElementById("f-mono") as HTMLSelectElement | null;
    monoEl?.addEventListener("change", onMonoChange);

    (window as any).fetchChannel = fetchChannel;
    (window as any).goToEmail = goToEmail;
    (window as any).submitEmail = submitEmail;
    (window as any).goToListing = goToListing;
    (window as any).submitListing = submitListing;
    (window as any).resetAll = resetAll;

    showStep("step1");

    return () => {
      monoEl?.removeEventListener("change", onMonoChange);
    };
  }, []);

  return (
    <div className="valuation-page">
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
            <a href="/deals">Pipeline</a>
            <a href="/valuation" className="active nav-val">
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
        <div className="glow" style={{ width: 600, height: 300, background: "radial-gradient(ellipse,rgba(34,197,94,0.09) 0%,transparent 70%)", top: 0, left: "50%", transform: "translateX(-50%)" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag lg">
            Free valuation <span className="st-accent">· No signup needed</span>
          </div>
          <h1>
            What is your
            <br />
            channel <em>worth?</em>
          </h1>
          <p className="hero-sub">Real market multiples. Instant result. Paste your URL and go — no fluff, no obligation.</p>
          <div className="trust-pills">
            <div className="tp lg">Under 60 seconds</div>
            <div className="tp lg">Real sale data</div>
            <div className="tp lg">100% free</div>
          </div>
        </div>
      </div>

      <div className="tool-wrap">
        {/* STEP 1 */}
        <div className="step active" id="step1">
          <div style={{ marginBottom: 24 }}>
            <label>YouTube channel URL</label>
            <div className="url-row">
              <input type="text" id="url-input" placeholder="https://youtube.com/@yourchannel" />
              <button className="fetch-btn" id="fetch-btn" onClick={() => (window as any).fetchChannel()}>
                Fetch stats →
              </button>
            </div>
            <div id="status-msg"></div>
          </div>

          <div id="ch-panel" style={{ display: "none" }}>
            <div className="ch-strip">
              <div className="av" id="ch-avatar">
                <span id="ch-init"></span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }} id="ch-name">
                  —
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-hint)", fontFamily: "var(--font-mono),monospace" }} id="ch-handle">
                  —
                </div>
              </div>
            </div>
            <div className="stats-row">
              <div className="ss">
                <div className="ssl">Subs</div>
                <div className="ssv" id="f-subs">
                  —
                </div>
              </div>
              <div className="ss">
                <div className="ssl">Views</div>
                <div className="ssv w" id="f-views">
                  —
                </div>
              </div>
              <div className="ss">
                <div className="ssl">Engagement</div>
                <div className="ssv" id="f-eng">
                  —
                </div>
              </div>
              <div className="ss">
                <div className="ssl">Age</div>
                <div className="ssv w" id="f-age">
                  —
                </div>
              </div>
            </div>

            <div className="slbl">Monetization details</div>
            <div className="fields-grid">
              <div>
                <label>Monetized?</label>
                <select id="f-mono" defaultValue="adsense">
                  <option value="adsense">AdSense</option>
                  <option value="brand">Brand deals only</option>
                  <option value="both">AdSense + Brand deals</option>
                  <option value="none">Not monetized</option>
                </select>
              </div>
              <div id="dur-wrap">
                <label>How long monetized?</label>
                <select id="f-dur" defaultValue="6plus">
                  <option value="6plus">6+ months</option>
                  <option value="3to6">3–6 months</option>
                  <option value="1to3">1–3 months</option>
                </select>
              </div>
              <div id="rev-wrap">
                <label>Monthly revenue (USD)</label>
                <input type="number" id="f-rev" placeholder="e.g. 2500" min={1} />
              </div>
              <div id="niche-wrap">
                <label>Content niche</label>
                <select id="f-niche" defaultValue="finance">
                  <option value="finance">Finance / Business</option>
                  <option value="tech">Technology / AI</option>
                  <option value="health">Health &amp; Fitness</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="gaming">Gaming</option>
                  <option value="lifestyle">Lifestyle / Vlog</option>
                  <option value="food">Food &amp; Cooking</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={() => (window as any).goToEmail()}>
              Get my free valuation
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* STEP 2: Email */}
        <div className="step" id="step2">
          <div className="eg">
            <div className="blur-box lg">
              <div className="blur-inner">
                <div className="bn" id="b-num">
                  $00,000 — $000,000
                </div>
                <div className="bl">Your estimated channel value</div>
              </div>
              <div className="lock-chip">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Enter email to unlock
              </div>
            </div>
            <div className="eg-title">Your result is ready</div>
            <p className="eg-sub">Drop your email to reveal the full valuation breakdown. We&apos;ll send you a copy too.</p>
            <div className="email-row">
              <input type="email" id="email-input" placeholder="your@email.com" />
              <button className="email-btn" onClick={() => (window as any).submitEmail()}>
                Unlock →
              </button>
            </div>
            <div className="priv">No spam &nbsp;&middot;&nbsp; Unsubscribe anytime</div>
          </div>
        </div>

        {/* STEP DQ */}
        <div className="step" id="step-dq">
          <div className="dq-wrap">
            <div className="dq-ring"><IconClock size={26} /></div>
            <div className="dq-t">Not quite ready yet.</div>
            <p className="dq-s">We only work with monetized channels — this ensures our buyers get quality, revenue-generating assets.</p>
            <div className="dq-tip">
              <strong>Come back once you&apos;re monetized.</strong>
              <br />
              Once your channel is in the YouTube Partner Program and earning revenue, we can give you a full valuation and list it within 24 hours.
            </div>
            <button className="btn-ghost" onClick={() => (window as any).resetAll()}>
              ← Start over
            </button>
          </div>
        </div>

        {/* STEP 3: Result */}
        <div className="step" id="step3">
          <div className="result-top">
            <div className="r-lbl">Estimated channel value</div>
            <div className="r-num" id="r-num">
              —
            </div>
            <div className="r-badges">
              <div className="rb rb-g" id="r-conf">
                —
              </div>
              <div className="rb rb-a" id="r-tier">
                —
              </div>
            </div>
          </div>
          <div className="slbl">Valuation breakdown</div>
          <div className="factors" id="factors"></div>
          <div className="cta-strip">
            <div className="cta-left">
              <h3>Ready to list?</h3>
              <p>
                Listed to verified buyers in 24 hours.
                <br />
                Zero upfront fees. Secure escrow.
              </p>
            </div>
            <button className="cta-btn" onClick={() => (window as any).goToListing()}>
              List my channel →
            </button>
          </div>
        </div>

        {/* STEP 4: List details */}
        <div className="step" id="step4">
          <div className="step4-intro">
            <h3>List your channel</h3>
            <p>Great news — your channel qualifies. Fill in a few details and we&apos;ll list it to our verified buyer network within 24 hours.</p>
          </div>
          <div className="step4-grid">
            <div>
              <label>Asking price (USD)</label>
              <input type="number" id="s4-price" placeholder="e.g. 25000" />
            </div>
            <div>
              <label>Content niche</label>
              <select id="s4-niche" defaultValue="finance">
                <option value="finance">Finance / Business</option>
                <option value="tech">Technology / AI</option>
                <option value="health">Health &amp; Fitness</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="gaming">Gaming</option>
                <option value="lifestyle">Lifestyle / Vlog</option>
                <option value="food">Food &amp; Cooking</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Sub-niche</label>
              <input type="text" id="s4-subniche" placeholder="e.g. AI & Gadgets" />
            </div>
            <div>
              <label>Monetization</label>
              <select id="s4-mono">
                <option>AdSense monetized</option>
                <option>Brand deals only</option>
                <option>AdSense + Brand deals</option>
              </select>
            </div>
            <div>
              <label>Your name</label>
              <input type="text" id="s4-name" placeholder="How should we address you?" />
            </div>
            <div>
              <label>Contact (email or Telegram)</label>
              <input type="text" id="s4-contact" placeholder="@handle or email" />
            </div>
          </div>
          <button className="btn-primary" onClick={() => (window as any).submitListing()} id="s4-btn">
            List my channel now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* SUCCESS */}
        <div className="step" id="step-success">
          <div className="success-wrap">
            <div className="success-ring"><IconCheck size={24} /></div>
            <div className="success-title">You&apos;re in the pipeline.</div>
            <p className="success-sub">Your channel has been submitted. Our team will verify it within 24 hours and reach out via your contact.</p>
            <div className="success-card" id="success-card"></div>
            <p style={{ fontSize: 13, color: "var(--fg-hint)" }}>
              Questions?{" "}
              <a href="mailto:deals@viralexchange.io" style={{ color: "var(--green)", textDecoration: "none" }}>
                deals@viralexchange.io
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span className="footer-copy">&copy; 2026 ViralExchange &nbsp;&middot;&nbsp; Estimates only — actual sale price may vary</span>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/deals">Pipeline</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
