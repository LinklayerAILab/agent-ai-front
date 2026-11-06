import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LinkLayerAI – Analysis History",
  description: "Your AI analysis history on LinkLayerAI.",
  keywords: "LinkLayerAI,Analysis History",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-[100%] h-[100%] mt-[20px] lg:mt-[0]">
      <div className="h-auto xl:h-[91vh] w-[100%] flex lg:items-center">{children}</div>
    </div>
  );
};

export default Layout;
