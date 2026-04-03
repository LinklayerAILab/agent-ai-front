"use client"
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TopProgressBarProps {
  color?: string;
  height?: number;
  duration?: number;
}

const TopProgressBar: React.FC<TopProgressBarProps> = ({
  color = '#ccff00',
  height = 3,
  duration = 500 // Increase duration to allow users to see completion animation
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;

    const startLoading = () => {
      setLoading(true);
      setProgress(10);
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            return 85; // Stop at 85%, wait for page to actually complete loading
          }
          // Use smoother progress increment
          const increment = Math.max(1, Math.random() * 8);
          return Math.min(prev + increment, 85);
        });
      }, 150); // Slightly slower update frequency
    };

    const completeLoading = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(100);
      completeTimeout = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, duration);
    };

    // Listen to all link click events
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Check if it's an external link
        const isExternalLink = url.hostname !== currentUrl.hostname;

        // Only display progress bar when link points to a different page
        if (url.pathname !== currentUrl.pathname || isExternalLink) {
          startLoading();

          // If it's an external link, set a short delay before auto-completing
          if (isExternalLink) {
            setTimeout(() => {
              completeLoading();
            }, 500);
          }
        }
      }
    };

    // Listen to browser forward and back navigation
    const handlePopState = () => {
      startLoading();
    };

    // Listen to custom route progress events
    const handleRouterProgressStart = () => {
      startLoading();
    };

    const handleRouterProgressEnd = () => {
      completeLoading();
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('routerProgressStart', handleRouterProgressStart);
    window.addEventListener('routerProgressEnd', handleRouterProgressEnd);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('routerProgressStart', handleRouterProgressStart);
      window.removeEventListener('routerProgressEnd', handleRouterProgressEnd);
      if (progressInterval) clearInterval(progressInterval);
      if (completeTimeout) clearTimeout(completeTimeout);
    };
  }, [duration]);

  // Handle path change - wait for page to actually complete loading
  useEffect(() => {
    if (loading) {
      // Give page more time to complete load, including data fetch and render
      const minLoadingTime = 800; // Minimum loading time
      const maxLoadingTime = 3000; // Maximum loading time

      let isCompleted = false;

      // Check if page is truly fully loaded function
      const checkPageReady = () => {
        // Check if document is completely loaded
        const isDocumentReady = document.readyState === 'complete';

        // Check if there are active network requests (simple check)
        const hasActiveRequests = performance.getEntriesByType('navigation')
          .some((entry: PerformanceNavigationTiming) => entry.loadEventEnd === 0);

        // Check if page content has been rendered
        const hasMainContent = document.querySelector('main') ||
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.main-content') ||
                               document.body.children.length > 2; // More than 2 child elements

        // Check if there are loading state elements (common loading indicators)
        const hasLoadingIndicators = !!(
          document.querySelector('.loading') ||
          document.querySelector('[data-loading="true"]') ||
          document.querySelector('.spinner') ||
          document.querySelector('.ant-spin') ||
          document.querySelector('[aria-busy="true"]')
        );

        // Check Next.js specific loading state
        const nextJsReady = !document.querySelector('#__next-dev-overlay-root') ||
                           !document.querySelector('[data-nextjs-scroll-focus-boundary]');

        return isDocumentReady && !hasActiveRequests && hasMainContent && !hasLoadingIndicators && nextJsReady;
      };

      // Periodically check if page is ready
      const checkInterval = setInterval(() => {
        if (checkPageReady() && !isCompleted) {
          isCompleted = true;
          clearInterval(checkInterval);

          setProgress(100);
          setTimeout(() => {
            setLoading(false);
            setProgress(0);
          }, duration);
        }
      }, 50);

      // Minimum loading time guarantee
      const minTimeout = setTimeout(() => {
        if (checkPageReady() && !isCompleted) {
          isCompleted = true;
          clearInterval(checkInterval);

          setProgress(100);
          setTimeout(() => {
            setLoading(false);
            setProgress(0);
          }, duration);
        }
      }, minLoadingTime);

      // Maximum loading time fallback
      const maxTimeout = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          clearInterval(checkInterval);
          
          setProgress(100);
          setTimeout(() => {
            setLoading(false);
            setProgress(0);
          }, duration);
        }
      }, maxLoadingTime);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(minTimeout);
        clearTimeout(maxTimeout);
      };
    }
  }, [pathname, loading, duration]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: color,
          transition: `width 0.2s ease-out`,
          width: `${progress}%`,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
};

export default TopProgressBar;