"use client";

import React from "react";
import AiTribe from "./AiTribe";
const Page = () => {
  return (
    <div className="flex items-center justify-center w-[100%] h-[100%] bg-white">
      <div className="page-agent max-w-[100vw] lg:w-[100%] flex justify-between gap-[20px] h-[100%] lg:h-[80vh]">
        <div className="rounded-[8px] w-[100%] h-[100%] lg:h-[80vh] flex flex-col-reverse lg:flex-row lg:px-[2vh]">
           <AiTribe></AiTribe>
    </div>
    </div>
    </div>
  );
};

export default Page;
