
import { request } from "./request";

// AI 分析历史接口（docs/analysis_history_design.md @ c_agent）。
// 列表不返回正文（content 恒为空串），点开详情才取；
// id 是字符串合成键（"a:123" 老链路 / "g:456" Guard），原样回传，勿当数字解析。

/** agent_c 后端通用响应外层（与 app/api/agent_c.ts 中的 AgentCResponse 一致） */
interface AgentCResponse {
  code: number;
  message: string;
}

export type AnalysisServiceType =
  | "analyse_coin"
  | "execute_strategy"
  | "risk_management"
  | "liquidity_check"
  | "binance_token_analysis"
  | "guard_coin_analysis";

// 业务线聚合维度：BEP20 = 老链路 5 类 Dify 分析；ALPHA = Guard 单币分析
export type AnalysisLine = "all" | "bep20" | "alpha";

export const BEP20_SERVICE_TYPES: AnalysisServiceType[] = [
  "analyse_coin",
  "execute_strategy",
  "risk_management",
  "liquidity_check",
  "binance_token_analysis",
];

export const ALPHA_SERVICE_TYPES: AnalysisServiceType[] = ["guard_coin_analysis"];

export const ALL_SERVICE_TYPES: AnalysisServiceType[] = [
  ...BEP20_SERVICE_TYPES,
  ...ALPHA_SERVICE_TYPES,
];

export interface AnalysisHistoryItem {
  /** 合成键 "a:123" / "g:456"，原样回传给详情与删除接口 */
  id: string;
  /** 6 种之一，见 AnalysisServiceType */
  service_type: AnalysisServiceType;
  /** 被分析币种符号（如 LISA/BTCUSDT）；识别不出时为空串 */
  symbol: string;
  /** 被分析币种名称/展示名；识别不出时为空串 */
  name: string;
  /** 脱敏后的输入摘要（永久不含 API Key）。列表页 UI 不展示，仅详情备用 */
  query_summary: string;
  /** 完整分析正文；列表接口恒为空串，详情接口才有 */
  content: string;
  /** ok 正常 / partial 内容可能不完整 / failed 失败 */
  status: "ok" | "partial" | "failed";
  /** status != ok 时的错误描述 */
  error_message: string | null;
  /** 分析时刻（排序键，新在前） */
  created_at: string;
}

export interface AnalysisHistoryListData {
  items: AnalysisHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetAnalysisHistoryResponse extends AgentCResponse {
  data: AnalysisHistoryListData;
}

export interface GetAnalysisHistoryDetailResponse extends AgentCResponse {
  data: AnalysisHistoryItem;
}

const AGENT_C_API = process.env.NEXT_PUBLIC_API_AGENT_C;

/**
 * 列表接口。后端 service_type 只支持单值；
 * 业务线聚合（BEP20 5 类 / ALPHA 1 类 / ALL 全部）在页面层组装多次调用后归并。
 */
export const get_analysis_history = (params: {
  service_type?: AnalysisServiceType;
  limit?: number;
  offset?: number;
}) => {
  const qs = new URLSearchParams();
  if (params.service_type) qs.set("service_type", params.service_type);
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  const query = qs.toString();
  return request<GetAnalysisHistoryResponse>(
    `${AGENT_C_API}/v1/analysis/history${query ? `?${query}` : ""}`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

/** 详情接口。id 是合成键，前端原样回传，不要 encodeURIComponent 后再拼前缀。 */
export const get_analysis_history_detail = (id: string) => {
  return request<GetAnalysisHistoryDetailResponse>(
    `${AGENT_C_API}/v1/analysis/history/${encodeURIComponent(id)}`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

/**
 * 删除本人单条分析。已删除 / 不存在 / 非本人一律返回 6202，
 * 前端把 6202 也视为成功（条目已不在列表即可）。
 */
export const delete_analysis_history = (id: string) => {
  return request<AgentCResponse>(
    `${AGENT_C_API}/v1/analysis/history/${encodeURIComponent(id)}`,
    {
      method: "delete",
      cache: "no-store",
    },
  );
};
