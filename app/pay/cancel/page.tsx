"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseCircleOutlined } from "@ant-design/icons";
import { clearPendingOrder } from "@/app/api/stripe";

// Static Stripe cancel landing page: no order polling, no API calls.
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    clearPendingOrder();
  }, []);

  return (
    <div className="w-full flex justify-center px-[14px]">
      <div className="w-full lg:w-[470px] bg-white border-2 border-solid border-black rounded-[12px] px-[24px] lg:px-[36px] py-[32px] lg:py-[44px] flex flex-col items-center gap-[16px]">
        <CloseCircleOutlined className="text-[#666666] text-[52px]" />
        <div className="text-[20px] lg:text-[24px] font-bold text-center">
          Payment Not Completed
        </div>
        <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
          The payment was not completed. No charges were made.
        </div>
        <button
          className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer mt-[8px]"
          onClick={() => router.push("/my-points")}
        >
          Back to My Points
        </button>
      </div>
    </div>
  );
}
