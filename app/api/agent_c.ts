
import { request, streamingRequest } from "./request";
import { ApiResponse } from "./user";

export const AGENT_C_API = process.env.NEXT_PUBLIC_API_AGENT_C;

interface AgentCResponse {
  code: number;
  message: string;
}
export interface GetUserCountResponse extends AgentCResponse {
  data: {
    count: number;
  };
}

export const get_user_count_c = () => {
  return request<GetUserCountResponse>(`${AGENT_C_API}/v1/user_count`, {
    method: "get",
    cache: "no-store",
  });
};

export interface GetGainRankingItem {
  symbol: string;
  price: number;
  gain: number;
  image: string;
  collect: boolean;
  loading: boolean;
  symbol_type: 0 | 1 | 2; // 0-spot 1-futures 2-spot+futures
}
export interface GetGainRankingCResponse extends AgentCResponse {
  data: {
    res: GetGainRankingItem[];
    total: number;
  };
}
// /getgainranking
export const get_gain_ranking_c = () => {
  // Set 5 seconds timeout for this interface at API layer
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("get_gain_ranking_c timeout")),
      5000,
    );
  });

  const reqPromise = request<GetGainRankingCResponse>(
    `${AGENT_C_API}/v1/getgainranking`,
    {
      method: "get",
      cache: "no-store",
    },
  );

  return Promise.race([reqPromise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<GetGainRankingCResponse>;
};

export interface GetCollectCResponse extends AgentCResponse {
  data: {
    symbols: string[] | null;
  };
}
// /get_collect
export const get_collect_c = () => {
  return request<GetCollectCResponse>(`${AGENT_C_API}/v1/get_collect`, {
    method: "get",
    cache: "no-store",
  });
};

// /set_collect
export const set_collect_c = (symbol: string) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/set_collect`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify({
      symbol,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

// /cancel_collect
export const cancel_collect_c = (symbol: string) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/cancel_collect`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify({
      symbol,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface inviterInfoResponse extends ApiResponse {
  data: {
    my_user_id: string; // My user ID
    my_image: string; // My image
    inviter_id: string; // User ID of the inviter
    inviter_image: string; // Inviter's image
    cex_names: string[]; // Exchange names of all API keys uploaded by inviter
  };
}
export const inviter_info = () => {
  return request<inviterInfoResponse>(`${AGENT_C_API}/v1/inviter_info`, {
    method: "get",
    cache: "no-store",
  });
};

export interface MyInviteeItem {
  user_id: string;
  image: string;
  cex_names: string[];
}

export interface MyInviteeInfoResponse extends ApiResponse {
  data: {
    invitees: MyInviteeItem[];
  };
}
// /my_invitee_info
export const my_invitee_info = () => {
  return request<MyInviteeInfoResponse>(`${AGENT_C_API}/v1/my_invitee_info`, {
    method: "get",
    cache: "no-store",
  });
};

export interface AnalyseCoinCResponse extends AgentCResponse {
  data: {
    analyse_result: {
      workflowRunId: string;
      input: {
        input: string;
      };
      output: {
        output: string;
      };
      workflowExecutionTime: number;
      status: string;
      totalCost: number;
      totalTokens: number;
      startTime: number;
      endTime: number;
      cost: number;
      tokens: number;
    };
  };
}
// /analyse_coin
export const analyse_coin_c = (symbol: string) => {
  return request<AnalyseCoinCResponse>(`${AGENT_C_API}/v1/analyse_coin`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify({
      input: `${symbol}`,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface RecommendCoinCResponse extends AgentCResponse {
  data: {
    recommend_result: {
      workflowRunId: string;
      input: {
        input: string;
      };
      output: {
        output: string;
      };
      workflowExecutionTime: number;
      status: string;
      totalCost: number;
      totalTokens: number;
      startTime: number;
      endTime: number;
      cost: number;
      tokens: number;
    };
  };
}
// /recommend_coin
export const recommend_coin_c = (str: string) => {
  return request<AnalyseCoinCResponse>(`${AGENT_C_API}/v1/recommend_coin`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify({
      input: str,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

// Flow request returns SSE event types
export interface StreamingSSEEvent {
  event: "message" | "workflow_started" | "workflow_finished" | "message_end";
  task_id?: string;
  id?: string;
  answer?: string;
  created_at?: number;
}

// Union of possible data types returned by flow request
export type StreamingResponse =
  | StreamingSSEEvent
  | {
      data?: {
        analyse_result?: {
          output?: {
            output: string;
          };
        };
        recommend_result?: {
          output?: {
            output: string;
          };
        };
        text?: string;
        content?: string;
      };
      text?: string;
      content?: string;
      answer?: string;
    }
  | string;

export const analyse_coin_c_steaming = (
  str: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  const requestBody: { input: string } = {
    input: str,
  };

  return streamingRequest<StreamingResponse>(
    `/api/v1/analyse_coin`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
    {
      endFun,
      abortController,
    },
  );
};

export const recommend_coin_c_steaming = (
  str: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  const requestBody: { input: string } = {
    input: str,
  };

  return streamingRequest<StreamingResponse>(
    `/api/v1/recommend_coin`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
    {
      endFun,
      abortController,
    },
  );
};

export const position_risk_management = (
  str: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  const requestBody: { input: string } = {
    input: str,
  };

  return streamingRequest<StreamingResponse>(
    `/api/v1/position_risk_management`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
    {
      endFun,
      abortController,
    },
  );
};

export const liquidity_check_dify = (
  str: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  const requestBody: { input: string } = {
    input: str,
  };

  return streamingRequest<StreamingResponse>(
    `/api/v1/liquidity_check_dify`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
    {
      endFun,
      abortController,
      parseMode: "sse",
    },
  );
};

export interface SendCaptchaRequestParams {
  email: string;
  type: number; // 0 for binding
}
export const post_send_captcha = (data: SendCaptchaRequestParams) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/send_captcha`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface BindEmailResponse {
  email: string;
  captcha: string;
  type: number;
}

export const post_user_bind_email = (data: BindEmailResponse) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/bind_email`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface GetUserInfoResponse extends AgentCResponse {
  data: {
    web3_address: string;
    email: string;
    invite_code: string;
    invite_count: number;
  };
}

export const get_user_info = () => {
  return request<GetUserInfoResponse>(`${AGENT_C_API}/v1/get_userinfo`, {
    method: "get",
    cache: "no-store",
  });
};

/**
 * @param signature
 * @param sig_msg
 * @returns
 */
export const bind_web3address = (address: string) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/bind_web3address`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify({ address }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

// /get_orderid
export interface GetOrderIdResponse extends AgentCResponse {
  data: {
    order_id: string;
  };
}

export const get_orderid = () => {
  return request<GetOrderIdResponse>(`${AGENT_C_API}/v1/get_orderid`, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export type QueryTasksType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined;
export interface QueryTasksItem {
  type: QueryTasksType;
  point: string | undefined;
  timestamp: number | undefined;
}

export interface QueryTasksResponse extends ApiResponse {
  data: {
    Res: QueryTasksItem[];
    Total: number;
  } | null;
}
// /query_tasks
export interface QueryTasksParams {
  page: number;
  size: number;
}
// Bind_Web3      = 1
//   Bind_Email     = 2
//   Follow_X       = 3
//   Telegram_Group = 4
//   New_User       = 5
//   Invite_User    = 6
//   Subcribe       = 7
export const query_tasks = (data: QueryTasksParams) => {
  return request<QueryTasksResponse>(`${AGENT_C_API}/v1/query_tasks`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};
// binance, okx, bitget, bybit
// /add_userapikey
export interface AddCommonApiKeyParams {
  apikey: string;
  secretkey: string;
  cex_name: string;
}
export interface AddPassCommonApiKeyParams extends AddCommonApiKeyParams {
  passphrase: string;
}

export const add_common_apikey = (
  data: AddCommonApiKeyParams | AddPassCommonApiKeyParams,
) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/add_userapikey`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

// /add_userapikey
export const add_userapikey = (
  data: AddCommonApiKeyParams | AddPassCommonApiKeyParams,
) => {
  return request<AgentCResponse>(`${AGENT_C_API}/v1/add_userapikey`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface QueryDexParams {
  cex_name: string;
}

export interface GetAssetWithLogoItem {
  asset: string;
  free: string;
  logo: string;
}
export interface GetAssetWithLogoResponse extends AgentCResponse {
  data: {
    assets: GetAssetWithLogoItem[];
  };
}
// /get_asset_with_logo
export const get_asset_with_logo = (data: QueryDexParams) => {
  return request<GetAssetWithLogoResponse>(
    `${AGENT_C_API}/v1/get_asset_with_logo`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
  );
};

export interface ContractExpertResponse extends AgentCResponse {
  data: {
    long_score: number;
    short_score: number;
  };
}
// /contract_expert_score
export const contract_expert_score = (data: QueryDexParams) => {
  return request<ContractExpertResponse>(
    `${AGENT_C_API}/v1/contract_expert_score`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
  );
};

export interface SpotExpertResponse extends AgentCResponse {
  data: {
    is_expert: boolean;
    score: number;
  };
}
// /spot_expert_score
export const spot_expert_score = (data: QueryDexParams) => {
  return request<SpotExpertResponse>(`${AGENT_C_API}/v1/spot_expert_score`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

export interface SpotPriceRequest {
  symbol: string;
}
export interface SpotPriceResponse extends AgentCResponse {
  data: {
    price: number;
  };
}
// /getspotprice
export const get_spot_price = (data: SpotPriceRequest) => {
  return request<SpotPriceResponse>(`${AGENT_C_API}/v1/getspotprice`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

// /liquidation_calculated
export interface LiquidationCalculatedRequest {
  cex_name: string;
}

export interface LiquidationCalculatedResponse extends AgentCResponse {
  data: {
    loss_count: number;
    // Number of losses
    period_start: number;
    period_end: number;
  };
}

export const liquidation_calculated = (data: LiquidationCalculatedRequest) => {
  return request<LiquidationCalculatedResponse>(
    `${AGENT_C_API}/v1/liquidation_calculated`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
  );
};

export const liquidation_undue = (data: LiquidationCalculatedRequest) => {
  return request<LiquidationCalculatedResponse>(
    `${AGENT_C_API}/v1/liquidation_undue`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
  );
};

export type GetCexData = string[];
export interface GetCexResponse extends AgentCResponse {
  data: {
    cex: GetCexData;
  };
}

export const get_cex = () => {
  return request<GetCexResponse>(`${AGENT_C_API}/v1/get_cex`, {
    method: "get",
    cache: "no-store",
  });
};

// /position_symbols
export interface PositionSymbolsParams {
  cex_name: string;
}
export interface PositionSymbolsItem {
  symbol: string;
  position_side: string;
  update_time: number;
}
export interface PositionSymbolsResponse extends AgentCResponse {
  data: {
    symbols: PositionSymbolsItem[];
    total_count: number;
  };
}
export const position_symbols = (data: PositionSymbolsParams) => {
  return request<PositionSymbolsResponse>(
    `${AGENT_C_API}/v1/position_symbols`,
    {
      method: "post",
      body: JSON.stringify(data),
      cache: "no-store",
    },
  );
};

export interface ClaimInfoItem {
  id: number;
  user_id: string;
  channel_id: number;
  channel_type: string;
  reference_id: string;
  amount: number;
  before_balance: number;
  after_balance: number;
  pool_before: number;
  pool_after: number;
  created_at: string;
}
// /claim_info
export interface ClaimInfoResponse extends AgentCResponse {
  data: {
    records: ClaimInfoItem[];
    total: number;
  };
}
export const get_claim_info = (params: { cex_name: string ,channel_ids: number[]}) => {
  return request<ClaimInfoResponse>(`${AGENT_C_API}/v1/claim_info`, {
    method: "post",
    cache: "no-store",
    body: JSON.stringify(params),
  });
};

// Alpha token info interfaces
export interface AlphaTokenItem {
  symbol: string;
  icon_url: string;
  token_address: string;
  price?: number;
  level?: number;
  color?: string;
  d2_result?: {
    slope: number;
  };
}

export interface AlphaTokenInfoResponse extends AgentCResponse {
  data: {
    tokens: AlphaTokenItem[];
  };
}

// /alpha_token_info
export const alpha_token_info = () => {
  return request<AlphaTokenInfoResponse>(
    `${AGENT_C_API}/v1/alpha_token_info`,
    {
      method: "get",
      cache: "no-store",
    },
    { timeout: 300000 },
  );
};

// /alpha_token_price
export interface AlphaTokenPriceItem {
  symbol: string;
  token_address: string;
  price: number;
}
export interface AlphaTokenPriceParams {
  token_addresses: string[];
}
export interface AlphaTokenPriceResponse extends ApiResponse {
  data: {
    prices: AlphaTokenPriceItem[];
  };
}
export const alpha_token_price = (params: AlphaTokenPriceParams) => {
  return request<AlphaTokenPriceResponse>(
    `${AGENT_C_API}/v1/alpha_token_price`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(params),
    },
    { timeout: 300000 },
  );
};

export interface LiquidityCheckItem {
  token_address: string; // Token address
  symbol: string; // Token symbol
  d1_result: string; // D1 result
  d2_result?: {
    slope: number;
  }; // D2 result
  color: string; // Liquidity status color
  level: number; // Liquidity status level (Yellow sub-level)
  description: string; // Status description
}
export interface LiquidityCheckResponse extends ApiResponse {
  data: {
    results: LiquidityCheckItem[];
  };
}

// liquidity_check
export const liquidity_check = (params: AlphaTokenPriceParams) => {
  return request<LiquidityCheckResponse>(
    `${AGENT_C_API}/v1/liquidity_check`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(params),
    },
    { timeout: 300000 },
  );
};

// /update_time
export interface UpdateTimeResponse extends ApiResponse {
  data: {
    block_time: number;
  };
}
export const update_time = () => {
  return request<UpdateTimeResponse>(
    `${AGENT_C_API}/v1/update_time`,
    {
      method: "get",
      cache: "no-store",
    },
    { timeout: 300000 },
  );
};

// ==================== LLAx Module ====================

// LLAx Balance
export interface LLAxBalanceData {
  balance: {
    balance: number;
    total_earned: number;
    total_consumed: number;
  };
}
export interface LLAxBalanceResponse extends AgentCResponse {
  data: LLAxBalanceData;
}
export const get_llax_balance = () => {
  return request<LLAxBalanceResponse>(`${AGENT_C_API}/v1/llax/balance`, {
    method: "get",
    cache: "no-store",
  });
};

// LLAx Issuance Records
export interface LLAxIssuanceRecord {
  id: number;
  channel_id: number;
  channel_name: string;
  amount: number;
  before_balance: number;
  after_balance: number;
  created_at: string;
}
export interface LLAxIssuanceRecordsResponse extends AgentCResponse {
  data: {
    records: LLAxIssuanceRecord[];
    total: number;
  };
}
export const get_llax_issuance_records = (params: {
  page: number;
  size: number;
}) => {
  return request<LLAxIssuanceRecordsResponse>(
    `${AGENT_C_API}/v1/llax/issuance-records?page=${params.page}&size=${params.size}`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// LLAx Pools
export interface LLAxPool {
  created_at: string;
  id: number;
  is_active: boolean;
  is_exhausted: boolean;
  issued_amount: number;
  last_warning_sent: null;
  name: string;
  remaining_amount: number;
  total_cap: number;
  updated_at: string;
  usage_percent: number;
}
export interface LLAxPoolsResponse extends AgentCResponse {
  data: LLAxPool[];
}
export const get_llax_pools = () => {
  return request<LLAxPoolsResponse>(`${AGENT_C_API}/v1/llax/pools`, {
    method: "get",
    cache: "no-store",
  });
};

// LLAx Pool Progress Report
export interface LLAxPoolProgressReport extends AgentCResponse {
  data: {
    pools: LLAxPool[];
    trend: Array<{ date: string; [key: string]: number | string }>;
  };
}
export const get_llax_pool_progress = () => {
  return request<LLAxPoolProgressReport>(
    `${AGENT_C_API}/v1/llax/reports/pool-progress`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// LLAx Announcements
export interface LLAxAnnouncement {
  id: number;
  title: string;
  content: string;
  priority: number;
  is_pinned: boolean;
  created_at: number;
}
export interface LLAxAnnouncementsResponse extends AgentCResponse {
  data: {
    announcements: LLAxAnnouncement[];
  };
}
export const get_llax_announcements = () => {
  return request<LLAxAnnouncementsResponse>(
    `${AGENT_C_API}/v1/llax/announcements`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// LLAx Referral Stats
export interface LLAxReferralStatsResponse extends AgentCResponse {
  data: {
    total_invitees: number;
    successful_referrals: number;
    total_reward_earned: number;
    max_referees: number;
  };
}
export const get_llax_referral_stats = () => {
  return request<LLAxReferralStatsResponse>(
    `${AGENT_C_API}/v1/llax/referral/stats`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// LLAx Referral Rewards
export interface LLAxReferralReward {
  id: number;
  invitee_id: string;
  reward_amount: number;
  order_tx_hash: string;
  created_at: number;
}
export interface LLAxReferralRewardsResponse extends AgentCResponse {
  data: {
    rewards: LLAxReferralReward[];
    total: number;
  };
}
export const get_llax_referral_rewards = (params: {
  page: number;
  size: number;
}) => {
  return request<LLAxReferralRewardsResponse>(
    `${AGENT_C_API}/v1/llax/referral/rewards?page=${params.page}&size=${params.size}`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// LLAx Wallet Snapshot Status
export interface LLAxWalletSnapshotData {
   has_snapshot: boolean //该用户已有钱包快照记录                                                                                                                                                                                    
  eligible: boolean // 该用户符合快照奖励资格（IsEligible，即持币满足条件）                                                                                                                                                          
  is_issued: boolean // LLAx 奖励尚未发放。改为 true 表示已发放                                                                                                                                                                     
  issued_at: null | number // 奖励发放时间，当前为 null 说明还没发放，发放后会写入具体时间                                                                                                                                                 
  snapshot_block: number // 快照时的 BSC 区块高度，记录的是在哪个区块做的持币检查                                                                                                                                               
  created_at: number // 快照记录的创建时间  

}
export interface LLAxWalletSnapshotResponse extends AgentCResponse {
  data: LLAxWalletSnapshotData;
}
export const get_llax_wallet_snapshot_status = () => {
  return request<LLAxWalletSnapshotResponse>(
    `${AGENT_C_API}/v1/llax/wallet/snapshot/status`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

// ==================== Binance Active Pools & Update Time ====================

export interface BinanceActivePoolsCountResponseData {
  count: number;
}
export interface GetBinanceActivePoolsCountResponse extends AgentCResponse {
  data: BinanceActivePoolsCountResponseData;
}
export const get_binance_active_pools_count = () => {
  return request<GetBinanceActivePoolsCountResponse>(
    `${AGENT_C_API}/v1/binance_active_pools_count`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};

export interface BinanceUpdateTimeResponseData {
  last_updated: number;
}
export interface GetBinanceUpdateTimeResponse extends AgentCResponse {
  data: BinanceUpdateTimeResponseData;
}
export const get_binance_update_time = () => {
  return request<GetBinanceUpdateTimeResponse>(
    `${AGENT_C_API}/v1/binance_update_time`,
    {
      method: "get",
      cache: "no-store",
    },
  );
};
