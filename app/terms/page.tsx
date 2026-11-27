import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";
import { CONTACT_EMAIL } from "@/components/site/links";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using ViralExchange to buy and sell YouTube channels.",
  alternates: { canonical: "/terms" },
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="November 27, 2026"
      intro={
        <p>
          These terms apply to your use of viralexchange.io, operated by Baymedia LLC, a Wyoming limited liability company doing business as
          ViralExchange (&ldquo;ViralExchange&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or creating an account, you agree to them. Our{" "}
          <Link href="/privacy">Privacy Policy</Link> explains how we handle your information.
        </p>
      }
    >
      <LegalSection n={1} title="What we do">
        <p>
          ViralExchange is a brokerage that connects people selling YouTube channels with people buying them. We review channels, present them to buyers,
          help negotiate, and close deals through a third-party escrow service. Unless we agree otherwise in writing, we are not the buyer or seller of
          any channel.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Eligibility and accounts">
        <p>
          You must be at least 18 and able to enter a binding contract. You&apos;re responsible for keeping your login details private and for activity on
          your account. Tell us at {mail} if you think someone else has access to it.
        </p>
      </LegalSection>

      <LegalSection n={3} title="For sellers">
        <ul>
          <li>You confirm you own or are authorised to sell the channel you submit, and that what you tell us about it is accurate and not misleading.</li>
          <li>We review every submission and may approve, edit, decline or unlist a listing at our discretion.</li>
          <li>You can change your asking price at any time while a listing is live. Other changes go through us.</li>
          <li>Our commission is payable only when a sale closes, on the terms we agree with you before the channel is listed.</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="For buyers">
        <ul>
          <li>We verify buyers before sharing a channel&apos;s name, link or full analytics, and ask you to sign a non-disclosure agreement first.</li>
          <li>
            You agree not to use information we share to contact a seller and complete a deal without us, in line with the non-disclosure and
            non-circumvention agreement you sign.
          </li>
          <li>You&apos;re responsible for your own due diligence before you buy.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Payments and escrow">
        <p>
          Deals close through a third-party escrow service, whose own terms apply to the payment. Funds are released to the seller once the channel
          transfer is complete. We will never ask you to send money to a personal account, or to share your login details by email.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Valuations and information">
        <p>
          Valuations from our tool are estimates based on market multiples and the information provided. They are not appraisals, guarantees or financial
          advice. Channel statistics come from YouTube and from sellers, and we can&apos;t guarantee they are complete or error-free.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Risks of buying a channel">
        <p>
          YouTube channels depend on YouTube&apos;s policies, algorithm and enforcement, which can change at any time. We don&apos;t guarantee that a channel
          will be sold, sell for a particular price, keep its audience, stay monetized, or remain in good standing with YouTube after a transfer.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Acceptable use">
        <p>Don&apos;t use ViralExchange to:</p>
        <ul>
          <li>list a channel you don&apos;t own or can&apos;t transfer, or one built on stolen, infringing or policy-violating content;</li>
          <li>misrepresent a channel&apos;s statistics, revenue or history;</li>
          <li>harass other users, scrape the site, or interfere with its security or operation;</li>
          <li>break the law, including sanctions and anti-money-laundering rules.</li>
        </ul>
        <p>We may suspend or close accounts that break these terms.</p>
      </LegalSection>

      <LegalSection n={9} title="Our content">
        <p>
          The site&apos;s design, text and software belong to us or our licensors. You keep the rights to what you submit and let us use it to operate the
          marketplace, including presenting your listing to buyers and, after a sale closes, featuring it in our track record.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Disclaimers and liability">
        <p>
          The site is provided &ldquo;as is&rdquo;. To the fullest extent the law allows, we disclaim implied warranties, and we aren&apos;t liable for
          indirect or consequential losses, or for losses arising from a transaction between a buyer and a seller. Our total liability to you for any claim
          is limited to the fees you paid us in the 12 months before the claim.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Governing law">
        <p>These terms are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law rules.</p>
      </LegalSection>

      <LegalSection n={12} title="Changes and contact">
        <p>
          We may update these terms. If a change is significant, we&apos;ll update the date above and let account holders know. Questions: {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
