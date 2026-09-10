"use client";

import { Suspense } from "react";
import StripeResultContent from "../../components/StripeResultContent";

// Stripe success landing. Polls GET /v1/stripe/orders (immediately, then
// ~2.5s intervals for about a minute) to show "processing" -> "confirmed",
// per the backend frontend integration guide. Delayed payment methods may
// keep the order pending past the window - that is NOT a failure, the page
// then points to the order list while the backend reconciles.
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
