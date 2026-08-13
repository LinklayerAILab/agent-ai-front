"use client";

import React, { useEffect, useMemo, useState } from "react";

export interface LiquidTubeProps {
  level: "Healthy" | "Caution" | "Critical" | null;
  className?: string;
  h5?: boolean;
}

const SHELL_CENTER_PATH =
  "M21.5 5C26.1944 5 30 8.80558 30 13.5V66.3171C30 66.5663 30.1226 66.7988 30.3231 66.9468C33.9915 69.6554 36.3711 74.0091 36.3711 78.9189C36.3711 87.133 29.7121 93.792 21.498 93.792C13.284 93.792 6.625 87.133 6.625 78.9189C6.62503 74.0074 9.00617 69.6522 12.6767 66.9439C12.8773 66.7959 13 66.5633 13 66.314V13.5C13 8.80558 16.8056 5 21.5 5Z";

const BULB_PATH =
  "M26.2158 70.2031C29.089 71.8895 31.0331 75.0707 31.0332 78.7285C31.0332 84.1663 26.7463 88.5399 21.5 88.54C16.2536 88.54 11.9658 84.1664 11.9658 78.7285C11.9659 75.0706 13.9109 71.8895 16.7842 70.2031C17.7684 69.6254 18.5556 68.5793 18.5557 67.3096H24.4434C24.4434 68.5794 25.2315 69.6254 26.2158 70.2031Z";

const ARROW_PATH = "M29.4893 23.4346H24.4434H18.5557H13.5098L21.499 13.96L29.4893 23.4346Z";

const ARROW_BASE_Y = 23.4346;
const ARROW_TOP_CLEARANCE_Y = 4;
const TUBE_LEFT = 18.5557;
const TUBE_RIGHT = 24.4434;
const TUBE_BOTTOM = 67.3096;
const MIN_ARROW_Y = ARROW_TOP_CLEARANCE_Y;
const MAX_ARROW_Y = 43.8;
const SEAM_OVERLAP = 0.8;
const LIQUID_SCALE = 1.18;
const LIQUID_TRANSFORM = `translate(21.5 78.7285) scale(${LIQUID_SCALE}) translate(-21.5 -78.7285)`;

type LiquidLevel = NonNullable<LiquidTubeProps["level"]>;

function getLiquidState(level: LiquidLevel | null) {
  if (level === null) {
    return {
      color: "transparent",
      arrowY: MAX_ARROW_Y,
      tubeHeight: 0,
    };
  }

  if (level === "Healthy") {
    const arrowY = MIN_ARROW_Y;
    return {
      color: "#A5FFBF",
      arrowY,
      tubeHeight: Math.max(0, TUBE_BOTTOM - ARROW_BASE_Y - arrowY + SEAM_OVERLAP * 2),
    };
  }

  if (level === "Caution") {
    const arrowY = (MIN_ARROW_Y + MAX_ARROW_Y) / 2;
    return {
      color: "#E5FF7F",
      arrowY,
      tubeHeight: Math.max(0, TUBE_BOTTOM - ARROW_BASE_Y - arrowY + SEAM_OVERLAP * 2),
    };
  }

  const arrowY = MAX_ARROW_Y;
  return {
    color: "#FF888D",
    arrowY,
    tubeHeight: Math.max(0, TUBE_BOTTOM - ARROW_BASE_Y - arrowY + SEAM_OVERLAP * 2),
  };
}

export const LiquidTube: React.FC<LiquidTubeProps> = ({
  level,
  className,
  h5 = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const liquidState = useMemo(() => getLiquidState(level), [level]);

  return (
    <div
      className={`relative transition-all duration-500 ease-out will-change-transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${className ?? ""}`}
    >
      <svg
        width="43"
        height="94"
        viewBox="0 0 43 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
        role="img"
        aria-label="Market liquidity thermometer"
        data-size={h5 ? "mobile" : "desktop"}
      >
        <rect width="43" height="100" fill="rgba(248, 255, 220, var(--tw-bg-opacity, 1))" />
        <path
          d={SHELL_CENTER_PATH}
          fill="none"
          stroke="#000000"
          strokeWidth="2.57628"
          strokeLinejoin="round"
        />
        <g transform={LIQUID_TRANSFORM}>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "center bottom",
              animation: "liquidTubePulse 3.2s ease-in-out infinite",
            }}
          >
            <path d={BULB_PATH} fill={liquidState.color} style={{ transition: "fill 420ms ease" }} />
            <g transform={`translate(0 ${liquidState.arrowY})`} style={{ transition: "transform 420ms ease" }}>
              <rect
                x={TUBE_LEFT}
                y={ARROW_BASE_Y - SEAM_OVERLAP}
                width={TUBE_RIGHT - TUBE_LEFT}
                height={liquidState.tubeHeight}
                fill={liquidState.color}
                style={{ transition: "height 420ms ease, fill 420ms ease" }}
              />
              <path
                d={ARROW_PATH}
                fill={liquidState.color}
                style={{
                  transition: "fill 420ms ease, opacity 240ms ease",
                  opacity: 1,
                }}
              />
            </g>
          </g>
        </g>
        <style jsx>{`
          @keyframes liquidTubePulse {
            0% {
              filter: brightness(0.94) drop-shadow(0 0 0 rgba(229, 255, 127, 0));
              opacity: 0.78;
              transform: scaleY(0.72);
            }
            18% {
              filter: brightness(1.2) drop-shadow(0 0 8px rgba(229, 255, 127, 0.9));
              opacity: 1;
              transform: scaleY(1.22);
            }
            34% {
              filter: brightness(0.98) drop-shadow(0 0 2px rgba(229, 255, 127, 0.25));
              opacity: 0.84;
              transform: scaleY(0.82);
            }
            72% {
              filter: brightness(1.18) drop-shadow(0 0 8px rgba(229, 255, 127, 0.85));
              opacity: 1;
              transform: scaleY(1.18);
            }
            100% {
              filter: brightness(0.94) drop-shadow(0 0 0 rgba(229, 255, 127, 0));
              opacity: 0.78;
              transform: scaleY(0.72);
            }
          }
        `}</style>
      </svg>
    </div>
  );
};
