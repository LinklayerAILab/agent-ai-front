"use client";
import bot from "@/app/images/agent/banner.png";
import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import './page.scss';
// Import components
import ChatBox from "../components/ChatBox";
import { ChatMessage } from "../components/ChatMessage";
// import { MessageItem } from "../components/ChatMessage";
import { AppDispatch, RootState } from "../store";
import { syncPoints } from "../store/userSlice";
import { AGENT_POINTS_COST } from "../enum";
// Import APIs
import { analyse_coin_c_steaming, recommend_coin_c_steaming } from "../api/agent_c";
import TrendBox from "./TrendBox";
import { MessageChunk } from "./types";


import { delayFunction } from "../utils";
import TypewriterNode from "../components/TypewriterNode";

import { getSystemInfo } from "../utils/system";
import { LeftOutlined } from "@ant-design/icons";
import Image from "next/image";
import botBig from "@/app/images/agent/botBig.svg";
import billIconGary from "@/app/images/agent/billIconGary.svg";
import CoinsList, { CoinItem } from "../components/CoinsList";
import SmaltImage from "../components/SmaltImage/SmaltImage";
import go from '@/app/images/agent/go.svg';
import Link from "next/link";



const Page = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [tip] = useState("Analyzing...");
  const [loading, setLoading] = useState(false);
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isLogin = useSelector((state: RootState) => state.user?.isLogin ?? false);
  const points = useSelector((state: RootState) => state.user.points);
  const [status, setStatus] = useState<'init' | 'loading' | 'generating' | 'end'>('init');
  // Store AbortController for current streaming request
  const streamAbortController = useRef<AbortController | null>(null);

  const handleRecommend = async (consultParam: string) => {
    if (!isLogin) {
      messageApi.warning("please login first");
      return;
    }

    await dispatch(syncPoints());
    const trackerCost = AGENT_POINTS_COST.TRACKER;
    if (points < trackerCost) {
      messageApi.warning(t("home.insufficientPoints", { cost: trackerCost }));
      return;
    }
    if (status === 'loading' || status === 'generating') {
      messageApi.warning(t('common.taskRunning'));
      return;
    }
    if (loading) {
      setLoading(false)
    }

    setMessageChunks([]);
    setStatus('loading');

    try {
      setLoading(true);

      await delayFunction()
      // Initialize empty message object for accumulating content
      let accumulatedContent = '';

      console.log('馃殌 Starting to call streaming API:', consultParam);

      // Create new AbortController to control streaming request
      streamAbortController.current = new AbortController();

      // Pass AbortController to recommendation API
      const streamGenerator = recommend_coin_c_steaming(consultParam, undefined, streamAbortController.current);
      console.log('馃殌 Stream generator created:', streamGenerator);
      console.log('馃殌 Generator type:', typeof streamGenerator);
      console.log('馃殌 Generator is AsyncGenerator:', streamGenerator[Symbol.asyncIterator] ? 'YES' : 'NO');

      console.log('馃殌 Starting for await loop...');

      // Test first iteration
      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('馃敡 Got iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('馃敡 First next() result:', firstResult);

        if (!firstResult.done) {
          console.log('馃摝 First data chunk:', firstResult.value);
          // Manually handle first data chunk
          // const chunk = firstResult.value;
          // ... handling logic
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('馃敡 Manual iterator test failed:', err);
      }

      for await (const chunk of streamGenerator) {
        // Check if aborted
        if (streamAbortController.current?.signal.aborted) {
          console.log('馃毇 Streaming request aborted, stopping data chunk processing');
          break;
        }

        console.log('馃摝 -------------- Received streaming data chunk:', chunk);
        console.log('馃摝 --------------Data type:', typeof chunk);
        console.log('馃摝 --------------Data structure:', Object.keys(chunk || {}));


        // Check data structure and extract message content
        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('馃攳 Processing data chunk:', chunk);

          // Handle our SSE event format
          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            // Our message event, extract answer field
            newContent = chunk.answer;
            console.log('鉁?Extracted answer content:', newContent);

            // Add new message chunk
            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now()
            };

            setMessageChunks(prev => {
              // If this is the first message chunk, set status to 'generating'
              if (prev.length === 0) {
                setStatus('generating');
              }
              return [...prev, newChunk];
            });


          } else if ('event' in chunk && chunk.event === 'workflow_started') {
            console.log('馃殌 Workflow started');
            // Don't add content, but can update status
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('馃弫 Workflow finished');
            // Clear AbortController when workflow finishes
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('馃摑 Message ended');
            // Clear AbortController when message ends
            streamAbortController.current = null;
          } else {
            // Handle other possible data formats
            if ('data' in chunk && chunk.data?.recommend_result?.output?.output) {
              newContent = chunk.data.recommend_result.output.output;
            } else if ('data' in chunk && (chunk.data?.text || chunk.data?.content)) {
              newContent = chunk.data.text || chunk.data.content || '';
            } else if ('text' in chunk && chunk.text) {
              newContent = chunk.text;
            } else if ('content' in chunk && chunk.content) {
              newContent = chunk.content;
            } else if ('answer' in chunk && chunk.answer) {
              newContent = chunk.answer;
            }
          }
        }

        // If new content obtained, accumulate and display
        if (newContent && newContent.trim()) {
          accumulatedContent += newContent;
          console.log('鉁?Extracted content:', newContent);
          console.log('馃摑 Accumulated content length:', accumulatedContent.length);
        }
      }

    } catch (error) {
      // Check if user actively aborted request
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('鉁?Streaming request aborted by user');
        return;
      }

      console.error('Streaming recommendation failed:', error);

      // Reset all states when API fails
      setLoading(false);
      setMessageChunks([]);
      setStatus('init');

      // Trigger completion event, reset typewriter state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('textLoaded'));
      }

      // Show error message
      messageApi.error(t('common.recommendFailed') || 'Recommendation failed, please try again');
    } finally {
      // Ensure cleanup regardless of outcome
      streamAbortController.current = null;
    }
  };
  // Event listener setup - independent useEffect to avoid being affected by other states
  useEffect(() => {
    const handleTextLoading = () => {
      setStatus('generating');
    }

    const handleTextLoaded = () => {
      setStatus('end');
    }

    window.addEventListener('textLoading', handleTextLoading)
    window.addEventListener('textLoaded', handleTextLoaded)

    return () => {
      window.removeEventListener('textLoading', handleTextLoading)
      window.removeEventListener('textLoaded', handleTextLoaded)
    }
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup streaming request AbortController
      if (streamAbortController.current) {
        streamAbortController.current.abort();
        streamAbortController.current = null;
      }

      console.log('Piloter component unmounted, cleanup completed');
    }
  }, [])


  const stopCreation = () => {
    console.log('馃洃 Stopping content generation');

    // 1. Stop streaming request
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
      console.log('鉁?Streaming request stopped');
    }

    // 2. Reset all recommendation related states
    setLoading(false);
    setMessageChunks([]);
    setStatus('init');

    // 3. Trigger text load completion event (reset typewriter effect state)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('textLoaded'));
    }

    console.log('鉁?All states reset, user can start new recommendation');
  }


  const [showDetail, setShowDetail] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<{ label: string; value: string } | null>(null);

  const handleAnalize = (strategy: { label: string; value: string }) => {
    console.log('Analyzing strategy:', strategy.value);
    const { isMobile } = getSystemInfo();

    setSelectedStrategy(strategy);
    if (isMobile) {
      setShowDetail(true);
    }

    // First clear rich text content in ChatMessage component
    setMessageChunks([]);

    // Then call handleRecommend method
    handleRecommend(`${strategy.label} ${strategy.value} `);
  }


  const handleBack = () => {
    setShowDetail(false);
    setSelectedStrategy(null);
    setSelectCoin(undefined);
    stopCreation()
  }
  const [tab, setTab] = useState(2)
  const handleTab = (tabIndex: number) => {
    setTab(tabIndex)
  }

  // Coin analysis related states
  const [selectCoin, setSelectCoin] = useState<CoinItem>();
  const [type, setType] = useState<number>(1); // 1-spot 2-futures
  const isStreamingRef = useRef<boolean>(false);

  // Debug: monitor status changes
  useEffect(() => {
    console.log('馃搳 Status changed to:', status);
  }, [status])

  // Event listener setup
  useEffect(() => {
    const handleTextLoading = () => {
      console.log('馃幀 textLoading event received, setting status to generating');
      setStatus('generating')
    }

    const handleTextLoaded = () => {
      // Only respond to textLoaded event when streaming has ended
      if (!isStreamingRef.current) {
        console.log('馃弫 textLoaded event received (stream ended), setting status to end');
        setStatus('end')
      } else {
        console.log('鈴革笍 textLoaded event received but stream is still active, ignoring');
      }
    }

    window.addEventListener('textLoading', handleTextLoading)
    window.addEventListener('textLoaded', handleTextLoaded)

    return () => {
      window.removeEventListener('textLoading', handleTextLoading)
      window.removeEventListener('textLoaded', handleTextLoaded)

      // Cleanup streaming request AbortController
      if (streamAbortController.current) {
        streamAbortController.current.abort();
        streamAbortController.current = null;
      }
    }
  }, [])

  // Coin analysis feature - function to continue analysis
  const proceedWithCoinAnalysis = async (v: CoinItem, coinType: number) => {
    const { isMobile } = getSystemInfo()

    if (loading) {
      setLoading(false)
    }
    const {symbol} = v

    setMessageChunks([]);
    setSelectCoin(v)
    if (isMobile) {
      setShowDetail(true)
    }
    setStatus('loading')

    // Mark streaming start
    isStreamingRef.current = true;

    try {
      setLoading(true);

      console.log('馃殌 Starting to call streaming analysis API:', symbol);

      // Create new AbortController to control streaming request
      streamAbortController.current = new AbortController();

      // Pass AbortController to analysis API
      const streamGenerator = analyse_coin_c_steaming(`${t('agent.analyze')} ${symbol} ${coinType === 2 ? t('agent.contract') : ''}`, undefined, streamAbortController.current);

      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('馃敡 Got iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('馃敡 First next() result:', firstResult);

        if (!firstResult.done) {
          console.log('馃摝 First data chunk:', firstResult.value);
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('馃敡 Manual iterator test failed:', err);
      }

      for await (const chunk of streamGenerator) {
        // Check if aborted
        if (streamAbortController.current?.signal.aborted) {
          console.log('馃毇 Streaming request aborted, stopping data chunk processing');
          break;
        }

        console.log('馃摝 Received streaming data chunk:', chunk);

        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('馃攳 Processing data chunk:', chunk);

          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            newContent = chunk.answer;
            console.log('鉁?Extracted answer content:', newContent);

            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now()
            };

            setMessageChunks(prev => {
              // If this is the first message chunk, set status to 'generating'
              if (prev.length === 0) {
                setStatus('generating');
              }
              return [...prev, newChunk];
            });

          } else if ('event' in chunk && chunk.event === 'workflow_started') {
            console.log('馃殌 Workflow started');
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('馃弫 Workflow finished');
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('馃摑 Message ended');
            streamAbortController.current = null;
          } else {
            if ('data' in chunk && chunk.data?.analyse_result?.output?.output) {
              newContent = chunk.data.analyse_result.output.output;
            } else if ('data' in chunk && (chunk.data?.text || chunk.data?.content)) {
              newContent = chunk.data.text || chunk.data.content || '';
            } else if ('text' in chunk && chunk.text) {
              newContent = chunk.text;
            } else if ('content' in chunk && chunk.content) {
              newContent = chunk.content;
            } else if ('answer' in chunk && chunk.answer) {
              newContent = chunk.answer;
            }

            if (newContent && newContent.trim()) {
              const newChunk: MessageChunk = {
                id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: newContent,
                timestamp: Date.now()
              };

              setMessageChunks(prev => [...prev, newChunk]);
            }
          }
        }
      }

      // for loop ended normally, indicating streaming request completed
      console.log('馃帀 Streaming request completed normally');

      // Mark streaming end
      isStreamingRef.current = false;

      // Set status to end directly (don't rely on event)
      setStatus('end');

    } catch (error) {
      // Check if user actively aborted request
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('鉁?Streaming request aborted by user');
        return;
      }

      console.error('Streaming analysis failed:', error);

      // Mark streaming end
      isStreamingRef.current = false;

      // Reset all states when API fails
      setLoading(false);
      setMessageChunks([]);
      setStatus('init');

      // Trigger completion event, reset typewriter state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('textLoaded'));
      }

      // Show error message
      messageApi.error(t('common.analysisFailed') || 'Analysis failed, please try again');
    } finally {
      // Ensure cleanup regardless of outcome
      streamAbortController.current = null;
    }
  };

  // Analysis feature - triggered when clicking consult AI
  const handleCoinAnalyze = async (v: CoinItem, coinType: number) => {
    if (!isLogin) {
      messageApi.warning("please login first");
      return;
    }
    setType(coinType);
    await dispatch(syncPoints());
    const pickerCost = AGENT_POINTS_COST.PICKER;
    if (points < pickerCost) {
      messageApi.warning(t("home.insufficientPoints", { cost: pickerCost }));
      return;
    }
    if (status === 'loading' || status === 'generating') {
      messageApi.warning(t('common.taskRunning'));
      return;
    }

    // Reset state to ensure correct state before each analysis
    setStatus('init');

    if (loading) {
      setLoading(false)
    }

    // Call proceedWithCoinAnalysis directly
    proceedWithCoinAnalysis(v, coinType);
  };


  return (
    <div className="flex lg:justify-center lg:items-center w-[100%] h-[100%] lg:p-4 page-piloter">
      {contextHolder}
      <div className="flex flex-col lg:flex-row w-[100%] gap-3 lg:gap-5 lg:h-[82vh]">
        <div className="w-[100%] lg:w-[70%] hidden lg:block">
          <ChatBox>
            {
              <ChatMessage status={status} stopCreation={stopCreation} tip={tip} loading={loading} messages={messageChunks} initNode={<TypewriterNode text={t('agent.initStr1')} icon={bot} />} />
            }
          </ChatBox>
        </div>

        <div className="w-[100%] lg:w-[32%] flex flex-col gap-[20px] lg:gap-[2vh]">
          {
            showDetail ? (
              <div className="lg:min-h-[86vh] bg-white py-2 rounded-[8px]">
                <div className="px-4" onClick={handleBack}><LeftOutlined></LeftOutlined></div>
                {/* Display different information based on selected strategy or coin */}
                {selectedStrategy ? (
                  // Display strategy information
                  <div className="border-[1px] border-solid border-[black] rounded-[8px] h-[100px] m-4 bg-[#F5F5F5] flex p-4">
                    <div className="flex items-center justify-center w-[70px]">
                      <Image src={botBig} alt="bot" width={60} height={60} />
                    </div>
                    <div className="flex items-center flex-1">
                      <div className="pl-4 w-[100%]">
                        <div className="flex gap-6"><span className="text-[14px] font-bold">
                          {selectedStrategy?.label}
                        </span> <span className="font-bold text-[18px] text-[#8AA90B]"></span></div>
                        <div className="border-t-[1px] border-t-black border-t-solid my-[6px]"></div>
                        <div className="text-[14px] flex items-center gap-2"><span className="font-bold text-[14px] flex items-center gap-2">
                          {selectedStrategy?.value}
                          <Image src={billIconGary} alt="icon" width={18} height={18} />
                        </span> </div>
                      </div>
                    </div>
                  </div>
                ) : selectCoin ? (
                  // Display coin information
                  <div className="border-[1px] border-solid border-[black] rounded-[8px] h-[100px] m-4 bg-[#F5F5F5] flex p-4">
                    <div className="flex items-center justify-center w-[70px]">
                      <SmaltImage
                        width={70}
                        height={70}
                        src={`https://cdn.linklayer.ai/coinimages/${selectCoin?.image}`}
                        className="rounded-full overflow-hidden inline-block bg-white p-1"
                        errorPlaceholder={
                          <div className="w-[70px] h-[70px] font-bold bg-[#eee] rounded-full border-[1px] border-solid flex items-center justify-center border-[#ccc] text-[34px]">
                            {selectCoin?.symbol.slice(0, 1).toUpperCase()}
                          </div>
                        }
                        alt=""
                      />
                    </div>
                    <div className="flex items-center flex-1">
                      <div className="pl-4 w-[100%]">
                        <div className="flex gap-6"><span className="text-[18px] font-bold">{t('agent.price')}</span> <span className="font-bold text-[18px] text-[#8AA90B]">${selectCoin?.price}</span></div>
                        <div className="border-t-[1px] border-t-black border-t-solid my-[6px]"></div>
                        <div className="text-[14px] flex items-center gap-2"><span className="font-bold text-[14px]">{t('agent.trading')}</span> <Link target="_blank" href={`https://www.binance.com/zh-CN/trade/${selectCoin?.symbol.split('USDT')[0]}_USDT?type=spot`}><Image src={go} width={16} height={16} alt=""></Image></Link> <span className="font-bold">{type === 1 ? t('agent.spot').toUpperCase() : t('agent.futures').toUpperCase()}</span></div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <ChatMessage stopCreation={stopCreation} status={status} className="h-auto" tip={tip} loading={loading} messages={messageChunks} currentCoin={selectCoin} />
              </div>
            ) : (
              tab === 1 ? (
                <TrendBox onAnalyze={handleAnalize} />
              ) : (
                <CoinsList
                  onConsultClick={(v) => handleCoinAnalyze(v, 1)}
                  onContractClick={(v) => handleCoinAnalyze(v, 2)}
                />
              )
            )
          }

          <div className="flex text-[18px] font-bold rounded-[8px] h-[44px] lg:h-[5vh] cursor-pointer">
              <div onClick={() => handleTab(2)} className={`home-btn flex-1 flex items-center justify-center gap-2 border-[2px] border-black border-solid rounded-l-[8px] ${tab === 2 && 'selected'}`}>
              {t('menu.picker')}
            </div>
            <div onClick={() => handleTab(1)} className={`home-btn flex-1 flex items-center justify-center bg-black text-white gap-2  border-[2px] border-black border-solid rounded-r-[8px] ${tab === 1 && 'selected'}`}>
              {t('menu.tracker')}
            </div>

          </div>
        </div>
      </div>    </div>
  );
};

export default Page;


