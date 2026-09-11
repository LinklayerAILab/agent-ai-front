"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, message, Pagination, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { formatDate } from "@/app/utils";
import {
  stripe_refunds,
  StripeRefundRequestData,
  StripeRefundStatus,
} from "@/app/api/stripe";
import { shortenOrderNo, StripeRefundTarget } from "./StripeRefundModal";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<StripeRefundStatus, string> = {
  requested: "bg-[#FFF7D6] text-[#8A6D00]",
  processing: "bg-[#FFF7D6] text-[#8A6D00]",
  refunded: "bg-[#E0EDFF] text-[#1D4ED8]",
  refund_failed: "bg-[#FFE1E1] text-[#C53030]",
  revoke_failed: "bg-[#E0EDFF] text-[#1D4ED8]",
  rejected: "bg-[#EBEBEB] text-[#666666]",
};

const STATUS_KEY: Record<StripeRefundStatus, string> = {
  requested: "myPoints.stripe.statusRefundRequested",
  processing: "myPoints.stripe.statusRefundProcessing",
  refunded: "myPoints.stripe.statusRefundRefunded",
  refund_failed: "myPoints.stripe.statusRefundFailed",
  revoke_failed: "myPoints.stripe.statusRefundRevokeFailed",
  rejected: "myPoints.stripe.statusRefundRejected",
};

// requested_at is an ISO string, unlike the unix-second timestamps on orders
const formatIsoTime = (iso: string) => {
  const ts = new Date(iso).getTime();
  return Number.isFinite(ts) ? formatDate(ts, "MM/DD HH:mm") : iso;
};

interface Props {
  /** bump to re-fetch (e.g. after a request was submitted) */
  refreshSignal: number;
  onReapply: (target: StripeRefundTarget) => void;
}

const StripeRefunds = ({ refreshSignal, onReapply }: Props) => {
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const [refunds, setRefunds] = useState<StripeRefundRequestData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await stripe_refunds({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      setRefunds(res.data?.refunds ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      messageApi.error(t("myPoints.stripe.loadOrdersFailed"));
    } finally {
      const tmr = setTimeout(() => {
        setLoading(false);
        clearTimeout(tmr);
      }, 400);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      setLoading(false);
      return;
    }
    fetchRefunds(page);
  }, [page, isLogin, refreshSignal]);

  return (
    <div>
      {messageContext}
      {loading ? (
        <div className="p-4 space-y-2 w-[100%]">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-[4%]"
            >
              <Skeleton.Input
                style={{ width: "30%" }}
                className="h-[36px] lg:h-[3.6vh] flex items-center"
                active
                size="small"
              />
              <Skeleton.Input
                style={{ width: "20%" }}
                className="h-[36px] lg:h-[3.6vh] flex items-center"
                active
                size="small"
              />
              <Skeleton.Input
                style={{ width: "20%" }}
                className="h-[36px] lg:h-[3.6vh] flex items-center"
                active
                size="small"
              />
              <Skeleton.Input
                style={{ width: "20%" }}
                className="h-[36px] lg:h-[3.6vh] flex items-center"
                active
                size="small"
              />
            </div>
          ))}
        </div>
      ) : refunds.length ? (
        <>
          <div className="list-box rounded-[8px] overflow-hidden">
            {refunds.map((item) => (
              <div key={item.id}>
                <div className="flex items-center h-[40px] lg:h-[4.85vh] list-item-ele text-[11px] lg:text-[12px]">
                  <div
                    className="flex-[1.2] pl-[10px] font-mono font-bold truncate"
                    title={item.order_ref}
                  >
                    {shortenOrderNo(item.order_ref)}
                  </div>
                  <div className="flex-[0.8] flex justify-center font-bold whitespace-nowrap">
                    ${item.refund_amount.toFixed(2)}
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span
                      title={
                        item.status === "rejected" && item.admin_note
                          ? `${t("myPoints.stripe.adminNoteLabel")}: ${item.admin_note}`
                          : undefined
                      }
                      className={`flex items-center h-[20px] px-[8px] rounded-[10px] text-[11px] font-bold whitespace-nowrap ${STATUS_BADGE[item.status]}`}
                    >
                      {t(STATUS_KEY[item.status])}
                    </span>
                  </div>
                  <div className="flex-[0.9] pr-[4px] flex justify-end font-bold whitespace-nowrap">
                    {item.requested_at
                      ? formatIsoTime(item.requested_at)
                      : ""}
                  </div>
                  <div className="flex-[0.7] pr-[10px] flex justify-end">
                    {item.status === "rejected" && (
                      <Button
                        size="small"
                        type="text"
                        danger
                        className="h-[22px] px-[6px] text-[11px] font-bold"
                        onClick={() =>
                          onReapply({
                            orderNo: item.order_ref,
                            presetReason: item.user_reason,
                          })
                        }
                      >
                        {t("myPoints.stripe.reapply")}
                      </Button>
                    )}
                  </div>
                </div>
                {item.status === "rejected" && item.admin_note ? (
                  <div
                    className="pl-[10px] pr-[10px] pb-[6px] text-[10px] text-[#666666] truncate list-item-ele"
                    title={item.admin_note}
                  >
                    {t("myPoints.stripe.adminNoteLabel")}: {item.admin_note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {total > PAGE_SIZE && (
            <div className="flex justify-center mt-[10px]">
              <Pagination
                size="small"
                simple
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center">
          <Empty description={t("common.noData")} />
        </div>
      )}
    </div>
  );
};

export default StripeRefunds;
