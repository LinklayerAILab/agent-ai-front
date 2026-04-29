"use client";
import "./Home.scss";
import netbox from "@/app/images/home/netbg.svg";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import PlatformList from "../components/Home/PlatformList";
import light from "@/app/images/home/light.svg";
import clock2 from "@/app/images/home/clock2.svg";
import book2 from "@/app/images/home/book2.svg";
import rightIcon3 from "@/app/images/home/rightIcon3.svg";
import selectOut from "@/app/images/home/selectOut.svg";
import dayjs from "dayjs";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Popover, Rate, Statistic } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import btcIcon from "@/app/images/coins/btc.svg";
import ethIcon from "@/app/images/coins/eth.svg";
import usdtIcon from "@/app/images/coins/usdt.svg";
import xrptIcon from "@/app/images/coins/xrp.svg";
import bnbIcon from "@/app/images/coins/bnb.svg";
import solIcon from "@/app/images/coins/sol.svg";
import trxIcon from "@/app/images/coins/trx.svg";
import dogeIcon from "@/app/images/coins/doge.svg";
import zecIcon from "@/app/images/coins/zec.svg";
const { Countdown } = Statistic;

import star from "@/app/images/home/star.svg";
import { ReceivedCard } from "../components/Home/ReceivedCard";
import { LabelAndVal } from "../components/Home/LabelAndVal";
import { ReceiveBtn } from "../components/Home/ReceiveBtn";
import { ReceiveSlide } from "../components/Home/ReceiveSlide";
import PopoverContent from "../components/PopoverContent";
import {
  ClaimInfoItem,
  get_claim_info,
  GetAssetWithLogoItem,
  liquidation_calculated,
  liquidation_undue,
  LiquidationCalculatedResponse,
  position_risk_management,
  position_symbols,
  PositionSymbolsResponse,
} from "@/app/api/agent_c";
import { MessageChunk } from "@/app/components/ChatMessage";
import { HomeAnalysisResult } from "../components/Home/HomeAnalysisResult";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  getContractExpertScore,
  getSpotExpertScore,
  getSyncAssets,
  setAssets,
  setLongScore,
  setShortScore,
} from "@/app/store/assetsSlice";
import { syncPoints } from "@/app/store/userSlice";
import { AGENT_POINTS_COST } from "@/app/enum";
import { message } from "antd";
import { CoinSlide } from "../components/Home/CoinSlide";
import { isMobileDevice } from "@/app/utils/walletConnect";

// Cryptocurrency data array
const cryptoData = [
  { asset: "BTC", free: "", logo: btcIcon },
  { asset: "ETH", free: "", logo: ethIcon },
  { asset: "USDT", free: "", logo: usdtIcon },
  { asset: "SOL", free: "", logo: xrptIcon },
  { asset: "WIFI", free: "", logo: bnbIcon },
  { asset: "SOL", free: "", logo: solIcon },
  { asset: "TRX", free: "", logo: trxIcon },
  { asset: "DOGE", free: "", logo: dogeIcon },
  { asset: "ZEC", free: "", logo: zecIcon },
];

interface InsightDashboardData {
  claimInfo: ClaimInfoItem[] | null;
  undue?: LiquidationCalculatedResponse;
  calculated?: LiquidationCalculatedResponse;
  positionSymbols?: PositionSymbolsResponse;
}

const insightDashboardCache = new Map<string, InsightDashboardData>();
const insightDashboardPromise = new Map<string, Promise<InsightDashboardData>>();

const fetchInsightDashboardData = async (
  cexName: string
): Promise<InsightDashboardData> => {
  const [claimRes, undueRes, calculatedRes, symbolsRes] = await Promise.allSettled([
    get_claim_info({ cex_name: cexName }),
    liquidation_undue({ cex_name: cexName }),
    liquidation_calculated({ cex_name: cexName }),
    position_symbols({ cex_name: cexName }),
  ]);

  return {
    claimInfo:
      claimRes.status === "fulfilled" ? claimRes.value.data.claim_info : null,
    undue: undueRes.status === "fulfilled" ? undueRes.value : undefined,
    calculated:
      calculatedRes.status === "fulfilled" ? calculatedRes.value : undefined,
    positionSymbols:
      symbolsRes.status === "fulfilled" ? symbolsRes.value : undefined,
  };
};

