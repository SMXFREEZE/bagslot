import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Toaster } from "@/components/toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "BagSlot — Find someone already flying there",
    template: "%s · BagSlot",
  },
  description:
    "BagSlot is a peer-to-peer travel marketplace. Travelers monetize unused baggage space; senders find trusted travelers already going their way.",
  openGraph: {
    title: "BagSlot — Find someone already flying there",
    description:
      "Use empty suitcase space from travelers going your way. Small items. Verified travelers. Safer handoffs.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main className="pb-20 md:pb-10">{children}</main>
        <MobileBottomNav />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
