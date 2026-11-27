// Structured data (schema.org JSON-LD) helpers. Google uses this to understand
// what a page is, and can show richer results (e.g. FAQ answers, breadcrumbs).

export const SITE_URL = "https://viralexchange.io";

/** Renders one JSON-LD block. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ViralExchange",
  legalName: "Baymedia LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpg`,
  email: "deals@viralexchange.io",
  description: "A brokerage for buying and selling monetized YouTube channels, with every deal closed through escrow.",
  sameAs: ["https://x.com/viralexchangeHQ"],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ViralExchange",
  url: SITE_URL,
};

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function articleJsonLd(a: { title: string; description: string; path: string; published: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    datePublished: a.published,
    dateModified: a.updated,
    author: { "@type": "Organization", name: "ViralExchange", url: SITE_URL },
    publisher: { "@type": "Organization", name: "ViralExchange", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpg` } },
  };
}
