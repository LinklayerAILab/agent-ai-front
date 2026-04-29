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

export type BinanceTokenAnalysisStreamingResponse =
  | {
      event: "message" | "workflow_started" | "workflow_finished" | "message_end";
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
    }
  | string;

export const binance_token_analysis_streaming = (
  input: string,
  endFun?: () => void,
  abortController?: AbortController,
) => {
  return streamingRequest<BinanceTokenAnalysisStreamingResponse>(
    `/api/v1/binance_token_analysis`,
    {
      method: "post",
      cache: "no-store",
      body: JSON.stringify({
        input,
      }),
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
