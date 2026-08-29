import type { NextConfig } from "next";

const productionOrigins = [
  "varadhiprep.in",
  "www.varadhiprep.in",
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
};

export default nextConfig;
