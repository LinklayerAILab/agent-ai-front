import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "LinkLayerAI – Empowering Web3 Trading with AI Agents",
  description: "LinkLayerAI transforms live trading data into trading intelligence, helping users capture opportunities across market cycles through evolving Agents.",
};

export default function InsightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center w-[100%] h-[100%]">
      <div className="max-w-[100vw] lg:w-[100%] flex justify-between gap-[20px] h-[100%] lg:h-[80vh] mx-[0]">
        <div className="rounded-[8px] w-[100%] h-[100%] lg:h-[80vh] flex flex-col-reverse lg:flex-row lg:px-[2vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
