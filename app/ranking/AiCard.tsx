import "./AiCard.scss";
// import icon from "../../assets/agent/icon.svg";
import chat from "@/app/images/agent/chat.svg";
import { Popover } from "antd";
import { useEffect, useState } from "react";
import { getSystemInfo } from "@/app/utils/system";
import agent from "@/app/images/agent/bot.svg";
import global from "@/app/images/agent/global.svg";
import x from "@/app/images/agent/x.svg";
import tg from "@/app/images/agent/tg.svg";
import discord from "@/app/images/agent/discord.svg";
import go from "@/app/images/agent/go.svg";
// import garyIcon from "../../assets/user/gary-icon.svg";
import activiteIcon from "@/app/images/user/ll-icon.svg";
import xz from "@/app/images/aitribe/xz.svg";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface AiCardProps {
  clickChat: () => void;
  selected: boolean;
  label: string;
  url?: string;
  profit: string;
}
const AiCard = (props: AiCardProps) => {
  const { t } = useTranslation();
  const [open] = useState(false);
  const handleOpenChange = () => {

    // setOpen(newOpen);
    props.clickChat();

  };
  const [show, setShow] = useState(false);
  const handleSetShow = () => {

    const system = getSystemInfo();
    if (system.isMobile) {
      setShow(true);
    } else {
      setShow(false);
    }
  };
  useEffect(() => {
    handleSetShow();
    window.addEventListener("resize", handleSetShow);
    return () => {
      window.removeEventListener("resize", handleSetShow);
    };
  }, []);
  return (
    <div
      className={`ai-card p-[10px] lg:p-[2vh] flex items-center justify-center w-[48%] lg:w-[31.8%] 2xl:w-[23.5%] h-[157px] mb-[10px] lg:mb-0 lg:h-[23.8vh] border-2 border-solid border-black rounded-lg hover:bg-[#cf0] ${
        props.selected ? "bg-[#cf0]" : "bg-white"
      }`}
    >
      {show ? (
        <Popover
          placement="bottom"
          trigger="click"
          open={open}
          getPopupContainer={() => document.getElementById("page-aiAgent")!}
          onOpenChange={handleOpenChange}
          content={
            <div className="w-full">
              <div>
                <div className="rounded-lg bg-[#F5FFCE] flex p-[14px]">
                  <div>
                    <div className="flex">
                      <Image
                        src={props.url ? props.url : agent}
                        className="w-[30vw] h-[30vw] rounded-full"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="flex-1 pl-[14px] flex flex-col justify-evenly">
                    <div className="flex justify-between">
                      <div className="font-bold">
                        {props.label || "LinkLayerAI"}
                      </div>
                    </div>
                    <div className="text-[12px] leading-4">
                      {t("ranking.onChainDesc")}
                    </div>
                    <div className="flex justify-start gap-[20px] mt-[10px]">
                      <a href="https://www.linklayer.ai/" target="_blank">
                        <Image src={global} className="w-[2vh]" alt="" />
                      </a>
                      <a href="https://x.com/intent/follow?screen_name=LinkLayerAI" target="_blank">
                        <Image src={x} className="w-[2vh]" alt="" />
                      </a>
                      <a href="https://t.me/linklayer_ai" target="_blank">
                        <Image src={tg} className="w-[2vh]" alt="" />
                      </a>
                      <a href="" target="_blank">
                        <Image src={discord} className="w-[2vh]" alt="" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-[58px] bg-[#E0FF65] flex gap-[14px] px-[12px] py-[8px]">
                  <div className="flex-1 text-center leading-[28px] font-bold h-[28px] flex items-center justify-center bg-white border border-solid border-black rounded-lg">
                    {t("ranking.agentNFT")} <Image src={chat} className="ml-[8px]" alt="" />
                  </div>
                  <div
                    onClick={() => props.clickChat()}
                    className="flex-1 text-center leading-[28px] font-bold h-[28px] flex items-center justify-center bg-white border border-solid border-black rounded-lg"
                  >
                    {t("ranking.agentChat")} <Image src={go} className="ml-[8px]" alt="" />
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div className="w-full">
            <div className="flex justify-start items-center">
              <div className="w-[8vh] relative">
                <Image
                  src={props.url ? props.url : activiteIcon}
                  className="w-[8vh] rounded-full"
                  alt=""
                />
                <Image src={xz} className="absolute right-0 bottom-0" alt="" />
              </div>
            </div>
            <div className="text-left font-bold mt-[0.5vh] text-[14px] lg:text-[2vh]">
              {props.label || "LinkLayerAI"}
            </div>
            <div className="total flex justify-start items-center mt-[1vh]">
              <span className="text-[14px]">{t("ranking.profitMargin")} {props.profit}</span>
              {/* <Image src={people} alt="" /> */}
            </div>
            <div className="chat-btn flex items-center justify-center mt-[1vh]" onClick={() => props.clickChat()}>

              {t("ranking.agent")}
            </div>
          </div>
        </Popover>
      ) : (
        <div className="w-full">
          <div className="flex justify-start items-center">
            <div className="w-[8vh] relative">
              <Image
                src={props.url ? props.url : activiteIcon}
                className="w-[8vh] rounded-full"
                alt=""
              />
              <Image src={xz} className="absolute right-0 bottom-0" alt="" />
            </div>
          </div>
          <div className="text-left font-bold mt-[0.5vh] text-[14px] lg:text-[2vh]">
            {props.label || "LinkLayerAI"}
          </div>
          <div className="total flex justify-start items-center mt-[1vh]">
            <span className="text-[14px]">{t("ranking.profit")} {props.profit}</span>
            {/* <Image src={people} alt="" /> */}
          </div>
          <div
           onClick={() => props.clickChat()}
            className="   chat-btn
      hidden
      group-hover:flex
      items-center
      justify-center
      mt-[1vh]
      border-2
      border-solid
      border-black
      rounded
      text-center
      bg-white
      text-base
      lg:text-lg
      font-bold
      cursor-pointer
      select-none
      leading-[4vh]
      shadow-[3px_3px_1px_0_rgba(0,0,0,1),0_0_0_0_rgba(0,0,0,0.1)]
      transition
      ease-in-out
      duration-300
      hover:translate-x-[3px]
      hover:translate-y-[3px]"
          >
            {t("ranking.agent")}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCard;
