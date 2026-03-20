"use client";
import { useState, useEffect } from "react";

interface BatteryChargingProps {
  className?: string;
  cellWidth?: string;
  cellHeight?: string;
  gap?: string;
  interval?: number;
}

export function BatteryCharging({
  className = "",
  cellWidth = "w-[12px] lg:w-[2.2vh]",
  cellHeight = "h-[24px] lg:h-[4.2vh]",
  gap = "gap-[2px] lg:gap-[4px]",
  interval = 200,
}: BatteryChargingProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= 7) {
          return -1;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={`flex ${gap} items-end ${className}`}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={`${cellWidth} ${cellHeight} rounded-[2px] transition-colors duration-150`}
          style={{
            backgroundColor: activeIndex >= index ? "#cf0" : "#999999",
          }}
        />
      ))}
    </div>
  );
}
