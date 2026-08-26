import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Varadhi Prep",
    short_name: "Varadhi",
    description: "Smart mock tests for career growth.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#020617",
    icons: [
      { src: "/varadhi-v-logo.png", sizes: "260x260", type: "image/png" },
    ],
  };
}
