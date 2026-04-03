"use client";
import { useEffect, useState, useRef } from "react";

const GlobalLoading = () => {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const timeoutsRef = useRef<{ fadeOut?: NodeJS.Timeout; remove?: NodeJS.Timeout }>({});

  useEffect(() => {
    let isMounted = true; // Track component mount status

    const hideLoading = () => {
      // Delay 0.2 seconds before triggering fade-out animation
      timeoutsRef.current.fadeOut = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
          // Remove component after fade-out animation completes
          timeoutsRef.current.remove = setTimeout(() => {
            if (isMounted) {
              setVisible(false);
            }
          }, 1000); // 1000ms fade-out animation duration
        }
      }, 200); // 200ms delay
    };

    // Check if page is already loaded completely
    if (document.readyState === 'complete') {
      // Page already loaded completely, execute directly
      hideLoading();
    } else {
      // Page still loading, listen for load event
      window.addEventListener("load", hideLoading);
    }

    // Fallback: Force hide loading after maximum 5 seconds to avoid permanent display
    const maxTimeout = setTimeout(() => {
      if (isMounted && visible) {
        setLoading(false);
        setTimeout(() => {
          if (isMounted) {
            setVisible(false);
          }
        }, 1000);
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener("load", hideLoading);
      // Clear all timers
      if (timeoutsRef.current.fadeOut) clearTimeout(timeoutsRef.current.fadeOut);
      if (timeoutsRef.current.remove) clearTimeout(timeoutsRef.current.remove);
      clearTimeout(maxTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .global-loading-container {
            opacity: 1;
            transition: opacity .4s ease-out;
            pointer-events: auto;
          }

          .global-loading-container.fade-out {
            opacity: 0;
            pointer-events: none;
          }

          .global-loading-spinner {
            display: inline-block;
            width: 100px;
            height: 100px;
            will-change: transform;
            transform: translateZ(0);
          }

          .global-loading-spinner svg {
            display: block;
            shape-rendering: geometricPrecision;
          }

          .global-loading-spinner circle {
            fill: none !important;
            stroke-dasharray: 0 250;
          }
        `
      }} />
      <div
        className={`global-loading-container ${!loading ? 'fade-out' : ''}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 1)",
          zIndex: 9999,
        }}
      >
          <div style={{ textAlign: "center" }}>
            <div className="global-loading-spinner">
            <svg width={100} height={100} stroke="rgba(188, 231, 16, 1)" fill="transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={'0 250'}>
                  <animate attributeName="stroke-dasharray" dur="1.5s" calcMode="spline" values="0 150;42 150;42 150;42 150" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="1.5s" calcMode="spline" values="0;-16;-59;-59" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"/>
                </circle>
                <animateTransform attributeName="transform" type="rotate" dur="2s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalLoading;
