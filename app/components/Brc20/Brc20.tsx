"use client"
import { Brc20Card } from "./Brc20Card";
import { useEffect, useRef, useState } from "react";
import bg from "@/app/images/brc20/bg.svg";
import Image from "next/image";
import bsc from "@/app/images/brc20/bsc.svg";
import searchIcon from "@/app/images/agent/search.svg";
import time from "@/app/images/brc20/whiteTime.svg";
import "./Brc20Button.scss";
import "./Brc20.scss";
import { LiquidTube } from "./LiquidTube";
import { getBinanceTokenScreen, getBinanceTokenPrice, binanceLiquidityCheck, BinanceTokenScreenItem } from "@/app/api/binance";
import {
  get_binance_active_pools_count,
  get_binance_market_liquidity,
  get_binance_update_time,
} from "@/app/api/agent_c";
import { AutoComplete, Skeleton } from "antd";
import { useTranslation } from "next-i18next";
import QuestionTip from "@/app/components/QuestionTip";

let activePoolsCountCache: number | null = null;
let updateTimeCache: number | null = null;
let tokenListCache: BinanceTokenScreenItem[] | null = null;
type LiquidityLevel = "Healthy" | "Caution" | "Critical";

// Debounce utility (same as CoinsList)
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function getLiquidityLevelKey(level: string | null) {
  const normalized = level?.toLowerCase();
  if (normalized === "healthy") return "brc20.liquidityLevels.healthy";
  if (normalized === "caution") return "brc20.liquidityLevels.caution";
  if (normalized === "critical") return "brc20.liquidityLevels.critical";
  return "brc20.liquidityLevels.critical";
}

function normalizeLiquidityLevel(level: string | null | undefined): LiquidityLevel | null {
  if (level === "Healthy" || level === "Caution" || level === "Critical") {
    return level;
  }

  return null;
}

// Merge batch prices into a token list (same logic as first-load merge)
async function mergeTokenPrices(
  list: BinanceTokenScreenItem[]
): Promise<BinanceTokenScreenItem[]> {
  if (list.length === 0) return list;

  const contractAddresses = list.map((token) => token.contractAddress).filter(Boolean);
  if (contractAddresses.length === 0) return list;

  try {
    const priceResponse = await getBinanceTokenPrice(contractAddresses);
    const prices = priceResponse.data.prices || [];

    const priceMap = new Map<string, number>();
    prices.forEach((item) => {
      priceMap.set(item.token_address.toLowerCase(), item.price);
    });

    return list.map((token) => ({
      ...token,
      price: priceMap.get(token.contractAddress.toLowerCase()),
    }));
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return list;
  }
}

