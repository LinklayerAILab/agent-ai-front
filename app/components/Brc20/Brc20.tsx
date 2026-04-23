"use client"
import { Brc20Card } from "./Brc20Card";
import { useEffect, useRef, useState } from "react";
import topGreen from "@/app/images/brc20/top-green.svg";
import topGreenH5 from "@/app/images/brc20/top-green-h5.svg";
import bg from "@/app/images/brc20/bg.svg";
import Image from "next/image";
import bsc from "@/app/images/brc20/bsc.svg";
import time from "@/app/images/brc20/whiteTime.svg";
import "./Brc20Button.scss";
import "./Brc20.scss";
import { getBinanceTokenScreen, getBinanceTokenPrice, BinanceTokenScreenItem } from "@/app/api/binance";
import { get_binance_active_pools_count, get_binance_update_time } from "@/app/api/agent_c";
import { Skeleton } from "antd";
import { useTranslation } from "next-i18next";

export function Brc20() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<BinanceTokenScreenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activePoolsCount, setActivePoolsCount] = useState<number | null>(null);
  const [updateTime, setUpdateTime] = useState<number | null>(null);

  const formatTimeAgo = (timestamp: number | null): string => {
    if (!timestamp) return "0m ago";
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    if (diff < 0) return "0m ago";
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Fetch Binance token screening list
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        // Fetch screening list, active pools count, and update time in parallel
        const [response, poolsResponse, timeResponse] = await Promise.allSettled([
          getBinanceTokenScreen(),
          get_binance_active_pools_count(),
          get_binance_update_time(),
        ]);

        let tokenList: BinanceTokenScreenItem[] = [];
        if (response.status === "fulfilled") {
          tokenList = response.value.data.results || [];
          setTokens(tokenList);
          setTotal(tokenList.length);
        }

        if (poolsResponse.status === "fulfilled") {
          setActivePoolsCount(poolsResponse.value.data.count);
        }

        if (timeResponse.status === "fulfilled") {
          setUpdateTime(timeResponse.value.data.last_updated);
        }

        // Asynchronously fetch price data
        if (tokenList.length > 0) {
          fetchPrices(tokenList);
        }
      } catch (error) {
        console.error('Failed to fetch binance token screen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Fetch price data
  const fetchPrices = async (tokenList: BinanceTokenScreenItem[]) => {
    try {
      const contractAddresses = tokenList.map(token => token.contractAddress).filter(Boolean);

      if (contractAddresses.length === 0) {
        return;
      }

      const priceResponse = await getBinanceTokenPrice(contractAddresses);
      const prices = priceResponse.data.prices || [];

      // Create price map table
      const priceMap = new Map<string, number>();
      prices.forEach(item => {
        priceMap.set(item.token_address.toLowerCase(), item.price);
      });

      // Update tokens, add price information
      setTokens(prevTokens =>
        prevTokens.map(token => ({
          ...token,
          price: priceMap.get(token.contractAddress.toLowerCase()),
        }))
      );
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  };


  return (
    <div className="w-[calc(100vw-28px)] mt-[20px] lg:mt-0 lg:w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 lg:bg-[#EBEBEB] rounded-[8px] flex flex-col lg:flex-row items-center lg:p-[2vh] page-alpha-inner">
      <div className="w-full h-full bg-white rounded-[8px] lg:p-[2vh]">
        <div className="lg:h-[76vh] flex flex-col lg:gap-[2vh] overflow-y-auto lg:pr-[2vh]">
        <div className="h-[20vh] bg-[#cf0] rounded-[8px] w-full hidden lg:flex items-center justify-center">
          <div className="flex-1 p-[2vh] h-full flex justify-start gap-[1vh] relative flex items-start">
            <div className="flex flex-col gap-[1vh] items-center justify-center h-full">
                <div className="text-[32px] font-bold w-full whitespace-nowrap flex items-center">{t('brc20.scannerTitle')} <div className="text-[14px] mt-[1vh] flex items-center gap-1 ml-[10px]"><Image src={time} alt="time" width={20} height={20}></Image> {formatTimeAgo(updateTime)}</div></div>
            <div className="text-[13px] w-full whitespace-nowrap">
              {t('brc20.scannerDesc')}
            </div>
            </div>
            <div className="flex items-center justify-center lg:w-[14vh] h-full">
                <Image src={bg} alt="bg" className="lg:w-[16vh] lg:h-[16vh] object-contain" />
            </div>
          </div>
          <div className="flex-1 flex justify-end gap-[1vh] py-[2vh] h-full pr-[2vh]">
             <div className="flex items-center justify-center rounded-[8px] bg-[#F8FFDC] p-[1vh]">
                <Image src={topGreen} alt="topGreen" className="h-[14vh] w-[8vh]" width={45} height={50}></Image>
            </div>
            <div className="flex flex-wrap gap-[1vh] w-[60%]">
                <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[2vh] lg:py-[1.5vh] flex flex-col items-center justify-center h-[16vh] w-[calc(50%-0.5vh)]">
              <div className="text-[16px] whitespace-nowrap">{t('brc20.healthyTokens')}</div>
              <div className="font-bold text-center text-[16px]">{total}</div>
            </div>
            <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[2vh] lg:py-[1.5vh] flex flex-col items-center justify-center h-[16vh] w-[calc(50%-0.5vh)]">
              <div className="text-[16px] whitespace-nowrap">{t('brc20.activePools')}</div>
              <div className="font-bold text-center text-[16px]">{activePoolsCount ?? "-"}</div>
            </div>

{/* 
            <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[2vh] lg:py-[1.5vh] flex flex-col items-center justify-center h-[7.5vh] w-[calc(50%-0.5vh)]">
              <div className="text-[12px] whitespace-nowrap">{t('brc20.totalLiquidity')}</div>
              <div className="font-bold text-center text-[16px]">-</div>
            </div>
            <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[2vh] lg:py-[1.5vh] flex flex-col items-center justify-center  h-[7.5vh] w-[calc(50%-0.5vh)]">
              <div className="text-[12px] whitespace-nowrap">{t('brc20.avgExitCost')}</div>
              <div className="font-bold text-center text-[16px]">-</div>
            </div> */}
            </div>
          </div>
        </div>
        <div className="block lg:hidden mb-[14px]">
          <div className="mb-[14px] rounded-[8px] bg-[#cf0] pb-[6px]">
            <div className="flex items-center h-[46px] px-[8px] text-[16px] font-bold justify-between">
              <div className="flex items-center"><Image src={bsc} alt="bsc" className="w-[20px] h-[20px] mr-[10px]" /> {t('brc20.chainPulse')}</div>
              <div className="text-[12px] flex items-center gap-1"><Image src={time} alt="time" className="w-[14px]" width={18} height={18}></Image> {formatTimeAgo(updateTime)}</div>
            </div>
            <div className="bg-white rounded-[8px] mx-[6px] p-[14px] h-[10rem]">
              <div className="h-full w-full brc20-h5bg flex py-[0.3rem]">
                <div className="flex-1 flex flex-col justify-between">
                  <div className="h-[3.5rem] flex flex-col items-center justify-center">
                    <div className="text-center text-[11px]">{t('brc20.healthyTokens')}</div>
                    <div className="text-center text-[16px] font-bold">{total}</div>
                  </div>

                  <div className="h-[3.5rem] flex flex-col items-center justify-center">
                    <div className="text-center text-[11px]">{t('brc20.totalLiquidity')}</div>
                    <div className="text-center text-[16px] font-bold">-</div>
                  </div>
                </div>
                <div className="w-[26%] flex items-center justify-center">
                  <Image src={topGreenH5} className="w-[4rem] ml-[-0.22rem]" alt="topGreenH5"></Image>
                </div>
                <div className="flex-1 flex flex-col justify-between">
             <div className="h-[3.5rem] flex flex-col items-center justify-center">
                    <div className="text-center text-[11px]">{t('brc20.activePools')}</div>
                    <div className="text-center text-[16px] font-bold">{activePoolsCount ?? "-"}</div>
                  </div>

                 <div className="h-[3.5rem] flex flex-col items-center justify-center">
                    <div className="text-center text-[11px]">{t('brc20.avgExitCost')}</div>
                    <div className="text-center text-[16px] font-bold">-</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[8px] bg-[#cf0] p-[14px] h-[116px] flex items-center gap-[14px] w-full">
            <div className="flex flex-col gap-[5px] w-[66%]">
              <div className="text-[18px] font-bold">{t('brc20.scannerTitle')}</div>
              <div className="text-[14px]">
                {t('brc20.scannerDesc')}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image src={bg} alt="bg" className="w-[100px] h-[100px] object-contain" />
            </div>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="brc20-list flex flex-wrap w-full sm:gap-[2vw] lg:gap-[0.96vw] gap-[14px]"
        >
          {loading ? (
            // Loading state - use Ant Design skeleton screen
            Array.from({ length: 9 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-full sm:w-1/2 sm:w-[48.4%] lg:w-[48.8%] xl:w-[32.45%] flex flex-row lg:gap-[1vh] bg-[#F3F3F3] rounded-[8px] p-[14px] lg:p-[1.8vh] lg:h-[16.5vh]"
              >
                <div className="flex w-full h-full">
                  <div className="flex flex-col pr-[14px] lg:pr-[2vh] border-r-[1px] border-r-[#E7E7E7] lg:w-[70%] border-r-solid w-full gap-[10px] lg:gap-[1vh]">
                    <div className="flex gap-[10px]">
                      <div className="flex gap-1 flex-col flex-1">
                        <div><Skeleton.Input active size="small" block className="w-full" /></div>
                        <div><Skeleton.Input active size="small" block className="w-full" /></div>
                      </div>
                    </div>
                    <div className="text-[12px] border-t-[#D8E2B1] border-t-[1px] pt-[14px] lg:pt-[2vh] flex gap-1 lg:gap-4 font-bold lg:mt-[1vh]">
                      <Skeleton.Input active size="small" block />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[14px] lg:gap-[2.5vh] pl-[14px] lg:pl-[2vh] lg:w-[30%] items-center justify-between h-full">
                    <Skeleton.Button active size="default" className="w-full" />
                    <Skeleton.Button active size="default" className="w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : tokens.length > 0 ? (
            // Render data list
            tokens.map((token, index) => (
              <Brc20Card key={token.tokenId || index} token={token} />
            ))
          ) : (
            // Empty state
            <div className="w-full text-center py-[4vh] text-gray-500">
              {t('brc20.noTokensAvailable')}
            </div>
          )}
        </div>
        </div>

      </div>
    </div>
  );
}
