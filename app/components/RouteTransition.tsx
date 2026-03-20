"use client";
import React, { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CSSTransition, SwitchTransition, TransitionGroup } from "react-transition-group";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import "./fade-transition.scss";
import "./Menus.scss"; // 导入Menus.scss以获取scroll动画样式

interface RouteTransitionProps {
  children: ReactNode;
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const direction = useSelector((state: RootState) => state.pageDirection.direction);
  const nodeRef = useMemo(() => React.createRef<HTMLDivElement>(), []);

  // 判断是否使用渐入渐出动画
  const shouldUseFadeAnimation = () => {
    // sendEmail 和 checkCaptcha 页面使用渐入渐出动画
    const fadeRoutes = ['/sendEmail', '/checkCaptcha'];
    if (!pathname) return false;
    return fadeRoutes.includes(pathname) || 
           fadeRoutes.some(route => pathname.startsWith(route + '/')) ||
           fadeRoutes.some(route => pathname.startsWith(route + '?'));
  };

  // 动态根据pathname和direction决定动画类型
  const getAnimationType = () => {
    const useFade = shouldUseFadeAnimation();
    
    if (useFade) {
      // sendEmail/checkCaptcha 页面强制使用fade
      return { type: 'fade', timeout: 400 };
    } else if (direction) {
      // 有direction设置，使用scroll动画
      return { type: direction, timeout: 300 };
    } else {
      // 默认使用fade
      return { type: 'fade', timeout: 400 };
    }
  };
  
  const { type: animationType, timeout } = getAnimationType();
  
  // 临时调试信息
  const useFade = shouldUseFadeAnimation();
  console.log('🎬 Animation Debug:', {
    pathname,
    direction,
    useFade,
    finalAnimationType: animationType,
    timeout
  });

  return (
    <TransitionGroup className="router-wrapper">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={pathname}
          appear
          timeout={timeout}
          classNames={animationType}
          unmountOnExit
          nodeRef={nodeRef}
          onEnter={() => {
            if (nodeRef.current) {
              nodeRef.current.style.willChange = 'transform, opacity';
            }
          }}
          onEntered={() => {
            if (nodeRef.current) {
              nodeRef.current.style.willChange = 'auto';
            }
          }}
        >
          <div 
            ref={nodeRef}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </TransitionGroup>
  );
}