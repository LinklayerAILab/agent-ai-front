"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";
import "./Alpha.scss";
import { AlphaCard } from "./AlphaCard";
import { SoundWave } from "./SoundWave";
import { AlphaEmptyState } from "./AlphaEmptyState";
import bot from "@/app/images/alpha/bot.svg";
import bg from "@/app/images/alpha/bg.svg"
import clockIcon from "@/app/images/alpha/clock.svg";

import dunIcon from "@/app/images/alpha/dun.svg";

import {
  alpha_token_info,
  alpha_token_price,
  liquidity_check,
  AlphaTokenItem,
  update_time,
} from "@/app/api/agent_c";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
type AlphaTokenWithPrice = AlphaTokenItem & {
  id: number;
  title: string;
  depth: string;
  type?: number;
  priceLoaded?: boolean;
  liquidityLoaded?: boolean;
};
export default function Alpha() {
  const { t } = useTranslation();
  const alphaListRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const [alphaData, setAlphaData] = useState<AlphaTokenWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const [updateTime, setUpdateTime] = useState(0)
  const [relativeTime, setRelativeTime] = useState("0m ago");

  useEffect(() => {
    if (!updateTime) {
      setRelativeTime("0m ago");
      return;
    }
    const update = () => {
      const diffMs = Date.now() - updateTime;
      const minutes = Math.max(0, Math.floor(diffMs / 60000));
      if (minutes >= 1440) {
        const days = Math.floor(minutes / 1440);
        const remainingMinutes = minutes % 1440;
        setRelativeTime(`${days}d${remainingMinutes}m`);
        return;
      }
      setRelativeTime(`${minutes}m ago`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);
  // Fetch alpha tokens data and prices
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);

        // Step 1: Fetch token info and render immediately
        const tokenInfoResponse = await alpha_token_info();
        const tokenList = tokenInfoResponse.data.tokens;

        // Render initial data with basic info
        const initialData = tokenList.map((token, index) => ({
          id: index,
          title: token.symbol,
          depth: "--",
          type: 3,
          symbol: token.symbol,
          icon_url: token.icon_url,
          token_address: token.token_address,
          price: undefined,
          priceLoaded: false,
          liquidityLoaded: false,
        }));
        setAlphaData(initialData);
        setUpdateTime(Date.now());
        setLoading(false);

        // Step 2: Extract token addresses
        const tokenAddresses = tokenList.map((item) => item.token_address).filter(Boolean);

        // Step 3: Fetch prices and liquidity check in parallel in background
        if (tokenAddresses.length > 0) {
          try {
            // Call both APIs in parallel
            const [priceResponse, liquidityResponse] = await Promise.all([
              alpha_token_price({
                token_addresses: tokenAddresses,
              }),
              liquidity_check({
                token_addresses: tokenAddresses,
              }),
            ]);

            // Create a price map for quick lookup
            const priceMap = new Map<string, number>();
            if (priceResponse.data?.prices) {
              priceResponse.data.prices.forEach((priceItem) => {
                priceMap.set(priceItem.token_address, priceItem.price);
              });
            }

            // Create a liquidity map for quick lookup
            const liquidityMap = new Map<string, { level: number; color: string,d2_result?:{slope: number} }>();
            if (liquidityResponse.data?.results) {
              liquidityResponse.data.results.forEach((liquidityItem) => {
                liquidityMap.set(liquidityItem.token_address, {
                  level: liquidityItem.level,
                  color: liquidityItem.color,
                  d2_result: liquidityItem.d2_result
                });
              });
            }

            // Update data with price and liquidity info
            setAlphaData((prevData) =>
              prevData.map((item, index) => {
                const token = tokenList[index];
                const price = priceMap.get(token.token_address);
                const liquidity = liquidityMap.get(token.token_address);
                if(liquidity?.d2_result){
                }
                
                return {
                  ...item,
                  price: typeof price === "number" ? price : undefined,
                  priceLoaded: true,
                  liquidityLoaded: !!liquidity,
                  level: liquidity?.level,
                  color: liquidity?.color,
                  d2_result: liquidity?.d2_result
                };
              })
            );
  
          } catch (priceError) {
            console.error("Failed to fetch token prices or liquidity:", priceError);
            // Update with error state
            setAlphaData((prevData) =>
              prevData.map((item) => ({
                ...item,
                price: Number.NaN,
                priceLoaded: true,
                liquidityLoaded: true,
              }))
            );

          }
        } 
      } catch (error) {
        console.error("Failed to fetch alpha tokens:", error);
        // messageApi.error("Failed to load alpha tokens");
        setLoading(false);
      }
    };

    if (isLogin) {
       setLoading(true)
      update_time().then(res => {
        setUpdateTime(res.data.block_time * 1000)
      })
      fetchTokens();
    } else {
      setLoading(false)
      setAlphaData([])
    }
  }, [isLogin]);



  useEffect(() => {
    // 确保只inclientexecute，避免 SSR/Hydration issues
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const viewWidth = 435;
    const viewHeight = 579;
    const drops: Array<{
      x: number;
      size: number;
      startY: number;
      endY: number;
      duration: number;
      delay: number;
      startTime: number;
    }> = [];

    let lastSpawn = 0;
    let rafId = 0;

    const resizeCanvas = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(wrap);
    resizeCanvas();

    const spawnDrops = (now: number) => {
      const count = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < count; i += 1) {
        const size = 8 + Math.random() * 2;
        const isLeft = Math.random() < 0.5;
        const x = isLeft ? 185 + Math.random() * 30 : 230 + Math.random() * 30;
        const startY = 460;
        const endY = 504;
        const duration = 1.2 + Math.random() * 1;
        const delay = Math.random() * 0.2;
        drops.push({
          x,
          size,
          startY,
          endY,
          duration,
          delay,
          startTime: now,
        });
      }
    };

    const easeInQuad = (t: number) => t * t;

    const tick = (now: number) => {
      const rect = wrap.getBoundingClientRect();
      const scale = Math.min(rect.width / viewWidth, rect.height / viewHeight);
      const imgW = viewWidth * scale;
      const imgH = viewHeight * scale;
      const offsetX = (rect.width - imgW) / 2;
      const offsetY = (rect.height - imgH) / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (now - lastSpawn > 700) {
        spawnDrops(now);
        lastSpawn = now;
      }

      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const d = drops[i];
        const t = (now - d.startTime) / 1000 - d.delay;
        if (t < 0) continue;
        const p = t / d.duration;
        if (p >= 1) {
          drops.splice(i, 1);
          continue;
        }

        const eased = easeInQuad(p);
        const y = d.startY + (d.endY - d.startY) * eased;
        const cx = offsetX + d.x * scale;
        const cy = offsetY + y * scale;

        const fadeIn = Math.min(1, p / 0.06);
        const fadeOut = p > 0.99 ? Math.max(0, 1 - (p - 0.99) / 0.01) : 1;
        const alpha = fadeIn * fadeOut;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.shadowColor = "#cf0";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, (d.size / 2) * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);
  const formatDepth = (depth?: number) => {
    if (depth === null || !depth) return '--';
    if(depth === 0) return '0'
    const str = (depth*100).toString()
    return str.length > 5 ? str.slice(0,5) : str
  };
  // Skeleton items
  const skeletonItems = useMemo(() => (
    Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="alpha-card skeleton-card flex gap-3 py-[14px] px-[14px] lg:px-[1.5vh] lg:py-[1.5vh]">
        <Skeleton.Avatar size={76} className="rounded-[8px]" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton.Input active size="small" className="w-[120px]" />
          <Skeleton.Input active size="small" className="w-[80px]" />
          <Skeleton.Input active size="small" className="w-[100px]" />
          <div className="h-[2px] bg-black my-[0.5vh]"></div>
          <div className="flex gap-2">
            <Skeleton.Button active size="small" className="flex-1" />
            <Skeleton.Button active size="small" className="flex-1" />
          </div>
        </div>
      </div>
    ))
  ), []);

  return (
    <>
      <div className="w-[calc(100vw-28px)] lg:w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 lg:bg-[#EBEBEB] rounded-[8px] flex flex-col lg:flex-row items-center lg:p-[2vh] page-alpha-inner">
        <div className="w-full h-full flex flex-col lg:flex-row lg:gap-4">
          <div className="bg-white rounded-[8px] w-full lg:w-[520px] h-full">
            <div className="left-box w-full h-[480px] lg:w-[520px] lg:h-full lg:h-full relative">
              <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full flex items-center justify-center">
              <div className="relative w-full lg:w-auto h-full flex items-center justify-center" id="icon-run">
                <div className="relative w-full h-full" ref={canvasWrapRef}>
                  <svg viewBox="0 0 435 579" className="w-full h-full">
                    <defs>
                      <linearGradient id="alpha-indicator-base" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5E5F5B" />
                        <stop offset="100%" stopColor="#878787" />
                      </linearGradient>
                      <linearGradient id="alpha-indicator-active-1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A7FFD5" />
                        <stop offset="100%" stopColor="#51FF6E" />
                      </linearGradient>
                      <linearGradient id="alpha-indicator-active-2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EEFE70" />
                        <stop offset="100%" stopColor="#E2FF08" />
                      </linearGradient>
                      <linearGradient id="alpha-indicator-active-3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFABB4" />
                        <stop offset="100%" stopColor="#FF4246" />
                      </linearGradient>
                    </defs>
                    <image href={bg.src} width="435" height="579" preserveAspectRatio="xMidYMid meet" />
                    <image href={clockIcon.src} x="229" y="95" width="14" height="14" />
                                        <text
                      id="alpha-time"
                      x="245"
                      y="107"
                      fill="#FFBE34"
                      stroke="#000"
                      strokeWidth="2"
                      paintOrder="stroke"
                      className="font-bold text-[0.875rem] lg:text-[0.78rem]"
                    >
                      {relativeTime}
                    </text>
                    <g className="alpha-indicators-svg" aria-hidden="true">
                      <g>
                        <circle cx="178.5" cy="540" r="9" fill="url(#alpha-indicator-base)" stroke="#000" strokeWidth="2" />
                        <circle
                          className="alpha-indicator-active alpha-indicator-active--1"
                          cx="178.5"
                          cy="540"
                          r="9"
                          fill="url(#alpha-indicator-active-1)"
                          stroke="#000"
                          strokeWidth="2"
                        />
                      </g>
                      <g>
                        <circle cx="216.5" cy="540" r="9" fill="url(#alpha-indicator-base)" stroke="#000" strokeWidth="2" />
                        <circle
                          className="alpha-indicator-active alpha-indicator-active--2"
                          cx="216.5"
                          cy="540"
                          r="9"
                          fill="url(#alpha-indicator-active-2)"
                          stroke="#000"
                          strokeWidth="2"
                        />
                      </g>
                      <g>
                        <circle cx="254.5" cy="540" r="9" fill="url(#alpha-indicator-base)" stroke="#000" strokeWidth="2" />
                        <circle
                          className="alpha-indicator-active alpha-indicator-active--3"
                          cx="254.5"
                          cy="540"
                          r="9"
                          fill="url(#alpha-indicator-active-3)"
                          stroke="#000"
                          strokeWidth="2"
                        />
                      </g>
                    </g>
                  </svg>
                  <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
                </div>
              </div>
              </div>

              <div className="absolute bottom-[80px] lg:bottom-[16vh] left-[50%] ml-[-160px] lg:ml-[-26vh]" id="alpha-bot">
                <div className="relative">
                  <Image src={bot} alt=""  className="w-[320px] lg:w-[52vh] object-contain lg: rounded-[8px] "></Image>
                </div>
              </div>

              <div className="absolute top-[225px] lg:top-[33vh] left-[50%] w-[80px] lg:w-[12.8vh] ml-[-35px] lg:ml-[-5.8vh]" id="wave-sound">
                <SoundWave />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[8px] flex-1 h-full mt-[10px] lg:mt-0 lg:p-[2vh] mt-[2vh]">
          
              <>

              <div className="lg:bg-[#cf0] lg:h-[6vh] border-[2px] border-solid border-black rounded-[8px] flex flex-col lg:flex-row gap-3 items-center px-0 lg:px-4">
                <div className="flex items-center gap-2 py-[4px] lg:py-0 bg-[#cf0] w-full px-4 lg:px-0 rounded-[8px]">
                  <Image src={dunIcon} alt="" width={24} height={24}></Image>
                  <span className="font-bold text-[16px]">{t('alpha.worstToken')}</span>
                </div>
                <div className="flex gap-2 items-center pb-4 lg:pb-0" id="alpha-list-box">
                  {alphaData.filter(item => item.color === 'RED').length > 0 ? (
                    alphaData
                      .filter(item => item.color === 'RED')
                      .map(item => (
                        <div key={item.id} className="border-[2px] border-solid border-black rounded-full bg-white px-3 h-[3.6vh] flex items-center justify-center">
                          {item.title}
                        </div>
                      ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            {!loading && alphaData.length === 0 ? (
              // Empty state
              <div className="w-full h-[400px] lg:h-[66vh] flex items-center justify-center border-[2px] border-solid border-black rounded-[8px] mt-[2vh]">
                <AlphaEmptyState description={t('alpha.noAlphaTokenInfo')} imageClassName="w-[158px] lg:w-[211px]" descriptionClassName="text-[16px] lg:text-[18px]" />
              </div>
            ) : (
              <div ref={alphaListRef} className="h-auto lg:h-[68vh] overflow-y-auto alpha-list mt-[1vh]">
                {loading ? (
                  // Skeleton loading state
                  <>{skeletonItems}</>
                ) : (
                  // Token list
                  alphaData.map((item) => (
                    <AlphaCard
                      key={item.id}
                      title={item.title}
                      price={item.price == null ? "-" : Number.isNaN(item.price) ? "N/A" : item.price.toFixed(6)}
                      depth={formatDepth(item?.d2_result?.slope)}
                      data={item}
                      icon={item.icon_url}
                      color={item.color}
                      priceLoaded={item.priceLoaded}
                      liquidityLoaded={item.liquidityLoaded}
                    />
                  ))
                )}
              </div>
            )}
              </>
           
          </div>
        </div>
    </div>
  </>
  );
}





