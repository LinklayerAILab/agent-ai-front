"use client";
import bot from "@/app/images/agent/banner.png";
import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Script from "next/script";
import './page.scss';
// 导入组件
import ChatBox from "../components/ChatBox";
import { ChatMessage } from "../components/ChatMessage";
// import { Messageitem } from "../components/ChatMessage";
import { AppDispatch, RootState } from "../store";
import { syncPoints } from "../store/userSlice";
// 导入API
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

  // Turnstile 相关状态
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // 存储当前流式请求的 AbortController
  const streamAbortController = useRef<AbortController | null>(null);

  // 动态初始化 Turnstile widget - 只在需要时创建，使用 callback 方式
  const initTurnstileOnDemand = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 详细检查各项条件
      console.log('🔧 Turnstile 初始化检查:');
      console.log('- window.turnstile 存在:', !!window.turnstile);
      console.log('- turnstileContainerRef.current 存在:', !!turnstileContainerRef.current);
      console.log('- 容器元素详情:', turnstileContainerRef.current);

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
      console.log('🔑 Turnstile 配置信息:');
      console.log('- 环境变量 NEXT_PUBLIC_TURNSTILE_SITE_KEY:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
      console.log('- 实际使用的 siteKey:', siteKey);
      console.log('- 当前域名:', window.location.hostname);
      console.log('- 当前完整URL:', window.location.href);

      // 验证 Site Key 格式
      if (!siteKey || (!siteKey.startsWith('0x') && !siteKey.startsWith('1x') && !siteKey.startsWith('2x') && !siteKey.startsWith('3x'))) {
        const error = new Error(`Invalid Turnstile site key format: ${siteKey}`);
        console.error('❌', error.message);
        reject(error);
        return;
      }

      // 如果已有 widget，先删除
      if (turnstileWidgetId) {
        try {
          window.turnstile.remove(turnstileWidgetId);
          setTurnstileWidgetId("");
        } catch (error) {
          console.warn('Failed to remove existing widget:', error);
        }
      }

      try {
        // 创建新的 widget，依赖 callback 获取 token
        const widgetId = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            console.log('✅ Turnstile callback received token:', token ? 'Token获取成功' : 'Token为空');
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

        // Turnstile invisible widget 会自动触发验证，无需手动调用 execute
        // 等待 callback 被调用即可

      } catch (error) {
        console.error('Failed to create Turnstile widget:', error);
        reject(error);
      }
    });
  };

  // 推荐功能 - 点击语言卡片时触发
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

      // 按需初始化 Turnstile 并获取 token
      let token = "";
      try {
        console.log('🔐 正在按需初始化 Turnstile 并获取 token...');

        // 等待 Turnstile 脚本加载完成
        if (!window.turnstile) {
          console.log('⏳ 等待 Turnstile 脚本加载...');

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error('❌ Turnstile 脚本加载超时');
              reject(new Error('Turnstile script load timeout after 10 seconds'));
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                console.log('✅ Turnstile 脚本加载完成');
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // 按需创建 widget 并获取 token
        token = await initTurnstileOnDemand();
        console.log('✅ 成功获取 Turnstile token:', token ? 'Token获取成功' : 'Token为空');
      } catch (tokenError) {
        console.error('❌ 获取 Turnstile token 失败:', tokenError);
        messageApi.error("Human verification failed, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      if (!token) {
        console.error('❌ Turnstile token 为空');
        messageApi.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      await delayFunction()
      // 初始化一个空的消息对象用于累积内容
      let accumulatedContent = '';

      console.log('🚀 开始调用流式接口:', consultParam);

      // 创建新的 AbortController 用于控制流式请求
      streamAbortController.current = new AbortController();

      // 将 token 和 AbortController 传递给推荐接口
      const streamGenerator = recommend_coin_c_steaming(consultParam, token, undefined, streamAbortController.current);
      console.log('🚀 流式生成器已创建:', streamGenerator);
      console.log('🚀 生成器类型:', typeof streamGenerator);
      console.log('🚀 生成器是否为AsyncGenerator:', streamGenerator[Symbol.asyncIterator] ? 'YES' : 'NO');

      console.log('🚀 开始进入for await循环...');

      // 测试第一次迭代
      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('🔧 获取iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('🔧 第一次next()结果:', firstResult);

        if (!firstResult.done) {
          console.log('📦 第一个数据块:', firstResult.value);
          // 手动处理第一个数据块
          // const chunk = firstResult.value;
          // ... 处理逻辑
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('🔧 手动测试迭代器失败:', err);
      }

      for await (const chunk of streamGenerator) {
        // 检查是否被中止
        if (streamAbortController.current?.signal.aborted) {
          console.log('🚫 流式请求已被中止，停止处理数据块');
          break;
        }

        console.log('📦 -------------- 收到流式数据块:', chunk);
        console.log('📦 --------------数据类型:', typeof chunk);
        console.log('📦 --------------数据结构:', Object.keys(chunk || {}));


        // 检查数据结构并提取消息内容
        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('🔍 处理数据块:', chunk);

          // 处理我们的SSE事件格式
          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            // 我们的消息事件，提取answer字段
            newContent = chunk.answer;
            console.log('✅ 提取到answer内容:', newContent);

            // 添加新的消息块
            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now()
            };

            setMessageChunks(prev => {
              // 如果这是第一个消息块，设置状态为 'generating'
              if (prev.length === 0) {
                setStatus('generating');
              }
              return [...prev, newChunk];
            });


          } else if ('event' in chunk && chunk.event === 'workflow_started') {
            console.log('🚀 工作流开始');
            // 不添加内容，但可以更新状态
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('🏁 工作流完成');
            // 工作流完成时清除 AbortController
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('📝 消息结束');
            // 消息结束时也清除 AbortController
            streamAbortController.current = null;
          } else {
            // 处理其他可能的数据格式
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

        // 如果获取到新内容，累积显示
        if (newContent && newContent.trim()) {
          accumulatedContent += newContent;
          console.log('✅ 提取到内容:', newContent);
          console.log('📝 累积内容长度:', accumulatedContent.length);
        }
      }

    } catch (error) {
      // 检查是否是用户主动中止的请求
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('✅ 流式请求已被用户中止');
        return;
      }

      console.error('流式推荐失败:', error);

      // 接口异常时重置所有状态
      setLoading(false);
      setMessageChunks([]);
      setStatus('init');

      // 触发完成事件,重置打字机状态
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('textLoaded'));
      }

      // 显示错误提示
      messageApi.error(t('common.recommendFailed') || 'Recommendation failed, please try again');
    } finally {
      // 确保无论如何都清理状态
      streamAbortController.current = null;
    }
  };
  // 事件监听器设置 - 独立的useEffect，避免被其他状态影响
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

  // Turnstile Widget 和 AbortController 清理
  useEffect(() => {
    return () => {
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
          console.warn('清理 Turnstile widget 失败:', error);
        }
      }

      console.log('Piloter component unmounted, cleanup completed');
    }
  }, [turnstileWidgetId])


  const stopCreation = () => {
    console.log('🛑 停止内容生成');

    // 1. 停止流式请求
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
      console.log('✅ 流式请求已停止');
    }

    // 2. 重置所有推荐相关状态
    setLoading(false);
    setMessageChunks([]);
    setStatus('init');

    // 3. 清除 Turnstile Widget（如果存在）
    if (turnstileWidgetId && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
        setTurnstileWidgetId("");
        console.log('✅ Turnstile widget 已清除');
      } catch (error) {
        console.warn('清除 Turnstile widget 失败:', error);
      }
    }

    // 4. 触发文本加载完成事件（重置打字机效果状态）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('textLoaded'));
    }

    console.log('✅ 所有状态已重置，用户可以开始新的推荐');
  }


  const [showDetail, setShowDetail] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<{ label: string; value: string } | null>(null);

  const handleAnalize = (strategy: { label: string; value: string }) => {
    console.log('分析策略:', strategy.value);
    const { isMobile } = getSystemInfo();

    setSelectedStrategy(strategy);
    if (isMobile) {
      setShowDetail(true);
    }

    // 先清除 ChatMessage 组件内的富文本内容
    setMessageChunks([]);

    // 再调用 handleRecommend 方法
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

  // 币种分析相关状态
  const [selectCoin, setSelectCoin] = useState<CoinItem>();
  const [type, setType] = useState<number>(1); // 1-现货 2-合约
  const isStreamingRef = useRef<boolean>(false);

  // 调试：监听 status 变化
  useEffect(() => {
    console.log('📊 Status changed to:', status);
  }, [status])

  // 事件监听器设置
  useEffect(() => {
    const handleTextLoading = () => {
      console.log('🎬 textLoading event received, setting status to generating');
      setStatus('generating')
    }

    const handleTextLoaded = () => {
      // 只有在流式传输已经结束时，才响应 textLoaded 事件
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
          console.warn('清理 Turnstile widget 失败:', error);
        }
      }
    }
  }, [turnstileWidgetId])

  // 币种分析功能 - 继续执行分析的函数
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

    // 标记流式传输开始
    isStreamingRef.current = true;

    try {
      setLoading(true);

      // 按需初始化 Turnstile 并获取 token
      let token = "";
      try {
        console.log('🔐 正在按需初始化 Turnstile 并获取 token...');

        // 等待 Turnstile 脚本加载完成
        if (!window.turnstile) {
          console.log('⏳ 等待 Turnstile 脚本加载...');

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error('❌ Turnstile 脚本加载超时');
              reject(new Error('Turnstile script load timeout after 10 seconds'));
            }, 10000);

            const checkTurnstile = setInterval(() => {
              if (window.turnstile) {
                console.log('✅ Turnstile 脚本加载完成');
                clearInterval(checkTurnstile);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // 按需创建 widget 并获取 token
        token = await initTurnstileOnDemand();
        console.log('✅ 成功获取 Turnstile token:', token ? 'Token获取成功' : 'Token为空');
      } catch (tokenError) {
        console.error('❌ 获取 Turnstile token 失败:', tokenError);
        messageApi.error("Human verification failed, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      if (!token) {
        console.error('❌ Turnstile token 为空');
        messageApi.error("Verification token is empty, please try again");
        setLoading(false);
        setStatus('init');
        return;
      }

      console.log('🚀 开始调用流式分析接口:', symbol);

      // 创建新的 AbortController 用于控制流式请求
      streamAbortController.current = new AbortController();

      // 将 token 和 AbortController 传递给分析接口
      const streamGenerator = analyse_coin_c_steaming(`${t('agent.analyze')} ${symbol} ${coinType === 2 ? t('agent.contract') : ''}`, token, undefined, streamAbortController.current);

      try {
        const iterator = streamGenerator[Symbol.asyncIterator]();
        console.log('🔧 获取iterator:', iterator);
        const firstResult = await iterator.next();
        console.log('🔧 第一次next()结果:', firstResult);

        if (!firstResult.done) {
          console.log('📦 第一个数据块:', firstResult.value);
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (err) {
        console.error('🔧 手动测试迭代器失败:', err);
      }

      for await (const chunk of streamGenerator) {
        // 检查是否被中止
        if (streamAbortController.current?.signal.aborted) {
          console.log('🚫 流式请求已被中止，停止处理数据块');
          break;
        }

        console.log('📦 收到流式数据块:', chunk);

        let newContent = '';

        if (chunk && typeof chunk === 'object') {
          console.log('🔍 处理数据块:', chunk);

          if ('event' in chunk && chunk.event === 'message' && 'answer' in chunk && chunk.answer !== undefined) {
            newContent = chunk.answer;
            console.log('✅ 提取到answer内容:', newContent);

            const newChunk: MessageChunk = {
              id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: newContent,
              timestamp: Date.now()
            };

            setMessageChunks(prev => {
              // 如果这是第一个消息块，设置状态为 'generating'
              if (prev.length === 0) {
                setStatus('generating');
              }
              return [...prev, newChunk];
            });

          } else if ('event' in chunk && chunk.event === 'workflow_started') {
            console.log('🚀 工作流开始');
          } else if ('event' in chunk && chunk.event === 'workflow_finished') {
            console.log('🏁 工作流完成');
            streamAbortController.current = null;
          } else if ('event' in chunk && chunk.event === 'message_end') {
            console.log('📝 消息结束');
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

      // for 循环正常结束,说明流式请求已完成
      console.log('🎉 流式请求正常完成');

      // 标记流式传输结束
      isStreamingRef.current = false;

      // 直接设置 status 为 end（不依赖事件）
      setStatus('end');

    } catch (error) {
      // 检查是否是用户主动中止的请求
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('✅ 流式请求已被用户中止');
        return;
      }

      console.error('流式分析失败:', error);

      // 标记流式传输结束
      isStreamingRef.current = false;

      // 接口异常时重置所有状态
      setLoading(false);
      setMessageChunks([]);
      setStatus('init');

      // 触发完成事件,重置打字机状态
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('textLoaded'));
      }

      // 显示错误提示
      messageApi.error(t('common.analysisFailed') || 'Analysis failed, please try again');
    } finally {
      // 确保无论如何都清理状态
      streamAbortController.current = null;
    }
  };

  // 分析功能 - 点击consult AI时触发
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

    // 重置状态，确保每次分析前状态正确
    setStatus('init');

    if (loading) {
      setLoading(false)
    }

    // 直接调用 proceedWithCoinAnalysis，该函数内部会获取 token
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
                {/* 根据是否有选中的策略或币种显示不同的信息 */}
                {selectedStrategy ? (
                  // 显示策略信息
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
                  // 显示币种信息
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

      {/* 隐藏的 Turnstile 容器元素 */}
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

      {/* 只加载 Turnstile 脚本，不自动初始化小部件 */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async />
    </div>
  );
};

export default Page;
