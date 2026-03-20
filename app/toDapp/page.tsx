"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import rightIcon from "@/app/images/logos/rightIcon.svg";
import Image from "next/image";
import chrome from "@/app/images/logos/chrome.svg";
import firefox from "@/app/images/logos/firefox.svg";
import safari from "@/app/images/logos/safari.svg";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useToDapp } from "@/app/hooks/useToDapp";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useRouter } from "next/navigation";
import bg from "@/app/images/toDapp/bg.svg";

import LoginButton from "../components/LoginButton";
import bot from "@/app/images/toDapp/bot.svg";
import Typewriter from "typewriter-effect";
interface TypewriterInstance {
  typeString: (string: string) => TypewriterInstance;
  pauseFor: (ms: number) => TypewriterInstance;
  deleteAll: (speed?: number) => TypewriterInstance;
  callFunction: (callback: () => void) => TypewriterInstance;
  start: () => TypewriterInstance;
  stop: () => TypewriterInstance;
}
function ToDappContent() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const baseUrl = "https://agent.linklayer.ai/";
  const toUrl = searchParams?.get("toUrl") || baseUrl;
  const backUrl = searchParams?.get("backUrl") || "/";

  const { list, handleTo } = useToDapp(toUrl);

  // listenuserloginstate
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const INVITE_CODE_KEY = "invite_code";

  // check并save invite_code parameter（参考 Connect.tsx）
  useEffect(() => {
    const extractInviteCode = () => {
      const directInviteCode = searchParams?.get("invite_code");
      if (directInviteCode) return directInviteCode;

      const toUrl = searchParams?.get("toUrl");
      if (!toUrl || typeof window === "undefined") return null;

      try {
        const decoded = decodeURIComponent(toUrl);
        const url = new URL(decoded, window.location.origin);
        return url.searchParams.get("invite_code");
      } catch {
        try {
          const url = new URL(toUrl, window.location.origin);
          return url.searchParams.get("invite_code");
        } catch {
          return null;
        }
      }
    };

    const inviteCode = extractInviteCode();
    if (inviteCode) {
      localStorage.setItem(INVITE_CODE_KEY, inviteCode);
    }
  }, [searchParams?.toString()]);

  const handleToBrowser = () => {
    window.location.href = toUrl;
  };

  // loginafter跳转到rootpath
  useEffect(() => {
    if (isLogin) {
      router.push("/");
    }
  }, [isLogin, router]);

  const [key, setKey] = useState(0);
  const typewriterRef = useRef<TypewriterInstance | null>(null);
  const text = useMemo(() => t("toDapp.typewriterText"), [t, i18n.language]);
  return (
    <>
      <div className="block lg:hidden lg:min-h-[100vh] min-w-[320px] max-w-[800px] m-auto to-dapp-page">
        <div className="xl:px-0 xl:w-5/6 max-w-[1600px] m-auto py-4">
          <div className="text-[16px] font-bold flex items-center gap-2">
            <Link href={backUrl}>
              {" "}
              <ArrowLeftOutlined /> {t("toDapp.back")}{" "}
            </Link>
          </div>
          <div className="p-4 flex flex-col gap-4 border-[2px] border-solid border-black rounded-[8px] mt-4 bg-[#EAEAEA]">
            {list.map((item) => (
              <div
                key={item.id}
                className="link-card bg-white border-[2px] border-solid border-black rounded-[8px] flex justify-between items-center py-4 px-4 gap-2"
              >
                <div className="rounded-full overflow-hidden">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex-1 font-bold">{item.title}</div>
                <div>
                  <div
                    onClick={() => handleTo(item.link, item.id)}
                    className="w-[60px] text-blue-600 underline button-small px-6 py-[5px] bg-[#cf0]"
                    style={{ borderRadius: "30px" }}
                  >
                    <Image
                      src={rightIcon}
                      alt="rightIcon"
                      width={14}
                      height={14}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="link-card bg-white border-[2px] border-solid border-black rounded-[8px] flex justify-between items-center py-4 px-4 gap-2">
              <div className="flex logos-list">
                <Image
                  src={chrome}
                  className="w-[14px] h-[14px]"
                  alt="chrome"
                ></Image>
                <Image
                  src={firefox}
                  className="w-[14px] h-[14px]"
                  alt="firefox"
                ></Image>
                <Image
                  src={safari}
                  className="w-[14px] h-[14px]"
                  alt="safari"
                ></Image>
              </div>
              <div className="flex-1 font-bold">
                {t("toDapp.openWithBrowser")}
              </div>
              <div>
                <div
                  onClick={() => handleToBrowser()}
                  className="w-[60px] text-blue-600 underline button-small px-6 py-[5px] bg-[#cf0]"
                  style={{ borderRadius: "30px" }}
                >
                  <Image
                    src={rightIcon}
                    alt="rightIcon"
                    width={14}
                    height={14}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center to-dapp-page h-full">
        <div className="flex gap-[2vh] h-[82vh] w-full">
          <div className="w-[60%] border-[2px] border-solid border-black rounded-[8px] relative overflow-hidden">
            <div className="h-[48vh] bg-[#cf0]">
              <div className="flex flex-col gap-4 items-center justify-center h-full">
                <div className="font-bold text-center text-[24px]">
                  {t("toDapp.unlockWeb3Agent")}
                </div>
                <Image
                  src={bg}
                  alt="bg"
                  className="h-[30vh] object-contain object-center"
                />
              </div>
              <div className="h-[20vh] flex items-center justify-center">
                <div className="w-[60%]">
                  <LoginButton
                    buttonText={t("toDapp.loginByWallet")}
                    buttonStyle={{ background: "#E9FF93" }}
                  />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="mx-[50px]">
                  {t("toDapp.termsAgreement")}{" "}
                  <Link
                    href="https://www.linklayer.ai/termsOfService"
                    className="text-[#409F23]"
                  >
                    {t("toDapp.termsOfService")}
                  </Link>{" "}
                  {t("toDapp.and")}{" "}
                  <Link
                    className="text-[#409F23]"
                    href="https://www.linklayer.ai/privacyPolicy"
                  >
                    {t("toDapp.privacyPolicy")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[40%] border-[2px] border-solid border-black rounded-[8px] relative overflow-hidden">
            <div className="flex items-center justify-center h-[50vh]">
              <Image
                src={bot}
                alt="bot"
                className="h-[40vh] w-[35vh] object-contain object-center"
              />
            </div>
            <div className="px-[10vh] mt-[3vh]">
              <Typewriter
                key={key}
                onInit={(typewriter: TypewriterInstance) => {
                  typewriterRef.current = typewriter;

                  typewriter
                    .typeString(text)
                    .pauseFor(2000)
                    .deleteAll(1) // 极快速度删除所有内容
                    .pauseFor(500)
                    .callFunction(() => {
                      // re-startdown一轮
                      setTimeout(() => {
                        setKey((prev) => prev + 1); // 强制重新渲染组件
                      }, 100);
                    });
                  typewriter.start();
                }}
                options={{
                  autoStart: false,
                  loop: false,
                  delay: 50,
                  wrapperClassName:
                    "text-[1.6vh] font-bold text-black text-left w-full leading-relaxed",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="lg:min-h-[100vh] min-w-[320px] max-w-[1600px] m-auto flex items-center justify-center">
          {t("toDapp.loading")}
        </div>
      }
    >
      <ToDappContent />
    </Suspense>
  );
}
