import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Pocket Jesus — Spiritual AI Guide",
  description:
    "Your personal AI spiritual guide, rooted in faith and scripture.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pocket Jesus — Spiritual AI Guide",
    description:
      "Your personal AI spiritual guide, rooted in faith and scripture.",
    url: siteUrl,
    siteName: "Pocket Jesus",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pocket Jesus — Spiritual AI Guide",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pocket Jesus — Spiritual AI Guide",
    description:
      "Your personal AI spiritual guide, rooted in faith and scripture.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pocket Jesus",
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4a5c2a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pocket Jesus",
              description:
                "Your personal AI spiritual guide, rooted in faith and scripture.",
              url: siteUrl,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              publisher: {
                "@type": "Organization",
                name: "The Von der Becke Academy Corp",
                email: "teamvcorp@thevacorp.com",
                telephone: "+17125601128",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <InstallPrompt />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#243018",
                color: "#e0ecbe",
                border: "1px solid #4a5c2a",
                borderRadius: "12px",
              },
            }}
          />
          {children}
          <footer className="mt-auto border-t border-olive-200 bg-olive-950 text-olive-200 py-8 px-6">
            <div className="max-w-3xl mx-auto text-center space-y-2">
              <p className="font-semibold text-olive-100 text-sm tracking-wide">
                The Von der Becke Academy Corp
              </p>
              <p className="text-xs text-olive-300">
                A 501(c)(3) Non-Profit Educational Organization
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 pt-1 text-xs text-olive-300">
                <a
                  href="tel:7125601128"
                  className="hover:text-olive-100 transition-colors"
                >
                  712-560-1128
                </a>
                <a
                  href="mailto:teamvcorp@thevacorp.com"
                  className="hover:text-olive-100 transition-colors"
                >
                  teamvcorp@thevacorp.com
                </a>
              </div>
              <p className="text-xs text-olive-700 pt-2">
                &copy; {new Date().getFullYear()} The Von der Becke Academy Corp. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
