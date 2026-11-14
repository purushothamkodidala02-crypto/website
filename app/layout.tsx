import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Telugu } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { NavigationProgress } from "@/components/feedback/NavigationProgress";
import { CopyProtection } from "@/components/site/CopyProtection";
import { SingleDeviceWatcher } from "@/components/auth/SingleDeviceWatcher";
import { ApEndowmentPriorityModal } from "@/components/feedback/ApEndowmentPriorityModal";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-varadhi-ui",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-telugu-noto",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
    template: "%s | Varadhi Prep",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Varadhi Prep",
    "Telangana constable exam date",
    "Telangana police mock test",
    "Telangana police syllabus",
    "Telangana constable mock test",
    "Telangana police exam mock test",
    "Telangana police exam date",
    "tg police exam date",
    "TG Police Constable mock test",
    "Telangana police constable free mock test",
    "TGPRB police constable mock test 2026",
    "TSLPRB police constable mock test",
    "TS police constable mock test in telugu",
    "TSPSC mock test free",
    "TGPSC online test series",
    "TG TET mock test papers",
    "TG TET 2026 practice test",
    "APPSC mock test in Telugu",
    "Telangana competitive exams online test series",
    "Telangana history and movement practice test",
    "Current affairs mock test for Telangana exams",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
    "తెలంగాణ కానిస్టేబుల్ ఆన్‌లైన్ టెస్ట్",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ పరీక్ష తేదీ 2026",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్",
    "తెలంగాణ పోలీస్ ఎగ్జామ్",
    "టీజీ టెట్ మాక్ టెస్ట్",
    "పోటీ పరీక్షల మాక్ టెస్ట్‌లు",
    "online mock test papers in Telugu",
    "free test series Telugu and English",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/varadhi-icon-96.png?v=2", type: "image/png", sizes: "96x96" },
      { url: "/varadhi-icon-192.png?v=2", type: "image/png", sizes: "192x192" },
      { url: "/varadhi-v-logo.png?v=2", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [{ url: "/apple-icon.png?v=2", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["te_IN"],
    siteName: SITE_NAME,
    title: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": "ECDDB1BF993A7E16288F00B7BDBCD3E7",
    },
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
    <html lang="en" className={`${inter.variable} ${notoSansTelugu.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
      </head>
      <body className="min-h-screen bg-white text-gray-900">
        <PostHogProvider>
          <NavigationProgress />
          <CopyProtection />
          <SingleDeviceWatcher />
          <ApEndowmentPriorityModal />
          {children}
          <GoogleAnalytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
