import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LinkLayerAI – Empowering Web3 Trading with AI Agents",
  description: "LinkLayerAI transforms live trading data into trading intelligence, helping users capture opportunities across market cycles through evolving Agents.",
  keywords: "LinkLayerAI,API,Configuration",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-[100%] h-[100%] mt-[20px] lg:mt-[0]">
      <div className="h-auto xl:h-[91vh] w-[100%] flex lg:items-center">{children}</div>
    </div>
  );
};

export default Layout;
