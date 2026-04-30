"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { message } from "antd";

import { liquidity_check_dify } from "@/app/api/agent_c";
import type { AlphaTokenItem } from "@/app/api/agent_c";
import { binance_token_analysis_streaming, type BinanceTokenScreenItem } from "@/app/api/binance";
import type { AppDispatch, RootState } from "@/app/store";
import { syncPoints } from "@/app/store/userSlice";
import { AGENT_POINTS_COST } from "@/app/enum";
import { ChatMessage, MessageChunk } from "@/app/components/ChatMessage";
import TypewriterNode from "@/app/components/TypewriterNode";
import bot from "@/app/images/agent/banner.png";

interface StreamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string | AlphaTokenItem | BinanceTokenScreenItem;
  mode?: "liquidity_check" | "binance_token_analysis";
}

const StreamingModal = memo(({ isOpen, onClose, query, mode = "liquidity_check" }: StreamingModalProps) => {
  const { t } = useTranslation();

  const isLogin = useSelector((state: RootState) => state.user?.isLogin ?? false);
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState<"init" | "loading" | "generating" | "end">("init");
  const [loading, setLoading] = useState(false);
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const streamAbortController = useRef<AbortController | null>(null);
  const hasStartedRef = useRef(false);

  const queryInput = useMemo(() => {
    if (typeof query === "string") {
      return `${t('agent.analyze')} ` + query;
    }

    return t('agent.analyze') + ' ' + JSON.stringify(query);
  }, [query, t]);

  const labels = useMemo(
    () => ({
      analyzing: t("agent.analyzing") || "Analyzing...",
      pleaseLogin: t("common.loginFirst") || "Please login first",
    }),
    [t]
  );

  const cleanup = useCallback(() => {
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
    }
    setLoading(false);
    setMessageChunks([]);
    setStatus("init");
  }, []);

  const reset = useCallback(() => {
    hasStartedRef.current = false;
  }, []);

  const stopCreation = useCallback(() => {
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
    }
    setStatus("end");
    setLoading(false);
    onClose();
  }, [onClose]);

  const startStreaming = useCallback(async () => {
    if (!isLogin) {
      message.warning(labels.pleaseLogin);
      onClose();
      return;
    }

    if (streamAbortController.current) {
      return;
    }

    cleanup();
    setStatus("loading");
    setLoading(true);
    setMessageChunks([]);

    try {
      const spotCost = AGENT_POINTS_COST.INSIGHT_SPOT;
      const latestPoints = await dispatch(syncPoints()).unwrap();
      if (latestPoints < spotCost) {
        message.warning(t("home.insufficientPoints", { cost: spotCost }));
        cleanup();
        return;
      }

      streamAbortController.current = new AbortController();

      const streamGenerator =
        mode === "binance_token_analysis"
          ? binance_token_analysis_streaming(
              queryInput,
              undefined,
              streamAbortController.current
            )
          : liquidity_check_dify(
              queryInput,
              undefined,
              streamAbortController.current
            );

      for await (const chunk of streamGenerator) {
        if (streamAbortController.current?.signal.aborted) {
          break;
        }

        let newContent = "";

        if (chunk && typeof chunk === "object") {
          if ("event" in chunk && chunk.event === "message" && "answer" in chunk) {
            newContent = chunk.answer || "";
          } else if ("event" in chunk && (chunk.event === "workflow_finished" || chunk.event === "message_end")) {
            streamAbortController.current = null;
          } else {
            const data = "data" in chunk ? chunk.data : undefined;
            newContent =
              data?.analyse_result?.output?.output ||
              data?.recommend_result?.output?.output ||
              data?.text ||
              data?.content ||
              ("text" in chunk ? chunk.text : "") ||
              ("content" in chunk ? chunk.content : "") ||
              ("answer" in chunk ? chunk.answer : "") ||
              "";
          }
        } else if (typeof chunk === "string") {
          newContent = chunk;
        }

        if (newContent) {
          const newChunk: MessageChunk = {
            id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: newContent,
            timestamp: Date.now(),
          };

          setMessageChunks((prev) => {
            if (prev.length === 0) {
              setStatus("generating");
              setTimeout(() => setLoading(false), 500);
            }
            return [...prev, newChunk];
          });
        }
      }

      setStatus("end");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      message.error(t("common.requestFailed") || "Request failed, please try again");
      cleanup();
    } finally {
      streamAbortController.current = null;
      setLoading(false);
    }
  }, [cleanup, isLogin, labels.pleaseLogin, mode, onClose, queryInput, t]);

  useEffect(() => {
    if (isOpen) {
      if (!hasStartedRef.current) {
        setStatus("loading");
        setLoading(true);
        hasStartedRef.current = true;
        startStreaming();
      }
    } else {
      cleanup();
      reset();
    }
  }, [cleanup, dispatch, isOpen, reset, startStreaming]);

  useEffect(() => {
    return () => {
      cleanup();
      reset();
    };
  }, [cleanup, reset]);

  useEffect(() => {
    const handleTextLoaded = () => {
      setStatus("end");
    };

    window.addEventListener("textLoaded", handleTextLoaded);
    return () => {
      window.removeEventListener("textLoaded", handleTextLoaded);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-[10000] flex items-center justify-center">
      <button
        type="button"
        aria-label={t("common.closeDialog") || "Close dialog"}
        className="absolute inset-0 cursor-pointer bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[10001] w-[92vw] max-w-[640px] rounded-[12px] bg-white shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === "binance_token_analysis"
              ? t("alpha.liquidityAnalysis")
              : (t("alpha.liquidityCheck") || "Liquidity Check")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label={t("common.close") || "Close"}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatMessage
            status={status}
            stopCreation={stopCreation}
            tip={labels.analyzing}
            loading={loading}
            messages={messageChunks}
            initNode={<TypewriterNode text={t("agent.initStr1") || "How can I help you?"} icon={bot} />}
            className="h-[60vh]"
          />
        </div>
      </div>
    </div>
  );
});

StreamingModal.displayName = "StreamingModal";

export default StreamingModal;
