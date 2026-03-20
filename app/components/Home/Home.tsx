"use client";
import "./Home.scss";
import netbox from "@/app/images/home/netbg.svg";
// import eye from "@/app/images/home/eye.svg";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Script from "next/script";
import PlatformList from "./PlatformList";
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

// import sad from "@/app/images/home/sad.svg";
// import rbbg from "@/app/images/home/rb-bg.svg";

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
import { ReceivedCard } from "./ReceivedCard";
import { LabelAndVal } from "./LabelAndVal";
import { ReceiveBtn } from "./ReceiveBtn";
import { ReceiveSlide } from "./ReceiveSlide";
import PopoverContent from "../PopoverContent";
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
import { HomeAnalysisResult } from "./HomeAnalysisResult";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
// import leftTitIcon from "@/app/images/home/leftTitIcon.svg";
import {
  getContractExpertScore,
  getSpotExpertScore,
  getSyncAssets,
  setAssets,
  setLongScore,
  setShortScore,
} from "@/app/store/assetsSlice";
import { syncPoints } from "@/app/store/userSlice";
import { message } from "antd";
import { CoinSlide } from "./CoinSlide";
import { isMobileDevice } from "@/app/utils/walletConnect";
// 加密货币数据数组
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
export default function Home() {
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

  // 币种分析相关状态
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const [status, setStatus] = useState<
    "init" | "loading" | "generating" | "end"
  >("init");
  const [loading, setLoading] = useState(false);
  const streamAbortController = useRef<AbortController | null>(null);

  // Turnstile 相关状态
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

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

  // 动态初始化 Turnstile widget - 只在需要时创建，使用 callback 方式
  const initTurnstileOnDemand = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 详细检查各项条件
      console.log("🔧 Turnstile 初始化检查:");
      console.log("- window.turnstile 存在:", !!window.turnstile);
      console.log(
        "- turnstileContainerRef.current 存在:",
        !!turnstileContainerRef.current
      );
      console.log("- 容器元素详情:", turnstileContainerRef.current);

      if (!window.turnstile) {
        const error = new Error("Turnstile script not loaded");
        console.error("❌", error.message);
        reject(error);
        return;
      }

      if (!turnstileContainerRef.current) {
        const error = new Error("Turnstile container element not found");
        console.error("❌", error.message);
        reject(error);
        return;
      }

      const siteKey =
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
        "1x00000000000000000000AA";
      console.log("🔑 Turnstile 配置信息:");
      console.log(
        "- 环境变量 NEXT_PUBLIC_TURNSTILE_SITE_KEY:",
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      );
      console.log("- 实际使用的 siteKey:", siteKey);
      console.log("- 当前域名:", window.location.hostname);
      console.log("- 当前完整URL:", window.location.href);

      // 验证 Site Key 格式
      if (
        !siteKey ||
        (!siteKey.startsWith("0x") &&
          !siteKey.startsWith("1x") &&
          !siteKey.startsWith("2x") &&
          !siteKey.startsWith("3x"))
      ) {
        const error = new Error(
          `Invalid Turnstile site key format: ${siteKey}`
        );
        console.error("❌", error.message);
        reject(error);
        return;
      }

      // 如果已有 widget，先删除
      if (turnstileWidgetId) {
        try {
          window.turnstile.remove(turnstileWidgetId);
          setTurnstileWidgetId("");
        } catch (error) {
          console.warn("Failed to remove existing widget:", error);
        }
      }

      try {
        // 创建新的 widget，依赖 callback 获取 token
        const widgetId = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log(
                "✅ Turnstile callback received token:",
                token ? "Token获取成功" : "Token为空"
              );
              if (token) {
                resolve(token);
              } else {
                reject(new Error("Turnstile callback returned empty token"));
              }
            },
            "error-callback": () => {
              console.error("❌ Turnstile widget error callback");
              reject(new Error("Turnstile widget error"));
            },
            "expired-callback": () => {
              console.log("⏰ Turnstile token expired callback");
              reject(new Error("Turnstile token expired"));
            },
            size: "invisible",
            theme: "light",
            action: "positionRiskManagement",
          }
        );

        setTurnstileWidgetId(widgetId);
        console.log("Turnstile widget created with ID:", widgetId);

        // Turnstile invisible widget 会自动触发验证，无需手动调用 execute
        // 等待 callback 被调用即可
      } catch (error) {
        console.error("Failed to create Turnstile widget:", error);
        reject(error);
      }
    });
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
    if (points <= 0) {
      message.warning("points not enough");
      return;
    }
    if (status === "loading" || status === "generating") {
      message.warning(t("common.taskRunning"));
      return;
    }
    if (loading) {
      setLoading(false);
    }

    // 先清除 ChatMessage 组件内的富文本内容
    setMessageChunks([]);
    setStatus("loading");

    try {
      setLoading(true);

      // 按需初始化 Turnstile 并获取 token
      let token = "";
      try {
        console.log("🔐 正在按需初始化 Turnstile 并获取 token...");

        // 等待 Turnstile 脚本加载完成
        if (!window.turnstile) {
          console.log("⏳ 等待 Turnstile 脚本加载...");

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error("❌ Turnstile 脚本加载超时");
              reject(
                new Error("Turnstile script load timeout after 10 seconds")
              );
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                console.log("✅ Turnstile 脚本加载完成");
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // 按需创建 widget 并获取 token
        token = await initTurnstileOnDemand();
        console.log(
          "✅ 成功获取 Turnstile token:",
          token ? "Token获取成功" : "Token为空"
        );
      } catch (tokenError) {
        console.error("❌ 获取 Turnstile token 失败:", tokenError);
        message.error("Human verification failed, please try again");
        setLoading(false);
        setStatus("init");
        return;
      }

      if (!token) {
        console.error("❌ Turnstile token 为空");
        message.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus("init");
        return;
      }

      console.log(
        "🚀 开始调用 position_risk_management 流式接口:",
        data.symbol
      );

      // 创建新的 AbortController 用于控制流式请求
      streamAbortController.current = new AbortController();

      // 调用流式接口，传递 token 和 AbortController
      const streamGenerator = position_risk_management(
        `${t("agent.analyze")}|symbol:${data.symbol}|${selectCex}`,
        token,
        undefined,
        streamAbortController.current
      );

      for await (const chunk of streamGenerator) {
        // 检查是否被中止
        if (streamAbortController.current?.signal.aborted) {
          console.log("🚫 流式请求已被中止，停止处理数据块");
          break;
        }

        console.log("📦 收到流式数据块:", chunk);

        let newContent = "";

        if (chunk && typeof chunk === "object") {
          console.log("🔍 处理数据块:", chunk);

          // 处理 SSE 事件格式
          if (
            "event" in chunk &&
            chunk.event === "message" &&
            "answer" in chunk &&
            chunk.answer !== undefined
          ) {
            newContent = chunk.answer;
            console.log("✅ 提取到answer内容:", newContent);

            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now(),
            };

            setMessageChunks((prev) => {
              // 如果这是第一个消息块，设置状态为 'generating'
              if (prev.length === 0) {
                setStatus("generating");
              }
              return [...prev, newChunk];
            });
          } else if ("event" in chunk && chunk.event === "workflow_started") {
            console.log("🚀 工作流开始");
          } else if ("event" in chunk && chunk.event === "workflow_finished") {
            console.log("🏁 工作流完成");
            streamAbortController.current = null;
          } else if ("event" in chunk && chunk.event === "message_end") {
            console.log("📝 消息结束");
            streamAbortController.current = null;
          } else {
            // 处理其他可能的数据格式
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

      // 流式请求正常完成
      console.log("🎉 流式请求正常完成");
      setStatus("end");
    } catch (error) {
      // 检查是否是用户主动中止的请求
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("✅ 流式请求已被用户中止");
        return;
      }

      console.error("流式分析失败:", error);

      // 接口异常时重置所有状态
      setLoading(false);
      setMessageChunks([]);
      setStatus("init");

      // 触发完成事件,重置打字机状态
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("textLoaded"));
      }

      // 显示错误提示
      message.error(
        t("common.analysisFailed") || "Analysis failed, please try again"
      );
    } finally {
      // 确保无论如何都清理状态
      streamAbortController.current = null;
    }
  };

  const handleUpload = () => {
    router.push("/apiForm");
  };

  // 停止分析
  const stopCreation = () => {
    console.log("🛑 停止内容生成");

    // 1. 停止流式请求
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
      console.log("✅ 流式请求已停止");
    }

    // 2. 重置所有相关状态
    setLoading(false);
    setMessageChunks([]);
    setStatus("init");

    // 3. 触发文本加载完成事件（重置打字机效果状态）
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("textLoaded"));
    }

    console.log("✅ 所有状态已重置");
  };

  // 事件监听器设置 - 监听 textLoading 和 textLoaded 事件
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

      // 清理流式请求的 AbortController
      if (streamAbortController.current) {
        streamAbortController.current.abort();
        streamAbortController.current = null;
      }

      // 清理 Turnstile Widget
      if (turnstileWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (error) {
          console.warn("清理 Turnstile widget 失败:", error);
        }
      }
    };
  }, [turnstileWidgetId]);

  // 处理币种点击
  const handleCryptoClick = async (crypto: GetAssetWithLogoItem) => {
    try {
      // 先同步积分
      const result = await dispatch(syncPoints()).unwrap();

      // 检查积分是否足够
      if (result < 10) {
        message.warning(t("home.insufficientPoints"));
        return;
      }

      // 积分足够，跳转页面
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

      // 每10秒轮询一次 getContractExpertScore
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

  const fetchLiquidationData = async () => {
    const res2 = await liquidation_undue({ cex_name: selectCex });
    setUndue(res2);
    const res1 = await liquidation_calculated({ cex_name: selectCex });
    setCalculated(res1);
  };
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
    if (isLogin) {
      get_claim_info({ cex_name: selectCex }).then((res) => {
        if(res.data.claim_info.length===0){
          setClaimInfo([...initClaimList]);
        }else {
          setClaimInfo(res.data.claim_info);
        }
      })
      fetchLiquidationData();
      try {
        position_symbols({ cex_name: selectCex }).then((res) => {
          setPositionSymbols(res);
        });
      } catch {
        setPositionSymbols(initData);
      }
      // 每10秒轮询一次 liquidation_calculated
      const calculatedInterval = setInterval(() => {
        liquidation_calculated({ cex_name: selectCex }).then((res) => {
          setCalculated(res);
        });
      }, 10000);

      return () => {
        clearInterval(calculatedInterval);
      };
    } else {
      setClaimInfo([...initClaimList]); 
      setUndue(undefined);
      setCalculated(undefined);
      setPositionSymbols(initData);
    }
  }, [selectCex, isLogin]);

  return (
    <div className="flex w-[100%] flex-col lg:flex-row justify-between items-center lg:h-[80vh] page-home-inner gap-[5px] lg:gap-[2vh] mt-[14px] lg:mt-0 ">
      <div className="w-[calc(100vw-28px)] lg:w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 lg:bg-[#EBEBEB] rounded-[8px] flex flex-col lg:flex-row items-center lg:p-[2vh]">
        <div className="bg-white rounded-[8px] h-auto lg:h-[100%] lg:mr-[18px] w-[100%] lg:w-[40%] lg:p-[2vh] flex lg:justify-between flex-col">
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

                {/* 标签 */}
                {/* <div className="absolute left-0 right-0 flex items-center justify-center top-[4px] lg:top-[4vh] xl:top-[1vh]">
                    <div className="lg:h-[6vh] flex items-center px-[6px] py-[4px] lg:px-[8px] lg:py-[8px] rounded-[4px] lg:rounded-[4px] font-bold text-[11px] lg:text-[14px] text-black cursor-pointer select-none">
                      <div className="flex items-center gap-[4px]">
                        <Image
                          src={leftTitIcon}
                          alt="Left Tit Icon"
                          className="h-[24px] w-[24px] lg:w-[3vh] lg:h-[3vh]"
                        />
                        <span
                          className="text-[20px] lg:text-[24px] font-bold text-white"
                          id="leftTit"
                          style={{
                            textShadow:
                              "-1px -1px 0 #000, 2px -1px 0 #000, -1px 2px 0 #000, 2px 2px 0 #000",
                          }}
                        >
                          {t("home.leftTit")}
                        </span>
                      </div>
                    </div>
                  </div> */}

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
                {/* 左侧导航按钮 */}
                <div className="crypto-swiper-button-prev flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity pr-[10px]">
                  <LeftOutlined
                    style={{ fontSize: "16px" }}
                    className="text-white lg:text-black"
                  />
                </div>

                {/* Swiper */}
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

                {/* 右侧导航按钮 */}
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
        <div className="rounded-[8px] h-[100%] w-[100%] lg:w-[59%]">
          <div className="h-auto lg:h-[78.5vh]  rounded-[8px] px-[0] py-[14px] lg:py-[2vh] lg:px-[2vh] bg-[#fff] lg:bg-white]">
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
                      {/* 示例横向滚动项 */}
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
                  {/* <Image
                    src={rbbg}
                    alt="RBbg"
                    className="lg:hidden absolute bottom-0 right-0 w-[30px] h-[30px] object-contain pointer-events-none select-none"
                  /> */}

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
                      {/* 当没有分析数据时显示提示 */}
                      {/* {messageChunks.length === 0 && status === 'init' && (
                        <div id="no-data" className="h-[45vh] flex items-center justify-center">Click Your Perps Position Pairs below to get real-time analysis....</div>
                      )} */}
                      {/* 当有分析数据时显示 HomeAnalysisResult */}
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
                        {/* Position symbols */}
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

      {/* 隐藏的 Turnstile 容器元素 */}
      <div
        id="turnstile-container-home"
        ref={turnstileContainerRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* 只加载 Turnstile 脚本，不自动初始化小部件 */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
      />
    </div>
  );
}
