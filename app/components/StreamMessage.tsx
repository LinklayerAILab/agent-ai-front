import { ReactNode, useEffect, useRef, useState, useMemo, memo } from "react";
import Typewriter from './Typewriter';
import { CoinItem } from "./CoinDetail";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

export interface MessageChunk {
  id: string;
  content: string;
  timestamp: number;
}

// use memo package装stopbutton，防止不必要re-render
const StopButton = memo(({ onClick }: { onClick?: () => void }) => {
  const lottieAnimation = useMemo(() => (
    <DotLottieReact
      src="https://lottie.host/79305bfb-5216-49e6-b30c-95f0871fbf64/yKlX4HP3Dl.lottie"
      loop
      autoplay
    />
  ), []);

  return (
    <div
      className="w-[40px] lg:w-[40px] lg:h-[40px] h-[40px] create-btn cursor-pointer rounded-full"
      onClick={onClick}
    >
      {lottieAnimation}
    </div>
  );
});

StopButton.displayName = 'StopButton';

export const StreamMessage = (props: {
  messages?: MessageChunk[];
  loading: boolean
  tip: string
  className?: string
  currentCoin?: CoinItem;
  initNode?: ReactNode;
  status: 'init' | 'loading' | 'generating' | 'end'
  stopCreation?: () => void
}) => {
  const [t] = useTranslation();
  const messageRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true); // 记录是否在底部
  const [isTypingComplete, setIsTypingComplete] = useState(false); // 记录打字机是否完成

  const handleStop = (e: Event) => {
    e.stopPropagation();
  }

  // checkisno滚动到bottom
  const checkIfAtBottom = () => {
    if (messageRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageRef.current;
      // 允许一定误差range（10px），避免精度issues
      const isBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isBottom);
    }
  };

  // 滚动到bottom - use requestAnimationFrame 确保 DOM updatecomplete
  const scrollToBottom = () => {
    if (messageRef.current) {
      requestAnimationFrame(() => {
        if (messageRef.current) {
          messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
      });
    }
  };

  // listen滚动event
  const handleScroll = () => {
    checkIfAtBottom();
  };

  useEffect(() => {
    const currentRef = messageRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleStop);
      currentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleStop);
        currentRef.removeEventListener('scroll', handleScroll);
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // whenmessageupdate时，ifinbottom且stateis generating or end，自动滚动
  useEffect(() => {
    if ((props.status === 'generating' || props.status === 'end') && isAtBottom) {
      // 双重 requestAnimationFrame 确保 DOM 完全render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [props.messages, props.status, isAtBottom])

  // use MutationObserver listencontentchange，实时滚动
  useEffect(() => {
    if (!messageRef.current || (props.status !== 'generating' && props.status !== 'end') || !isAtBottom) {
      return;
    }

    const observer = new MutationObserver(() => {
      if ((props.status === 'generating' || props.status === 'end') && isAtBottom) {
        scrollToBottom();
      }
    });

    observer.observe(messageRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [props.status, isAtBottom])

  const [intvalId, setIntvalId] = useState<NodeJS.Timeout>();

  const showLoader = () => {
    if (intvalId) {
      clearInterval(intvalId);
    }
    let ptg = -2;
    const interval = setInterval(() => {
      if (ptg < 94) {
        ptg += 2;
      }
    }, 350);
    setIntvalId(interval);
    return interval;
  };

  useEffect(() => {
    if (props.loading) {
      showLoader();
    } else {
      if (intvalId) {
        clearInterval(intvalId);
        setIntvalId(undefined);
      }
    }
  }, [props.loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    localStorage.setItem('showCreateCollectionTip', 'true');
    setOpen(false)
  }

  useEffect(() => {
    if ((props.status === 'loading' || props.status === 'generating') && !localStorage.getItem('showCreateCollectionTip')) {
      setOpen(true)
    }

    const handleTextLoaded = () => {
      setOpen(false);
      setIsTypingComplete(true); // 打字机完成时设置标志
    };

    window.addEventListener('textLoaded', handleTextLoaded);
    return () => {
      window.removeEventListener('textLoaded', handleTextLoaded);
    }
  }, [props.status])

  // when status 变for loading or generating 时，reset打字completestate
  useEffect(() => {
    if (props.status === 'loading' || props.status === 'generating') {
      setIsTypingComplete(false);
    }
  }, [props.status])

  // CheckisnoDisplaystopbutton：onlyin loading/generating state，or者 end state但打字机还未complete时Display
  const showStopButton = props.status === 'loading' || props.status === 'generating' || (props.status === 'end' && !isTypingComplete);

  return (
    <div className="relative h-[100%]">
      <div
        ref={messageRef}
        className={`flex flex-col ${props.status === 'init' ? 'bg-[white]' :'bg-white'} gap-8 ${props.className || 'h-[54vh]'} w-full flex-1 ${props.messages?.length ? 'overflow-y-auto' : ''} lg:h-[56.2vh] overflow-x-hidden rounded-[4px]`}
      >
        <Typewriter
          messages={props.messages}
          currentCoin={props.currentCoin}
          status={props.status}
          initNode={props.initNode}
          loadingClassName="h-[400px] lg:h-[56vh]"
          initClassName="h-[400px] lg:h-[56vh]"
          initNodeClassName="h-[400px] lg:h-[56vh]"
        />
      </div>

      {/* 始终渲染按钮，通过 CSS 控制显示/隐藏，避免卸载导致闪烁 */}
      <div
        className='absolute right-[50%] mr-[-20px] lg:mr-[0] lg:right-[20px] bottom-[20px] lg:bottom-[20px]'
        style={{
          opacity: showStopButton ? 1 : 0,
          pointerEvents: showStopButton ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-in-out'
        }}
      >
        <Popconfirm
          icon={false}
          getPopupContainer={() => document.body}
          showCancel={false}
          title={<div className="w-[180px]">{t('common.stopGenerationTip')}</div>}
          onConfirm={handleConfirm}
          open={open}
          okText={t('common.gotIt')}
        >
          <StopButton onClick={props.stopCreation} />
        </Popconfirm>
      </div>
    </div>
  );
};
