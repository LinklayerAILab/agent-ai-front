'use client';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import html2canvas from 'html2canvas';
import trading from '@/app/images/agent/trading.svg';
import * as htmlToImage from 'html-to-image';
import { message, Progress } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Note: we intentionally avoid rehype-raw to prevent raw HTML injection (XSS).
import 'github-markdown-css/github-markdown-light.css';
import llicon from '@/app/images/agent/llicon.svg';
import ll from '@/app/images/agent/ll.svg';
import off from '@/app/images/agent/off.svg';
import biglogo from '@/app/images/agent/biglogo.svg';
import code from '@/app/images/agent/code.jpg';
import noData from '@/app/images/agent/noData.svg'

interface TypewriterProps {
    text?: string;
    messages?: MessageChunk[];
    speed?: number;
    currentCoin?: CoinItem;
    status?: 'init' | 'loading' | 'generating' | 'end';
    initNode?: ReactNode;
    loadingClassName?: string;
    initClassName?: string;
    initNodeClassName?: string;

}

import Dialog from './Dialog';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { CoinItem } from './CoinDetail';

import { MessageChunk } from './ChatMessage';

const Typewriter: React.FC<TypewriterProps> = ({ text, messages, speed = 10, currentCoin, status = 'init', initNode, loadingClassName,initClassName,initNodeClassName }) => {

    const [displayedText, setDisplayedText] = useState('');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [t] = useTranslation();

    const processedMessagesRef = useRef<Set<string>>(new Set());
    const fullTextRef = useRef<string>('');
    const currentIndexRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const prevStatusRef = useRef(status);

    // 鈽呪槄鈽?鏁版嵁鍒拌揪閫熷害杩借釜 鈽呪槄鈽?
    const messageTimestampsRef = useRef<number[]>([]);
    // 璁板綍涓婁竴娆＄殑 text 闀垮害锛岀敤浜庢娴?text 鐨勫彉鍖?
    const prevTextLengthRef = useRef<number>(0);
    // 璁板綍涓婁竴娆′娇鐢ㄧ殑妯″紡锛?text' 鎴?'messages'锛?
    const prevModeRef = useRef<'text' | 'messages' | null>(null);

    // 鏍规嵁鏁版嵁閲忓拰鐘舵€佸姩鎬佽绠楅€熷害
    const calculateDynamicSpeed = (totalLength: number, currentStatus: string = status): number => {
        const remainingLength = totalLength - currentIndexRef.current;

        // 濡傛灉 streaming 宸茬粨鏉燂紝璁＄畻鍦ㄥ浐瀹氭椂闂村唴鏄剧ず瀹岀殑閫熷害
        if (currentStatus === 'end' && remainingLength > 0) {
            // 鐩爣锛氬湪 1.5 绉掑唴鏄剧ず瀹屽墿浣欏唴瀹?
            const targetDuration = 1500; // 1.5绉?
            const calculatedSpeed = targetDuration / remainingLength;
            // 闄愬埗閫熷害鑼冨洿锛?ms - 50ms
            return Math.max(1, Math.min(50, calculatedSpeed));
        }

        // 鍩虹閫熷害
        let baseSpeed = speed;

        // 鈽呪槄鈽?鏍规嵁鏁版嵁鍒拌揪閫熷害鍔ㄦ€佽皟鏁存墦瀛楁満閫熷害 鈽呪槄鈽?
        if (messageTimestampsRef.current.length >= 2) {
            // 璁＄畻鏁版嵁鍒拌揪鐨勫钩鍧囬棿闅旀椂闂达紙姣锛?
            const timestamps = messageTimestampsRef.current;
            const totalInterval = timestamps[timestamps.length - 1] - timestamps[0];
            const avgInterval = totalInterval / (timestamps.length - 1);

            // 璁＄畻姣忕鍒拌揪鐨勫瓧绗︽暟
            const charsPerSecond = 1000 / avgInterval;


            // 鈽呪槄鈽?鍏抽敭锛氭牴鎹暟鎹祦閫熷害璋冩暣鎵撳瓧鏈洪€熷害 鈽呪槄鈽?
            // 绛栫暐锛氭墦瀛楁満閫熷害搴旇鐣ュ揩浜庢暟鎹祦閫熷害锛岄伩鍏嶇Н绱お澶氭湭鏄剧ず鍐呭
            // 浣嗕篃涓嶈兘澶揩锛岄伩鍏嶈拷涓婃暟鎹祦鏈熬鍚庡嚭鐜扮瓑寰?

            // 璁＄畻鐞嗚鎵撳瓧鏈洪€熷害锛氳鐣ュ揩浜庢暟鎹祦閫熷害
            // 濡傛灉鏁版嵁娴佹瘡 100ms 鍒拌揪 10 涓瓧绗︼紙鍗?100 瀛楃/绉掞級
            // 閭ｄ箞鎵撳瓧鏈哄簲璇ュ湪澶х害 80-90ms 鍐呮樉绀鸿繖 10 涓瓧绗︼紙鍗虫瘡涓瓧绗?8-9ms锛?

            const targetCharsPerSecond = charsPerSecond * 1.2; // 鎵撳瓧鏈洪€熷害姣旀暟鎹祦蹇?20%
            const targetMsPerChar = 1000 / targetCharsPerSecond;

            // 闄愬埗鎵撳瓧鏈洪€熷害鑼冨洿锛氭渶蹇?3ms锛屾渶鎱?30ms
            baseSpeed = Math.max(3, Math.min(30, targetMsPerChar));

        }

        // 鏍规嵁鎬诲瓧绗︽暟杩涗竴姝ュ井璋冮€熷害
        // 0-500瀛楃锛氫娇鐢ㄥ綋鍓嶈绠楃殑閫熷害
        // 500-2000瀛楃锛氶€熷害閫愭笎鍔犲揩
        // 2000-5000瀛楃锛氶€熷害鏇村揩
        // 5000+瀛楃锛氭渶蹇€熷害

        if (totalLength <= 500) {
            return baseSpeed;
        } else if (totalLength <= 2000) {
            // 绾挎€ф彃鍊硷細浠?baseSpeed 鍒?baseSpeed/2
            const ratio = (totalLength - 500) / 1500;
            return baseSpeed - (baseSpeed * 0.5 * ratio);
        } else if (totalLength <= 5000) {
            // 绾挎€ф彃鍊硷細浠?baseSpeed/2 鍒?baseSpeed/5
            const ratio = (totalLength - 2000) / 3000;
            return baseSpeed / 2 - (baseSpeed * 0.3 * ratio);
        } else {
            // 瓒呴暱鏂囨湰浣跨敤鏈€蹇€熷害
            return Math.max(1, baseSpeed / 10);
        }
    };
    const initStr = () => {
        // 纭畾褰撳墠浣跨敤鐨勬ā寮?
        const currentMode: 'text' | 'messages' | null = text ? 'text' : (messages ? 'messages' : null);

        // 妫€娴嬫ā寮忓垏鎹紝濡傛灉鍒囨崲浜嗘ā寮忥紝闇€瑕侀噸缃姸鎬?
        if (prevModeRef.current !== null && prevModeRef.current !== currentMode) {
            // 妯″紡鍒囨崲鏃堕噸缃姸鎬?
            processedMessagesRef.current.clear();
            fullTextRef.current = '';
            currentIndexRef.current = 0;
            messageTimestampsRef.current = [];
            prevTextLengthRef.current = 0;
            setDisplayedText('');
        }

        // 鏇存柊褰撳墠妯″紡
        prevModeRef.current = currentMode;

        // 浼樺厛浣跨敤messages锛屽鏋滄病鏈夊垯浣跨敤text
        const currentMessages = messages || (text ? [{ id: 'legacy', content: text, timestamp: Date.now() }] : []);



        if (currentMessages.length === 0) {
            // 濡傛灉鏄痩oading鐘舵€侊紝涓嶇珛鍗虫竻闄ゆ樉绀虹殑鍐呭锛岃loading鏄剧ず
            if (status !== 'loading') {
                setDisplayedText('');
            }
            processedMessagesRef.current.clear();
            fullTextRef.current = '';
            currentIndexRef.current = 0;
            messageTimestampsRef.current = [];
            prevTextLengthRef.current = 0;
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // 鈽呪槄鈽?鐗规畩澶勭悊 text 妯″紡锛氳褰曟椂闂存埑鐢ㄤ簬璁＄畻閫熷害 鈽呪槄鈽?
        if (text) {
            const currentTextLength = text.length;
            if (currentTextLength > prevTextLengthRef.current) {
                const charsAdded = currentTextLength - prevTextLengthRef.current;
                const currentTime = Date.now();

                // 璁板綍鏃堕棿鎴筹紙鏍规嵁澧炲姞鐨勫瓧绗︽暟璁板綍澶氫釜鏃堕棿鎴筹紝鏈€澶?0涓級
                for (let i = 0; i < Math.min(charsAdded, 10); i++) {
                    messageTimestampsRef.current.push(currentTime);
                }

                // 鍙繚鐣欐渶杩?20 涓椂闂存埑
                if (messageTimestampsRef.current.length > 20) {
                    messageTimestampsRef.current = messageTimestampsRef.current.slice(-20);
                }

                prevTextLengthRef.current = currentTextLength;

            }

            // 瀵逛簬 text 妯″紡锛岀洿鎺ヤ娇鐢?text 浣滀负瀹屾暣鏂囨湰
            fullTextRef.current = text;

            // 鍚姩鎴栫户缁墦瀛楁満鏁堟灉
            startTypewriterIfNeeded();
            return;
        }

        // 鈽呪槄鈽?messages 妯″紡锛氳褰曟椂闂存埑骞跺鐞嗘墦瀛楁満鏁堟灉 鈽呪槄鈽?
        const newMessages = currentMessages.filter(msg => !processedMessagesRef.current.has(msg.id));

        if (newMessages.length > 0) {
            // 鍙湁鍦ㄥ疄闄呮湁鏂版秷鎭椂鎵嶈Е鍙?textLoading 浜嬩欢
            window.dispatchEvent(new Event('textLoading'))

            // 鍏堟爣璁拌繖浜涙秷鎭负宸插鐞嗭紝閬垮厤閲嶅澶勭悊
            newMessages.forEach(msg => processedMessagesRef.current.add(msg.id));

            // 鈽呪槄鈽?璁板綍姣忎釜鏂版秷鎭埌杈剧殑鏃堕棿鎴?鈽呪槄鈽?
            const currentTime = Date.now();
            newMessages.forEach(() => {
                messageTimestampsRef.current.push(currentTime);
            });

            // 鍙繚鐣欐渶杩?20 涓椂闂存埑
            if (messageTimestampsRef.current.length > 20) {
                messageTimestampsRef.current = messageTimestampsRef.current.slice(-20);
            }

            // 鍚堝苟鎵€鏈夋柊娑堟伅鐨勫唴瀹?
            const newContent = newMessages.map(msg => msg.content).join('');

            if (newContent.length > 0) {

                // 鏇存柊瀹屾暣鏂囨湰
                fullTextRef.current += newContent;


                // 鍚姩鎴栫户缁墦瀛楁満鏁堟灉
                startTypewriterIfNeeded();
            }
        } else {
        }

        function startTypewriterIfNeeded() {
            // 濡傛灉宸茬粡鏈夊畾鏃跺櫒鍦ㄨ繍琛岋紝鍏堟竻闄ゅ畠浠ヤ究浣跨敤鏂伴€熷害閲嶆柊鍚姩
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // 濡傛灉褰撳墠鏄剧ず鐨勫瓧绗︽暟宸茬粡杈惧埌瀹屾暣鏂囨湰闀垮害锛屼篃涓嶉渶瑕佸惎鍔?
            if (currentIndexRef.current >= fullTextRef.current.length) {
                return;
            }

            // 璁＄畻褰撳墠鐨勫姩鎬侀€熷害锛堜紶鍏ュ綋鍓?status锛?
            const dynamicSpeed = calculateDynamicSpeed(fullTextRef.current.length, status);

            timerRef.current = setInterval(() => {
                if (currentIndexRef.current < fullTextRef.current.length) {
                    currentIndexRef.current++;
                    const currentText = fullTextRef.current.slice(0, currentIndexRef.current);
                    setDisplayedText(currentText);
                } else {
                    window.dispatchEvent(new Event('textLoaded'))
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                }
            }, dynamicSpeed);
        }
    }
    // 鐩戝惉 status 鍙樺寲锛屽綋 streaming 缁撴潫鏃惰皟鏁存墦瀛楁満閫熷害
    useEffect(() => {
        // 妫€娴?status 鏄惁浠庡叾浠栫姸鎬佸彉涓?'end'
        if (prevStatusRef.current !== 'end' && status === 'end') {

            const remainingChars = fullTextRef.current.length - currentIndexRef.current;

            if (remainingChars > 0) {
                // 杩樻湁鏈樉绀虹殑鍐呭锛岄噸鏂拌绠楅€熷害骞堕噸鍚畾鏃跺櫒
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                const finalSpeed = calculateDynamicSpeed(fullTextRef.current.length, 'end');

                timerRef.current = setInterval(() => {
                    if (currentIndexRef.current < fullTextRef.current.length) {
                        currentIndexRef.current++;
                        const currentText = fullTextRef.current.slice(0, currentIndexRef.current);
                        setDisplayedText(currentText);
                    } else {
                        window.dispatchEvent(new Event('textLoaded'));
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                    }
                }, finalSpeed);
            } else {
                // 宸茬粡鏄剧ず瀹屼簡锛岀洿鎺ヨЕ鍙戝畬鎴愪簨浠?
                window.dispatchEvent(new Event('textLoaded'));
            }
        }

        // 鏇存柊 prevStatusRef
        prevStatusRef.current = status;
    }, [status]);

    // 杩涘害鏉″姩鐢绘晥鏋?
    useEffect(() => {
        if (status === 'loading') {
            // 绔嬪嵆閲嶇疆涓?锛屼笉瑙﹀彂鍔ㄧ敾
            setProgressPercent(0);

            // 浣跨敤 setTimeout 寤惰繜鍚姩鍔ㄧ敾锛岀‘淇濋噸缃畬鎴?
            const startTimer = setTimeout(() => {
                // 10绉掑唴浠?%鍒?5%
                const totalTime = 10000; // 10绉?
                const targetPercent = 95;
                const intervalTime = 70; // 姣?0ms鏇存柊涓€娆?
                const increment = (targetPercent / totalTime) * intervalTime;

                progressTimerRef.current = setInterval(() => {
                    setProgressPercent(prev => {
                        if (prev >= targetPercent) {
                            if (progressTimerRef.current) {
                                clearInterval(progressTimerRef.current);
                                progressTimerRef.current = null;
                            }
                            return targetPercent;
                        }
                        return prev + increment;
                    });
                }, intervalTime);
            }, 50); // 寤惰繜 50ms 鍚姩鍔ㄧ敾

            return () => {
                clearTimeout(startTimer);
                if (progressTimerRef.current) {
                    clearInterval(progressTimerRef.current);
                    progressTimerRef.current = null;
                }
            };
        } else {
            // loading缁撴潫鏃剁洿鎺ヨ缃负100%锛堜笉鍦ㄨ鍥句腑锛屼笉浼氱湅鍒板姩鐢伙級
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
            }
            // 鍙湪涔嬪墠鏄?loading 鐘舵€佹椂鎵嶆洿鏂?
            setProgressPercent(0);
        }
    }, [status]);

    useEffect(() => {

        // 浼樺厛浣跨敤messages锛屽鏋滄病鏈夊垯浣跨敤text
        initStr();


        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [messages, text, speed]); // 绉婚櫎 initStr 渚濊禆锛屽洜涓哄畠鍦ㄧ粍浠跺唴閮ㄥ畾涔?


    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(displayedText);
                message.success('Copied to clipboard');
            } else {
                // 鍏煎鎬ф柟妗?
                const textArea = document.createElement('textarea');
                textArea.value = displayedText;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    message.success('Copied to clipboard');
                } catch {
                    message.error('Copy failed');
                }
                document.body.removeChild(textArea);
            }
        } catch {
            message.error('Copy failed');
        }
    };


    const handleDownload = async () => {
        const element = document.getElementById('download-ele');
        if (!element) {
            message.error(t('agent.downloadError'));
            return;
        }

        try {
            // 棰勫姞杞藉浘鐗囩‘淇濆畬鍏ㄦ覆鏌?
            const preloadImages = () => {
                return new Promise((resolve) => {
                    const images = element.querySelectorAll('img');
                    const imagePromises = Array.from(images).map(img => {
                        return new Promise((imgResolve) => {
                            if (img.complete) {
                                imgResolve(1);
                            } else {
                                img.onload = imgResolve;
                                img.onerror = imgResolve;
                            }
                        });
                    });
                    Promise.all(imagePromises).then(resolve);
                });
            };

            // 纭繚鍏冪礌鍙骞跺凡娓叉煋锛屽悓鏃堕鍔犺浇鍥剧墖
            await Promise.all([
                new Promise(resolve => setTimeout(resolve, 1000)),
                preloadImages()
            ]);

            // 寮哄埗璁剧疆code鍥剧墖鐨勫唴鑱旀牱寮忥紝纭繚html2canvas鑳芥纭瘑鍒?
            const codeImg = element.querySelector('img[src*="code"]');
            if (codeImg) {
                (codeImg as HTMLElement).style.cssText = `
                    width: 100px !important;
                    height: 100px !important;
                    object-fit: contain !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: static !important;
                    transform: none !important;
                    flex-shrink: 0 !important;
                `;
            }

            // 鑾峰彇鍏冪礌鐨勫疄闄呭昂瀵?
            const rect = element.getBoundingClientRect();


            // 灏濊瘯浣跨敤html-to-image浣滀负鏇夸唬鏂规
            let dataUrl;
            try {
                dataUrl = await htmlToImage.toPng(element, {
                    quality: 1,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    width: Math.max(element.scrollWidth, element.clientWidth, rect.width),
                    height: Math.max(element.scrollHeight, element.clientHeight, rect.height),
                });
            } catch {

                // 鍥為€€鍒癶tml2canvas
                const canvas = await html2canvas(element, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 1,
                    logging: true,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
                        // 寮哄埗澶勭悊鎵€鏈夊浘鐗?
                        const images = clonedDoc.querySelectorAll('img');
                        images.forEach(img => {
                            img.style.display = 'block';
                            img.style.visibility = 'visible';
                            img.style.opacity = '1';
                            img.style.width = img.getAttribute('width') || '100px';
                            img.style.height = img.getAttribute('height') || '100px';
                            img.style.objectFit = 'contain';
                        });
                    }
                });

                dataUrl = canvas.toDataURL('image/png');
            }

            // 妫€鏌ataUrl鏄惁鏈夋晥
            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 50) {
                console.error('Invalid dataUrl generated:', dataUrl);
                message.error(t('agent.downloadError'));
                return;
            }
   

            // PC鍜孒5锛氱粺涓€浣跨敤浼犵粺a鏍囩涓嬭浇
                try {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `linklayer-ai-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    message.success(t('agent.downloadSuccess'));
                } catch (downloadError) {
                    console.error('Download failed:', downloadError);
                    message.error(t('agent.downloadError'));
                }
        } catch (error) {
            console.error('Download failed:', error);
            message.error(t('agent.downloadError'));
        }
    };

    const handleShowDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleToTrading = () => {
        window.open(`https://www.binance.com/en/trade/${currentCoin?.symbol.split("USDT")[0]}_USDT?type=spot`, '_blank');
    }


    // 鍒ゆ柇鏄惁鏈夋秷鎭暟鎹紙鍖呮嫭 messages 鎴?text锛夋垨姝ｅ湪鍔犺浇
    const hasMessageData = useMemo(() => {
        return status === 'loading' || (messages && messages.length > 0) || (text && text.length > 0);
    }, [status, messages, text]);

    return (
        <div style={{ boxSizing: "border-box" }}>
            {status === 'init' ? (
                <div className={` flex items-center justify-center type-context ${initClassName ? initClassName : 'h-[60vh] lg:h-[73.4vh]'}`}>
                    {
                        initNode ? initNode : <Image src={noData} className='lg:h-[140px] lg:w-[140px]' alt='' />
                    }
                </div>
            ) : status === 'loading' ? (
                <div className={`${loadingClassName ? loadingClassName:'h-[60vh] lg:h-[70vh]'} lg:w-[100%] flex items-center justify-center  type-context`}>
                    <div className="flex flex-col items-center gap-4">
                        <Progress
                            key={`progress-${status}`}
                            type="circle"
                            trailColor='#eee'
                            strokeColor='#8aa90b'
                            percent={Math.round(progressPercent)}
                            size={120}
                        />
                        <div className="text-gray-600">{t('agent.analyzing')}</div>
                    </div>
                </div>
            ) : (status === 'generating' || status === 'end') && hasMessageData ? <>
            <div className="markdown-body max-w-[88vw] relative p-4 rounded-[8px] bg-[#eee] break-words text-[12px]" id="copy-ele">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        table: ({ ...props }) => (
                            <div style={{ overflowX: 'auto' }}>
                                <table {...props} />
                            </div>
                        ),
                    }}
                >
                    {displayedText}
                </ReactMarkdown>


            </div>
                <div className='flex items-center gap-2 mx-4'>
                    <div className="h-[36px] bg-white border-[1px] border-solid border-[#ccc] rounded-[8px] my-[14px] flex items-center justify-center py-2 px-2 gap-4">
                        <CopyOutlined className="cursor-pointer ]" onClick={handleCopy} />
                        <DownloadOutlined className="cursor-pointer" onClick={handleShowDialog} />

                    </div>
                    {
                        currentCoin?.symbol && <div onClick={handleToTrading} className="cursor-pointer text-[12px] h-[36px] font-bold bg-white border-[1px] border-solid border-[#ccc] rounded-[8px] my-[14px] flex items-center justify-center py-2 px-2 gap-4">
                            {t('agent.trading')}
                            <Image src={trading} alt='' className='h-[16px] w-[16px]' />
                        </div>
                    }
                </div>
            </> : (
                <div className={`${initNodeClassName ? initNodeClassName : 'h-[60vh] lg:h-[73.4vh]'} flex items-center justify-center`}>
                    {
                        initNode ? initNode : <Image src={noData} className='lg:h-[140px] lg:w-[140px] bg-[#F9FFE2]' alt='' />
                    }
                </div>
            )}


            <Dialog isOpen={isDialogOpen} onClose={handleCloseDialog}>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                        <Image src={ll} className='h-[24px] w-[130px]' alt='' />
                        <Image src={llicon} alt='' className='h-[24px]' />
                        <span className='text-[16px] font-bold'>LinkLayer AI</span>
                    </div>
                    <div>
                        <Image src={off} className='cursor-pointer h-[24px] w-[24px]' onClick={handleCloseDialog} alt='' />
                    </div>
                </div>
                <div className={`h-[65vh] lg:h-[70vh] bg-white mt-[14px] lg:mt-[20px] ${messages?.length ? 'overflow-y-scroll' : ''}`}               style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ccc #f1f5f9', // Firefox: thumb color, track color (slate-300, slate-100)
      }}>
                    <div id='download-ele' className='p-[14px] w-full min-w-[800px] max-w-none lg:w-[1000px] overflow-x-auto'>
                        <div className='flex justify-between items-center py-[20px] border-b-[1px] border-b-solid border-[#eee] pb-[14px] gap-4 min-w-0'>

                            <div className='flex items-center flex-1 min-w-0'>
                                <Image src={biglogo} className='h-[100px] lg:h-[100px] w-[100px] lg:w-[100px] flex-shrink-0' alt='' />
                                <div className='flex flex-col justify-center pl-4 min-w-0 flex-1'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='font-bold text-[14px] lg:text-[16px]'>{t('agent.scanCode')}</div>
                                        <div className='text-[12px] lg:text-[14px] text-gray-600 break-words'>
                                            {t('agent.scanTip')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex-shrink-0'>
                                <Image
                                    width={100}
                                    height={100}

                                    src={code.src}
                                    className='h-[100px] lg:h-[100px] w-[100px] lg:w-[100px] object-contain'
                                    alt=''
                                />
                            </div>
                        </div>
                        <div className='min-h-[56vh] markdown-body pb-[30px] break-words'>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ ...props }) => (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table {...props} />
                                        </div>
                                    ),
                                }}
                            >
                                {displayedText}
                            </ReactMarkdown>
                        </div>

                    </div>
                </div>
                <div className='flex justify-center items-center'>
                    <div onClick={handleDownload} className='bg-[#cf0] w-[70%] text-black text-[16px] font-bold px-[16px] py-[6px] rounded-[8px] text-center mt-[24px] cursor-pointer'>Download</div>
                </div>
            </Dialog>
        </div>
    );
};

export default Typewriter;
