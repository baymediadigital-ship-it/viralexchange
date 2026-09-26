"use client";

import { useEffect } from "react";
import "../acquire.css";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5bGgiuAOCggW7yhyQZnHjZbsaxRBlyLWuby3iMA9OnyZFSEWgFUG4SkNzCghC3JeE/exec";

export default function AcquireClient() {
  useEffect(() => {
    async function submitApplication() {
      const fname = (document.getElementById("f-fname") as HTMLInputElement).value.trim();
      const lname = (document.getElementById("f-lname") as HTMLInputElement).value.trim();
      const email = (document.getElementById("f-email") as HTMLInputElement).value.trim();
      const contact = (document.getElementById("f-contact") as HTMLInputElement).value.trim();
      const budget = (document.getElementById("f-budget") as HTMLSelectElement).value;
      const niche = (document.getElementById("f-niche") as HTMLSelectElement).value;
      const experience = (document.getElementById("f-experience") as HTMLSelectElement).value;
      const goals = (document.getElementById("f-goals") as HTMLTextAreaElement).value.trim();

      if (!fname) {
        alert("Please enter your first name.");
        return;
      }
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email.");
        return;
      }
      if (!budget) {
        alert("Please select your budget range.");
        return;
      }
      if (!niche) {
        alert("Please select a preferred niche.");
        return;
      }
      if (!experience) {
        alert("Please select your experience level.");
        return;
      }

      const btn = document.getElementById("submit-btn") as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML =
        '<div style="width:16px;height:16px;border:2px solid rgba(0,0,0,0.3);border-top-color:#050805;border-radius:50%;animation:spin 0.65s linear infinite;"></div> Submitting...';

      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "acquisition_application",
            name: fname + " " + lname,
            email,
            contact,
            budget,
            niche,
            experience,
            goals,
          }),
        });
      } catch {}

      document.getElementById("form-main")!.style.display = "none";
      document.getElementById("success-screen")!.style.display = "block";
      const apply = document.getElementById("apply");
      if (apply) window.scrollTo({ top: apply.offsetTop - 80, behavior: "smooth" });
    }

    (window as any).submitApplication = submitApplication;
  }, []);

  return (
    <div className="acquire-page">
      <nav>
        <div className="container-wide">
          <div className="nav-inner">
            <a href="/" className="logo">
              <div className="logo-img">
                <img src="/logo.jpg" alt="VX" />
              </div>
              <div className="logo-name">VIRALEXCHANGE</div>
            </a>
            <div className="nav-links">
              <a href="/">Marketplace</a>
              <a href="/deals">Pipeline</a>
              <a href="/valuation">Free valuation</a>
              <a href="#apply" className="nav-cta">
                Apply now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="tag">Done-for-you acquisition</div>
          <h1>
            You didn&apos;t fail at faceless YouTube.
            <br />
            <em>The approach did.</em>
          </h1>
          <p className="hero-sub">
            Stop starting from scratch. We find you a monetized channel that&apos;s already earning, handle the acquisition, and
            connect you with a production team to scale it. You own the asset from day one.
          </p>
          <a
            href="#apply"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--green)",
              color: "#050805",
              fontSize: 15,
              fontWeight: 800,
              padding: "16px 32px",
              borderRadius: 100,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Apply to acquire a channel
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-hint)" }}>Takes 3 minutes. We review within 24 hours.</div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-label">The problem</div>
          <h2>You&apos;ve been here before.</h2>
          <div className="body-text">
            <p>
              You paid for a course. Or hired a coach. Or joined a done-for-you program that promised a monetized channel in 90
              days. You did the work, followed the steps, and somewhere along the way it stopped adding up.
            </p>
            <p>
              Maybe you never hit monetization. Maybe you did and the revenue wasn&apos;t what you expected. Maybe the coach moved
              on and left you figuring it out alone.
            </p>
            <p>
              The frustrating part isn&apos;t that faceless YouTube doesn&apos;t work. It does. Channels on this model are making
              real money right now. The frustrating part is that you spent months and thousands of dollars on the hardest part of
              the process when you didn&apos;t have to.
            </p>
            <p style={{ color: "var(--fg)", fontWeight: 600 }}>
              Building from scratch is the slowest, riskiest, most uncertain way to get into this. There&apos;s a faster way.
            </p>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section style={{ padding: "0 0 48px" }}>
        <div className="container-wide">
          <div className="proof-strip">
            <div className="ps">
              <div className="ps-val">24+</div>
              <div className="ps-label">Channels sold</div>
            </div>
            <div className="ps">
              <div className="ps-val">$380K+</div>
              <div className="ps-label">Total volume</div>
            </div>
            <div className="ps">
              <div className="ps-val">24h</div>
              <div className="ps-label">Avg verification</div>
            </div>
            <div className="ps">
              <div className="ps-val">100%</div>
              <div className="ps-label">Escrow protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-wide">
          <div className="section-label">The offer</div>
          <h2>
            Buy something that&apos;s
            <br />
            <em>already working.</em>
          </h2>
          <p style={{ color: "var(--fg-sub)", fontSize: 16, lineHeight: 1.65, maxWidth: 560, marginTop: 12 }}>
            We source a vetted, monetized YouTube channel. You acquire it. A production agency keeps it growing. You own an asset
            from day one.
          </p>
          <div className="offer-grid">
            <div className="offer-card">
              <div className="oc-num">01</div>
              <div className="oc-icon">🔍</div>
              <div className="oc-title">We source the channel</div>
              <div className="oc-desc">
                We find a verified, monetized channel that matches what you&apos;re looking for. Revenue history, engagement,
                account standing, niche fit — all checked before we bring it to you.
              </div>
            </div>
            <div className="offer-card">
              <div className="oc-num">02</div>
              <div className="oc-icon">🔒</div>
              <div className="oc-title">You acquire it safely</div>
              <div className="oc-desc">
                Every acquisition closes through secure escrow. Your money doesn&apos;t move until the channel transfer is
                verified complete. No risk, no trust required.
              </div>
            </div>
            <div className="offer-card">
              <div className="oc-num">03</div>
              <div className="oc-icon">📈</div>
              <div className="oc-title">A production team scales it</div>
              <div className="oc-desc">
                We connect you with a production agency that knows how to grow monetized channels. Content goes out consistently.
                Revenue grows. Valuation goes up.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section className="section" style={{ background: "rgba(34,197,94,0.03)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-label">The math</div>
          <h2>
            This is how asset
            <br />
            <em>ownership works.</em>
          </h2>
          <div className="body-text" style={{ marginTop: 20 }}>
            <p>
              A channel earning $500 a month can sell for $6,000 to $12,000. That same channel, scaled to $2,000 a month, is worth
              $24,000 to $48,000.
            </p>
            <p>
              You put capital in at the bottom. You scale with a production team. You sell at the top or hold and collect the
              income. Either way you own something with real value, not a certificate and a Slack group.
            </p>
            <p>The people who understand this aren&apos;t buying courses. They&apos;re buying assets.</p>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="section">
        <div className="container">
          <div className="section-label">Who this is for</div>
          <h2>
            Be honest
            <br />
            <em>with yourself.</em>
          </h2>
          <div className="for-grid">
            <div className="for-card for-yes">
              <div className="for-title" style={{ color: "var(--green)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                This is for you if
              </div>
              <div className="for-item">
                <div className="for-dot green"></div>You&apos;ve tried building a faceless channel and it didn&apos;t work out
              </div>
              <div className="for-item">
                <div className="for-dot green"></div>You&apos;ve spent money on courses or coaches and have nothing to show for it
              </div>
              <div className="for-item">
                <div className="for-dot green"></div>You have capital ready and want it working for you
              </div>
              <div className="for-item">
                <div className="for-dot green"></div>You want to own a cash flowing digital asset without building from scratch
              </div>
            </div>
            <div className="for-card for-no">
              <div className="for-title" style={{ color: "var(--fg-hint)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                This is not for you if
              </div>
              <div className="for-item">
                <div className="for-dot dim"></div>You&apos;re looking for a get rich quick scheme. Channels take work to scale.
              </div>
              <div className="for-item">
                <div className="for-dot dim"></div>You don&apos;t have capital ready to acquire a channel. Come back when you do.
              </div>
              <div className="for-item">
                <div className="for-dot dim"></div>You want someone else to own the asset. You are the owner. Owners pay attention.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-label">The process</div>
          <h2>
            What happens after
            <br />
            <em>you apply.</em>
          </h2>
          <div className="steps">
            <div className="step-row">
              <div className="step-num">1</div>
              <div className="step-content">
                <h4>You fill out the application</h4>
                <p>Takes 3 minutes. Tells us your budget, what niche you&apos;re interested in, and what you&apos;re trying to build.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-num">2</div>
              <div className="step-content">
                <h4>We review within 24 hours</h4>
                <p>If it&apos;s a fit we get on a call, understand exactly what you&apos;re looking for, and start sourcing channels that match.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-num">3</div>
              <div className="step-content">
                <h4>We present verified channels</h4>
                <p>We bring you vetted options with real revenue data. No pressure. Either the numbers make sense or they don&apos;t.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-num">4</div>
              <div className="step-content">
                <h4>Acquisition closes through escrow</h4>
                <p>Your money doesn&apos;t move until the channel transfer is verified complete. Both sides protected.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-num">5</div>
              <div className="step-content">
                <h4>Production team takes over</h4>
                <p>We connect you with the agency. Content starts going out. Revenue starts growing. You own an asset that works.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className="form-section" id="apply">
        <div className="container">
          <div className="form-card">
            <div id="form-main">
              <div className="form-title">Apply to acquire a channel</div>
              <div className="form-sub">Takes 3 minutes. We review every application within 24 hours.</div>
              <div className="form-grid">
                <div className="field">
                  <label>First name</label>
                  <input type="text" id="f-fname" placeholder="Your first name" />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input type="text" id="f-lname" placeholder="Your last name" />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input type="email" id="f-email" placeholder="your@email.com" />
                </div>
                <div className="field">
                  <label>Telegram or WhatsApp</label>
                  <input type="text" id="f-contact" placeholder="@handle or phone number" />
                </div>
                <div className="field">
                  <label>Acquisition budget (USD)</label>
                  <select id="f-budget" defaultValue="">
                    <option value="">Select your budget range</option>
                    <option>$3,000 — $7,000</option>
                    <option>$7,000 — $15,000</option>
                    <option>$15,000 — $30,000</option>
                    <option>$30,000+</option>
                  </select>
                </div>
                <div className="field">
                  <label>Preferred niche</label>
                  <select id="f-niche" defaultValue="">
                    <option value="">Select a niche</option>
                    <option>Finance / Business</option>
                    <option>Technology / AI</option>
                    <option>Health &amp; Fitness</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Gaming</option>
                    <option>Lifestyle / Vlog</option>
                    <option>Open to suggestions</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Have you tried faceless YouTube before?</label>
                  <select id="f-experience" defaultValue="">
                    <option value="">Select one</option>
                    <option>Yes — built a channel from scratch, didn&apos;t work out</option>
                    <option>Yes — paid a course or coach, didn&apos;t get results</option>
                    <option>Yes — got monetized but revenue was disappointing</option>
                    <option>No — this is my first time exploring this</option>
                  </select>
                </div>
                <div className="field full">
                  <label>What are you trying to build? (optional)</label>
                  <textarea id="f-goals" placeholder="Tell us a bit about what you're looking to achieve..."></textarea>
                </div>
              </div>
              <button className="submit-btn" onClick={() => (window as any).submitApplication()} id="submit-btn">
                Submit my application
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="form-note">No spam. No sales pressure. If it&apos;s not a fit we&apos;ll tell you straight.</div>
            </div>

            <div id="success-screen">
              <div className="success-ring">✓</div>
              <h3>Application received.</h3>
              <p>
                We&apos;ll review it within 24 hours and reach out via your preferred contact. While you wait, join our private
                Buyers Lounge on Telegram. New verified channel listings go live there first.
              </p>
              <a href="https://t.me/+uM8whHPwYFhjY2Y8" target="_blank" className="tg-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                </svg>
                Join the Buyers Lounge
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container-wide">
          <div className="footer-inner">
            <span className="footer-copy">&copy; 2026 ViralExchange. All rights reserved.</span>
            <div className="footer-links">
              <a href="/">Marketplace</a>
              <a href="/valuation">Free valuation</a>
              <a href="/deals">Pipeline</a>
              <a href="mailto:deals@viralexchange.io">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
