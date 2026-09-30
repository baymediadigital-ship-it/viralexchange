import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Outfit } from "next/font/google";
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

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: "variable",
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
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
