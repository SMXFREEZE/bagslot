import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Toaster } from "@/components/toast";
import { NativeBootstrap } from "@/components/native-bootstrap";
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
  applicationName: "BagSlot",
  appleWebApp: {
    capable: true,
    title: "BagSlot",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "BagSlot — Find someone already flying there",
    description:
      "Use empty suitcase space from travelers going your way. Small items. Verified travelers. Safer handoffs.",
    type: "website",
    siteName: "BagSlot",
  },
  twitter: {
    card: "summary_large_image",
    title: "BagSlot — Find someone already flying there",
    description:
      "Peer-to-peer baggage marketplace. From $5. Payment protected until delivery.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-background font-sans">
        <SiteHeader />
        <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10">
          {children}
        </main>
        <MobileBottomNav />
        <Toaster />
        <NativeBootstrap />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
