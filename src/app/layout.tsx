import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: { default: "Shizuka — One Bot. Infinite Possibilities.", template: "%s | Shizuka" },
  description: "Meet Shizuka, a Discord companion for music, moderation, security and community management.",
  metadataBase: new URL(siteConfig.siteUrl),
  openGraph: { title: "Shizuka Discord Bot", description: "One Bot. Infinite Possibilities.", type: "website", images: [new URL("og-image.svg", siteConfig.siteUrl).toString()] },
  twitter: { card: "summary_large_image", title: "Shizuka Discord Bot", description: "One Bot. Infinite Possibilities." },
  icons: { icon: "favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Navbar /><main>{children}</main><Footer /><Analytics /><SpeedInsights /></body></html>;
}
