import type { MetadataRoute } from "next";

// Mobile-install metadata. Kept on the isolated mobile feature branch until reviewed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "NestRune — A World Worth Collecting",
    short_name: "NestRune",
    description: "Collect original fantasy cards, open packs, and battle through Rune Dungeons.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#071d20",
    theme_color: "#073239",
    orientation: "any",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
