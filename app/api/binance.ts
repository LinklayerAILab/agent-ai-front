import { request, streamingRequest } from "./request";
const api = '/agent_c_api'
interface BinanceResponse {
  code: number;
  message: string;
}

export interface BinanceTokenScreenItem {
  tokenId: string;           // Binance Token ID (CoinGecko ID)
  tokenSymbol: string;       // Token symbol
  tokenName: string;         // Token name
  contractAddress: string;   // Contract address
  poolAddress: string;       // Main pool address
  poolType: string;          // Pool type (V2/V3)
  quoteTokenSymbol: string;  // Quote token symbol
  depthScore: number;        // Depth adequacy score
  stabilitySlope: number;    // Depth stability slope
  exitSlippage: number;      // Exit feasibility slippage
  overallScore: number;      // Overall score
  riskLevel: string;         // Risk level
  analysisResult: string;    // Complete analysis result JSON
  screeningTime: number;     // Screening time
  lastUpdated: number;       // Last update time
  price?: number;            // Token price (from price API)
  imageUrl: string
}

export interface BinanceTokenScreenResponseData {
  results: BinanceTokenScreenItem[];
  total: number;
}

export interface GetBinanceTokenScreenResponse extends BinanceResponse {
  data: BinanceTokenScreenResponseData;
}

/**
 * Fetch Binance token screening list
 * Use proxy path /defai_api/binance_token_screen
 */
export const getBinanceTokenScreen = () => {
  return request<GetBinanceTokenScreenResponse>(`${api}/v1/binance_token_screen`, {
    method: "GET",
    cache: "no-store",
  });
};

// ==================== Price interfaces ====================

export interface BinanceTokenPriceItem {
  symbol: string;
  token_address: string;
  price: number;
  pool_type: string; // V2, V2-MultiHop, V3, V3-MultiHop
}

export interface BinanceTokenPriceResponseData {
  prices: BinanceTokenPriceItem[];
}

export interface GetBinanceTokenPriceRequest {
  token_addresses: string[];
}

export interface GetBinanceTokenPriceResponse extends BinanceResponse {
  data: BinanceTokenPriceResponseData;
}

/**
 * Fetch Binance token prices
 * Use proxy path /defai_api/v1/binance_token_price
 * @param tokenAddresses Contract address array
 */
