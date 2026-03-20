"use client";
import { useEffect, useState } from "react";
import guideBg from "@/app/images/guide.png";
import guideBgMobile from "@/app/images/guide_bg_mobile.png";
import bot from "@/app/images/guide/bot.svg";
import HandbookCard from "./HandbookCard";
import { debounce } from "@/app/utils/common";
import { getSystemInfo } from "@/app/utils/system";
// import go from "@/app/images/guide/go.svg";
import { useTranslation } from "react-i18next";
import Image from "next/image";
export default function Guide() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(getSystemInfo().isMobile || window.innerWidth < 1024);
    const handleGetDevice = debounce(() => {
      setIsMobile(getSystemInfo().isMobile || window.innerWidth < 1024);
    }, 50);
    window.addEventListener("resize", handleGetDevice);
    return () => {
      window.removeEventListener("resize", handleGetDevice);
    };
  }, []);
  return (
    <div className="lg:h-[90vh] page-aiAgent w-[100%] flex items-center justify-center">
      <div className="page-guide lg:h-[91vh] mx-0 lg:mx-[2vh] w-[100%] flex items-center justify-center">
        <div className="w-[100%]">
          <div className="relative lg:h-[40vh] flex">
            {isMobile ? (
              <Image
                src={guideBgMobile}
                className="w-full rounded-xl object-cover"
                alt=""
              />
            ) : (
              <Image src={guideBg} className="w-full rounded-xl" alt="" />
            )}
          </div>
          <div className="mt-6 lg:mt-8 flex flex-col lg:flex-row justify-between gap-3 lg:gap-[3vh]">
            <div className="w-full lg:w-[70%] flex flex-col gap-3 lg:gap-[2vh]">
              <HandbookCard
                label={t("guide.q1label")}
                desc={t("guide.q1desc")}
                rightIcon={<></>}
              />
              <HandbookCard
                label={t("guide.q2label")}
                desc={t("guide.q2desc")}
                rightIcon={<></>}
              />
            </div>
            <div className="mb-[20px] lg:mb-0 border-2 border-solid border-black rounded-md w-full lg:w-[28%] h-[20vh] lg:h-[36vh] flex items-center justify-center bg-[#EDFFA3]">
              <Image
                src={bot}
                className="h-[90%]"
                alt="Chatbot illustration"
              ></Image>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
