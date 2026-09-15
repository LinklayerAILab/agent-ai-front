"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, message, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { formatDate } from "@/app/utils";
import { QueryTasksItem, QueryTasksType } from "@/app/api/agent_c";
import {
  stripe_orders,
  stripe_refunds,
  StripeOrderItem,
  StripeRefundRequestData,
  StripeRefundStatus,
} from "@/app/api/stripe";
import StripeRefundModal, {
  StripeRefundTarget,
} from "./StripeRefundModal";

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
// one order per status so every badge variant is visible
const MOCK_REFUNDS: StripeRefundRequestData[] = [
  {
    id: 2,
    order_ref: "SO1789300002",
    status: "requested",
    reason: "user_request",
    user_reason: "bought the wrong package",
    admin_note: "",
    refund_amount: 990,
    refund_currency: "usd",
    requested_at: "2026-09-13T10:24:00Z",
    handled_at: "",
    refunded_at: "",
    created_at: "2026-09-13T10:24:00Z",
  },
  {
    id: 1,
    order_ref: "SO1789200003",
    status: "refunded",
    reason: "user_request",
    user_reason: "duplicate payment",
    admin_note: "",
    refund_amount: 2990,
    refund_currency: "usd",
    requested_at: "2026-09-12T08:00:00Z",
    handled_at: "2026-09-12T09:30:00Z",
    refunded_at: "2026-09-12T09:30:00Z",
    created_at: "2026-09-12T08:00:00Z",
  },
  {
    id: 3,
    order_ref: "SO1789000004",
    status: "rejected",
    reason: "user_request",
    user_reason: "points already spent",
    admin_note: "refund window exceeded",
    refund_amount: 990,
    refund_currency: "usd",
    requested_at: "2026-09-10T15:00:00Z",
    handled_at: "2026-09-11T09:00:00Z",
    refunded_at: "",
    created_at: "2026-09-10T15:00:00Z",
  },
];

// one-shot fetch and scroll - both lists are per-user and small
const FETCH_LIMIT = 1000;

// only paid orders are listed; payment confirmation moved to /pay landing pages
const PAID_BADGE = "bg-[#E9FF93] text-[#7A9900]";

const REFUND_STATUS_BADGE: Record<StripeRefundStatus, string> = {
  requested: "bg-[#FFF7D6] text-[#8A6D00]",
  processing: "bg-[#FFF7D6] text-[#8A6D00]",
  refunded: "bg-[#E0EDFF] text-[#1D4ED8]",
  refund_failed: "bg-[#FFE1E1] text-[#C53030]",
  revoke_failed: "bg-[#E0EDFF] text-[#1D4ED8]",
  rejected: "bg-[#EBEBEB] text-[#666666]",
};

const REFUND_STATUS_KEY: Record<StripeRefundStatus, string> = {
  requested: "myPoints.stripe.statusRefundRequested",
  processing: "myPoints.stripe.statusRefundProcessing",
  refunded: "myPoints.stripe.statusRefundRefunded",
  refund_failed: "myPoints.stripe.statusRefundFailed",
  revoke_failed: "myPoints.stripe.statusRefundRevokeFailed",
  rejected: "myPoints.stripe.statusRefundRejected",
};

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

/** unified row: a task point record or a paid card order (with its refund ticket, if any) */
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
      refund?: StripeRefundRequestData;
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
  const [refunds, setRefunds] = useState<StripeRefundRequestData[]>(
    USE_MOCK_DATA ? MOCK_REFUNDS : []
  );
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refundTarget, setRefundTarget] = useState<StripeRefundTarget | null>(
    null
  );
  // bump to re-fetch (e.g. after a refund request was submitted)
  const [refreshSignal, setRefreshSignal] = useState(0);

  const fetchOrders = async () => {
    // TEMP MOCK: skip the api while previewing styles
    if (USE_MOCK_DATA) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const [ordersRes, refundsRes] = await Promise.all([
        stripe_orders({ limit: FETCH_LIMIT, offset: 0, status: "paid" }),
        stripe_refunds({ limit: FETCH_LIMIT, offset: 0 }),
      ]);
      setOrders(ordersRes.data?.orders ?? []);
      setRefunds(refundsRes.data?.refunds ?? []);
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
  }, [isLogin, refreshSignal]);

  // latest refund ticket per order (highest id wins)
  const refundByOrder = useMemo(() => {
    const map = new Map<string, StripeRefundRequestData>();
    for (const r of refunds) {
      const prev = map.get(r.order_ref);
      if (!prev || r.id > prev.id) map.set(r.order_ref, r);
    }
    return map;
  }, [refunds]);

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
      refund: refundByOrder.get(o.order_no),
      time: o.paid_at ?? o.created_at,
    }));
    return [...taskRows, ...orderRows].sort((a, b) => b.time - a.time);
  }, [records, orders, refundByOrder]);

  const loading = recordsLoading || ordersLoading;

  const openRefundModal = (order: StripeOrderItem) =>
    setRefundTarget({
      orderNo: order.order_no,
      amountCents: order.amount_cents,
      points: order.points,
      llaxAmount: order.llax_amount,
    });

  const openReapplyModal = (row: Extract<UnifiedRow, { kind: "order" }>) =>
    setRefundTarget({
      orderNo: row.order.order_no,
      presetReason: row.refund?.user_reason,
      amountCents: row.order.amount_cents,
      points: row.order.points,
      llaxAmount: row.order.llax_amount,
    });

  const refundRefresh = () => setRefreshSignal((s) => s + 1);

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
                <div className="flex-[0.9] pr-[4px] flex justify-end font-bold whitespace-nowrap">
                  {formatDate(row.time * 1000, "MM/DD HH:mm")}
                </div>
                <div className="flex-[0.7] pr-[10px]" />
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
                    title={
                      row.refund?.status === "rejected" && row.refund.admin_note
                        ? `${t("myPoints.stripe.adminNoteLabel")}: ${row.refund.admin_note}`
                        : undefined
                    }
                    className={`flex items-center h-[20px] px-[8px] rounded-[10px] text-[10px] lg:text-[11px] font-bold whitespace-nowrap ${
                      row.refund
                        ? REFUND_STATUS_BADGE[row.refund.status]
                        : PAID_BADGE
                    }`}
                  >
                    {row.refund
                      ? t(REFUND_STATUS_KEY[row.refund.status])
                      : t("myPoints.stripe.statusPaid")}
                  </span>
                </div>
                <div className="flex-[0.9] pr-[4px] flex justify-end font-bold whitespace-nowrap">
                  {formatDate(row.time * 1000, "MM/DD HH:mm")}
                </div>
                <div className="flex-[0.7] pr-[10px] flex justify-end">
                  {!row.refund ? (
                    <Button
                      size="small"
                      type="text"
                      danger
                      className="h-[22px] px-[6px] text-[10px] lg:text-[11px] font-bold"
                      onClick={() => openRefundModal(row.order)}
                    >
                      {t("myPoints.stripe.refundApply")}
                    </Button>
                  ) : row.refund.status === "rejected" ? (
                    <Button
                      size="small"
                      type="text"
                      danger
                      className="h-[22px] px-[6px] text-[10px] lg:text-[11px] font-bold"
                      onClick={() => openReapplyModal(row)}
                    >
                      {t("myPoints.stripe.reapply")}
                    </Button>
                  ) : null}
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
      <StripeRefundModal
        target={refundTarget}
        onClose={() => setRefundTarget(null)}
        onSubmitted={refundRefresh}
        onOrderStale={refundRefresh}
        onRequestExists={refundRefresh}
      />
    </div>
  );
};

export default PointsHistory;
