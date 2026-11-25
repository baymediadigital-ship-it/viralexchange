import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "variable",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

// Redesign type: Inter (with optical sizing, so display sizes get tighter
// letterforms) and Geist Mono for small labels.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Applies a saved light/dark choice before first paint (no flash). Without one,
// pages render light. See globals.css and components/site/ThemeToggle.tsx.
const themeScript = `(function(){try{var t=localStorage.getItem("vx-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL("https://viralexchange.io"),
  title: {
    default: "ViralExchange — Buy & Sell YouTube Channels",
    template: "%s — ViralExchange",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} ${inter.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Extensions like ColorZilla add attributes to <body> before React loads;
          ignore attribute mismatches on this one element only. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
