"use client";

import { Suspense } from "react";
import StripeResultContent from "../../components/StripeResultContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[50vh] flex items-center justify-center text-[14px] font-bold">
          Loading...
        </div>
      }
    >
      <StripeResultContent />
    </Suspense>
  );
}
