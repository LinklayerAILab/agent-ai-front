"use client";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import "./NotificationCarousel.scss";

export interface NotificationCarouselProps {
  children: ReactNode[];
  interval?: number; // 轮播间隔时间（毫秒），默认3000ms
  className?: string;
}

export default function NotificationCarousel({
  children,
  interval = 3000,
  className = "",
}: NotificationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!children || children.length <= 1) return;

    // clear之before定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // ifpause，不启动定时器
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setIsTransitioning(true);

      // animationcompleteafterupdateindex并resetanimationstate
      animationTimerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % children.length);
        setIsTransitioning(false);
      }, 500); // 与动画持续时间一致
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [children, interval, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (!children || children.length === 0) {
    return null;
  }

  // ifonly一个childelement，不need轮播
  if (children.length === 1) {
    return <div className={`notification-carousel ${className}`}>{children[0]}</div>;
  }

  // Calculatedown一个index
  const nextIndex = (currentIndex + 1) % children.length;

  return (
    <div
      className={`notification-carousel w-[100%] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="notification-carousel-wrapper">
        {/* 当前显示的通知 */}
        <div
          className={`notification-item current ${isTransitioning ? "slide-out" : ""}`}
          key={`current-${currentIndex}`}
        >
          {children[currentIndex]}
        </div>

        {/* 即将进入的通知 */}
        {isTransitioning && (
          <div
            className="notification-item next slide-in"
            key={`next-${nextIndex}`}
          >
            {children[nextIndex]}
          </div>
        )}
      </div>
    </div>
  );
}
