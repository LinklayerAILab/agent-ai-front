import { useEffect, useState, useMemo, memo, useRef } from "react";
import Typewriter from "../Typewriter";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

export interface MessageChunk {
  id: string;
  content: string;
  timestamp: number;
}

// use memo package装stopbutton，防止不必要re-render
const StopButton = memo(({ onClick }: { onClick?: () => void }) => {
  const lottieAnimation = useMemo(
    () => (
      <DotLottieReact
        src="https://lottie.host/79305bfb-5216-49e6-b30c-95f0871fbf64/yKlX4HP3Dl.lottie"
        loop
        autoplay
      />
    ),
    []
  );

  return (
    <div
      className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] cursor-pointer rounded-full"
      onClick={onClick}
    >
      {lottieAnimation}
    </div>
  );
});

StopButton.displayName = "StopButton";

interface HomeAnalysisResultProps {
  messages?: MessageChunk[];
  loading: boolean;
  tip: string;
  status: "init" | "loading" | "generating" | "end";
  stopCreation?: () => void;
  currentCoin: {
    symbol: string;
    update_time: number;
  };
}

export const HomeAnalysisResult = (props: HomeAnalysisResultProps) => {
  const [t] = useTranslation();
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true); // 记录是否在底部
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    localStorage.setItem("showHomeAnalysisTip", "true");
    setOpen(false);
  };

  // checkisno滚动到bottom
  const checkIfAtBottom = () => {
    if (scrollBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollBoxRef.current;
      // 允许一定误差range（10px），避免精度issues
      const isBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isBottom);
    }
  };

  // 滚动到bottom - use requestAnimationFrame 确保 DOM updatecomplete
  const scrollToBottom = () => {
    if (scrollBoxRef.current) {
      requestAnimationFrame(() => {
        if (scrollBoxRef.current) {
          scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
        }
      });
    }
  };

  // listen滚动event
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // listen滚动event
  useEffect(() => {
    const element = scrollBoxRef.current;
    if (!element) return;

    // Add滚动eventlisten
    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // whenmessageupdate时，ifinbottom且stateis generating or end，自动滚动
  useEffect(() => {
    if (
      (props.status === "generating" || props.status === "end") &&
      isAtBottom
    ) {
      // 双重 requestAnimationFrame 确保 DOM 完全render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [props.messages, props.status, isAtBottom]);

  // use MutationObserver listencontentchange，实时滚动
  useEffect(() => {
    if (
      !scrollBoxRef.current ||
      (props.status !== "generating" && props.status !== "end") ||
      !isAtBottom
    ) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (
        (props.status === "generating" || props.status === "end") &&
        isAtBottom
      ) {
        scrollToBottom();
      }
    });

    observer.observe(scrollBoxRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [props.status, isAtBottom]);

  // when打字机complete时settingslogo
  useEffect(() => {
    const handleTextLoaded = () => {
      setOpen(false);
      setIsTypingComplete(true);
    };

    window.addEventListener("textLoaded", handleTextLoaded);
    return () => {
      window.removeEventListener("textLoaded", handleTextLoaded);
    };
  }, []);

  // when status 变for loading or generating 时，reset打字completestate
  useEffect(() => {
    if (props.status === "loading" || props.status === "generating") {
      setIsTypingComplete(false);

      // CheckisnoDisplaytip
      if (!localStorage.getItem("showHomeAnalysisTip")) {
        setOpen(true);
      }
    }
  }, [props.status]);

  // CheckisnoDisplaystopbutton
  const showStopButton =
    props.status === "loading" ||
    props.status === "generating" ||
    (props.status === "end" && !isTypingComplete);

  return (
    <div className="w-full h-full relative">
      {/* 内容区域 */}
      <div
        ref={scrollBoxRef}
        className={`flex flex-col bg-white gap-4 w-full lg:h-[47vh] overflow-y-auto overflow-x-hidden rounded-[4px]`}
        id="home-stream-data-box"
      >
        <Typewriter
          messages={props.messages}
          status={props.status}
          loadingClassName="h-[68vh] lg:h-[47vh]"
          initClassName="h-[68vh] lg:h-[47vh]"
          initNodeClassName="h-[68vh] lg:h-[47vh]"
          currentCoin={{
            symbol: props.currentCoin.symbol,
            price: 0,
            gain: 0,
            image: "",
            collect: false,
            loading: false,
          }}
        />
      </div>

      {/* 停止按钮 - 固定位置 */}
      <div
        className="absolute right-[50%] mr-[-20px] lg:mr-[0] lg:right-[20px] bottom-[20px] lg:bottom-[20px] z-10"
        style={{
          opacity: showStopButton ? 1 : 0,
          pointerEvents: showStopButton ? "auto" : "none",
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        <Popconfirm
          icon={false}
          getPopupContainer={() => document.body}
          showCancel={false}
          title={
            <div className="w-[180px]">{t("common.stopGenerationTip")}</div>
          }
          onConfirm={handleConfirm}
          open={open}
          okText={t("common.gotIt")}
        >
          <StopButton onClick={props.stopCreation} />
        </Popconfirm>
      </div>
    </div>
  );
};
