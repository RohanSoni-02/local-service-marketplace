import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thikana — local shops, on call",
    short_name: "Thikana",
    description: "Book trusted local tradespeople or rent tools from verified shops near you.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ee",
    theme_color: "#0f4f40",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
