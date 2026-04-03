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

// Use memo to wrap stopbutton, prevent unnecessary re-render
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
  const [isAtBottom, setIsAtBottom] = useState(true); // Track whether at bottom
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    localStorage.setItem("showHomeAnalysisTip", "true");
    setOpen(false);
  };

  // Check if scrolled to bottom
  const checkIfAtBottom = () => {
    if (scrollBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollBoxRef.current;
      // Allow certain error range (10px) to avoid precision issues
      const isBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isBottom);
    }
  };

  // Scroll to bottom - use requestAnimationFrame to ensure DOM update complete
  const scrollToBottom = () => {
    if (scrollBoxRef.current) {
      requestAnimationFrame(() => {
        if (scrollBoxRef.current) {
          scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
        }
      });
    }
  };

  // Listen to scroll event
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // Listen to scroll event
  useEffect(() => {
    const element = scrollBoxRef.current;
    if (!element) return;

    // Add scroll event listener
    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // When message updates, if at bottom and state is generating or end, auto scroll
  useEffect(() => {
    if (
      (props.status === "generating" || props.status === "end") &&
      isAtBottom
    ) {
      // Double requestAnimationFrame to ensure complete DOM render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [props.messages, props.status, isAtBottom]);

  // Use MutationObserver to listen to content changes, real-time scroll
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

  // Set flag when typewriter completes
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

  // When status changes to loading or generating, reset typing complete state
  useEffect(() => {
    if (props.status === "loading" || props.status === "generating") {
      setIsTypingComplete(false);

      // Check whether to display tip
      if (!localStorage.getItem("showHomeAnalysisTip")) {
        setOpen(true);
      }
    }
  }, [props.status]);

  // Check whether to display stop button
  const showStopButton =
    props.status === "loading" ||
    props.status === "generating" ||
    (props.status === "end" && !isTypingComplete);

  return (
    <div className="w-full h-full relative">
      {/* Content area */}
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

      {/* Stop button - fixed position */}
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
