import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LLA Agent - Pilot of Your Trading and Social Intelligence",
    short_name: "LLA Agent",
    description:
      "Unlock Your Live Trading Data, Ignite Trading Social Connections — Powered by Agent Intelligence.",
    id: "/",
    start_url: "/",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    icons: [
      {
        src: "/defai1.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/install-pc.png",
        sizes: "1416x945",
        type: "image/png",
        form_factor: "wide",
        label: "Wonder Widgets",
      },
      {
        src: "/install-h5.png",
        sizes: "387x840",
        type: "image/png",
        form_factor: "narrow",
        label: "Wonder Widgets s",
      },
    ],
  };
}
