"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { syncPoints } from "@/app/store/userSlice";
import { message } from "antd";
import Script from "next/script";
import { useTranslation } from "react-i18next";
import { LeftOutlined } from "@ant-design/icons";
import star from "@/app/images/home/star.svg";
import { MessageChunk } from "@/app/components/ChatMessage";
import { HomeAnalysisResult } from "@/app/components/Home/HomeAnalysisResult";
import { position_risk_management } from "@/app/api/agent_c";
import { delayFunction } from "@/app/utils";
import Image from "next/image";

export default function PositionAnalysis() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const symbol = params?.symbol as string;
  const cexName = searchParams?.get("cex_name") || "binance";
  const backUrl = searchParams?.get("backUrl");

  const dispatch = useDispatch<AppDispatch>();
  const isLogin = useSelector(
    (state: RootState) => state.user?.isLogin ?? false
  );
  const points = useSelector((state: RootState) => state.user.points);


  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const [status, setStatus] = useState<
    "init" | "loading" | "generating" | "end"
  >("init");
  const [loading, setLoading] = useState(false);
  const streamAbortController = useRef<AbortController | null>(null);


  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);


  const [currentCoin, setCurrentCoin] = useState<{
    symbol: string;
    update_time: number;
  }>({
    symbol: "",
    update_time: 0,
  });

 
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
            action: "positionRiskAnalysis",
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


  const handleAnalysis = async () => {
    if (!symbol) {
      message.warning(t("common.symbolRequired"));
      return;
    }

    if (!isLogin) {
      message.warning(t("home.loginFirst"));
      return;
    }

    await dispatch(syncPoints());
    if (points <= 0) {
      message.warning(t("home.pointsNotEnough"));
      return;
    }
    if (status === "loading" || status === "generating") {
      message.warning(t("common.taskRunning"));
      return;
    }

  
    setMessageChunks([]);
    setStatus("loading");
    setCurrentCoin({ symbol, update_time: Date.now() });
      debugger
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
                console.log("✅ Turnstile script loaded");
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // Create widget on demand and get token
        token = await initTurnstileOnDemand();
      } catch {
        message.error(t("common.humanVerificationFailed"));
        setLoading(false);
        setStatus("init");
        return;
      }

      if (!token) {
        message.error(t("common.verificationTokenEmpty"));
        setLoading(false);
        setStatus("init");
        return;
      }

      await delayFunction();


      streamAbortController.current = new AbortController();

    
      const streamGenerator = position_risk_management(
        `${t("agent.analyze")}|symbol:${symbol.toUpperCase()}|${cexName}`,
        token,
        undefined,
        streamAbortController.current
      );

      for await (const chunk of streamGenerator) {

        if (streamAbortController.current?.signal.aborted) {
          console.log("🚫 Streaming request aborted, stopping data chunk processing");
          break;
        }



        let newContent = "";

        if (chunk && typeof chunk === "object") {

          // Handle SSE event format
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
            console.log("🚀 Workflow started...");
          } else if ("event" in chunk && chunk.event === "workflow_finished") {
            console.log("🏁 Workflow completed");
            streamAbortController.current = null;
          } else if ("event" in chunk && chunk.event === "message_end") {
            console.log("📝 Message ended...");
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


      console.log("🎉 Streaming request completed normally");
      setStatus("end");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {

        return;
      }



      // Reset all states when API fails
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

  // Stop analysis
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

    console.log("✅ All states have been reset");
  };

  useEffect(() => {
    const handleTextLoading = () => {
      setStatus("generating");
    };

    const handleTextLoaded = () => {
      setStatus("end");
      dispatch(syncPoints());
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
          console.warn("Failed to cleanup Turnstile widget:", error);
        }
      }
    };
  }, [turnstileWidgetId]);


  useEffect(() => {
    if (symbol && isLogin) {

      handleAnalysis();
    }
  }, [symbol, isLogin]);

  const handleBack = () => {
    if (backUrl) {
      router.push(decodeURIComponent(backUrl));
    } else {
      router.back();
    }
  };

  if (!symbol) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">{t("common.symbolRequired")}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-black text-white rounded"
          >
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>

      <div
        id="turnstile-container-position-analysis"
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


      <div className="max-w-6xl mx-auto mt-4">
        <div
          className="px-[8px] lg:px-0 flex items-center gap-2 cursor-pointer mb-[14px] lg:mb-0 hover:opacity-70 transition-opacity w-full bg-[#cf0] h-[40px] lg:h-[4vh] lg:px-4"
          onClick={handleBack}
        >
          <LeftOutlined style={{ fontSize: "16px" }} />
          <span className="text-[16px] font-bold">
            {t("cryptoAnalysis.back")}
          </span>
        </div>
 
      </div>


      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-md p-4 min-h-[76vh]">
          <div className="lg:px-[2vh] lg:pt-[2vh] lg:pb-[1vh] flex items-center gap-2 lg:gap-4 font-bold text-[11px] lg:text-[12px] rounded-[8px]">
            <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[4px] lg:py-2 bg-[#E9FF93] flex items-center gap-1 flex-1 flex items-center justify-center">
              <Image src={star} alt="star"></Image> {t("home.personalPosition")}
            </div>
            <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[4px] lg:py-2 bg-[#F9FFE2] flex items-center gap-1 flex-1 flex items-center justify-center">
              <Image src={star} alt="star"></Image>
              {t("home.liveMonitoring")}
            </div>
          </div>
          <div className="lg:px-[2vh] lg:pt-[2vh] lg:pb-[1vh] flex items-center gap-2 lg:gap-4 font-bold text-[11px] lg:text-[12px] rounded-[8px] mt-[10px]">
            <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[4px] lg:py-2 bg-[#C4BEFF] flex items-center gap-1 flex-1 flex items-center justify-center">
              <Image src={star} alt="star"></Image>
              {t("home.publicFactors")}
            </div>
            <div className="border-[1px] border-solid border-black rounded-[4px] px-[8px] py-[4px] lg:py-2 bg-[#F6EFFF] flex items-center gap-1 flex-1 flex items-center justify-center">
              <Image src={star} alt="star"></Image>
              {t("home.agentAdvice")}
            </div>
          </div>

          <div className="mt-[14px]">
            <HomeAnalysisResult
            status={status}
            stopCreation={stopCreation}
            tip={t("home.analyzing")}
            loading={loading}
            messages={messageChunks}
            currentCoin={currentCoin}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
