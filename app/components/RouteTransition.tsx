"use client";
import React, { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CSSTransition, SwitchTransition, TransitionGroup } from "react-transition-group";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import "./fade-transition.scss";
import "./Menus.scss"; // Import Menus.scss to get scroll animation styles

interface RouteTransitionProps {
  children: ReactNode;
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const direction = useSelector((state: RootState) => state.pageDirection.direction);
  const nodeRef = useMemo(() => React.createRef<HTMLDivElement>(), []);

  // Determine whether to use fade-in/fade-out animation
  const shouldUseFadeAnimation = () => {
    // sendEmail and checkCaptcha pages use fade-in/fade-out animation
    const fadeRoutes = ['/sendEmail', '/checkCaptcha'];
    if (!pathname) return false;
    return fadeRoutes.includes(pathname) || 
           fadeRoutes.some(route => pathname.startsWith(route + '/')) ||
           fadeRoutes.some(route => pathname.startsWith(route + '?'));
  };

  // Dynamically determine animation type based on pathname and direction
  const getAnimationType = () => {
    const useFade = shouldUseFadeAnimation();

    if (useFade) {
      // sendEmail/checkCaptcha pages force use fade
      return { type: 'fade', timeout: 400 };
    } else if (direction) {
      // Has direction setting, use scroll animation
      return { type: direction, timeout: 300 };
    } else {
      // Default use fade
      return { type: 'fade', timeout: 400 };
    }
  };

  const { type: animationType, timeout } = getAnimationType();

  // Temporary debug information
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