export function Brc20({ showSearch = false }: { showSearch?: boolean }) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<BinanceTokenScreenItem[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchStr, setSearchStr] = useState("");
  const [total, setTotal] = useState(0);
  const [activePoolsCount, setActivePoolsCount] = useState<number | null>(null);
  const [updateTime, setUpdateTime] = useState<number | null>(null);
  const [, setLiquidPercentage] = useState<number | null>(null);
  const [liquidityLevel, setLiquidityLevel] = useState<LiquidityLevel | null>(null);
  const [displayLiquidityLevel, setDisplayLiquidityLevel] = useState<LiquidityLevel>("Critical");
  const [isLiquidityLevelVisible, setIsLiquidityLevelVisible] = useState(true);
  const [, setTick] = useState(0);
  const searchSeqRef = useRef(0);
  const [searchStuck, setSearchStuck] = useState(false);
  const [searchStuckMobile, setSearchStuckMobile] = useState(false);

  // Track when the search box sticks to the top of the scroll container:
  // the box is pinned exactly when the hero section has scrolled out of it.
  useEffect(() => {
    if (!showSearch) return;
    const scrollContainer = scrollContainerRef.current?.parentElement;
    const hero = scrollContainer?.firstElementChild;
    if (!scrollContainer || !hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSearchStuck(!entry.isIntersecting),
      { root: scrollContainer }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [showSearch]);

  // Mobile: page-level scroll with overflow ancestors breaks position:sticky,
  // so emulate it — pin the search box below the fixed header once the page
  // scrolls past its natural position.
  const searchStuckMobileRef = useRef(false);
  useEffect(() => {
    if (!showSearch) return;
    const HEADER_HEIGHT = 56;
    const mql = window.matchMedia("(max-width: 1023px)");
    const searchBox = scrollContainerRef.current?.previousElementSibling as HTMLElement | null;

    const evaluate = () => {
      if (!mql.matches || !searchBox) {
        searchStuckMobileRef.current = false;
        setSearchStuckMobile(false);
        return;
      }
      // Once pinned the box goes fixed and its static rect collapses,
      // so remember the scroll threshold at the moment of pinning.
      const stickAt = Number(searchBox.dataset.stickAt);
      if (searchStuckMobileRef.current) {
        if (stickAt && window.scrollY + HEADER_HEIGHT < stickAt) {
          searchStuckMobileRef.current = false;
          setSearchStuckMobile(false);
        }
      } else if (searchBox.getBoundingClientRect().top <= HEADER_HEIGHT) {
        searchBox.dataset.stickAt = String(window.scrollY + HEADER_HEIGHT);
        searchStuckMobileRef.current = true;
        setSearchStuckMobile(true);
      }
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    mql.addEventListener("change", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      mql.removeEventListener("change", evaluate);
    };
  }, [showSearch]);

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

  // Auto-refresh formatTimeAgo display every minute
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active pools count independently
  useEffect(() => {
    if (activePoolsCountCache !== null) {
      setActivePoolsCount(activePoolsCountCache);
      return;
    }
    get_binance_active_pools_count()
      .then((res) => {
        const count = res.data.count;
        activePoolsCountCache = count;
        setActivePoolsCount(count);
      })
      .catch(console.error);
  }, []);

  // Fetch update time independently
  useEffect(() => {
    if (updateTimeCache !== null) {
      setUpdateTime(updateTimeCache);
      return;
    }
    get_binance_update_time()
      .then((res) => {
        const time = res.data.last_updated;
        updateTimeCache = time;
        setUpdateTime(time);
      })
      .catch(console.error);
  }, []);

  // Fetch market liquidity on mount and refresh it every minute.
  useEffect(() => {
    const fetchMarketLiquidity = async () => {
      try {
        const res = await get_binance_market_liquidity();
        setLiquidPercentage(res.data.healthScore ?? 0);
        setLiquidityLevel(normalizeLiquidityLevel(res.data.level));
      } catch {
        setLiquidPercentage(0);
        setLiquidityLevel(null);
      }
    };

    fetchMarketLiquidity();
    const timer = setInterval(fetchMarketLiquidity, 60_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (liquidityLevel === null || liquidityLevel === displayLiquidityLevel) {
      return;
    }

    setIsLiquidityLevelVisible(false);
    const timer = setTimeout(() => {
      setDisplayLiquidityLevel(liquidityLevel);
      setIsLiquidityLevelVisible(true);
    }, 220);

    return () => clearTimeout(timer);
  }, [displayLiquidityLevel, liquidityLevel]);

  // Fetch token screen list + prices independently
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setTokensLoading(true);
        if (tokenListCache !== null) {
          setTokens(tokenListCache);
          setTotal(tokenListCache.length);
          return;
        }
        const response = await getBinanceTokenScreen();
        let tokenList: BinanceTokenScreenItem[] = response.data.results || [];
        tokenList = await mergeTokenPrices(tokenList);

        tokenListCache = tokenList;
        setTokens(tokenList);
        setTotal(tokenList.length);
      } catch (error) {
        console.error("Failed to fetch binance token screen:", error);
      } finally {
        setTokensLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Fuzzy search via binance_liquidity_check
  const doSearch = async (query: string) => {
    const seq = ++searchSeqRef.current;

    if (!query) {
      setSearching(false);
      const list = tokenListCache ?? [];
      setTokens(list);
      setTotal(list.length);
      return;
    }

    setSearching(true);
    try {
      const res = await binanceLiquidityCheck(query);
      if (seq !== searchSeqRef.current) return; // stale response
      const results = res.data.results || [];
      const merged = await mergeTokenPrices(results);
      if (seq !== searchSeqRef.current) return; // stale after price merge
      setTokens(merged);
      setTotal(merged.length);
    } catch (error) {
      console.error("Failed to fuzzy query binance liquidity check:", error);
    } finally {
      if (seq === searchSeqRef.current) {
        setSearching(false);
      }
    }
  };

  const debouncedSearchRef = useRef(debounce((q: string) => doSearch(q), 500));

  const handleSearchChange = (value: string) => {
    setSearchStr(value);
    debouncedSearchRef.current(value);
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
             <QuestionTip content={t('brc20.updateFrequency')}>
               <div className="relative flex items-center justify-center rounded-[8px] bg-[#F8FFDC] p-[1vh]">
                  <LiquidTube level={liquidityLevel} className="h-[14vh] w-[8vh]" />
               </div>
             </QuestionTip>
            <div className="flex flex-wrap gap-[1vh] w-[60%]">
               <div className="flex w-full gap-2">
                            <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[1vh] lg:py-[1vh] flex flex-col items-center justify-center h-[7.5vh] w-[calc(50%-0.5vh)]">
              <div className="text-[13px] whitespace-nowrap flex items-center gap-[4px]">{t('brc20.activePools')}
                <QuestionTip content={t('brc20.activePoolsTip')} />
              </div>
              <div className="font-bold text-center text-[16px]">{activePoolsCount ?? "-"}</div>
            </div>
                 <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[1vh] lg:py-[1vh] flex flex-col items-center justify-center h-[7.5vh] w-[calc(50%-0.5vh)]">
              <div className="text-[13px] whitespace-nowrap flex items-center gap-[4px]">{t('brc20.healthyTokens')}
                <QuestionTip content={t('brc20.healthyTokensTip')} />
              </div>
              <div className="font-bold text-center text-[16px]">{total}</div>
            </div>

               </div>


            <div className="w-full">
              <div className="rounded-[8px] bg-[#F8FFDC] px-[14px] py-[10px] lg:px-[1vh] lg:py-[1vh] flex flex-col items-center justify-center h-[7.5vh] w-full">
              <div className="text-[13px] whitespace-nowrap flex items-center gap-[4px]">{t('brc20.totalLiquidity')}
                <QuestionTip content={t('brc20.totalLiquidityTip')} />
              </div>
              <div
                className={`font-bold text-center text-[14px] transition-opacity duration-300 ${
                  isLiquidityLevelVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {t(getLiquidityLevelKey(displayLiquidityLevel))}
              </div>
            </div>
            </div>
            
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
              <div className="h-full w-full flex lg:py-[0.3rem] gap-2">
                        <QuestionTip content={t('brc20.updateFrequency')}>
                          <div className="relative w-[26%] flex items-center justify-center bg-[#F8FFDC] border-[1px] border-[#C4F402] rounded-[8px]">
                            <LiquidTube level={liquidityLevel} h5 className="w-[4rem] ml-[-0.22rem]" />
                          </div>
                        </QuestionTip>
               <div className="w-full flex flex-col gap-2">
                 <div className="flex-1 flex justify-between gap-2">
                  <div className="h-[3.8rem] flex flex-col items-center justify-center flex-1 bg-[#F8FFDC] border-[1px] border-[#C4F402] rounded-[8px]">
                    <div className="text-center text-[11px] flex items-center justify-center gap-[4px]">{t('brc20.healthyTokens')}
                      <QuestionTip content={t('brc20.healthyTokensTip')} className="text-[10px]" />
                    </div>
                    <div className="text-center text-[16px] font-bold">{total}</div>
                  </div>
       <div className="h-[3.8rem] flex flex-col items-center justify-center flex-1 bg-[#F8FFDC] border-[1px] border-[#C4F402] rounded-[8px]">
                    <div className="text-center text-[11px] flex items-center justify-center gap-[4px]">{t('brc20.activePools')}
                      <QuestionTip content={t('brc20.activePoolsTip')} className="text-[10px]" />
                    </div>
                    <div className="text-center text-[16px] font-bold">{activePoolsCount ?? "0"}</div>
                  </div>
            
                </div>
        
                <div className="flex-1 flex justify-between">
      

                 <div className="h-[3.8rem] flex flex-col items-center justify-center  bg-[#F8FFDC] border-[1px] border-[#C4F402] rounded-[8px] w-full">
                    <div className="text-center text-[11px] flex items-center justify-center gap-[4px]">{t('brc20.totalLiquidity')}
                      <QuestionTip content={t('brc20.totalLiquidityTip')} className="text-[10px]" />
                    </div>
                    <div
                      className={`text-center text-[16px] font-bold transition-opacity duration-300 ${
                        isLiquidityLevelVisible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {t(getLiquidityLevelKey(displayLiquidityLevel))}
                    </div>
                  </div>
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
        {showSearch && (
          <div
            className={`sticky top-[55px] lg:top-0 z-[10] w-full transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
              searchStuck
                ? "lg:bg-white lg:pt-[1.2vh] lg:-my-[0.8vh] lg:pb-[1vh] lg:shadow-[0_6px_10px_-6px_rgba(0,0,0,0.3)]"
                : ""
            }`}
          >
            <div
              className={`border-[2px] border-solid border-black bg-white pl-[6px] rounded-[8px] h-[42px] lg:h-[6vh] flex items-center my-[4px] lg:my-0 ${
                searchStuckMobile
                  ? "fixed left-[14px] right-[14px] top-[64px] z-[110] my-0 shadow-[0_6px_10px_-6px_rgba(0,0,0,0.3)]"
                  : ""
              }`}
            >
              <AutoComplete
                placeholder={t('brc20.searchPlaceholder')}
                allowClear={true}
                value={searchStr}
                onChange={handleSearchChange}
                className="flex-1 w-[100%] font-bold text-[16px]"
                variant="borderless"
              />
              <div className="px-[10px] cursor-pointer">
                <Image src={searchIcon} alt="search" />
              </div>
            </div>
          </div>
        )}
        <div
          ref={scrollContainerRef}
          className={`brc20-list flex flex-wrap w-full sm:gap-[2vw] lg:gap-[0.96vw] gap-[14px] transition-opacity duration-200 ${
            searching ? "opacity-60" : "opacity-100"
          }`}
        >
          {tokensLoading ? (
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
