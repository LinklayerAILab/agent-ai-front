import { request } from "./request";

interface BinanceResponse {
  code: number;
  message: string;
}

export interface BinanceTokenScreenItem {
  tokenId: string;           // Binance Token ID (CoinGecko ID)
  tokenSymbol: string;       // 代币符号
  tokenName: string;         // 代币名称
  contractAddress: string;   // 合约地址
  poolAddress: string;       // 主池地址
  poolType: string;          // 池子类型 (V2/V3)
  quoteTokenSymbol: string;  // 报价币符号
  depthScore: number;        // 深度充足性分数
  stabilitySlope: number;    // 深度稳定性斜率
  exitSlippage: number;      // 退出可行性滑点
  overallScore: number;      // 综合评分
  riskLevel: string;         // 风险等级
  analysisResult: string;    // 完整分析结果 JSON
  screeningTime: number;     // 筛选时间
  lastUpdated: number;       // 最后更新时间
  price?: number;            // 代币价格（从价格接口获取）
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
 * fetch币安代币筛选list
 * use代理path /defai_api/binance_token_screen
 */
export const getBinanceTokenScreen = () => {
  return request<GetBinanceTokenScreenResponse>("/defai_api/v1/binance_token_screen", {
    method: "GET",
    cache: "no-store",
  });
};

// ==================== 价格interface ====================

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
 * fetch币安代币价格
 * use代理path /defai_api/v1/binance_token_price
 * @param tokenAddresses 合约addressarray
 */
export const getBinanceTokenPrice = (tokenAddresses: string[]) => {
  return request<GetBinanceTokenPriceResponse>("/defai_api/v1/binance_token_price", {
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
 * fetch币安代币筛选list及价格
 * group合interface：先fetch筛选list，再批量fetch价格并合并
 */
export const getBinanceTokenScreenWithPrices = async (): Promise<BinanceTokenScreenItem[]> => {
  try {
    // 1. fetch筛选list
    const screenResponse = await getBinanceTokenScreen();
    const tokens = screenResponse.data.results || [];

    if (tokens.length === 0) {
      return [];
    }

    // 2. 提取all合约address
    const contractAddresses = tokens.map(token => token.contractAddress).filter(Boolean);

    if (contractAddresses.length === 0) {
      return tokens;
    }

    // 3. 批量fetch价格
    try {
      const priceResponse = await getBinanceTokenPrice(contractAddresses);
      const prices = priceResponse.data.prices || [];

      // 4. Create价格map表
      const priceMap = new Map<string, number>();
      prices.forEach(item => {
        priceMap.set(item.token_address.toLowerCase(), item.price);
      });

      // 5. 合并价格data到代币list
      return tokens.map(token => ({
        ...token,
        price: priceMap.get(token.contractAddress.toLowerCase()),
      }));
    } catch (priceError) {
      console.error('Failed to fetch prices, returning tokens without price:', priceError);
      // 价格fetchFailed时，Return不含价格代币list
      return tokens;
    }
  } catch (error) {
    console.error('Failed to fetch token screen:', error);
    throw error;
  }
};
