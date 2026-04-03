"use client";
import bot from "@/app/images/agent/banner.png";
import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Script from "next/script";
import './page.scss';
// Import components
import ChatBox from "../components/ChatBox";
import { ChatMessage } from "../components/ChatMessage";
// import { MessageItem } from "../components/ChatMessage";
import { AppDispatch, RootState } from "../store";
import { syncPoints } from "../store/userSlice";
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

  // Turnstile related state
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Store AbortController for current streaming request
  const streamAbortController = useRef<AbortController | null>(null);

  // Dynamically initialize Turnstile widget - create on demand using callback method
  const initTurnstileOnDemand = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Detailed check of all conditions
      console.log('🔧 Turnstile initialization check:');
      console.log('- window.turnstile exists:', !!window.turnstile);
      console.log('- turnstileContainerRef.current exists:', !!turnstileContainerRef.current);
      console.log('- Container element details:', turnstileContainerRef.current);

      if (!window.turnstile) {
        const error = new Error('Turnstile script not loaded');
        console.error('❌', error.message);
        reject(error);
        return;
      }

      if (!turnstileContainerRef.current) {
        const error = new Error('Turnstile container element not found');
        console.error('❌', error.message);
        reject(error);
        return;
      }

      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
      console.log('🔑 Turnstile configuration info:');
      console.log('- Environment variable NEXT_PUBLIC_TURNSTILE_SITE_KEY:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
      console.log('- Actual siteKey in use:', siteKey);
      console.log('- Current domain:', window.location.hostname);
      console.log('- Current full URL:', window.location.href);

      // Validate Site Key format
      if (!siteKey || (!siteKey.startsWith('0x') && !siteKey.startsWith('1x') && !siteKey.startsWith('2x') && !siteKey.startsWith('3x'))) {
        const error = new Error(`Invalid Turnstile site key format: ${siteKey}`);
        console.error('❌', error.message);
        reject(error);
        return;
      }

      // If widget exists, remove it first
      if (turnstileWidgetId) {
        try {
          window.turnstile.remove(turnstileWidgetId);
          setTurnstileWidgetId("");
        } catch (error) {
          console.warn('Failed to remove existing widget:', error);
        }
      }

      try {
        // Create new widget, rely on callback to get token
        const widgetId = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            console.log('✅ Turnstile callback received token:', token ? 'Token obtained successfully' : 'Token is empty');
            if (token) {
              resolve(token);
            } else {
              reject(new Error('Turnstile callback returned empty token'));
            }
          },
          'error-callback': () => {
            console.error('❌ Turnstile widget error callback');
            reject(new Error('Turnstile widget error'));
          },
          'expired-callback': () => {
            console.log('⏰ Turnstile token expired callback');
            reject(new Error('Turnstile token expired'));
          },
          size: 'invisible',
          theme: 'light',
          action: 'recommendCoin'
        });

        setTurnstileWidgetId(widgetId);
        console.log('Turnstile widget created with ID:', widgetId);

        // Turnstile invisible widget will automatically trigger verification, no need to manually call execute
        // Just wait for callback to be invoked

      } catch (error) {
        console.error('Failed to create Turnstile widget:', error);
        reject(error);
      }
    });
  };

  // Recommendation feature - triggered when clicking language card
  const handleRecommend = async (consultParam: string) => {
    if (!isLogin) {
      messageApi.warning("please login first");
      return;
    }

    await dispatch(syncPoints());
    if (points <= 0) {
      messageApi.warning("points not enough");
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

      // Initialize Turnstile on demand and get token
      let token = "";
      try {
        console.log('🔐 Initializing Turnstile on demand and getting token...');

        // Wait for Turnstile script to load
        if (!window.turnstile) {
          console.log('⏳ Waiting for Turnstile script to load...');

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error('❌ Turnstile script load timeout');
              reject(new Error('Turnstile script load timeout after 10 seconds'));
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                console.log('✅ Turnstile script loaded');
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // Create widget on demand and get token
        token = await initTurnstileOnDemand();
        console.log('✅ Successfully obtained Turnstile token:', token ? 'Token obtained successfully' : 'Token is empty');
      } catch (tokenError) {
        console.error('❌ Failed to get Turnstile token:', tokenError);
        messageApi.error("Human verification failed, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      if (!token) {
        console.error('❌ Turnstile token is empty');
        messageApi.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      await delayFunction()
      // Initialize empty message object for accumulating content
      let accumulatedContent = '';

      console.log('🚀 Starting to call streaming API:', consultParam);

      // Create new AbortController to control streaming request
      streamAbortController.current = new AbortController();

      // Pass token and AbortController to recommendation API
      const streamGenerator = recommend_coin_c_steaming(consultParam, token, undefined, streamAbortController.current);
      console.log('🚀 Stream generator created:', streamGenerator);
      console.log('🚀 Generator type:', typeof streamGenerator);
      console.log('🚀 Generator is AsyncGenerator:', streamGenerator[Symbol.asyncIterator] ? 'YES' : 'NO');

      console.log('🚀 Starting for await loop...');

      // Test first iteration
      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('🔧 Got iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('🔧 First next() result:', firstResult);

        if (!firstResult.done) {
          console.log('📦 First data chunk:', firstResult.value);
          // Manually handle first data chunk
          // const chunk = firstResult.value;
          // ... handling logic
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('🔧 Manual iterator test failed:', err);
      }

      for await (const chunk of streamGenerator) {
        // Check if aborted
        if (streamAbortController.current?.signal.aborted) {
          console.log('🚫 Streaming request aborted, stopping data chunk processing');
          break;
        }

        console.log('📦 -------------- Received streaming data chunk:', chunk);
        console.log('📦 --------------Data type:', typeof chunk);
        console.log('📦 --------------Data structure:', Object.keys(chunk || {}));


        // Check data structure and extract message content
        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('🔍 Processing data chunk:', chunk);

          // Handle our SSE event format
          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            // Our message event, extract answer field
            newContent = chunk.answer;
            console.log('✅ Extracted answer content:', newContent);

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
            console.log('🚀 Workflow started');
            // Don't add content, but can update status
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('🏁 Workflow finished');
            // Clear AbortController when workflow finishes
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('📝 Message ended');
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
          console.log('✅ Extracted content:', newContent);
          console.log('📝 Accumulated content length:', accumulatedContent.length);
        }
      }

    } catch (error) {
      // Check if user actively aborted request
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('✅ Streaming request aborted by user');
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

  // Turnstile Widget and AbortController cleanup
  useEffect(() => {
    return () => {
      // Cleanup streaming request AbortController
      if (streamAbortController.current) {
        streamAbortController.current.abort();
        streamAbortController.current = null;
      }

      // Cleanup Turnstile Widget
      if (turnstileWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (error) {
          console.warn('Failed to cleanup Turnstile widget:', error);
        }
      }

      console.log('Piloter component unmounted, cleanup completed');
    }
  }, [turnstileWidgetId])


  const stopCreation = () => {
    console.log('🛑 Stopping content generation');

    // 1. Stop streaming request
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
      console.log('✅ Streaming request stopped');
    }

    // 2. Reset all recommendation related states
    setLoading(false);
    setMessageChunks([]);
    setStatus('init');

    // 3. Clear Turnstile Widget (if exists)
    if (turnstileWidgetId && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
        setTurnstileWidgetId("");
        console.log('✅ Turnstile widget cleared');
      } catch (error) {
        console.warn('Failed to clear Turnstile widget:', error);
      }
    }

    // 4. Trigger text load completion event (reset typewriter effect state)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('textLoaded'));
    }

    console.log('✅ All states reset, user can start new recommendation');
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
    console.log('📊 Status changed to:', status);
  }, [status])

  // Event listener setup
  useEffect(() => {
    const handleTextLoading = () => {
      console.log('🎬 textLoading event received, setting status to generating');
      setStatus('generating')
    }

    const handleTextLoaded = () => {
      // Only respond to textLoaded event when streaming has ended
      if (!isStreamingRef.current) {
        console.log('🏁 textLoaded event received (stream ended), setting status to end');
        setStatus('end')
      } else {
        console.log('⏸️ textLoaded event received but stream is still active, ignoring');
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

      // Cleanup Turnstile Widget
      if (turnstileWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (error) {
          console.warn('Failed to cleanup Turnstile widget:', error);
        }
      }
    }
  }, [turnstileWidgetId])

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

      // Initialize Turnstile on demand and get token
      let token = "";
      try {
        console.log('🔐 Initializing Turnstile on demand and getting token...');

        // Wait for Turnstile script to load
        if (!window.turnstile) {
          console.log('⏳ Waiting for Turnstile script to load...');

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error('❌ Turnstile script load timeout');
              reject(new Error('Turnstile script load timeout after 10 seconds'));
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                console.log('✅ Turnstile script loaded');
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // Create widget on demand and get token
        token = await initTurnstileOnDemand();
        console.log('✅ Successfully obtained Turnstile token:', token ? 'Token obtained successfully' : 'Token is empty');
      } catch (tokenError) {
        console.error('❌ Failed to get Turnstile token:', tokenError);
        messageApi.error("Human verification failed, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      if (!token) {
        console.error('❌ Turnstile token is empty');
        messageApi.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      console.log('🚀 Starting to call streaming analysis API:', symbol);

      // Create new AbortController to control streaming request
      streamAbortController.current = new AbortController();

      // Pass token and AbortController to analysis API
      const streamGenerator = analyse_coin_c_steaming(`${t('agent.analyze')} ${symbol} ${coinType === 2 ? t('agent.contract') : ''}`, token, undefined, streamAbortController.current);

      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('🔧 Got iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('🔧 First next() result:', firstResult);

        if (!firstResult.done) {
          console.log('📦 First data chunk:', firstResult.value);
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('🔧 Manual iterator test failed:', err);
      }

      for await (const chunk of streamGenerator) {
        // Check if aborted
        if (streamAbortController.current?.signal.aborted) {
          console.log('🚫 Streaming request aborted, stopping data chunk processing');
          break;
        }

        console.log('📦 Received streaming data chunk:', chunk);

        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('🔍 Processing data chunk:', chunk);

          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            newContent = chunk.answer;
            console.log('✅ Extracted answer content:', newContent);

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
            console.log('🚀 Workflow started');
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('🏁 Workflow finished');
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('📝 Message ended');
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
      console.log('🎉 Streaming request completed normally');

      // Mark streaming end
      isStreamingRef.current = false;

      // Set status to end directly (don't rely on event)
      setStatus('end');

    } catch (error) {
      // Check if user actively aborted request
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('✅ Streaming request aborted by user');
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
    if (points <= 0) {
      messageApi.warning("points not enough");
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

    // Call proceedWithCoinAnalysis directly, this function will get token internally
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
      </div>

      {/* Hidden Turnstile container element */}
      <div
        id="turnstile-container-piloter"
        ref={turnstileContainerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Only load Turnstile script, don't auto-initialize widget */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async />
    </div>
  );
};

export default Page;
