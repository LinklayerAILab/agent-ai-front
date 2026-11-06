"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Empty, Modal, Skeleton, message } from "antd";
import {
  LeftOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-light.css";
import { RootState } from "../store";
import { formatDate } from "../utils";
import {
  AnalysisHistoryItem,
  AnalysisServiceType,
  get_analysis_history,
  get_analysis_history_detail,
} from "../api/analysis";
import "./page.scss";

const PAGE_SIZE = 20;

/** 本页只展示这两个分析类型，每个 Tab 直查对应接口。
 *  Tab 文案：BEP20 / ALPHA（业务线维度）；底层查询映射：
 *    BEP20 → binance_token_analysis
 *    ALPHA → liquidity_check */
const TABS: { key: AnalysisServiceType; i18nKey: string }[] = [
  { key: "binance_token_analysis", i18nKey: "analysisHistory.tabs.bep20" },
  { key: "liquidity_check", i18nKey: "analysisHistory.tabs.alpha" },
];

/** 把后端 time.Time 序列化字符串解析成毫秒时间戳（失败返回 0） */
const parseTs = (s: string): number => {
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
};

const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [messageApi, messageContext] = message.useMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  // 当前选中的分析类型
  const [serviceType, setServiceType] = useState<AnalysisServiceType>("binance_token_analysis");
  // 已加载到的记录（按 created_at DESC）
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // 详情 Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<AnalysisHistoryItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 触底加载哨兵（IntersectionObserver 监听，PC 列表内滚 / 移动端页面滚都有效）
  const sentinelRef = useRef<HTMLDivElement>(null);

  /** 拉取指定 service_type 在当前 offset 处的一页 */
  const fetchPage = useCallback(
    async (
      st: AnalysisServiceType,
      offset: number,
    ): Promise<{ items: AnalysisHistoryItem[]; total: number }> => {
      const res = await get_analysis_history({
        service_type: st,
        limit: PAGE_SIZE,
        offset,
      });
      return { items: res.data.items || [], total: res.data.total || 0 };
    },
    [],
  );

  /** 重新加载第一页（切 tab / 首次进入） */
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { items: list, total } = await fetchPage(serviceType, 0);
      setItems(list);
      setHasMore(list.length < total && list.length >= PAGE_SIZE);
    } catch {
      messageApi.error(t("analysisHistory.loadFailed"));
      setItems([]);
      setHasMore(false);
    } finally {
      const tmr = setTimeout(() => {
        setLoading(false);
        clearTimeout(tmr);
      }, 400);
    }
  }, [fetchPage, serviceType, messageApi, t]);

  useEffect(() => {
    if (!isLogin) {
      setLoading(false);
      setItems([]);
      return;
    }
    reload();
  }, [isLogin, reload]);

  /** 触底加载更多 */
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { items: next, total } = await fetchPage(serviceType, items.length);
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const fresh = next.filter((i) => !seen.has(i.id));
        return [...prev, ...fresh];
      });
      setHasMore(items.length + next.length < total);
    } catch {
      messageApi.error(t("analysisHistory.loadFailed"));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, items.length, serviceType, loading, loadingMore, messageApi, t]);

  // 哨兵进入视口即加载下一页（不依赖具体滚动容器，PC/移动端通用）
  useEffect(() => {
    if (loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      // 提前 40px 触发，保持原触底手感
      { rootMargin: "0px 0px 40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, loading]);

  /** 打开详情 */
  const openDetail = useCallback(
    async (item: AnalysisHistoryItem) => {
      // 失败的记录无分析内容，禁止打开详情
      if (item.status === "failed") return;
      setDetailItem(item);
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await get_analysis_history_detail(item.id);
        setDetailItem(res.data);
      } catch (err) {
        const code = (err as { code?: number })?.code;
        // 6202 不存在/已删除
        if (code === 6202) {
          setDetailError(t("analysisHistory.loadFailed"));
          // 顺手从列表里摘掉
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        } else {
          setDetailError(t("analysisHistory.loadFailed"));
        }
      } finally {
        setDetailLoading(false);
      }
    },
    [t],
  );

  const statusBadge = (status: AnalysisHistoryItem["status"]) => {
    switch (status) {
      case "ok":
        return "bg-[#E9FF93] text-[#7A9900]";
      case "partial":
        return "bg-[#FFF3CD] text-[#B8860B]";
      case "failed":
        return "bg-[#F8D7DA] text-[#DC3545]";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  return (
    <div className="page-analysis-history w-[100%] h-auto lg:h-[83vh] flex flex-col page-home-inner lg:border-solid lg:border-black lg:border-2 rounded-[8px]">
      {messageContext}

      {/* 顶部返回条（仅 lg 显示，仿 my-points） */}
      <div
        className="h-[40px] lg:h-[4vh] bg-[#cf0] rounded-t-[8px] hidden lg:flex items-center px-[14px] cursor-pointer select-none"
        onClick={() => router.push("/")}
      >
        <LeftOutlined />
        <span className="text-[16px] ml-[4px] font-bold">
          {t("common.back")}
        </span>
      </div>

      <div className="flex flex-col h-[100%] py-[14px] lg:py-[3vh] lg:px-[20px]">
        {/* 标题 */}
        <div className="text-[18px] lg:text-[24px] font-bold flex items-center justify-center gap-[8px] mb-[14px] lg:mb-[2vh]">
          <HistoryOutlined />
          {t("analysisHistory.title")}
        </div>

        {/* Tabs：BEP20 / ALPHA */}
        <div className="flex justify-center mb-[14px] lg:mb-[2vh]">
          <div className="inline-flex bg-[#eee] rounded-[8px] p-[4px] gap-[4px]">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className={`px-[16px] lg:px-[24px] py-[6px] lg:py-[8px] rounded-[6px] text-[12px] lg:text-[14px] font-bold cursor-pointer select-none transition-colors ${
                  serviceType === tab.key
                    ? "bg-[#cf0] text-black"
                    : "text-[#666] hover:text-black"
                }`}
                onClick={() => setServiceType(tab.key)}
              >
                {t(tab.i18nKey)}
              </div>
            ))}
          </div>
        </div>

        {/* 列表 */}
        <div className="rounded-[8px] overflow-hidden list-box lg:h-[55vh] overflow-y-auto lg:w-[600px] lg:max-w-full lg:mx-auto">
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
                </div>
              ))}
            </div>
          ) : items.length ? (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center h-[40px] lg:h-[52px] list-item-ele text-[10px] lg:text-[12px] px-[10px] ${
                    item.status === "failed" ? "disabled" : "cursor-pointer"
                  }`}
                  onClick={item.status === "failed" ? undefined : () => openDetail(item)}
                >
                  {/* 币种（symbol 优先，name 兜底） */}
                  <div className="flex-1 flex items-center min-w-0">
                    <span
                      className="font-bold truncate"
                      title={item.symbol || item.name}
                    >
                      {item.symbol || item.name || "--"}
                    </span>
                  </div>

                  {/* 状态徽标 */}
                  <div className="flex-1 flex justify-center">
                    <span
                      className={`flex items-center h-[20px] px-[8px] rounded-[10px] text-[10px] lg:text-[11px] font-bold whitespace-nowrap ${statusBadge(item.status)}`}
                    >
                      {t(`analysisHistory.status.${item.status}`)}
                    </span>
                  </div>

                  {/* 时间 */}
                  <div className="flex-1 font-bold whitespace-nowrap text-right">
                    {formatDate(parseTs(item.created_at), "MM/DD HH:mm")}
                  </div>
                </div>
              ))}

              {/* 触底哨兵：进入视口即触发 loadMore */}
              <div ref={sentinelRef} className="h-[1px]" />

              {/* 触底加载更多指示 */}
              {loadingMore && (
                <div className="py-[10px] flex justify-center text-[12px] text-[#666]">
                  {t("analysisHistory.loadMore")}
                </div>
              )}
              {!hasMore && items.length > PAGE_SIZE && (
                <div className="py-[10px] flex justify-center text-[12px] text-[#999]">
                  {t("analysisHistory.noMore")}
                </div>
              )}
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-[8px]">
              <Empty description={t("analysisHistory.empty")} />
              <div className="text-[12px] text-[#999]">
                {t("analysisHistory.emptyDesc")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 详情 Modal */}
      <Modal
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        footer={null}
        width="92vw"
        style={{ maxWidth: 720 }}
        title={
          <span className="text-[14px] lg:text-[16px]">
            {t("analysisHistory.title")}
          </span>
        }
      >
        {detailLoading ? (
          <div className="p-[20px] space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Input
                key={i}
                style={{ width: `${80 - i * 10}%` }}
                active
                size="small"
              />
            ))}
          </div>
        ) : detailError ? (
          <div className="p-[20px] text-center text-[#DC3545] text-[14px]">
            {detailError}
          </div>
        ) : detailItem ? (
          <div className="flex flex-col">
            {/* 元信息：币种 + 时间 */}
            <div className="flex items-center justify-between text-[11px] text-[#999] pb-[10px] border-b border-gray-100">
              <span className="truncate pr-[10px] font-bold text-[13px] text-black">
                {detailItem.symbol || detailItem.name || "--"}
              </span>
              <span className="shrink-0">
                {formatDate(parseTs(detailItem.created_at), "YYYY/MM/DD HH:mm")}
              </span>
            </div>

            {/* partial 提示 */}
            {detailItem.status === "partial" && (
              <div className="mt-[10px] px-[10px] py-[6px] rounded-[6px] bg-[#FFF3CD] text-[#B8860B] text-[12px] font-bold">
                {t("analysisHistory.partialTip")}
              </div>
            )}

            {/* failed 提示 */}
            {detailItem.status === "failed" && (
              <div className="mt-[10px] px-[10px] py-[6px] rounded-[6px] bg-[#F8D7DA] text-[#DC3545] text-[12px] font-bold">
                {detailItem.error_message || t("analysisHistory.status.failed")}
              </div>
            )}

            {/* 正文（markdown 渲染，table 容器允许横向滚动） */}
            <div className="markdown-body mt-[12px] max-h-[55vh] overflow-y-auto text-[13px] lg:text-[14px] !bg-transparent">
              {detailItem.content || detailItem.error_message ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ ...props }) => (
                      <div style={{ overflowX: "auto" }}>
                        <table {...props} />
                      </div>
                    ),
                  }}
                >
                  {detailItem.content || detailItem.error_message || ""}
                </ReactMarkdown>
              ) : (
                <div className="text-[#999]">--</div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Page;
