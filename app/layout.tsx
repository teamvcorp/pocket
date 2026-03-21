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

export const metadata: Metadata = {
  title: "Pocket Jesus — Spiritual AI Guide",
  description:
    "Your personal AI spiritual guide, rooted in faith and scripture.",
  manifest: "/manifest.json",
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
