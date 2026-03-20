import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkLayerAI – Empowering Web3 Trading with AI Agents",
  description: "LinkLayerAI transforms live trading data into trading intelligence, helping users capture opportunities across market cycles through evolving Agents.",
  keywords: "LinkLayerAI,LinkLayer,AI,Strategy Agent,AI Agent,Trading Strategy,Automated Trading,Smart Strategy",
  openGraph: {
    title: "LinkLayerAI – Empowering Web3 Trading with AI Agents",
    description: "LinkLayerAI transforms live trading data into trading intelligence, helping users capture opportunities across market cycles through evolving Agents.",
    url: process.env.NEXT_PUBLIC_WALLET_ORIGIN,
    images: [
      {
        url: "https://cdn.linklayer.ai/uploads/photo_2025-12-03_11-29-56.jpg",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "LinkLayerAI – Empowering Web3 Trading with AI Agents",
    description: "LinkLayerAI transforms live trading data into trading intelligence, helping users capture opportunities across market cycles through evolving Agents.",
    images: ["https://cdn.linklayer.ai/uploads/photo_2025-12-03_11-29-56.jpg"],
  }
};

export default function CheckCaptchaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
