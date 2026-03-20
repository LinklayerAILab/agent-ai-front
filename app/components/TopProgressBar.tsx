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
  duration = 500 // 增加持续时间，让用户能看到完成的动画
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
            return 85; // 在 85% 停止，等待页面真正加载完成
          }
          // use更平缓进度增长
          const increment = Math.max(1, Math.random() * 8);
          return Math.min(prev + increment, 85);
        });
      }, 150); // 稍微放慢更新频率
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

    // listenalllink点击event
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // checkisnoisexternallink
        const isExternalLink = url.hostname !== currentUrl.hostname;
        
        // onlywhenlink指向differentpage时only thenDisplayprogress bar
        if (url.pathname !== currentUrl.pathname || isExternalLink) {
          startLoading();
          
          // ifisexternallink，settings一个短暂delayafter自动complete
          if (isExternalLink) {
            setTimeout(() => {
              completeLoading();
            }, 500);
          }
        }
      }
    };

    // listen浏览器before进after退
    const handlePopState = () => {
      startLoading();
    };

    // listen自Define路由进度event
    const handleRouterProgressStart = () => {
      startLoading();
    };

    const handleRouterProgressEnd = () => {
      completeLoading();
    };

    // Addeventlisten
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

  // handlepathchange - awaitpage实际loadcomplete
  useEffect(() => {
    if (loading) {
      // 给page更多time来completeload，package括datafetchandrender
      const minLoadingTime = 800; // 最小加载时间
      const maxLoadingTime = 3000; // 最大加载时间
      
      let isCompleted = false;
      
      // checkpageisnotrue正loadcompletefunction
      const checkPageReady = () => {
        // checkdocumentationisno完全load
        const isDocumentReady = document.readyState === 'complete';
        
        // checkisno有正inproceednetworkrequest（简单check）
        const hasActiveRequests = performance.getEntriesByType('navigation')
          .some((entry: PerformanceNavigationTiming) => entry.loadEventEnd === 0);
        
        // checkpagecontentisno已render
        const hasMainContent = document.querySelector('main') || 
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.main-content') ||
                               document.body.children.length > 2; // 大于2个子元素
        
        // checkisno有loadstateelement（commonload指示器）
        const hasLoadingIndicators = !!(
          document.querySelector('.loading') ||
          document.querySelector('[data-loading="true"]') ||
          document.querySelector('.spinner') ||
          document.querySelector('.ant-spin') ||
          document.querySelector('[aria-busy="true"]')
        );
        
        // check Next.js 特有loadstate
        const nextJsReady = !document.querySelector('#__next-dev-overlay-root') ||
                           !document.querySelector('[data-nextjs-scroll-focus-boundary]');
        
        return isDocumentReady && !hasActiveRequests && hasMainContent && !hasLoadingIndicators && nextJsReady;
      };
      
      // 定期checkpageisno准备then绪
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
      
      // minimumloadtime保障
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
      
      // maximumloadtime兜底
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