export default function InsightPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const longScore = useSelector((state: RootState) => state.assets.longScore);
  const shortScore = useSelector((state: RootState) => state.assets.shortScore);
  const selectCex = useSelector((state: RootState) => state.assets.selectCex);
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const points = useSelector((state: RootState) => state.user.points);
  const selectStatus = useMemo(() => {
    if (longScore || shortScore) {
      return true;
    }
    return false;
  }, [longScore, shortScore]);
  const [tab, setTab] = useState(1);

  // Coin analysis related states
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const [status, setStatus] = useState<
    "init" | "loading" | "generating" | "end"
  >("init");
  const [loading, setLoading] = useState(false);
  const streamAbortController = useRef<AbortController | null>(null);

  const initData = {
    code: 0,
    message: "",
    data: {
      symbols: [
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
        {
          symbol: "",
          position_side: "",
          update_time: 0,
        },
      ],
      total_count: 0,
    },
  };
  const [positionSymbols, setPositionSymbols] =
    useState<PositionSymbolsResponse>(initData);

  const handleTab = async (v: number) => {
    setTab(v);
    if (!isLogin) {
      return;
    }
    if (v === 2) {
      try {
        const res = await position_symbols({ cex_name: selectCex });
        if(res.data.symbols.length===0){
          setPositionSymbols(initData);
        }else {
          setPositionSymbols(res);
        }

      } catch {
        setPositionSymbols(initData);
      }
    }
  };

  const [selectCoin, setSelectCoin] = useState<{
    update_time: number;
    symbol: string;
  }>({ update_time: 0, symbol: "" });

  const handleAnalizeCoin = async (data: {
    update_time: number;
    symbol: string;
  }) => {
    if (!data.symbol) {
      return;
    }

    if (!isLogin) {
      message.warning("please login first");
      return;
    }
    if (isMobileDevice()) {
      const currentPath = encodeURIComponent(pathname!);
      router.push(`/position-analysis/${data.symbol}?cex_name=${selectCex}&backUrl=${currentPath}`);
      return;
    }

    setSelectCoin(data);
    await dispatch(syncPoints());
    const perpsCost = AGENT_POINTS_COST.PERPS;
    if (points < perpsCost) {
      message.warning(t("home.insufficientPoints", { cost: perpsCost }));
      return;
    }
    if (status === "loading" || status === "generating") {
      message.warning(t("common.taskRunning"));
      return;
    }
    if (loading) {
      setLoading(false);
    }

    setMessageChunks([]);
    setStatus("loading");

    try {
      setLoading(true);

      streamAbortController.current = new AbortController();

      const streamGenerator = position_risk_management(
        `${t("agent.analyze")}|symbol:${data.symbol}|${selectCex}`,
        undefined,
        streamAbortController.current
      );

      for await (const chunk of streamGenerator) {
        if (streamAbortController.current?.signal.aborted) {
          break;
        }

        let newContent = "";

        if (chunk && typeof chunk === "object") {
          if (
            "event" in chunk &&
            chunk.event === "message" &&
            "answer" in chunk &&
            chunk.answer !== undefined
          ) {
            newContent = chunk.answer;

            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now(),
            };

            setMessageChunks((prev) => {
              if (prev.length === 0) {
                setStatus("generating");
              }
              return [...prev, newChunk];
            });
          } else if ("event" in chunk && chunk.event === "workflow_started") {
            // Workflow started
          } else if ("event" in chunk && chunk.event === "workflow_finished") {
            streamAbortController.current = null;
          } else if ("event" in chunk && chunk.event === "message_end") {
            streamAbortController.current = null;
          } else {
            if ("data" in chunk && chunk.data?.analyse_result?.output?.output) {
              newContent = chunk.data.analyse_result.output.output;
            } else if (
              "data" in chunk &&
              (chunk.data?.text || chunk.data?.content)
            ) {
              newContent = chunk.data.text || chunk.data.content || "";
            } else if ("text" in chunk && chunk.text) {
              newContent = chunk.text;
            } else if ("content" in chunk && chunk.content) {
              newContent = chunk.content;
            } else if ("answer" in chunk && chunk.answer) {
              newContent = chunk.answer;
            }

            if (newContent && newContent.trim()) {
              const newChunk: MessageChunk = {
                id: `chunk_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                content: newContent,
                timestamp: Date.now(),
              };

              setMessageChunks((prev) => {
                if (prev.length === 0) {
                  setStatus("generating");
                }
                return [...prev, newChunk];
              });
            }
          }
        }
      }

      setStatus("end");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoading(false);
      setMessageChunks([]);
      setStatus("init");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("textLoaded"));
      }

      message.error(
        t("common.analysisFailed") || "Analysis failed, please try again"
      );
    } finally {
      streamAbortController.current = null;
    }
  };

  const handleUpload = () => {
    router.push("/apiForm");
  };

  const stopCreation = () => {
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
    }

    setLoading(false);
    setMessageChunks([]);
    setStatus("init");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("textLoaded"));
    }
  };

  useEffect(() => {
    const handleTextLoading = () => {
      setStatus("generating");
    };

    const handleTextLoaded = () => {
      setStatus("end");
    };

    window.addEventListener("textLoading", handleTextLoading);
    window.addEventListener("textLoaded", handleTextLoaded);

    return () => {
      window.removeEventListener("textLoading", handleTextLoading);
      window.removeEventListener("textLoaded", handleTextLoaded);

      if (streamAbortController.current) {
        streamAbortController.current.abort();
        streamAbortController.current = null;
      }
    };
  }, []);

  const handleCryptoClick = async (crypto: GetAssetWithLogoItem) => {
    try {
      const spotCost = AGENT_POINTS_COST.INSIGHT_SPOT;
      const result = await dispatch(syncPoints()).unwrap();

      if (result < spotCost) {
        message.warning(t("home.insufficientPoints", { cost: spotCost }));
        return;
      }

      const currentPath = encodeURIComponent(pathname!);
      router.push(`/crypto-analysis/${crypto.asset}?backUrl=${currentPath}`);
    } catch {
      message.error(t("home.syncPointsError"));
    }
  };

  const assets = useSelector((state: RootState) => state.assets.assets);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isLogin) {
      dispatch(getSyncAssets("binance"));
      dispatch(getContractExpertScore("binance"));
      dispatch(getSpotExpertScore("binance"));

      const scoreInterval = setInterval(() => {
        dispatch(getContractExpertScore("binance"));
      }, 10000);

      return () => {
        clearInterval(scoreInterval);
      };
    } else {
      dispatch(setAssets([]));
      dispatch(setLongScore(0));
      dispatch(setShortScore(0));
    }
  }, [isLogin, dispatch]);

  const [undue, setUndue] = useState<LiquidationCalculatedResponse>();
  const [calculated, setCalculated] = useState<LiquidationCalculatedResponse>();

  const initClaimList: ClaimInfoItem[] = [
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    },
    {
      claim_flag: false,
      period_start: 0,
      period_end: 0,
      claim_time:  0,
      claim_amount: 0
    }
  ];
  const [claimInfo, setClaimInfo] = useState<ClaimInfoItem[]>([...initClaimList]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      if (insightDashboardCache.has(selectCex)) {
        const cached = insightDashboardCache.get(selectCex)!;
        if (cancelled) return;
        setClaimInfo(
          cached.claimInfo && cached.claimInfo.length > 0
            ? cached.claimInfo
            : [...initClaimList]
        );
        setUndue(cached.undue);
        setCalculated(cached.calculated);
        setPositionSymbols(cached.positionSymbols || initData);
        return;
      }

      if (!insightDashboardPromise.has(selectCex)) {
        insightDashboardPromise.set(selectCex, fetchInsightDashboardData(selectCex));
      }

      try {
        const data = await insightDashboardPromise.get(selectCex)!;
        insightDashboardCache.set(selectCex, data);
        if (cancelled) return;
        setClaimInfo(
          data.claimInfo && data.claimInfo.length > 0
            ? data.claimInfo
            : [...initClaimList]
        );
        setUndue(data.undue);
        setCalculated(data.calculated);
        setPositionSymbols(data.positionSymbols || initData);
      } catch {
        if (cancelled) return;
        setClaimInfo([...initClaimList]);
        setUndue(undefined);
        setCalculated(undefined);
        setPositionSymbols(initData);
      } finally {
        insightDashboardPromise.delete(selectCex);
      }
    };

    if (isLogin) {
      loadDashboardData();
      const calculatedInterval = setInterval(() => {
        liquidation_calculated({ cex_name: selectCex }).then((res) => {
          setCalculated(res);
          if (insightDashboardCache.has(selectCex)) {
            const cached = insightDashboardCache.get(selectCex)!;
            insightDashboardCache.set(selectCex, {
              ...cached,
              calculated: res,
            });
          }
        });
      }, 10000);

      return () => {
        cancelled = true;
        clearInterval(calculatedInterval);
      };
    } else {
      cancelled = true;
      setClaimInfo([...initClaimList]);
      setUndue(undefined);
      setCalculated(undefined);
      setPositionSymbols(initData);
    }
  }, [selectCex, isLogin]);

  return (
    <div className="flex w-[100%] flex-col lg:flex-row justify-between items-center lg:h-[80vh] page-home-inner gap-[5px] lg:gap-[2vh] mt-[14px] lg:mt-0 ">
      <div className="w-[calc(100vw-28px)] lg:w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 lg:bg-[#EBEBEB] rounded-[8px] flex flex-col lg:flex-row items-center lg:p-[2vh]">
        <div className="bg-white rounded-[8px] h-auto lg:h-[100%] lg:mr-[18px] w-[100%] lg:w-[40%] p-0 lg:p-[2vh] flex lg:justify-between flex-col">
          <div className="lg:h-[100px] lg:h-[15vh] bg-white rounded-[8px]">
            <PlatformList handleUpload={handleUpload} />
          </div>

          <div className="flex lg:flex-col flex-col-reverse lg:pt-[2vh] justify-between max-w-[100vw] w-auto mt-[20px] lg:mt-0 lg:w-auto lg:h-[60vh] select-none">
            <div className="flex items-center justify-center h-[340px] lg:h-[52vh] lg:mb-[2vh] mt-[10px] lg:mt-0">
              <div className="relative w-[100%] lg:w-[100%] h-[340px] lg:h-[100%]">
                <div className="flex items-center justify-center absolute left-0 right-0 top-0 bottom-0">
                  <Image
                    src={netbox}
                    alt="Netbox"
                    className="h-[320px] lg:h-[46vh] lg:w-[100%] xl:w-[90%] 2xl:w-[75%]"
                  />
                </div>

                <div className="absolute left-0 right-0 flex items-center justify-between top-[143px] lg:top-[20.5vh] xl:top-[19.5vh] lg:px-0 xl:px-[1.2vw] 2xl:px-[2.8vw]">
                  <div className="lg:h-[7vh] flex items-center bg-[#EBDBFF] px-[6px] py-[4px] lg:px-[12px] lg:py-[8px] rounded-[4px] lg:rounded-[4px] font-bold text-[11px] lg:text-[14px] text-black cursor-pointer select-none">
                    <Popover
                      content={
                        <PopoverContent>
                          <strong>{t("home.cautious")}:</strong>{" "}
                          {t("home.cautiousDesc")}
                        </PopoverContent>
                      }
                    >
                      <div className="flex flex-col gap-[2px] lg:gap-[4px]">
                        <div className="flex items-center">
                          <Image
                            src={light}
                            alt="Light"
                            className="lg:mr-[4px] h-[12px] lg:h-[1.7vh] lg:w-[1.7vh]"
                          />
                          {t("home.cautious")}
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center gap-[8px] rounded-[4px] h-[20px] bg-[#F6EFFF] px-[4px]">
                            <Rate
                              allowHalf
                              defaultValue={longScore}
                              value={longScore}
                              count={3}
                              disabled
                              style={{ fontSize: 14 }}
                            />
                            <span>{longScore}</span>
                          </div>
                        </div>
                      </div>
                    </Popover>
                  </div>
                  <div className="lg:h-[7vh] top-[145px] lg:top-[18vh] flex items-center bg-[#EBDBFF] px-[6px] lg:px-[12px] py-[4px] lg:px-[12px] lg:py-[4px] rounded-[4px] lg:rounded-[4px] font-bold text-[11px] lg:text-[14px] text-black cursor-pointer select-none">
                    <Popover
                      content={
                        <PopoverContent>
                          <strong>{t("home.radical")}:</strong>
                          {t("home.radicalShortDesc")}
                        </PopoverContent>
                      }
                    >
                      <div className="flex flex-col gap-[2px] lg:gap-[4px]">
                        <div className="flex items-center">
                          <Image
                            src={light}
                            alt="Light"
                            className="lg:mr-[4px] h-[12px] lg:h-[1.7vh] lg:w-[1.7vh]"
                          />
                          {t("home.radical")}
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center gap-[8px] rounded-[4px] h-[20px] bg-[#F6EFFF] px-[4px]">
                            <Rate
                              allowHalf
                              defaultValue={shortScore}
                              count={3}
                              value={shortScore}
                              disabled
                              style={{ fontSize: 14 }}
                            />
                            <span>{shortScore}</span>
                          </div>
                        </div>
                      </div>
                    </Popover>
                  </div>
                </div>
                <div className="absolute left-0 right-0 flex items-center justify-center bottom-[40px] lg:bottom-[5vh] xl:bottom-[2vh]">
                  <div className="lg:h-[5vh] flex items-center bg-[#EBDBFF] px-[6px] py-[4px] lg:px-[8px] lg:py-[8px] rounded-[4px] lg:rounded-[4px] font-bold text-[11px] lg:text-[14px] text-black cursor-pointer select-none">
                    <Popover
                      content={
                        <PopoverContent>
                          <strong>{t("home.analytical")}:</strong>
                          {t("home.analyticalDesc")}
                        </PopoverContent>
                      }
                    >
                      <div className="flex flex-col gap-[2px] lg:gap-[4px]">
                        <div className="flex items-center justify-center">
                          <Image
                            src={selectStatus ? selectOut : rightIcon3}
                            alt="Light"
                            className="lg:mr-[4px] h-[12px] lg:h-[2.2vh] lg:w-[2.2vh]"
                          />
                          {t("home.analytical")}
                        </div>
                      </div>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
            <div className="platform-box rounded-[8px] bg-black lg:bg-[#F2F2F2] h-[48px] lg:h-[7vh] xl:h-[10vh] px-[14px] flex items-center gap-3">
              <div className="flex w-[100%] items-center h-[33px] lg:h-[100%] select-none">
                <div className="crypto-swiper-button-prev flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity pr-[10px]">
                  <LeftOutlined
                    style={{ fontSize: "16px" }}
                    className="text-white lg:text-black"
                  />
                </div>

                {
                  <Swiper
                    key={assets.length}
                    modules={[Navigation]}
                    slidesPerView={7}
                    slidesPerGroup={7}
                    spaceBetween={12}
                    watchOverflow={false}
                    breakpoints={{
                      320: {
                        slidesPerView: 6,
                        slidesPerGroup: 6,
                        spaceBetween: 12,
                      },
                      1024: {
                        slidesPerView: 8,
                        slidesPerGroup: 8,
                        spaceBetween: 12,
                      },
                    }}
                    navigation={{
                      prevEl: ".crypto-swiper-button-prev",
                      nextEl: ".crypto-swiper-button-next",
                    }}
                    loop={assets.length > 8}
                    className="w-full h-full"
                  >
                    {assets.length
                      ? assets.map((crypto, index) => (
                          <SwiperSlide
                            title={crypto.asset}
                            key={index}
                            className="flex items-center justify-center h-[100%]"
                          >
                            <div
                              className={`rounded-full flex items-center justify-center text-white text-[12px] font-bold cursor-pointer hover:scale-110 transition-transform h-[100%] `}
                              onClick={() => handleCryptoClick(crypto)}
                            >
                              {crypto.logo ? (
                                <Image
                                  src={crypto.logo}
                                  alt={crypto.asset}
                                  width={32}
                                  height={32}
                                  className="w-[32px] h-[32px] lg:w-[3.8vh] lg:h-[3.8vh] rounded-full bg-white"
                                />
                              ) : (
                                <div
                                  className={`bg-[#eee] text-black rounded-full flex items-center justify-center w-[32px] h-[32px] lg:w-[3.8vh] lg:h-[3.8vh] rounded-full font-bold cursor-pointer hover:scale-110 border-[#666] border-solid border-[1px] transition-transform `}
                                >
                                  {crypto.asset.slice(0, 2)}
                                </div>
                              )}
                            </div>
                          </SwiperSlide>
                        ))
                      : cryptoData.map((crypto, index) => (
                          <SwiperSlide
                            title={crypto.asset}
                            key={index}
                            className="flex items-center justify-center h-[100%]"
                          >
                            <div
                              className={`cursor-not-allowed rounded-full flex items-center justify-center text-white text-[12px] font-bold cursor-pointer hover:scale-110 transition-transform h-[100%] `}
                            >
                              <Image
                                src={crypto.logo}
                                alt={crypto.asset}
                                width={32}
                                height={32}
                                className="w-[32px] h-[32px] lg:w-[3.8vh] lg:h-[3.8vh] rounded-full cursor-not-allowed"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                  </Swiper>
                }

                <div className="crypto-swiper-button-next flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity pl-[10px]">
                  <RightOutlined
                    style={{ fontSize: "16px" }}
                    className="text-white lg:text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[8px] h-[100%] w-[100%] lg:w-[59%] mt-[20px] lg:mt-0">
          <div className="h-auto lg:h-[78.5vh]  rounded-[8px] px-[0] py-[14px] lg:py-[2vh] lg:px-[2vh] bg-[transparent] lg:bg-[#fff] lg:bg-white]">
            <div className="flex text-[18px] font-bold rounded-[8px] h-[44px] lg:h-[5vh] cursor-pointer">
              <div
                onClick={() => handleTab(1)}
                className={`home-btn flex-1 flex items-center justify-center bg-black text-white gap-2  border-[2px] border-black border-solid rounded-l-[8px] ${
                  tab === 1 && "selected"
                }`}
              >
                {t("home.perpsMining")}
              </div>
              <div
                onClick={() => handleTab(2)}
                className={`home-btn flex-1 flex items-center justify-center gap-2 border-[2px] border-black border-solid rounded-r-[8px] ${
                  tab === 2 && "selected"
                }`}
              >
                {t("home.perpsPilot")}
              </div>
            </div>
            {tab === 1 && (
              <div
                className="bg-[#ebebeb] p-[14px] lg:p-0 lg:bg-[#fff] rounded-[8px] h-auto lg:h-[68vh] mt-[2vh] relative w-[100%]"
                id="context-box-2"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-[2vh] lg:h-[44vh]">
                  <ReceivedCard
                    bg="bg-[#EBFF99]"
                    title={t("home.retroactiveBonus")}
                    desc={t("home.retroactiveBonusDesc")}
                  >
                    <div className="flex flex-col p-[14px] lg:p-[0] gap-[6px] lg:gap-[1vh]">
                      <LabelAndVal
                        label={t("home.ready")}
                        value={t("home.claimAllBonuses")}
                      ></LabelAndVal>
                      <LabelAndVal
                        label={t("home.cycle")}
                        value={`${
                          calculated?.data.period_start
                            ? dayjs(calculated?.data.period_start).format(
                                "YYYY-MM-DD"
                              )
                            : "-"
                        } - ${
                          calculated?.data.period_end
                            ? dayjs(calculated?.data.period_end).format(
                                "YYYY-MM-DD"
                              )
                            : "-"
                        }`}
                      ></LabelAndVal>
                      <LabelAndVal
                        label={t("home.liquidation")}
                        value={`${calculated?.data.loss_count || '-'} ${t(
                          "home.times"
                        )}`}
                      ></LabelAndVal>
                      <LabelAndVal
                        className="mb-[2vh]"
                        label={t("home.bonus")}
                        value={<span className="text-shadow-white">-LLAx</span>}
                      ></LabelAndVal>

                      <div className="hidden lg:block w-[80%] m-auto">
                        <ReceiveBtn disabled className="hidden lg:block">
                          {t("home.received")}
                        </ReceiveBtn>
                      </div>
                      <div className="absolute top-[14px] right-[14px] lg:hidden">
                        <ReceiveBtn disabled>{t("home.received")}</ReceiveBtn>
                      </div>
                    </div>
                  </ReceivedCard>
                  <ReceivedCard
                    bg="bg-[#C4BEFF]"
                    title={t("home.recurringRewards")}
                    desc={t("home.recurringRewardsDesc")}
                  >
                    <div className="flex flex-col p-[14px] lg:p-[0] gap-[6px] lg:gap-[1vh]">
                      <LabelAndVal
                        label={t("home.countdown")}
                        value={
                          <div className="flex items-center gap-2">
                            <Image
                              src={clock2}
                              className="w-[16px]"
                              alt="clock"
                            ></Image>
                            <span>
                              <Countdown
                                format={`DD [${t("common.days")}] HH:mm:ss`}
                                valueStyle={{ fontSize: 14 }}
                                value={undue?.data.period_end || 0}
                              ></Countdown>
                            </span>
                          </div>
                        }
                      ></LabelAndVal>
                      <LabelAndVal
                        label={t("home.cycle")}
                        value={`${
                          undue?.data.period_start
                            ? dayjs(undue?.data.period_start).format(
                                "YYYY-MM-DD"
                              )
                            : "-"
                        } - ${
                          undue?.data.period_end
                            ? dayjs(undue?.data.period_end).format("YYYY-MM-DD")
                            : "-"
                        }`}
                      ></LabelAndVal>
                      <LabelAndVal
                        label={t("home.liquidation")}
                        value={`${undue?.data.loss_count || '-'} ${t("home.times")}`}
                      ></LabelAndVal>
                      <LabelAndVal
                        className="mb-[2vh]"
                        label={t("home.rewards")}
                        value={
                          <span className="text-shadow-white">- LLAx</span>
                        }
                      ></LabelAndVal>
                      <div className="hidden lg:block w-[80%] m-auto">
                        <ReceiveBtn>{t("home.claim")}</ReceiveBtn>
                      </div>
                      <div className="absolute top-[14px] right-[14px] lg:hidden">
                        <ReceiveBtn>{t("home.claim")}</ReceiveBtn>
                      </div>
                    </div>
                  </ReceivedCard>
                </div>
                <div className="rounded-[8px] lg:bg-[#fff] h-[180px] lg:h-[23vh] mt-[20px] lg:mt-[2vh] relative w-[100%]">
                  <style>{`
                        #date-swiper::-webkit-scrollbar {
                          height: 4px;
                        }
                        #date-swiper::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        #date-swiper::-webkit-scrollbar-thumb {
                          background-color: #cf0;
                          border-radius: 4px;
                        }
                        #date-swiper::-webkit-scrollbar-thumb:hover {
                          background-color: #abd501;
                        }
                      `}</style>
                  <div className="flex items-center text-[16px] font-bold mb-[14px] lg:mb-[1vh]">
                    {" "}
                    <Image src={book2} alt="book2"></Image> {t("home.claimHistory")}
                  </div>
                  <div className="w-[100%] h-[150px] lg:h-[18vh]">
                    <div
                      id="date-swiper"
                      className="flex gap-[10px] lg:gap-[14px] h-full overflow-x-auto overflow-y-hidden scroll-smooth"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cf0 #eee",
                      }}
                    >
                      {claimInfo.map((item,idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-[44%] lg:w-[200px] cursor-pointer rounded-[4px] overflow-hidden"
                        >
                          <ReceiveSlide
                            data={item}
                          ></ReceiveSlide>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === 2 && (
              <div className="rounded-[8px] h-auto lg:h-[67vh] mt-[2vh] w-[100%]">
                <div className="bg-white rounded-[8px] lg:h-[68vh] border-[1px] border-solid border-black lg:border-none mt-[14px] lg:mt-0 relative">

                  <div className="hidden lg:block border-[1px] border-solid border-black rounded-[8px] overflow-x-hidden overflow-hidden">
                    <div
                      className="lg:h-[54vh]"
                      id="scroll-box-pilot"
                    >
                      <div className="lg:px-[2vh] lg:pt-[2vh] lg:pb-[1vh] flex items-center gap-2 lg:gap-4 font-bold text-[11px] lg:text-[12px] rounded-[8px]">
                        <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[2px] lg:py-2 bg-[#E9FF93] flex items-center gap-1 flex-1 flex items-center justify-center">
                          <Image
                            src={star}
                            alt="star"
                            className="hidden lg:inline-block"
                          ></Image>{" "}
                          {t("home.personalPosition")}
                        </div>
                        <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[2px] lg:py-2 bg-[#F9FFE2] flex items-center gap-1 flex-1 flex items-center justify-center">
                          <Image
                            src={star}
                            alt="star"
                            className="hidden lg:inline-block"
                          ></Image>
                          {t("home.liveMonitoring")}
                        </div>
                        <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[2px] lg:py-2 bg-[#C4BEFF] flex items-center gap-1 flex-1 flex items-center justify-center">
                          <Image
                            src={star}
                            alt="star"
                            className="hidden lg:inline-block"
                          ></Image>
                          {t("home.publicFactors")}
                        </div>
                        <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[2px] lg:py-2 bg-[#F6EFFF] flex items-center gap-1 flex-1 flex items-center justify-center">
                          <Image
                            src={star}
                            alt="star"
                            className="hidden lg:inline-block"
                          ></Image>
                          {t("home.agentAdvice")}
                        </div>
                      </div>
                      <div className="lg:h-[47vh]">
                        <HomeAnalysisResult
                          status={status}
                          stopCreation={stopCreation}
                          tip={t("home.analyzing")}
                          loading={loading}
                          messages={messageChunks}
                          currentCoin={selectCoin}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[8px] px-[10px] lg:px-0 py-[18px] lg:py-[14px] lg:p-0 lg:bg-[#fff] h-auto lg:h-[12vh] relative w-[100%]">
                    <style>{`
                        #date-swiper::-webkit-scrollbar {
                          height: 4px;
                        }
                        #date-swiper::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        #date-swiper::-webkit-scrollbar-thumb {
                          background-color: #cf0;
                          border-radius: 4px;
                        }
                        #date-swiper::-webkit-scrollbar-thumb:hover {
                          background-color: #abd501;
                        }
                      `}</style>

                    <div className="w-[100%] h-auto lg:h-[12vh]">
                      <div
                        id="date-swiper2"
                        className="flex flex-col lg:flex-row gap-[10px] lg:gap-[14px] h-full overflow-y-auto overflow-x-hidden lg:overflow-x-auto lg:overflow-y-hidden scroll-smooth"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#cf0 #eee",
                        }}
                      >
                        {positionSymbols?.data.symbols.map((item, index) => (
                          <div
                            key={`${item.symbol}-${index}`}
                            className={`flex-shrink-0 w-[100%] lg:w-[200px] ${
                              item.symbol
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            } rounded-[4px] overflow-hidden`}
                          >
                            <CoinSlide
                              onClick={handleAnalizeCoin}
                              data={{
                                update_time: item.update_time,
                                symbol: item.symbol,
                              }}
                            ></CoinSlide>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
