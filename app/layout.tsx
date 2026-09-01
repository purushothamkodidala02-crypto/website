import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { NavigationProgress } from "@/components/feedback/NavigationProgress";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-varadhi-ui",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Varadhi Prep: Smart Mock Tests for Career Growth",
    template: "%s | Varadhi Prep",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/varadhi-v-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/varadhi-v-logo.png",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["te_IN"],
    siteName: SITE_NAME,
    title: "Varadhi Prep: Smart Mock Tests for Career Growth",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Varadhi Prep: Smart Mock Tests for Career Growth",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-gray-900">
        <NavigationProgress />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
