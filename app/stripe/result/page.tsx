"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { syncPoints } from "@/app/store/userSlice";
import { AppDispatch } from "@/app/store";
import {
  clearPendingOrder,
  readPendingOrder,
  stripe_orders,
  STRIPE_PACKAGES,
  StripeOrderItem,
  StripePackageType,
} from "@/app/api/stripe";

type Phase = "polling" | "paid" | "cancelled" | "timeout" | "notFound";

const POLL_INTERVAL_MS = 2500;
const POLL_MAX_ATTEMPTS = 24; // ~60 seconds

interface DisplayOrder {
  order_no: string;
  package_type: StripePackageType;
  amount_cents: number;
  points: number;
  llax_amount: number;
}

function StripeResultContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("polling");
  const [order, setOrder] = useState<StripeOrderItem | null>(null);
  // bumping this restarts the polling effect (Refresh Status button)
  const [pollRound, setPollRound] = useState(0);

  const statusParam = searchParams?.get("status") ?? null;
  const orderNoParam = searchParams?.get("order_no") ?? null;

  // hint saved right before the redirect to Stripe; survives the round trip
  const initialHint = useMemo(() => readPendingOrder(), []);

  const paidGuardRef = useRef(false);

  useEffect(() => {
    if (statusParam === "cancel") {
      clearPendingOrder();
      setPhase("cancelled");
      return;
    }

    paidGuardRef.current = false;
    setPhase("polling");

    const hint = readPendingOrder();
    const targetOrderNo = orderNoParam || hint?.order_no || "";

    const onPaid = (target: StripeOrderItem) => {
      if (paidGuardRef.current) return;
      paidGuardRef.current = true;
      clearPendingOrder();
      setOrder(target);
      setPhase("paid");
      dispatch(syncPoints());
    };

    // returns true while polling should continue
    const poll = async (): Promise<boolean> => {
      try {
        const res = await stripe_orders({ limit: 20, offset: 0 });
        const list = res.data?.orders ?? [];
        if (!list.length) {
          setPhase("notFound");
          return false;
        }
        const target = list.find((o) => o.order_no === targetOrderNo) ?? list[0];
        setOrder(target);
        if (target.status === "paid") {
          onPaid(target);
          return false;
        }
        if (target.status === "expired" || target.status === "failed") {
          clearPendingOrder();
          setPhase("cancelled");
          return false;
        }
        // pending - delayed payment methods (e.g. bank transfer) stay here longer
        return true;
      } catch (err) {
        const e = err as { code?: number };
        if (e.code === 401) {
          // global unauthorized dialog already triggered by request.ts
          return false;
        }
        // transient failure - keep polling
        return true;
      }
    };

    let inFlight = false;
    let attempts = 0;
    let stopTimer: (() => void) | null = null;

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      attempts += 1;
      let keepGoing = false;
      try {
        keepGoing = attempts < POLL_MAX_ATTEMPTS ? await poll() : false;
      } finally {
        inFlight = false;
      }
      if (!keepGoing) {
        setPhase((prev) => (prev === "polling" ? "timeout" : prev));
        stopTimer?.();
      }
    };

    const timer = setInterval(tick, POLL_INTERVAL_MS);
    stopTimer = () => clearInterval(timer);

    // immediate first check
    tick();

    return () => clearInterval(timer);
  }, [statusParam, orderNoParam, pollRound]);

  const displayOrder: DisplayOrder | null = useMemo(() => {
    if (order) {
      return {
        order_no: order.order_no,
        package_type: order.package_type,
        amount_cents: order.amount_cents,
        points: order.points,
        llax_amount: order.llax_amount,
      };
    }
    if (initialHint) {
      const pkg = STRIPE_PACKAGES[initialHint.package_type];
      return {
        order_no: initialHint.order_no,
        package_type: initialHint.package_type,
        amount_cents: pkg.amountCents,
        points: pkg.points,
        llax_amount: pkg.llax,
      };
    }
    return null;
  }, [order, initialHint]);

  const backToPoints = () => router.push("/my-points");

  const orderCard = displayOrder ? (
    <div className="w-full border-[1px] border-solid border-black rounded-[8px] bg-[#F9FFE2] px-[14px] py-[10px] flex flex-col gap-[4px] text-[12px] lg:text-[13px] font-bold">
      <div className="flex justify-between gap-[10px]">
        <span className="text-[#666666]">{t("stripeResult.orderInfo")}</span>
        <span className="font-mono truncate" title={displayOrder.order_no}>
          {displayOrder.order_no}
        </span>
      </div>
      <div className="flex justify-between gap-[10px]">
        <span className="capitalize">{displayOrder.package_type}</span>
        <span>${(displayOrder.amount_cents / 100).toFixed(2)}</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full flex justify-center px-[14px]">
      <div className="w-full lg:w-[470px] bg-white border-2 border-solid border-black rounded-[12px] px-[24px] lg:px-[36px] py-[32px] lg:py-[44px] flex flex-col items-center gap-[16px]">
        {phase === "polling" && (
          <>
            <div className="w-[48px] h-[48px] border-[4px] border-black border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[20px] lg:text-[24px] font-bold text-center">
              {t("stripeResult.confirming")}
            </div>
            <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
              {t("stripeResult.confirmingDesc")}
            </div>
            {orderCard}
            <button
              className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer mt-[8px]"
              onClick={backToPoints}
            >
              {t("stripeResult.backToPoints")}
            </button>
          </>
        )}

        {phase === "paid" && (
          <>
            <CheckCircleFilled className="text-[#7A9900] text-[52px]" />
            <div className="text-[20px] lg:text-[24px] font-bold text-center">
              {t("stripeResult.success")}
            </div>
            <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
              {t("stripeResult.successDesc", {
                points: (displayOrder?.points ?? 0).toLocaleString("en-US"),
                llax: (displayOrder?.llax_amount ?? 0).toLocaleString("en-US"),
              })}
            </div>
            {orderCard}
            <button
              className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer mt-[8px]"
              onClick={backToPoints}
            >
              {t("stripeResult.backToPoints")}
            </button>
          </>
        )}

        {phase === "cancelled" && (
          <>
            <CloseCircleOutlined className="text-[#666666] text-[52px]" />
            <div className="text-[20px] lg:text-[24px] font-bold text-center">
              {t("stripeResult.cancelled")}
            </div>
            <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
              {t("stripeResult.cancelledDesc")}
            </div>
            {orderCard}
            <button
              className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer mt-[8px]"
              onClick={backToPoints}
            >
              {t("stripeResult.retry")}
            </button>
          </>
        )}

        {phase === "timeout" && (
          <>
            <ClockCircleOutlined className="text-[#7A9900] text-[52px]" />
            <div className="text-[20px] lg:text-[24px] font-bold text-center">
              {t("stripeResult.timeout")}
            </div>
            <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
              {t("stripeResult.timeoutDesc")}
            </div>
            {orderCard}
            <div className="w-full flex flex-col gap-[10px] mt-[8px]">
              <button
                className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer"
                onClick={() => setPollRound((r) => r + 1)}
              >
                {t("stripeResult.refresh")}
              </button>
              <button
                className="w-full h-[44px] border-2 border-solid border-black text-black text-[15px] font-bold rounded-[8px] cursor-pointer bg-white"
                onClick={backToPoints}
              >
                {t("stripeResult.backToPoints")}
              </button>
            </div>
          </>
        )}

        {phase === "notFound" && (
          <>
            <QuestionCircleOutlined className="text-[#666666] text-[52px]" />
            <div className="text-[20px] lg:text-[24px] font-bold text-center">
              {t("stripeResult.notFound")}
            </div>
            <div className="text-[13px] lg:text-[14px] text-center text-[#666666]">
              {t("stripeResult.notFoundDesc")}
            </div>
            <button
              className="w-full h-[44px] bg-black text-white text-[15px] font-bold rounded-[8px] cursor-pointer mt-[8px]"
              onClick={backToPoints}
            >
              {t("stripeResult.backToPoints")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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
