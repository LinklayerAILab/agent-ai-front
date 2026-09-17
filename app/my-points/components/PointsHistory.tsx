"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, message, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { formatDate } from "@/app/utils";
import { QueryTasksItem, QueryTasksType } from "@/app/api/agent_c";
import { stripe_orders, StripeOrderItem } from "@/app/api/stripe";

// ⚠️ TEMP MOCK for mobile style preview - flip to true (or delete) after review
const USE_MOCK_DATA = false;
// fixed epoch (~2026-09-14), see page.tsx
const MOCK_NOW = 1789400000;
const MOCK_ORDERS: StripeOrderItem[] = [
  {
    order_no: "SO1789400001",
    package_type: "professional",
    amount_cents: 9990,
    currency: "usd",
    points: 12500,
    llax_amount: 130000,
    status: "paid",
    created_at: MOCK_NOW - 3700,
    paid_at: MOCK_NOW - 3600,
  },
  {
    order_no: "SO1789300002",
    package_type: "basic",
    amount_cents: 990,
    currency: "usd",
    points: 990,
    llax_amount: 10000,
    status: "paid",
    created_at: MOCK_NOW - 86400,
    paid_at: MOCK_NOW - 86400 + 300,
  },
  {
    order_no: "SO1789200003",
    package_type: "standard",
    amount_cents: 2990,
    currency: "usd",
    points: 3400,
    llax_amount: 36000,
    status: "paid",
    created_at: MOCK_NOW - 86400 * 2,
    paid_at: MOCK_NOW - 86400 * 2 + 120,
  },
  {
    order_no: "SO1789000004",
    package_type: "basic",
    amount_cents: 990,
    currency: "usd",
    points: 990,
    llax_amount: 10000,
    status: "paid",
    created_at: MOCK_NOW - 86400 * 4,
    paid_at: MOCK_NOW - 86400 * 4 + 60,
  },
];

// one-shot fetch and scroll - both lists are per-user and small
const FETCH_LIMIT = 1000;

// only paid orders are listed; payment confirmation moved to /pay landing pages
const PAID_BADGE = "bg-[#E9FF93] text-[#7A9900]";

function getTypeKey(type: QueryTasksType) {
  switch (type) {
    case 1:
      return "bind_web3";
    case 2:
      return "bind_email";
    case 3:
      return "follow_x";
    case 4:
      return "telegram_group";
    case 5:
      return "new_user";
    case 6:
      return "invite_user";
    case 7:
      return "subcribe";
  }
}

/** unified row: a task point record or a paid card order */
type UnifiedRow =
  | {
      kind: "task";
      key: string;
      type: QueryTasksType;
      point: string | undefined;
      time: number;
    }
  | {
      kind: "order";
      key: string;
      order: StripeOrderItem;
      time: number;
    };

interface Props {
  /** task point records from the page's 8s polling (may contain padding rows) */
  records: QueryTasksItem[];
  recordsLoading: boolean;
}

const PointsHistory = ({ records, recordsLoading }: Props) => {
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const [orders, setOrders] = useState<StripeOrderItem[]>(
    USE_MOCK_DATA ? MOCK_ORDERS : []
  );
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = async () => {
    // TEMP MOCK: skip the api while previewing styles
    if (USE_MOCK_DATA) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const ordersRes = await stripe_orders({
        limit: FETCH_LIMIT,
        offset: 0,
        status: "paid",
      });
      setOrders(ordersRes.data?.orders ?? []);
    } catch {
      messageApi.error(t("myPoints.stripe.loadOrdersFailed"));
    } finally {
      const tmr = setTimeout(() => {
        setOrdersLoading(false);
        clearTimeout(tmr);
      }, 400);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      setOrdersLoading(false);
      return;
    }
    fetchOrders();
  }, [isLogin]);

  // drop the padding rows the page pads its records with, merge with the paid
  // orders and sort everything by time, newest first
  const rows = useMemo<UnifiedRow[]>(() => {
    const taskRows: UnifiedRow[] = records
      .filter((r) => r.timestamp !== undefined)
      .map((r, idx) => ({
        kind: "task" as const,
        key: `task-${idx}`,
        type: r.type,
        point: r.point,
        time: r.timestamp as number,
      }));
    const orderRows: UnifiedRow[] = orders.map((o) => ({
      kind: "order" as const,
      key: o.order_no,
      order: o,
      time: o.paid_at ?? o.created_at,
    }));
    return [...taskRows, ...orderRows].sort((a, b) => b.time - a.time);
  }, [records, orders]);

  const loading = recordsLoading || ordersLoading;

  return (
    <div className="mx-[0] lg:mx-[3vh] mt-[8px] lg:mt-[1vh]">
      {messageContext}
      <div className="rounded-[8px] overflow-hidden list-box lg:h-[55vh] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2 w-[100%]">
            {Array.from({ length: 12 }).map((_, index) => (
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
        ) : rows.length ? (
          rows.map((row) =>
            row.kind === "task" ? (
              <div
                key={row.key}
                className="flex items-center h-[40px] lg:h-[4.85vh] list-item-ele text-[10px] lg:text-[12px]"
              >
                <div className="flex-[1.2] pl-[10px] font-bold truncate">
                  {row.type ? t(`subscribe.${getTypeKey(row.type)}`) : ""}
                </div>
                <div className="flex-[0.8] flex justify-center font-bold whitespace-nowrap">
                  {row.point}
                </div>
                <div className="flex-1" />
                <div className="flex-[0.9] pr-[10px] flex justify-end font-bold whitespace-nowrap">
                  {formatDate(row.time * 1000, "MM/DD HH:mm")}
                </div>
              </div>
            ) : (
              <div
                key={row.key}
                className="flex items-center h-[40px] lg:h-[4.85vh] list-item-ele text-[10px] lg:text-[12px]"
              >
                <div
                  className="flex-[1.2] pl-[10px] font-bold truncate"
                  title={row.order.order_no}
                >
                  {t("myPoints.stripe.cardOrder")} · $
                  {(row.order.amount_cents / 100).toFixed(2)}
                </div>
                <div className="flex-[0.8] flex justify-center font-bold whitespace-nowrap">
                  {row.order.points}
                </div>
                <div className="flex-1 flex justify-center">
                  <span
                    className={`flex items-center h-[20px] px-[8px] rounded-[10px] text-[10px] lg:text-[11px] font-bold whitespace-nowrap ${PAID_BADGE}`}
                  >
                    {t("myPoints.stripe.statusPaid")}
                  </span>
                </div>
                <div className="flex-[0.9] pr-[10px] flex justify-end font-bold whitespace-nowrap">
                  {formatDate(row.time * 1000, "MM/DD HH:mm")}
                </div>
              </div>
            )
          )
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <Empty description={t("common.noData")} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsHistory;
