"use client";
import "./Menus.scss";
import "./fade-transition.scss";
import icon from "./../images/icon.svg";
import MenuButton from "./MenuButton";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import SetLang from "./SetLang";
import { debounce } from "../utils";
import { getSystemInfo } from "../utils/system";
import { usePathname } from "next/navigation";
import Connect from "./Connect";
import noticesIcon from "@/app/images/components/noices.svg";
import NotificationCarousel from "./NotificationCarousel";
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from "react-transition-group";
import { useDispatch, useSelector } from "react-redux";
import { MENU_ROUTES } from "../enum/routes";
import { setDirection } from "../store/pageDirectionSlice";
import { RootState } from "../store";
import { useRouter } from "next/navigation";
import { getNotices, NoticeItem } from "../api/board";
import Link from "next/link";
import { setShowMenu } from "../store/menuSlice";
import { ArrowRightOutlined } from "@ant-design/icons";


export interface MenusProps {
  children: ReactNode;
}

export default function Menus(props: MenusProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const showMenu = useSelector((state:RootState) => state.menus.showMenu)

  // List of pages with independent layout
  const independentLayoutPages = ["/sendEmail", "/checkCaptcha", "/bindWallet"];
  const isIndependentLayout = independentLayoutPages.some(
    (page) =>
      pathname === page ||
      pathname?.startsWith(page + "/") ||
      pathname?.startsWith(page + "?")
  );
  const dispatch = useDispatch();
  const handleGetDevice = debounce(() => {
    const w = window.innerWidth;
    if (w < 640) {
      setIsMobile(true);
      dispatch(setDirection(""));
    }
  }, 50);
  useEffect(() => {
    const w = window.innerWidth;
    if (w < 640) {
      setIsMobile(true);
      dispatch(setDirection(""));
    }

    window.addEventListener("resize", handleGetDevice);
    return () => {
      window.removeEventListener("resize", handleGetDevice);
    };
  }, [handleGetDevice, dispatch]);
  const handleTo = (path: string) => {

    if (isMobile) {
      menuClose();
    }
    const nowRouteItem = MENU_ROUTES.find((item) => item.path === pathname);
    const nextRouteItem = MENU_ROUTES.find((item) => item.path === path);
    // If current or next route is not in MENU_ROUTES, navigate directly without animation
    if (!nowRouteItem || !nextRouteItem) {
      router.push(path);
      return;
    }

    let dir = "";
    if (nowRouteItem.index > nextRouteItem.index) {
      dir = "top"; // From higher index to lower index, scroll up
    } else {
      dir = "down"; // From lower index to higher index, scroll down
    }

    const animationClass = dir === "top" ? "scroll-top" : "scroll-down";
    dispatch(setDirection(animationClass));

    if (!isMobile) {
      const t = setTimeout(() => {
        router.push(path);
        clearTimeout(t);
      }, 300);
    } else {
      router.push(path);
    }
  };
  // const [menus,setMenus] = useState()
  useEffect(() => {
    if (getSystemInfo().isMobile) {
      menuClose()
    }
  }, []);

  // Swipe left gesture to close menu
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let shouldIgnoreSwipe = false;

    const isIgnoredSwipeTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("[data-menu-swipe-ignore='true']"));
    };

    const handleTouchStart = (e: TouchEvent) => {
      shouldIgnoreSwipe = isIgnoredSwipeTarget(e.target);
      if (shouldIgnoreSwipe) return;
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (shouldIgnoreSwipe || isIgnoredSwipeTarget(e.target)) {
        shouldIgnoreSwipe = false;
        return;
      }
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipeGesture();
      shouldIgnoreSwipe = false;
    };

    const handleSwipeGesture = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50; // Minimum swipe distance

      // Check for horizontal swipe (horizontal distance greater than vertical distance)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe left: close menu
        if (deltaX < -minSwipeDistance && showMenu) {
          menuClose();
        }
        // Swipe right: open menu
        else if (deltaX > minSwipeDistance && !showMenu) {
          dispatch(setShowMenu(true));
        }
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showMenu]);

  const menuClose = () => {
      dispatch(setShowMenu(false))
  };

  const direction = useSelector(
    (state: RootState) => state.pageDirection.direction
  );
  // const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const nodeRef = useMemo(() => React.createRef<HTMLDivElement>(), []);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // setMenuActive(false);
    dispatch(setShowMenu(false))
    // Clear transition animation when switching between crypto-analysis and apiForm routes
    if (
      pathname?.startsWith("/crypto-analysis") ||
      pathname?.startsWith("/apiForm")
    ) {
      dispatch(setDirection(""));
    }
  }, [pathname, dispatch]);


  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    // Function to fetch announcement data
    const fetchNotices = async () => {
      try {
        const response = await getNotices();
        setNotices(response.data.notifications);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };

    fetchNotices();
  }, []);
  const handleSetMenu = () => {
    dispatch(setShowMenu(!showMenu))
  }
  // If it's an independent layout page, render content directly without using Menus layout
  if (isIndependentLayout) {
    return <>{props.children ?? <></>}</>;
  }

  return (
    <div className="flex w-[100vw] lg:h-[100vh] lg:overflow-hidden">
      <div className="sm:border-r-[3px] sm:border-r-black border-r-0">
        <>
          <div
            className={`menus pb-[5.4vh] lg:static hidden lg:flex flex-col justify-between h-[80vh] lg:h-[100vh]`}
          >
            <div className="flex-1 flex flex-col lg:justify-between pb-[3vh]">
              <div>
                <div className="logo mt-[21px] mb-[32px] hidden lg:block">
                  <div className="flex justify-center items-center cursor-pointer">
                    <Image
                      src={icon}
                      alt="Home Icon"
                      onClick={() => handleTo("/")}
                    ></Image>
                  </div>
                </div>
                <div className="flex h-56px items-center justify-end lg:hidden px-24px bg-#F3F3F3">
                  <div
                    className="w-24px h-24px rounded-5px border-2px border-solid border-black flex items-center justify-center"
                    onClick={menuClose}
                  >
                    <i className="i-material-symbols-close-small-outline-rounded font-size-30px"></i>
                  </div>
                </div>
                <div className="lg:px-[16px] flex flex-col lg:gap-[3vh]">
                  <MenuButton
                    key={"/"}
                    checked={pathname === "/" ? true : false}
                    onClick={() => handleTo("/")}
                  >
                    {t("menu.brc20")}
                  </MenuButton>
                   <MenuButton
                    checked={pathname === "/alpha" ? true : false}
                    onClick={() => handleTo("/alpha")}
                  >
                    <div className="flex justify-between lg:justify-center w-[100%]">
                      <div className="font-size-16px">
                        {t("menu.alpha")}
                      </div>
                      <div className="flex lg:hidden items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 1024 1024"
                        >
                          <path
                            fill="currentColor"
                            d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"
                          />
                        </svg>
                      </div>
                    </div>
                  </MenuButton>
                  <MenuButton
                    key={"/insight"}
                    checked={pathname === "/insight" ? true : false}
                    onClick={() => handleTo("/insight")}
                  >
                    {t("menu.insight")}
                  </MenuButton>
                  <MenuButton
                    key={"/piloter"}
                    checked={pathname === "/piloter" ? true : false}
                    onClick={() => handleTo("/piloter")}
                  >
                    {t("menu.piloter")}
                  </MenuButton>

                  <div className="block lg:hidden">
                    <MenuButton
                      checked={false}
                      key={"/"}
                      onClick={() => handleTo("/")}
                    >
                      <div className="flex justify-between w-[100%] items-center">
                        <div className="font-size-16px">{t("menu.home")}</div>
                        <div className="block lg:hidden">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 1024 1024"
                          >
                            <path
                              fill="currentColor"
                              d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"
                            />
                          </svg>
                        </div>
                      </div>
                    </MenuButton>
                  </div>
                                <MenuButton
                    checked={pathname === "/graph" ? true : false}
                    onClick={() => handleTo("/graph")}
                  >
                    <div className="flex justify-between lg:justify-center w-[100%]">
                      <div className="font-size-16px">
                        {t("menu.graph")}
                      </div>
                      <div className="flex lg:hidden items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 1024 1024"
                        >
                          <path
                            fill="currentColor"
                            d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"
                          />
                        </svg>
                      </div>
                    </div>
                  </MenuButton>
    
                </div>
              </div>
            </div>

            <div>
              <SetLang></SetLang>
              <div className="mt-[20px] lg:mt-[2vh] hidden lg:flex justify-center items-center lg:flex-col pb-[20px] pt-[40px] lg:pt-0 lg:pb-[0]">
                <div className="w-[100%] px-[16px] flex flex-col gap-[2vh]">
                  <div
                    className="platform-card hover:bg-[#cf0]"
                    onClick={() =>
                      window.open(
                        "https://x.com/intent/follow?screen_name=LinkLayerAI"
                      )
                    }
                  >
                    <div className="icon-box">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g fill="currentColor">
                          <path d="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              dur="0.4s"
                              values="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z;M1 2h2.5L18.5 22h-2.5zM5.5 2h2.5L23 22h-2.5z"
                            />
                          </path>
                          <path d="M3 2h5v0h-5zM16 22h5v0h-5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.4s"
                              dur="0.4s"
                              values="M3 2h5v0h-5zM16 22h5v0h-5z;M3 2h5v2h-5zM16 22h5v-2h-5z"
                            />
                          </path>
                          <path d="M18.5 2h3.5L22 2h-3.5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.5s"
                              dur="0.4s"
                              values="M18.5 2h3.5L22 2h-3.5z;M18.5 2h3.5L5 22h-3.5z"
                            />
                          </path>
                        </g>
                      </svg>
                    </div>
                    <div className="text-[12px] font-bold text-left flex-1 px-[6px]">
                      {t("menu.x")}
                    </div>
                  </div>
                  <div
                    className="platform-card hover:bg-[#cf0]"
                    onClick={() => window.open("https://t.me/linklayer_ai")}
                  >
                    <div className="icon-box">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                      >
                        <path
                          fill="currentColor"
                          d="m29.919 6.163l-4.225 19.925c-.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744l-3.106 2.988c-.344.344-.631.631-1.294.631l.463-6.556L24.919 8.72c.519-.462-.113-.719-.806-.256l-14.75 9.288l-6.35-1.988c-1.381-.431-1.406-1.381.288-2.044l24.837-9.569c1.15-.431 2.156.256 1.781 2.013z"
                        />
                      </svg>
                    </div>
                    <div className="text-[12px] font-bold text-left flex-1 px-[6px]">
                      {t("menu.telegram")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      </div>
      <div className="flex-1 lg:overflow-hidden flex lg:block">
        <div>
          <div>
            <div className="header fixed bg-[white] left-0 top-0 lg:static z-[100] h-[56px] w-[100vw] lg:w-auto xl:h-[9vh] border-b-2 border-b-black xl:pr-[21px] w-[100%]">
              <div className="header-content flex justify-between lg:justify-between items-center gap-2 h-[100%] px-[14px] lg:px-[2vh]">
                <div
                  ref={menuButtonRef}
                  onClick={handleSetMenu}
                  className={`menu relative flex justify-center flex-col gap-[5px] block lg:hidden w-[28px] h-[28px] border-[2px] border-solid border-[#000] ${
                    showMenu ? "active" : "close"
                  }`}
                >
                  <div></div>
                  <div></div>
                  {/* <div></div> */}
                </div>
                {
                  notices.length ? <div
                  className="w-[60vw] hidden lg:flex items-center"
                  id="notices"
                >
                  <NotificationCarousel interval={3000}>
                    {notices.map((notice) =>
                      notice.type === "link" ? (
                        <div key={notice.id} className="flex items-start gap-2">
                          <Link
                            className={`hover:underline flex items-center gap-2 hover:text-black notice-link h-[22px] w-[60vw]`}
                            href={notice.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={noticesIcon}
                              className="mt-[3px] flex-shrink-0"
                              alt="notices"
                            ></Image>
                            <span className="overflow-hidden whitespace-nowrap text-ellipsis flex-1">
                              {notice.content}
                            </span>
                          </Link>
                        </div>
                      ) : (
                        <div key={notice.id} className="flex items-start gap-2">
                          <Image
                            src={noticesIcon}
                            className="mt-[3px]"
                            alt="notices"
                          ></Image>
                          {notice.content}
                        </div>
                      )
                    )}
                  </NotificationCarousel>
                </div> : <div></div>
                }
        

                <div className="flex items-center gap-2 text-sm lg:text-lg font-bold">
                  <div className="flex items-center gap-2 h-[38px] lg:h-[5vh]">
                    <Connect />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`mobile-menu ${showMenu ? 'show-menu ' : ''} flex lg:hidden`}>
 
          <div
            ref={menuRef}
            className={`menu-panel flex flex-col justify-between`}
          >
            <div className="flex flex-col px-4">
              {MENU_ROUTES.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleTo(item.path)}
                  className={`h-[62px] flex items-center justify-between border-b-[1px] border-b-solid border-b-black gap-2`}
                >
                  <div className="flex items-center gap-2">
                    <Image src={item.icon} alt="" width={24} height={24}></Image>
                  <span className="text-[16px]">{t(item.name)}</span>
                    </div>
                  {
                    pathname === item.path ? <ArrowRightOutlined className="font-bold"></ArrowRightOutlined> : <></>
                  }
                </div>
              ))}
            </div>
              <div className="px-4 mb-[60px]">
                <SetLang></SetLang>
                              <div className="mt-[20px] flex justify-center items-center lg:flex-col ">
                <div className="w-[100%] flex flex-col gap-[2vh]">
                  <div
                    className="platform-card bg-white hover:bg-[#cf0]"
                    onClick={() =>
                      window.open(
                        "https://x.com/intent/follow?screen_name=LinkLayerAI"
                      )
                    }
                  >
                    <div className="icon-box">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g fill="currentColor">
                          <path d="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              dur="0.4s"
                              values="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z;M1 2h2.5L18.5 22h-2.5zM5.5 2h2.5L23 22h-2.5z"
                            />
                          </path>
                          <path d="M3 2h5v0h-5zM16 22h5v0h-5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.4s"
                              dur="0.4s"
                              values="M3 2h5v0h-5zM16 22h5v0h-5z;M3 2h5v2h-5zM16 22h5v-2h-5z"
                            />
                          </path>
                          <path d="M18.5 2h3.5L22 2h-3.5z">
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.5s"
                              dur="0.4s"
                              values="M18.5 2h3.5L22 2h-3.5z;M18.5 2h3.5L5 22h-3.5z"
                            />
                          </path>
                        </g>
                      </svg>
                    </div>
                    <div className="text-[12px] font-bold text-left flex-1 px-[6px]">
                      {t("menu.x")}
                    </div>
                  </div>
                  <div
                    className="platform-card bg-white hover:bg-[#cf0]"
                    onClick={() => window.open("https://t.me/linklayer_ai")}
                  >
                    <div className="icon-box">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                      >
                        <path
                          fill="currentColor"
                          d="m29.919 6.163l-4.225 19.925c-.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744l-3.106 2.988c-.344.344-.631.631-1.294.631l.463-6.556L24.919 8.72c.519-.462-.113-.719-.806-.256l-14.75 9.288l-6.35-1.988c-1.381-.431-1.406-1.381.288-2.044l24.837-9.569c1.15-.431 2.156.256 1.781 2.013z"
                        />
                      </svg>
                    </div>
                    <div className="text-[12px] font-bold text-left flex-1 px-[6px]">
                      {t("menu.telegram")}
                    </div>
                  </div>
                </div>
              </div>
              </div>
          </div>


        </div>
        <div
          className={`root-page-context page-con pt-[55px] lg:pt-[0] px-[14px] lg:px-[24px] h-auto lg:h-[91vh] lg:flex lg:items-center lg:justify-center mt-[0px] lg:mt-[0] ${
            pathname === "/" ? "home" : pathname?.substring(1, pathname.length)
          } ${showMenu ? 'open-menu' : ''}`}
        >
          <div className="home-layout overflow-y-scroll xl:overflow-hidden">
            <TransitionGroup className="router-wrapper">
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={pathname}
                  appear={true}
                  timeout={400}
                  classNames={direction}
                  unmountOnExit={true}
                  nodeRef={nodeRef}
                >
                  <div ref={nodeRef}>{props.children ?? <></>}</div>
                </CSSTransition>
              </SwitchTransition>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
