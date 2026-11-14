import type { NextConfig } from "next";

const productionOrigins = [
  "varadhiprep.in",
  "www.varadhiprep.in",
  "*.varadhiprep.in",
  "varadhi.kodidalanani.workers.dev",
  "*.workers.dev",
  "localhost:3000",
  "127.0.0.1:3000",
  "*.vercel.app",
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
].filter((origin): origin is string => Boolean(origin));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["@supabase/supabase-js", "lucide-react", "clsx", "tailwind-merge"],
    serverActions: {
      bodySizeLimit: "3mb",
      allowedOrigins: productionOrigins,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
          },
        ]
      : [],
  },
  redirects: async () => [
    {
      source: "/exams",
      destination: "/mock-tests",
      permanent: true,
    },
    {
      source: "/mock-tests/:state/:exam/syllabus",
      destination: "/mock-tests/:state/:exam",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
