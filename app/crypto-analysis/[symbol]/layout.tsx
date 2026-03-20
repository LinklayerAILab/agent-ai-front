import { Metadata } from "next";
import React, { ReactNode } from "react";

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

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-[100%] h-[100%] ">
      <div className="h-auto xl:h-[91vh] w-[100%] lg:flex lg:items-center lg:justify-center mt-[20px] lg:mt-[0]">
        {children}
      </div>
    </div>
  );
};

export default Layout;
