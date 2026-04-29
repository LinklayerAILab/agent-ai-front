"use client";
import React, { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { AutoComplete, Skeleton, Tooltip, message } from "antd";
import rightIcon from "@/app/images/agent/right.svg";
import rightIconGary from "@/app/images/agent/rightGary.svg";
import './CoinList.scss'
// Import images
import searchIcon from "@/app/images/agent/search.svg";
// import botdot from "@/app/images/agent/botdot.svg";

// Import components
import Star from "../Star";
import SmaltImage from "../SmaltImage/SmaltImage";

// Import APIs
import {
  get_gain_ranking_c,
  get_collect_c,
  set_collect_c,
  cancel_collect_c,
  GetGainRankingCResponse,
  GetCollectCResponse,
} from "@/app/api/agent_c";
import { isDev } from "@/app/enum";


// Debounce utility function
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

// Type definitions
export interface CoinItem {
  symbol: string;
  price: number;
  gain: number;
  image: string;
  symbol_type: 0 | 1 |2; // 0-spot 1-futures 2-spot+futures
  collect: boolean;
  loading?: boolean;
}

type CurrentItem = CoinItem;

interface CoinsListInitialData {
  ranking: GetGainRankingCResponse | null;
  collects: GetCollectCResponse | null;
}

const coinsListInitialDataCache = new Map<string, CoinsListInitialData>();
const coinsListInitialDataPromise = new Map<string, Promise<CoinsListInitialData>>();

const getCoinsListInitialKey = (isLogin: boolean, token: string | null) =>
  isLogin && token ? `login:${token}` : "guest";

const fetchCoinsListInitialData = async (
  isLogin: boolean
): Promise<CoinsListInitialData> => {
  if (isLogin) {
    const [collectRes, rankingRes] = await Promise.allSettled([
      get_collect_c(),
      get_gain_ranking_c(),
    ]);

    return {
      collects: collectRes.status === "fulfilled" ? collectRes.value : null,
      ranking: rankingRes.status === "fulfilled" ? rankingRes.value : null,
    };
  }

  return {
    collects: null,
    ranking: await get_gain_ranking_c(),
  };
};

export interface CoinsListProps {
  /** Consult AI button click callback - spot */
  onConsultClick: (v:CoinItem) => void;
  /** Consult AI button click callback - futures */
  onContractClick: (v:CoinItem) => void;
  /** Search box placeholder */
  searchPlaceholder?: string;
  /** Table header configuration */
  tableHeaders?: {
    tokenName: string;
    currentPrice: string;
    spot: string;
    futures: string;
  };
  /** Custom container className */
  containerClassName?: string;
  /** Table container height */
  tableHeight?: string;
}

const CoinsList = forwardRef<HTMLDivElement, CoinsListProps>(({
  onConsultClick,
  onContractClick,
  searchPlaceholder,
  tableHeaders,
  containerClassName = "flex flex-col gap-[14px] lg:gap-[1vh] lg:justify-center w-100% lg:w-100% overflow-hidden",
  tableHeight = "h-[68vh] lg:h-[62vh]",
}, ref) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  // Internal state
  const [currentList, setCurrentList] = useState<CurrentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrollLoading, setIsScrollLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [searchStr, setSearchStr] = useState("");

  // Internal refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useRef({ page: 1, size: 20 });
  const gains = useRef<GetGainRankingCResponse | null>(null);
  const collectC = useRef<GetCollectCResponse | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const isScrollLoadingRef = useRef(false);
  const isFirstLoad = useRef(true);
  const isMounted = useRef(false);
  const filteredData = useRef<CurrentItem[]>([]);
  const lastApiCallTime = useRef(0);
  const timerCreatedCount = useRef(0);
  const handleGetListRef = useRef<() => Promise<void>>(async () => {});
  const handleGetRankingRef = useRef<(collects: GetCollectCResponse | null) => Promise<void>>(async () => {});
  const isCreatingTimer = useRef(false); // Prevent concurrent timer creation

  // Debug mode
  const DEBUG_MODE = isDev;
  const debugLog = useCallback((...args: unknown[]) => {
    if (DEBUG_MODE) {
      console.log('[CoinList Debug]', ...args);
    }
  }, [DEBUG_MODE]);

  // Unified timer management function - ensure only one timer at any time
  const createTimer = useCallback((source: string) => {
    // Prevent concurrent creation
    if (isCreatingTimer.current) {
      debugLog(`Timer creation blocked - already creating from ${source}`);
      return;
    }

    isCreatingTimer.current = true;

    // First clear existing timer
    if (timer.current) {
      debugLog(`Clearing existing timer before creating new one from ${source}`);
      clearInterval(timer.current);
      timer.current = null;
    }

    // Ensure component is mounted
    if (!isMounted.current) {
      debugLog(`Component unmounted, skip timer creation from ${source}`);
      isCreatingTimer.current = false;
      return;
    }

    // Create new timer
    timerCreatedCount.current += 1;
    const timerId = timerCreatedCount.current;
    debugLog(`Creating timer #${timerId} from ${source}`);
    clearInterval(timer.current!);
    timer.current = setInterval(() => {
      handleGetListRef.current();
    }, 8000);

    isCreatingTimer.current = false;
  }, [debugLog]);

  // Clear timer
  const clearTimer = useCallback((source: string) => {
    if (timer.current) {
      debugLog(`Clearing timer from ${source}`);
      clearInterval(timer.current);
      timer.current = null;
    }
  }, [debugLog]);
  // API call function to prevent duplicate calls
  const callGetGainRankingApi = async (source: string) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime.current;
    const apiCallTimeout = 1000;

    if (timeSinceLastCall < apiCallTimeout) {
      debugLog(`API call blocked - too soon (${timeSinceLastCall}ms < ${apiCallTimeout}ms)`, { source });
      return null;
    }

    lastApiCallTime.current = now;
    debugLog('Calling get_gain_ranking_c API', { source, timestamp: now });

    try {
      const result = await get_gain_ranking_c();
      debugLog('API call completed successfully', { source });
      return result;
    } catch (error) {
      debugLog('API call failed', { source, error });
      throw error;
    }
  };

  // Get collection list
  const handleGetCollects = async () => {
    const data = await get_collect_c();
    collectC.current = data;
    return data;
  };

  // Pagination loading
  const toPage = useCallback(() => {
    if (!gains.current?.data.res) {
      isScrollLoadingRef.current = false;
      setIsScrollLoading(false);
      return;
    }

    const start = (params.current.page - 1) * params.current.size;
    const end = params.current.page * params.current.size;
    const sortData = gains.current.data.res.map((item) => {
      const flag = collectC.current?.data.symbols?.includes(item.symbol);
      return {
        ...item,
        collect: flag ? true : false,
        loading: false,
      };
    });

    const newList = sortData
      .sort((a, b) => Number(b.collect) - Number(a.collect))
      .slice(start, end);

    if (newList.length === 0) {
      setHasMoreData(false);
      isScrollLoadingRef.current = false;
      setIsScrollLoading(false);
      debugLog('No new data loaded, reset loading state');
    } else {
      setCurrentList((prev) => [...prev, ...newList]);
      debugLog('New data loaded:', newList.length);
    }
  }, [debugLog]);

  // Reset pagination state
  const resetPagination = useCallback(() => {
    params.current.page = 1;
    isScrollLoadingRef.current = false;
    setIsScrollLoading(false);
    setHasMoreData(true);
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = 0;
    }
  }, []);

  // Get coin list - timer dedicated
  const handleGetList = useCallback(async () => {
    const callId = Math.random().toString(36).substr(2, 9);
    debugLog(`handleGetList called by timer [${callId}]`);

    if (!isMounted.current) {
      debugLog(`Component unmounted, skip handleGetList [${callId}]`);
      return;
    }

    if (isScrollLoadingRef.current || searchStr) {
      debugLog(`Skip timer refresh: scrolling or searching [${callId}]`);
      return;
    }

    try {
      const res = await callGetGainRankingApi(`timer-${callId}`);
      if (!res) {
        debugLog(`API call was blocked, skipping update [${callId}]`);
        return;
      }

      if (!isMounted.current) {
        debugLog(`Component unmounted after API, skip update [${callId}]`);
        return;
      }

      gains.current = res;

      if (res.data.res.length) {
        const start = 0;
        const end = params.current.page * params.current.size;
        const newlist = res.data.res
          .map((item) => ({
            ...item,
            loading: false,
            collect:
              collectC?.current?.data.symbols?.includes(
                item.symbol.toUpperCase()
              ) || false,
          }))
          .sort((a, b) => Number(b.collect) - Number(a.collect))
          .slice(start, end);

        if (!isMounted.current) {
          debugLog(`Component unmounted before setState, skip [${callId}]`);
          return;
        }

        setCurrentList(newlist);
        debugLog(`Timer refresh completed, items: ${newlist.length} [${callId}]`);
      }
    } catch (error) {
      console.error(`Failed to refresh coin list [${callId}]:`, error);
      if (DEBUG_MODE) {
        messageApi.warning('Data refresh failed');
      }
    }
  }, [searchStr, callGetGainRankingApi, debugLog, messageApi]);

  // Update handleGetListRef
  useEffect(() => {
    handleGetListRef.current = handleGetList;
  }, [handleGetList]);

  // Get ranking data - initialization dedicated
  const handleGetRanking = useCallback(async (collects: GetCollectCResponse | null) => {
    debugLog('handleGetRanking called', { hasTimer: !!timer.current, isFirstLoad: isFirstLoad.current });

    // Use unified clear function
    clearTimer('handleGetRanking-start');

    if (isFirstLoad.current === true) {
      setLoading(true);
    }

    try {
      const res = await callGetGainRankingApi('initialization');
      if (!res) {
        debugLog('API call was blocked during initialization');
        setLoading(false);
        return;
      }

      if (!isMounted.current) {
        debugLog('Component unmounted after API, skip initialization updates');
        return;
      }

      gains.current = res;
      isFirstLoad.current = false;

      if (res.data.res.length) {
        const list = res.data.res
          .map((item) => ({
            ...item,
            loading: false,
            collect:
              collects?.data.symbols?.includes(item.symbol.toUpperCase()) ||
              false,
          }))
          .sort((a, b) => Number(b.collect) - Number(a.collect))
          .slice(0, params.current.size);

        setCurrentList(list);
        debugLog('handleGetRanking completed, list items:', list.length);
      }

      // Start timer after initialization completes
      createTimer('handleGetRanking-end');
    } finally {
      setLoading(false);
    }
  }, [callGetGainRankingApi, clearTimer, createTimer]);

  // Update handleGetRankingRef
  useEffect(() => {
    handleGetRankingRef.current = handleGetRanking;
  }, [handleGetRanking]);

  // Scroll loading
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isScrollLoadingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 160) {
      if (searchStr) {
        debugLog('Search mode: scroll loading disabled');
        return;
      }

      const totalItems = gains.current?.data?.res.length || 0;
      const loadedItems = params.current.page * params.current.size;

      if (loadedItems >= totalItems) {
        debugLog('No more data to load');
        setHasMoreData(false);
        return;
      }

      // Use unified clear function
      clearTimer('scroll-loading');

      try {
        isScrollLoadingRef.current = true;
        setIsScrollLoading(true);
        params.current.page++;
        debugLog('Loading page:', params.current.page);

        toPage();

        // Wait for scroll loading to complete before creating timer
        setTimeout(() => {
          isScrollLoadingRef.current = false;
          setIsScrollLoading(false);
          debugLog('Scroll loading completed');

          // Create timer in setTimeout callback to ensure state has updated
          createTimer('scroll-loading-complete');
        }, 100);
      } catch (error) {
        console.error('Scroll loading error:', error);
        isScrollLoadingRef.current = false;
        setIsScrollLoading(false);
        messageApi.error('Loading failed, please try again later.');
      }
    }
  }, [searchStr, toPage, messageApi, clearTimer, createTimer]);

  // Use useRef to store debounced function, avoid recreating every time
  const debouncedHandleScrollRef = useRef(debounce(handleScroll, 80));

  // Update debounced function when handleScroll changes
  useEffect(() => {
    debouncedHandleScrollRef.current = debounce(handleScroll, 80);
  }, [handleScroll]);

  // Search functionality
  const handleChange = useCallback((e: string) => {
    setSearchStr(e);

    if (e) {
      const list = gains.current?.data.res.filter((item) =>
        item.symbol.toLowerCase().includes(e.toLowerCase())
      );

      filteredData.current = list?.map((item) => ({
        ...item,
        loading: false,
        collect:
          collectC.current?.data.symbols?.includes(
            item.symbol.toUpperCase()
          ) || false,
      })) || [];

      setCurrentList(filteredData.current.slice(0, params.current.size));
      debugLog('Search results:', filteredData.current.length);
    } else {
      resetPagination();
      filteredData.current = [];

      const list = gains.current?.data.res
        .map((item) => ({
          ...item,
          loading: false,
          collect:
            collectC.current?.data.symbols?.includes(
              item.symbol.toUpperCase()
            ) || false,
        }))
        .sort((a, b) => Number(b.collect) - Number(a.collect))
        .slice(0, params.current.size);

      setCurrentList(list || []);

      // Recreate timer after search is cleared
      createTimer('search-cleared');

      debugLog('Search cleared, pagination reset');
    }
  }, [resetPagination, createTimer]);

  // Collection functionality
  const handleCollect = useCallback(async (symbol: string, collect: boolean) => {
    const data = currentList.map((item) => item);
    data.forEach((item) => {
      if (item.symbol === symbol) {
        item.loading = true;
      }
    });

    setCurrentList(data);

    try {
      if (collect) {
        await set_collect_c(symbol);
      } else {
        await cancel_collect_c(symbol);
      }
      await handleGetCollects();
    } finally {
      data.forEach((item) => {
        if (item.symbol === symbol) {
          item.loading = false;
        }
      });
      setCurrentList(currentList);
    }

    setTimeout(() => {
      setCurrentList(
        currentList.map((item) => {
          if (item.symbol === symbol) {
            return {
              ...item,
              collect: collect,
            };
          }
          return item;
        })
      );
    });
  }, [currentList]);

  // Initialize data
  useEffect(() => {
    isMounted.current = true;
    debugLog('useEffect triggered', {
      currentLoginState: isLogin,
      hasTimer: !!timer.current
    });

    let cancelled = false;

    const token = localStorage.getItem("access_token");
    const initKey = getCoinsListInitialKey(isLogin, token);

    const loadInitialData = async () => {
      try {
        setLoading(true);

        let initialData: CoinsListInitialData;

        if (coinsListInitialDataCache.has(initKey)) {
          initialData = coinsListInitialDataCache.get(initKey)!;
        } else {
          if (!coinsListInitialDataPromise.has(initKey)) {
            coinsListInitialDataPromise.set(
              initKey,
              fetchCoinsListInitialData(isLogin)
            );
          }
          initialData = await coinsListInitialDataPromise.get(initKey)!;
          coinsListInitialDataCache.set(initKey, initialData);
          coinsListInitialDataPromise.delete(initKey);
        }

        if (cancelled || !isMounted.current) {
          return;
        }

        collectC.current = initialData.collects;
        gains.current = initialData.ranking;
        isFirstLoad.current = false;

        const rankingList = initialData.ranking?.data?.res || [];
        if (rankingList.length > 0) {
          const list = rankingList
            .map((item) => ({
              ...item,
              loading: false,
              collect:
                initialData.collects?.data?.symbols?.includes(
                  item.symbol.toUpperCase()
                ) || false,
            }))
            .sort((a, b) => Number(b.collect) - Number(a.collect))
            .slice(0, params.current.size);

          setCurrentList(list);
        } else {
          setCurrentList([]);
        }

        createTimer("initial-cache-load");
      } catch (error) {
        coinsListInitialDataPromise.delete(initKey);
        console.error("Failed to load coin list initial data:", error);
        if (!cancelled && isMounted.current) {
          setCurrentList([]);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    const el = scrollRef.current;
    if (!el) return;

    const debouncedScrollHandler = () => {
      debouncedHandleScrollRef.current();
    };

    el.addEventListener("scroll", debouncedScrollHandler);

    return () => {
      cancelled = true;
      isMounted.current = false;

      // Use unified clear function
      clearTimer('component-unmount');

      isScrollLoadingRef.current = false;
      setIsScrollLoading(false);
      filteredData.current = [];
      lastApiCallTime.current = 0;
      timerCreatedCount.current = 0;
      isCreatingTimer.current = false;

      el.removeEventListener("scroll", debouncedScrollHandler);
      debugLog('Component unmounted, cleanup completed');
    };
  }, [isLogin, debugLog]); // Remove handleGetRanking dependency, use ref to call

  // Expose scrollRef to parent component (through forwardRef's ref parameter)
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(scrollRef.current);
      } else {
        ref.current = scrollRef.current;
      }
    }
  }, [ref]);

  // Get price color style - use useCallback to optimize
  const getColor = useCallback((price: number) => {
    if (price > 0) {
      return "text-[#8AA90B]";
    } else if (price < 0) {
      return "text-[#FF1616]";
    }
    return "text-[#000000]";
  }, []);

  // Use useMemo to optimize table header configuration
  const headers = useMemo(() => {
    return tableHeaders || {
      tokenName: t('agent.tokenName'),
      currentPrice: t('agent.currentPrice'),
      spot: t('agent.spot'),
      futures: t('agent.futures')
    };
  }, [t, tableHeaders]);

  // Use useCallback to optimize coin name processing
  const handleName = useCallback((s: string) => {
    if(s) {
      return s.split('USDT')[0]
    }
    return '-'
  }, []);

  // Use useMemo to optimize skeleton screen rendering
  const skeletonItems = useMemo(() => (
    Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton.Avatar size={24} />
        <div className="flex-1">
          <Skeleton.Input className='h-[36px] lg:h-[3.6vh] w-[25%] lg:w-[50px]' active size="small" />
        </div>
        <div className="flex-1 flex justify-center">
          <Skeleton.Input  className='h-[36px] lg:h-[3.6vh] w-[25%] lg:w-[50px]' active size="small" />
        </div>
        <div className="flex-1 flex justify-center">
          <Skeleton.Avatar size={20} shape="square" />
        </div>
        <div className="flex-1 flex justify-center">
          <Skeleton.Avatar size={20} shape="square" />
        </div>
      </div>
    ))
  ), []);

  return (
    <>
    {contextHolder}
    <div className={`${containerClassName} coinlist p-0 lg:p-[1vh] bg-[#F1F1F1] lg:border-[2px] lg:border-black lg:border-solid rounded-[8px]`}>

      {/* Search box */}
      <div className="border-[2px] border-solid border-black bg-white pl-[6px] rounded-[8px] h-[42px] lg:h-[6vh] flex items-center">
        <AutoComplete
          placeholder={searchPlaceholder || t('agent.place')}
          allowClear={true}
          onChange={handleChange}
          className="flex-1 w-[100%] text-bold text-[16px]"
          variant="borderless"
        />
        <div className="px-[10px] cursor-pointer">
          <Image src={searchIcon} alt="" />
        </div>
      </div>

      {/* Coin list container */}
      <div className={`rounded-[8px] relative bg-white rounded-[8px]`}>
        {/* Table header */}
        <div className="sticky top-0 left-0 right-0 bg-[#cf0] flex h-[40px] lg:h-[5vh] font-bold text-[14px] px-[14px] lg:px-[14px] text-[#666] rounded-t-[8px] overflow-hidden">
          <div className="flex justify-start items-center flex-[1]">
            {headers.tokenName}
          </div>
          <div className="flex flex items-center justify-center flex-[1]">
            {headers.currentPrice}
          </div>
          <div className="flex justify-center items-center w-[60px]">
            {headers.spot}
          </div>
          <div className="flex justify-center items-center w-[60px]">
            {headers.futures}
          </div>
        </div>

        {/* Coin list */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-x-hidden overflow-y-auto ${tableHeight} lg:h-[62vh] rounded-[8px]`}
        >
          {loading ? (
            // Skeleton screen - use memoized elements
            <div className="p-4 space-y-4">
              {skeletonItems}
            </div>
          ) : (
            <table
              style={{ tableLayout: "fixed" }}
              cellSpacing={0}
              cellPadding={0}
              className="w-[100%] text-[14px] rounded-[8px] overflow-hidden pt-[5vh]"
            >
              <tbody>
                {currentList.map((item) => (
                  <tr key={item.symbol} className='flex ml-[14px] mr-[14px] lg:mr-[4px] border-b-[1px] border-solid border-[#eee]'>
                    <td className="text-left align-middle flex-[1]">
                      <div className="flex items-center justify-start h-[50px]">
                        {isLogin && (
                          <span className="inline-block mr-[3px] lg:mr-[5px]">
                            <Star
                              loading={item.loading || false}
                              collect={item.collect}
                              symbol={item.symbol}
                              onClick={handleCollect}
                            />
                          </span>
                        )}
                        <Tooltip title={item.symbol} placement="top">
                          <div
                            className={`flex items-center justify-start ${
                              isLogin ? "" : "lg:pl-[0px]"
                            }`}
                          >
                          <SmaltImage
                            width={24}
                            height={24}
                            src={`https://cdn.linklayer.ai/coinimages/${item.image}`}
                            className="rounded-full overflow-hidden inline-block w-[20px] h-[20px] lg:w-[24px] lg:h-[24px]"
                            errorPlaceholder={
                              <div className="w-[24px] font-bold h-[24px] bg-[#eee] rounded-full border-[1px] border-solid flex items-center justify-center border-[#ccc]">
                                {item.symbol.slice(0, 1).toUpperCase()}
                              </div>
                            }
                            alt=""
                          />
                          <div className="ml-[5px]">{handleName(item.symbol)}</div>
                        </div>
                        </Tooltip>
                      </div>
                    </td>
                    <td className={`${getColor(item.gain)} text-center align-middle flex-[1]`}>
                      <div className="flex items-center justify-center h-[50px]">
                        $ {item.price.toString().substring(0, 8)}
                      </div>
                    </td>
                    <td className="text-center align-middle w-[60px]" style={{padding:0}}>
                      <div className="flex items-center justify-center h-[50px]">
                        {
                          (item.symbol_type === 0 || item.symbol_type === 2) ? (
                            <Image src={rightIcon} className='w-[20px] lg:w-[20px] cursor-pointer' alt="" onClick={() => onConsultClick(item)} />
                          ) : (
                            <Image src={rightIconGary} className='w-[20px] lg:w-[20px] cursor-not-allowed' alt="" />
                          )}
                      </div>
                    </td>
                    <td className="text-center align-middle w-[60px]"  style={{padding:0}}>
                      <div className="flex items-center justify-center h-[50px]">
                        {
                          (item.symbol_type === 1 || item.symbol_type === 2) ? (
                            <Image src={rightIcon} className='w-[20px] lg:w-[20px] cursor-pointer' alt="" onClick={() => onContractClick(item)} />
                          ) : (
                            <Image src={rightIconGary} className='w-[20px] lg:w-[20px] cursor-not-allowed' alt="" />
                          )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Bottom loading status */}
          {!loading && !searchStr && (
            <div className="flex justify-center items-center py-4 text-[14px] text-gray-500">
              {isScrollLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#8AA90B] rounded-full animate-spin"></div>
                  <span>{t('common.loading') || 'Loading...'}</span>
                </div>
              ) : hasMoreData ? (
                <span>{t('common.scrollToLoadMore') || 'Scroll to load more'}</span>
              ) : (
                <span>{t('common.noMoreData') || 'No more data'}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
});

CoinsList.displayName = 'CoinsList';

export default CoinsList;
