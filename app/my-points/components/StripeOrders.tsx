"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, message, Pagination, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { formatDate } from "@/app/utils";
import {
  stripe_orders,
  StripeOrderItem,
  StripeOrderStatus,
} from "@/app/api/stripe";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<StripeOrderStatus, string> = {
  pending: "bg-[#FFF7D6] text-[#8A6D00]",
  paid: "bg-[#E9FF93] text-[#7A9900]",
  expired: "bg-[#EBEBEB] text-[#666666]",
  failed: "bg-[#FFE1E1] text-[#C53030]",
};

const STATUS_KEY: Record<StripeOrderStatus, string> = {
  pending: "myPoints.stripe.statusPending",
  paid: "myPoints.stripe.statusPaid",
  expired: "myPoints.stripe.statusExpired",
  failed: "myPoints.stripe.statusFailed",
};

const shortenOrderNo = (orderNo: string) =>
  orderNo.length > 12 ? `${orderNo.slice(0, 4)}...${orderNo.slice(-4)}` : orderNo;

const StripeOrders = () => {
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const [orders, setOrders] = useState<StripeOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // only paid orders are listed; payment confirmation moved to /pay landing pages
  const fetchOrders = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await stripe_orders({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
        status: "paid",
      });
      const list = res.data?.orders ?? [];
      setOrders(list);
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
    fetchOrders(page);
  }, [page, isLogin]);

  return (
    <div className="px-[8px] lg:px-[3vh] mt-[8px] lg:mt-[1vh]">
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
      ) : orders.length ? (
        <>
          <div className="list-box rounded-[8px] overflow-hidden">
            {orders.map((item) => (
              <div
                key={item.order_no}
                className="flex items-center h-[40px] lg:h-[4.85vh] list-item-ele text-[11px] lg:text-[12px]"
              >
                <div
                  className="flex-[1.2] pl-[10px] font-mono font-bold truncate"
                  title={item.order_no}
                >
                  {shortenOrderNo(item.order_no)}
                </div>
                <div className="flex-[0.8] hidden sm:flex justify-center font-bold capitalize">
                  {item.package_type}
                </div>
                <div className="flex-[0.8] flex justify-center font-bold whitespace-nowrap">
                  ${(item.amount_cents / 100).toFixed(2)}
                </div>
                <div className="flex-1 flex justify-center">
                  <span
                    className={`flex items-center h-[20px] px-[8px] rounded-[10px] text-[11px] font-bold whitespace-nowrap ${STATUS_BADGE[item.status]}`}
                  >
                    {t(STATUS_KEY[item.status])}
                  </span>
                </div>
                <div className="flex-1 pr-[10px] flex justify-end font-bold whitespace-nowrap">
                  {item.created_at
                    ? formatDate(item.created_at * 1000, "MM/DD HH:mm")
                    : ""}
                </div>
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

export default StripeOrders;
