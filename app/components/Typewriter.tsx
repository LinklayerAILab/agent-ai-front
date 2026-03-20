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

    const messageTimestampsRef = useRef<number[]>([]);
    const prevTextLengthRef = useRef<number>(0);
    const prevModeRef = useRef<'text' | 'messages' | null>(null);

    const calculateDynamicSpeed = (totalLength: number, currentStatus: string = status): number => {
        const remainingLength = totalLength - currentIndexRef.current;

        if (currentStatus === 'end' && remainingLength > 0) {
            const targetDuration = 1500;
            const calculatedSpeed = targetDuration / remainingLength;

            return Math.max(1, Math.min(50, calculatedSpeed));
        }


        let baseSpeed = speed;


        if (messageTimestampsRef.current.length >= 2) {

            const timestamps = messageTimestampsRef.current;
            const totalInterval = timestamps[timestamps.length - 1] - timestamps[0];
            const avgInterval = totalInterval / (timestamps.length - 1);

            const charsPerSecond = 1000 / avgInterval;
            const targetCharsPerSecond = charsPerSecond * 1.2;
            const targetMsPerChar = 1000 / targetCharsPerSecond;

            baseSpeed = Math.max(3, Math.min(30, targetMsPerChar));

        }


        if (totalLength <= 500) {
            return baseSpeed;
        } else if (totalLength <= 2000) {
            const ratio = (totalLength - 500) / 1500;
            return baseSpeed - (baseSpeed * 0.5 * ratio);
        } else if (totalLength <= 5000) {
            const ratio = (totalLength - 2000) / 3000;
            return baseSpeed / 2 - (baseSpeed * 0.3 * ratio);
        } else {
            return Math.max(1, baseSpeed / 10);
        }
    };
    const initStr = () => {
        const currentMode: 'text' | 'messages' | null = text ? 'text' : (messages ? 'messages' : null);

        if (prevModeRef.current !== null && prevModeRef.current !== currentMode) {
            processedMessagesRef.current.clear();
            fullTextRef.current = '';
            currentIndexRef.current = 0;
            messageTimestampsRef.current = [];
            prevTextLengthRef.current = 0;
            setDisplayedText('');
        }

        prevModeRef.current = currentMode;

        const currentMessages = messages || (text ? [{ id: 'legacy', content: text, timestamp: Date.now() }] : []);



        if (currentMessages.length === 0) {
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

        if (text) {
            const currentTextLength = text.length;
            if (currentTextLength > prevTextLengthRef.current) {
                const charsAdded = currentTextLength - prevTextLengthRef.current;
                const currentTime = Date.now();

                for (let i = 0; i < Math.min(charsAdded, 10); i++) {
                    messageTimestampsRef.current.push(currentTime);
                }

                if (messageTimestampsRef.current.length > 20) {
                    messageTimestampsRef.current = messageTimestampsRef.current.slice(-20);
                }

                prevTextLengthRef.current = currentTextLength;

            }

            fullTextRef.current = text;

            startTypewriterIfNeeded();
            return;
        }

        const newMessages = currentMessages.filter(msg => !processedMessagesRef.current.has(msg.id));

        if (newMessages.length > 0) {
            window.dispatchEvent(new Event('textLoading'))

            newMessages.forEach(msg => processedMessagesRef.current.add(msg.id));

            const currentTime = Date.now();
            newMessages.forEach(() => {
                messageTimestampsRef.current.push(currentTime);
            });

            if (messageTimestampsRef.current.length > 20) {
                messageTimestampsRef.current = messageTimestampsRef.current.slice(-20);
            }

            const newContent = newMessages.map(msg => msg.content).join('');

            if (newContent.length > 0) {

                fullTextRef.current += newContent;


                startTypewriterIfNeeded();
            }
        } else {
        }

        function startTypewriterIfNeeded() {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (currentIndexRef.current >= fullTextRef.current.length) {
                return;
            }

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
    useEffect(() => {
        if (prevStatusRef.current !== 'end' && status === 'end') {

            const remainingChars = fullTextRef.current.length - currentIndexRef.current;

            if (remainingChars > 0) {
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
                window.dispatchEvent(new Event('textLoaded'));
            }
        }

        prevStatusRef.current = status;
    }, [status]);

    useEffect(() => {
        if (status === 'loading') {
            setProgressPercent(0);

            const startTimer = setTimeout(() => {
                const totalTime = 10000;
                const targetPercent = 95;
                const intervalTime = 70;
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
            }, 50);

            return () => {
                clearTimeout(startTimer);
                if (progressTimerRef.current) {
                    clearInterval(progressTimerRef.current);
                    progressTimerRef.current = null;
                }
            };
        } else {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
            }
            setProgressPercent(0);
        }
    }, [status]);

    useEffect(() => {

        initStr();


        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [messages, text, speed]); 


    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(displayedText);
                message.success('Copied to clipboard');
            } else {
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

            await Promise.all([
                new Promise(resolve => setTimeout(resolve, 1000)),
                preloadImages()
            ]);

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

            const rect = element.getBoundingClientRect();


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

                const canvas = await html2canvas(element, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 1,
                    logging: true,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
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

            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 50) {
                console.error('Invalid dataUrl generated:', dataUrl);
                message.error(t('agent.downloadError'));
                return;
            }
   

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
