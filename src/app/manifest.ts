import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BagSlot — Find someone already flying there",
    short_name: "BagSlot",
    description:
      "Peer-to-peer baggage marketplace. Send small items with verified travelers who already have empty suitcase space.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF9",
    theme_color: "#0A0A0F",
    orientation: "portrait-primary",
    categories: ["travel", "shopping", "lifestyle"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Find a trip",
        short_name: "Search",
        description: "Browse travelers heading your way",
        url: "/search",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Post a trip",
        short_name: "Post",
        description: "List empty suitcase space",
        url: "/trips/new",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
    ],
  };
}
