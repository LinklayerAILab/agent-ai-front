"use client";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import "./NotificationCarousel.scss";

export interface NotificationCarouselProps {
  children: ReactNode[];
  interval?: number; // Carousel interval time (milliseconds), default 3000ms
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

    // Clear previous timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // If paused, don't start timer
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setIsTransitioning(true);

      // Update index and reset animation state after animation completes
      animationTimerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % children.length);
        setIsTransitioning(false);
      }, 500); // Consistent with animation duration
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

  // If only one child element, no need for carousel
  if (children.length === 1) {
    return <div className={`notification-carousel ${className}`}>{children[0]}</div>;
  }

  // Calculate next index
  const nextIndex = (currentIndex + 1) % children.length;

  return (
    <div
      className={`notification-carousel w-[100%] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="notification-carousel-wrapper">
        {/* Currently displayed notification */}
        <div
          className={`notification-item current ${isTransitioning ? "slide-out" : ""}`}
          key={`current-${currentIndex}`}
        >
          {children[currentIndex]}
        </div>

        {/* Next notification to enter */}
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
