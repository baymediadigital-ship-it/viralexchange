import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";
import { CONTACT_EMAIL } from "@/components/site/links";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ViralExchange collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 27, 2026"
      intro={
        <p>
          ViralExchange is operated by Baymedia LLC, a Wyoming limited liability company (&ldquo;ViralExchange&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          This policy explains what we collect when you use viralexchange.io, why, who we share it with, and the choices you have. Questions:{" "}
          {mail}.
        </p>
      }
    >
      <LegalSection n={1} title="What we collect">
        <ul>
          <li>
            <strong className="font-medium text-vx-ink">Account details:</strong> your name, email address and password. Passwords are handled by our
            authentication provider and are never visible to us.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">Channel listings:</strong> the channel link, public statistics we fetch from YouTube, and what you
            tell us: niche, monetization, revenue, asking price, contact details and any notes.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">Valuation requests:</strong> your email, the channel you entered, its public statistics and the
            answers you give.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">Buyer applications and enquiries:</strong> your name, email, other contact details, budget,
            preferred niches, experience and any message you send.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">Correspondence:</strong> emails and messages you exchange with us.
          </li>
        </ul>
        <p>We do not use advertising trackers or sell your information.</p>
      </LegalSection>

      <LegalSection n={2} title="How we use it">
        <ul>
          <li>To run the marketplace: reviewing and listing channels, matching buyers and sellers, and supporting deals through to close.</li>
          <li>To contact you about your listing, application, valuation or enquiry, and to send account emails such as sign-up confirmations and password resets.</li>
          <li>To verify buyers and sellers, prevent fraud and keep the platform secure.</li>
          <li>To meet legal, accounting and tax obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="What is public">
        <p>
          Approved listings show only non-identifying details, such as niche, subscribers, monthly views and asking price. A channel&apos;s name and link are
          shared only with buyers we have verified and who have signed a non-disclosure agreement.
        </p>
        <p>
          When a sale closes, we may publish the channel&apos;s name, niche, subscriber count and sale price as part of our track record. If you would prefer
          a sale not to be shown, tell us at {mail}.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Who we share it with">
        <ul>
          <li>
            <strong className="font-medium text-vx-ink">Service providers</strong> that run the site for us: Supabase (database and accounts), Netlify
            (hosting) and Resend (email). They process data on our behalf.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">The other side of a deal:</strong> once a buyer is verified and under NDA, we share the details
            needed to evaluate and complete the transaction, and the escrow provider receives what it needs to close it.
          </li>
          <li>
            <strong className="font-medium text-vx-ink">Authorities,</strong> when the law requires it or to protect people from fraud or harm.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="YouTube data">
        <p>
          Our channel lookup uses YouTube API Services to fetch public channel statistics. By using it you agree to the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>. Google&apos;s handling of data is
          described in the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>. We only read
          public channel information, and we never ask for access to your YouTube or Google account through the site.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Cookies and storage">
        <p>
          We use essential cookies to keep you signed in, and your browser&apos;s local storage to remember whether you chose light or dark mode. We do not
          use advertising or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection n={7} title="How long we keep it">
        <p>
          We keep account, listing and deal records for as long as your account is active and as needed for legal, tax and dispute purposes afterwards.
          Enquiries and valuation requests that don&apos;t lead anywhere are deleted on request.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Your choices">
        <p>
          You can update your name and password in your account settings. To access, correct or delete your information, or to object to how we use it,
          email {mail} from the address on your account. We&apos;ll reply within 30 days.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Security and location">
        <p>
          Data is encrypted in transit, and access to it is restricted to the people who need it. Our providers may store and process data in the United
          States and other countries.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Children">
        <p>ViralExchange is for people aged 18 and over. We don&apos;t knowingly collect information from anyone younger.</p>
      </LegalSection>

      <LegalSection n={11} title="Changes">
        <p>If we change this policy in a meaningful way, we&apos;ll update the date above and, where appropriate, let account holders know by email.</p>
      </LegalSection>
    </LegalPage>
  );
}