export const getBinanceTokenPrice = (tokenAddresses: string[]) => {
  return request<GetBinanceTokenPriceResponse>(`${api}/v1/binance_token_price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token_addresses: tokenAddresses,
    }),
  });
};

/**
 * Fetch Binance token screening list and prices
 * Combined interface: first fetch screening list, then batch fetch prices and merge
 */
export const getBinanceTokenScreenWithPrices = async (): Promise<BinanceTokenScreenItem[]> => {
  try {
    // 1. Fetch screening list
    const screenResponse = await getBinanceTokenScreen();
    const tokens = screenResponse.data.results || [];

    if (tokens.length === 0) {
      return [];
    }

    // 2. Extract all contract addresses
    const contractAddresses = tokens.map(token => token.contractAddress).filter(Boolean);

    if (contractAddresses.length === 0) {
      return tokens;
    }

    // 3. Batch fetch prices
    try {
      const priceResponse = await getBinanceTokenPrice(contractAddresses);
      const prices = priceResponse.data.prices || [];

      // 4. Create price map
      const priceMap = new Map<string, number>();
      prices.forEach(item => {
        priceMap.set(item.token_address.toLowerCase(), item.price);
      });

      // 5. Merge price data into token list
      return tokens.map(token => ({
        ...token,
        price: priceMap.get(token.contractAddress.toLowerCase()),
      }));
    } catch (priceError) {
      console.error('Failed to fetch prices, returning tokens without price:', priceError);
      // When price fetch fails, return token list without prices
      return tokens;
    }
  } catch (error) {
    console.error('Failed to fetch token screen:', error);
    throw error;
  }
};

// ==================== Funding Analysis types ====================

export interface FundingDepthBalance {
  buy_depth: number;
  sell_depth: number;
  asymmetry_pct: number;
}

export interface FundingAnalysisData {
  cvd: number;
  cvd_trend: string;
  funding_rate: number;
  funding_status: string;
  depth_balance: FundingDepthBalance;
  risk_signals: string[];
}

export type BinanceTokenAnalysisStreamingResponse =
  | {
      event: "message" | "workflow_started" | "workflow_finished" | "message_end" | "funding_data";
      answer?: string;
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
      // funding_data fields (present when event === "funding_data")
      cvd?: number;
      cvd_trend?: string;
      funding_rate?: number;
      funding_status?: string;
      depth_balance?: FundingDepthBalance;
      risk_signals?: string[];
    }
  | string;

export const binance_token_analysis_streaming = (
  input: string,
  lang?: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  const body: Record<string, unknown> = { input };

  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=UTF-8",
  };
  if (lang) {
    headers["Accept-Language"] = lang;
  }

  return streamingRequest<BinanceTokenAnalysisStreamingResponse>(
    `/api/v1/binance_token_analysis`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify(body),
      headers,
    },
    {
      endFun,
      abortController,
      parseMode: "sse",
    },
  );
};

// ==================== Binance Liquidity Check ====================

export interface BinanceLiquidityCheckRequest {
  query: string; // symbol 或合约地址（模糊匹配）
}

/**
 * binance_liquidity_check 返回的是 PascalCase 字段（Go 默认 JSON tag），
 * 与 binance_token_screen 的 camelCase 不同。这里统一归一化成
 * BinanceTokenScreenItem（camelCase），方便复用 Brc20Card 渲染。
 */
function normalizeLiquidityCheckItem(raw: Record<string, unknown>): BinanceTokenScreenItem {
  const str = (v: unknown, fallback = ""): string =>
    typeof v === "string" ? v : fallback;
  const num = (v: unknown, fallback = 0): number =>
    typeof v === "number" ? v : fallback;

  return {
    tokenId: str(raw.TokenID ?? raw.tokenId),
    tokenSymbol: str(raw.TokenSymbol ?? raw.tokenSymbol),
    tokenName: str(raw.TokenName ?? raw.tokenName),
    contractAddress: str(raw.ContractAddress ?? raw.contractAddress),
    poolAddress: str(raw.PoolAddress ?? raw.poolAddress),
    poolType: str(raw.PoolType ?? raw.poolType),
    quoteTokenSymbol: str(raw.QuoteTokenSymbol ?? raw.quoteTokenSymbol),
    depthScore: num(raw.DepthScore ?? raw.depthScore),
    stabilitySlope: num(raw.StabilitySlope ?? raw.stabilitySlope),
    exitSlippage: num(raw.ExitSlippage ?? raw.exitSlippage),
    overallScore: num(raw.OverallScore ?? raw.overallScore),
    riskLevel: str(raw.RiskLevel ?? raw.riskLevel),
    analysisResult: str(raw.AnalysisResult ?? raw.analysisResult),
    screeningTime: num(raw.ScreeningTime ?? raw.screeningTime),
    lastUpdated: num(raw.LastUpdated ?? raw.lastUpdated),
    imageUrl: str(raw.ImageUrl ?? raw.imageUrl),
  };
}

/**
 * Fuzzy query the token list by symbol or contract address.
 * Response items are normalized to the BinanceTokenScreenItem shape.
 */
export const binanceLiquidityCheck = async (
  query: string
): Promise<GetBinanceTokenScreenResponse> => {
  const res = await request<{
    code: number;
    message: string;
    data: { results: Record<string, unknown>[] };
  }>(`${api}/v1/binance_liquidity_check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const results = (res.data.results || []).map(normalizeLiquidityCheckItem);
  return {
    ...res,
    data: { results, total: results.length },
  };
};
