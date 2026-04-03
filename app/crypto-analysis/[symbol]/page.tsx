"use client";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import Image from "next/image";
import light from "@/app/images/home/light.svg";
import rightIcon from "@/app/images/agent/right.svg";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { getSyncAssets } from "@/app/store/assetsSlice";
import { syncPoints } from "@/app/store/userSlice";
import {
  GetAssetWithLogoItem,
  analyse_coin_c_steaming,
  get_spot_price,
} from "@/app/api/agent_c";
import { MessageChunk } from "@/app/piloter/types";
import { message } from "antd";
import Script from "next/script";
import { StreamMessage } from "@/app/components/StreamMessage";
import FlipNumbers from "react-flip-numbers";

export default function CryptoAnalysis() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const symbol = params?.symbol as string;
  const { t } = useTranslation();
  const assets = useSelector((state: RootState) => state.assets.assets);
  const isLogin = useSelector(
    (state: RootState) => state.user?.isLogin ?? false
  );
  const points = useSelector((state: RootState) => state.user.points);

  const [currentPrice, setCurrentPrice] = useState<string>("0");

  const handleToTrading = () => {
    window.open(
      `https://www.binance.com/en/trade/${symbol.toUpperCase()}_USDT?type=spot`,
      "_blank"
    );
  };

  const handleBack = () => {
    const backUrl = searchParams?.get("backUrl");
    if (backUrl) {
      router.push(decodeURIComponent(backUrl));
    } else {
      router.replace("/");
    }
  };

  const dispatch = useDispatch<AppDispatch>();

  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const [status, setStatus] = useState<
    "init" | "loading" | "generating" | "end"
  >("init");
  const [tip] = useState("Analyzing...");

  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const streamAbortController = useRef<AbortController | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  useEffect(() => {
    dispatch(getSyncAssets("binance"));
  }, []);


  const fetchSpotPrice = async () => {
    if (!symbol) return;

    const response = await get_spot_price({ symbol: symbol.toUpperCase() });
    const price = response.data.price;
    setCurrentPrice(price.toString());
  };

  useEffect(() => {
    if (!symbol) return;


    fetchSpotPrice();


    const intervalId = setInterval(() => {
      fetchSpotPrice();
    }, 5000);


    return () => {
      clearInterval(intervalId);
    };
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (symbol && assets.length > 0 && isLogin && points > 0) {

      if (status === "init" && messageChunks.length === 0) {
        proceedWithCoinAnalysis(symbol);
      }
    }
  }, [symbol, assets, isLogin, points]);

  const currentCrypto = useMemo(
    () => assets.find((crypto) => crypto.asset === symbol?.toUpperCase()),
    [assets, symbol]
  );

  const initTurnstileOnDemand = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
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

      if (turnstileWidgetId) {
        try {
          window.turnstile.remove(turnstileWidgetId);
          setTurnstileWidgetId("");
        } catch (error) {
          console.warn("Failed to remove existing widget:", error);
        }
      }

      try {
  
        const widgetId = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: siteKey,
            callback: (token: string) => {
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
            action: "analyseCoin",
          }
        );

        setTurnstileWidgetId(widgetId);
        console.log("Turnstile widget created with ID:", widgetId);
      } catch (error) {
        console.error("Failed to create Turnstile widget:", error);
        reject(error);
      }
    });
  };

  const handleCryptoClick = async (crypto: GetAssetWithLogoItem) => {

    if (status === 'loading' || status === 'generating') {
      messageApi.warning(t("common.taskInProgress"));
      return;
    }

    try {

      const result = await dispatch(syncPoints()).unwrap();


      if (result < 10) {
        message.warning(t("home.insufficientPoints"));
        return;
      }


      const currentPath = encodeURIComponent(pathname || '');
      router.push(`/crypto-analysis/${crypto.asset}?backUrl=${currentPath}`);
    } catch {
      message.error(t("home.syncPointsError"));
    }
  };


  useEffect(() => {
    const handleTextLoading = () => {
      console.log(
        "🎬 textLoading event received, setting status to generating"
      );
      setStatus("generating");
    };

    const handleTextLoaded = () => {
      if (!isStreamingRef.current) {
        console.log(
          "🏁 textLoaded event received (stream ended), setting status to end"
        );
        setStatus("end");
      } else {
        console.log(
          "⏸️ textLoaded event received but stream is still active, ignoring"
        );
      }
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

      if (turnstileWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (error) {
          console.warn("err:", error);
        }
      }
    };
  }, [turnstileWidgetId]);

  const proceedWithCoinAnalysis = async (coinSymbol: string) => {
    if (loading) {
      setLoading(false);
    }

    setMessageChunks([]);
    setStatus("loading");

    isStreamingRef.current = true;

    try {
      setLoading(true);

      let token = "";
      try {
        if (!window.turnstile) {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(
                new Error("Turnstile script load timeout after 10 seconds")
              );
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        token = await initTurnstileOnDemand();
      } catch  {
        messageApi.error("Human verification failed, please try again");
        setLoading(false);
        setStatus("init");
        return;
      }

      if (!token) {
        messageApi.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus("init");
        return;
      }

      // Create new AbortController to control streaming request
      streamAbortController.current = new AbortController();

      // Pass token and AbortController to analysis API
      const streamGenerator = analyse_coin_c_steaming(
        `${t("agent.analyze")} ${coinSymbol}`,
        token,
        undefined,
        streamAbortController.current
      );

      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        const firstResult = await iterator.next();
        if (!firstResult.done) {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      } catch (err) {
        console.error("🔧 err:", err);
      }

      for await (const chunk of streamGenerator) {
        // Check if aborted
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

              setMessageChunks((prev) => [...prev, newChunk]);
            }
          }
        }
      }

      isStreamingRef.current = false;
      setStatus("end");
    } catch (error) {

      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      isStreamingRef.current = false;

      setLoading(false);
      setMessageChunks([]);
      setStatus("init");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("textLoaded"));
      }

      messageApi.error(
        t("common.analysisFailed") || "Analysis failed, please try again"
      );
    } finally {
      streamAbortController.current = null;
    }
  };


  const stopCreation = () => {
    console.log("🛑 Stopping content generation");


    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
      console.log("✅ Streaming request stopped");
    }


    setLoading(false);
    setMessageChunks([]);
    setStatus("init");


    if (turnstileWidgetId && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
        setTurnstileWidgetId("");
      } catch (error) {
        console.warn("err:", error);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("textLoaded"));
    }

  };

  return (
    <div className="w-[100%] lg:w-[100%] lg:h-[82vh] bg-[#fff] lg:bg-white rounded-[8px] lg:bg-white overflow-y-auto page-crypto-analysis">
      {contextHolder}

      <div className="bg-[#f1f1f1] lg:bg-[#fff] lg:h-[82vh] rounded-[8px] lg:border-[2px] lg:border-solid lg:border-black overflow-hidden">
        <div
          className="px-[8px] lg:px-0 flex items-center gap-2 cursor-pointer mb-[14px] lg:mb-0 hover:opacity-70 transition-opacity w-full bg-[#cf0] h-[40px] lg:h-[4vh] lg:px-4"
          onClick={handleBack}
        >
          <LeftOutlined style={{ fontSize: "16px" }} />
          <span className="text-[16px] font-bold">
            {t("cryptoAnalysis.back")}
          </span>
        </div>

        <div className="flex flex-col gap-[14px] lg:mt-[14px] lg:px-[24px] lg:py-[14px] bg-[#F2F2F2] lg:mx-[24px] rounded-[8px] lg:h-[74vh]">
   
          <div className="bg-black rounded-[8px] p-[20px] border-2 border-black text-white flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
            <div className="flex items-center gap-4 lg:w-[35%]">
              <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-[24px] font-bold">
                {currentCrypto?.logo ? (
                  <Image
                    src={currentCrypto.logo}
                    alt={currentCrypto.asset}
                    width={60}
                    height={60}
                    className="w-[60px] h-[60px] rounded-full bg-white"
                  />
                ) : (
                  currentCrypto?.asset.slice(0, 2)
                )}
              </div>
              <div className="flex-1 flex flex-col gap-[2px]">
                <div className="text-[14px] flex items-center justify-between rounded-[4px] bg-[#1C1C1C] h-[38px] px-[14px]">
                  <span>{t("cryptoAnalysis.price")}</span>
                  <span
                    id="price-box"
                    className="font-bold text-[#cf0] h-[100%]"
                    style={{ minWidth: "60px", textAlign: "right", display: "inline-flex", alignItems: "center" }}
                  >
                    <span style={{ marginRight: "2px" }}>$</span>
                    <FlipNumbers
                      height={14}
                      width={10}
                      color="#cf0"
                      background="transparent"
                      play
                      perspective={100}
                      duration={1.3}
                      delay={0}
                      numbers={currentPrice}
                      numberStyle={{
                        fontWeight: "bold",
                        fontSize: "14px"
                      }}
                    />
                  </span>
                </div>
                <div className="text-[14px] flex items-center justify-between gap-[2px]">
                  <div className="rounded-[4px] bg-[#1C1C1C] h-[38px] px-[14px] w-[40%] flex items-center justify-center">
                    {t("cryptoAnalysis.spot")}

                    <Image src={light} alt="light" className="ml-[4px]" />
                  </div>
                  <div
                    className="rounded-[4px] bg-[#1C1C1C] h-[38px] px-[14px] flex-1 flex items-center justify-center cursor-pointer"
                    onClick={handleToTrading}
                  >
                    {t("cryptoAnalysis.trading")}
                    <Image
                      src={rightIcon}
                      alt="rightIcon"
                      className="ml-[4px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              id="coin-list"
              className="rounded-[4px] bg-[#1C1C1C] h-[48px] lg:h-[78px] px-[14px] py-[5px] lg:py-0 lg:h-[78px] w-[100%] lg:w-[63%] flex items-center gap-2"
            >
  
              <div className="crypto-swiper-button-prev flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0 w-[20px] h-[20px]">
                <LeftOutlined style={{ fontSize: "16px", color: "white" }} />
              </div>

       
              <div className="flex-1 min-w-0">
                {assets.length > 0 && (
                  <Swiper
                    key={`crypto-swiper-${assets?.length}`}
                    modules={[Navigation]}
                    slidesPerView={8}
                    slidesPerGroup={8}
                    spaceBetween={18}
                    watchOverflow={false}
                    breakpoints={{
                      320: {
                        slidesPerView: 5,
                        slidesPerGroup: 5,
                        spaceBetween: 12,
                      },
                      1024: {
                        slidesPerView: 10,
                        slidesPerGroup: 10,
                        spaceBetween: 12,
                      },
                    }}
                    navigation={{
                      prevEl: ".crypto-swiper-button-prev",
                      nextEl: ".crypto-swiper-button-next",
                      disabledClass: "swiper-button-disabled",
                    }}
                    loop={true}
                    onSwiper={(swiper) => {
                      setTimeout(() => {
                        swiper.navigation.init();
                        swiper.navigation.update();
                      }, 100);
                    }}
                    className="w-full h-full"
                  >
                    {assets.map((crypto, index) => (
                      <SwiperSlide
                        key={index}
                        className="flex items-center justify-center"
                        title={crypto.asset}
                      >
                        <div className="flex items-center justify-center">
                          <div
                            className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] rounded-full flex items-center justify-center text-white text-[12px] font-bold cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => handleCryptoClick(crypto)}
                          >
                            {crypto.logo ? (
                              <Image
                                src={crypto.logo}
                                width={32}
                                height={32}
                                alt={crypto.asset}
                                className="w-[32px] bg-white h-[32px] lg:w-[40px] lg:h-[40px] rounded-full"
                              />
                            ) : (
                              <div
                                className={`bg-[#eee] text-black rounded-full flex items-center justify-center w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] rounded-full font-bold cursor-pointer hover:scale-110 border-[#666] border-solid border-[1px] transition-transform `}
                              >
                                {crypto.asset.slice(0, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>

    
              <div className="crypto-swiper-button-next flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0 w-[20px] h-[20px]">
                <RightOutlined style={{ fontSize: "16px", color: "white" }} />
              </div>
            </div>
          </div>

   
          {assets.length ? (
            <div className="bg-white rounded-[8px] lg:flex-1" id="chat-content">
              <StreamMessage
                stopCreation={stopCreation}
                status={status}
                tip={tip}
                loading={loading}
                messages={messageChunks}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>


      <div
        id="turnstile-container-crypto-analysis"
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

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
      />
    </div>
  );
}
