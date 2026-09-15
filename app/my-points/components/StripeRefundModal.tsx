"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, message, Modal } from "antd";
import { STRIPE_ERROR_CODES, stripe_refund_request } from "@/app/api/stripe";

/** A refund request target - either an order row or a rejected ticket re-apply */
export interface StripeRefundTarget {
  orderNo: string;
  /** prefill when re-applying a rejected request */
  presetReason?: string;
  /** order snapshot for display; absent when re-applying from the refund list */
  amountCents?: number;
  points?: number;
  llaxAmount?: number;
}

export const shortenOrderNo = (orderNo: string) =>
  orderNo.length > 12 ? `${orderNo.slice(0, 4)}...${orderNo.slice(-4)}` : orderNo;

const REASON_MAX_BYTES = 1024;
// backend rate limit for refund submission is 3 requests / 300 seconds
const REFUND_COOLDOWN_MS = 300 * 1000;

interface Props {
  target: StripeRefundTarget | null;
  onClose: () => void;
  /** a request was submitted - refresh the refund list */
  onSubmitted: () => void;
  /** 6011/6012 - the order list is stale, refresh it */
  onOrderStale: () => void;
  /** 6017 - an active request already exists, guide to the refund list */
  onRequestExists: () => void;
}

const StripeRefundModal = ({
  target,
  onClose,
  onSubmitted,
  onOrderStale,
  onRequestExists,
}: Props) => {
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();

  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownUntilRef = useRef(0);

  useEffect(() => {
    setReason(target?.presetReason ?? "");
    setReasonError("");
    setRefunding(false);
  }, [target]);

  // cooldown ticker (429 rate limit): one tick per second until it expires
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const tmr = setTimeout(() => setCooldownLeft((s) => s - 1), 1000);
    return () => clearTimeout(tmr);
  }, [cooldownLeft]);

  const startCooldown = () => {
    cooldownUntilRef.current = Date.now() + REFUND_COOLDOWN_MS;
    setCooldownLeft(REFUND_COOLDOWN_MS / 1000);
  };

  const handleOk = async () => {
    if (!target || refunding || cooldownLeft > 0) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError(t("myPoints.stripe.refundReasonRequired"));
      return;
    }
    // UTF-8 byte check - maxLength counts chars, CJK text is 3 bytes each
    if (new TextEncoder().encode(trimmed).length > REASON_MAX_BYTES) {
      setReasonError(t("myPoints.stripe.refundReasonTooLong"));
      return;
    }
    setRefunding(true);
    try {
      await stripe_refund_request(target.orderNo, trimmed);
      messageApi.success(t("myPoints.stripe.refundSubmitted"));
      onSubmitted();
      onClose();
    } catch (err) {
      const e = err as { code?: number; message?: string };
      if (e.code === STRIPE_ERROR_CODES.REFUND_NOT_REFUNDABLE) {
        messageApi.error(t("myPoints.stripe.refundNotRefundable"));
        onOrderStale();
        onClose();
      } else if (e.code === STRIPE_ERROR_CODES.REFUND_ALREADY_REFUNDED) {
        messageApi.warning(t("myPoints.stripe.refundAlreadyRefunded"));
        onOrderStale();
        onClose();
      } else if (e.code === STRIPE_ERROR_CODES.REFUND_REQUEST_EXISTS) {
        messageApi.warning(t("myPoints.stripe.refundRequestExists"));
        onRequestExists();
        onClose();
      } else if (e.code === STRIPE_ERROR_CODES.REFUND_BAD_REASON) {
        setReasonError(t("myPoints.stripe.refundReasonRequired"));
      } else if (e.code === 429) {
        startCooldown();
        messageApi.warning(
          t("myPoints.stripe.refundCooldown", { seconds: REFUND_COOLDOWN_MS / 1000 })
        );
      } else {
        messageApi.error(e.message || t("common.transactionFailed"));
      }
    } finally {
      setRefunding(false);
    }
  };

  return (
    <>
      {messageContext}
      <Modal
        title={t("myPoints.stripe.refundTitle")}
        open={!!target}
        onOk={handleOk}
        onCancel={() => {
          if (!refunding) onClose();
        }}
        okText={
          cooldownLeft > 0
            ? `${t("common.confirm")} (${cooldownLeft}s)`
            : t("common.confirm")
        }
        cancelText={t("common.cancel")}
        okButtonProps={{ danger: true, disabled: cooldownLeft > 0 }}
        // push the footer buttons down: 15px on mobile, 1vh from lg up
        // (! needed - antd injects .ant-modal-footer margin-top at runtime)
        classNames={{ footer: "!mt-[24px] lg:!mt-[3vh]" }}
        confirmLoading={refunding}
        maskClosable={false}
      >
        {target && (
          <div className="flex flex-col gap-[10px]">
            <div className="bg-[#F9FFE2] border border-solid border-black rounded-[8px] px-[10px] py-[8px]">
              <div
                className="font-mono text-[12px] font-bold break-all"
                title={target.orderNo}
              >
                {target.orderNo}
              </div>
              {typeof target.amountCents === "number" && (
                <div className="text-[12px] font-bold mt-[2px]">
                  ${(target.amountCents / 100).toFixed(2)}
                </div>
              )}
            </div>
            <div className="bg-[#FFF7D6] text-[#8A6D00] rounded-[8px] px-[10px] py-[8px] text-[12px] font-bold">
              {typeof target.points === "number"
                ? t("myPoints.stripe.refundPointsWarning", {
                    points: target.points.toLocaleString("en-US"),
                    llax: (target.llaxAmount ?? 0).toLocaleString("en-US"),
                  })
                : t("myPoints.stripe.refundPointsWarningGeneric")}
            </div>
            <div>
              <div className="text-[12px] font-bold mb-[4px]">
                {t("myPoints.stripe.refundReasonLabel")}
              </div>
              <Input.TextArea
                rows={3}
                maxLength={1024}
                showCount
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
                placeholder={t("myPoints.stripe.refundReasonPlaceholder")}
                status={reasonError ? "error" : undefined}
              />
              {reasonError && (
                <div className="text-[#C53030] text-[11px] mt-[2px]">
                  {reasonError}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default StripeRefundModal;
