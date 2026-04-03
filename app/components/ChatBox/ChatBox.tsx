"use client";
import React, { ReactNode } from 'react';
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

// importimage
// import agentTitle from "@/app/images/agent/agentTit.svg";
// import usa from "@/app/images/agent/usa.svg";
// import china from "@/app/images/agent/china.svg";
// import ko from "@/app/images/agent/ko.svg";
// import ja from "@/app/images/agent/ja.svg";

import chat_mark from "@/app/images/agent/chat-mark.svg";
import send from "@/app/images/agent/send.svg";
import TypeForm from "@/app/components/TypeForm";

// Language configuration type
export interface LanguageConfig {
  flag: string;
  title: string;
  readyText: string;
  consultText: string;
  consultParam: string;
}

// ChatBox property types
export interface ChatBoxProps {
  /** Chat content section */
  children: ReactNode;
  /** Custom title */
  title?: string;
  /** Login prompt text */
  loginPrompt?: string;
}

// Default language configuration
// const defaultLanguages: LanguageConfig[] = [
//   {
//     flag: usa,
//     title: "Token selection",
//     readyText: "Ready",
//     consultText: "Consult",
//     consultParam: "Trading"
//   },
//   {
//     flag: china,
//     title: "Select token",
//     readyText: "Ready",
//     consultText: "Consult",
//     consultParam: "Secondary trading"
//   },
//   {
//     flag: ko,
//     title: "토큰 선택",
//     readyText: "준비됨",
//     consultText: "문의하다",
//     consultParam: "거래"
//   },
//   {
//     flag: ja,
//     title: "トークンを選ぶ",
//     readyText: "準備完了",
//     consultText: "聞く",
//     consultParam: "とりひき"
//   }
// ];

const ChatBox: React.FC<ChatBoxProps> = ({
  children,
  loginPrompt
}) => {
  const { t } = useTranslation();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);


  return (
    <>
      {isLogin ? (
        <div className="relative w-[100%] lg:h-[100%] flex flex-1 border-[2px] border-solid border-black rounded-[8px] overflow-hidden" id="chat-box">
          <div className="w-[100%] h-[100%] bg-white">
            {/* Title bar */}
            <div className="bg-[#cf0] h-[40px] lg:h-[5vh] flex items-center justify-center">
              {/* <span className="hidden text-[12px] lg:text-[16px] lg:flex items-center justify-center font-bold gap-1 lg:gap-2">
                <Image src={agentTitle} className="h-[20px] lg:h-[30px]" alt="" />
                {title || t('agent.frameTitle')}
              </span> */}
            </div>
            
            {/* Main content area */}
            <div className="h-[74vh] lg:h-[76.5vh] flex flex-col-reverse lg:flex-col justify-between w-[100%] bg-[#f1f1f1]">
              {/* Chat content area */}
                {children}
            </div>
          </div>
        </div>
      ) : (
        // Not logged in state
        <div className="border-[2px] border-solid border-black lg:flex-1 rounded-[8px] bg-[#f1f1f1] overflow-hidden flex flex-col lg:h-[100%]">
          <div className="bg-[#cf0] h-[50px] flex justify-center items-center font-bold">
          </div>
          <div className="lg:flex-1 flex items-center justify-center bg-[white] chat-box">
            <div className="flex flex-col items-center justify-between w-[100%] h-[100%]">
              <div className="h-[350px] lg:h-[52vh] flex items-center">
                <div className="flex flex-col items-center">
                  <Image
                    src={chat_mark}
                    className="h-[140px] lg:h-auto"
                    alt=""
                  />
                  <div className="flex items-center text-[#A3A3A3] text-lg font-bold mt-[20px]">
                    {loginPrompt || (!isLogin ? t("agent.toLogin") : <TypeForm />)}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex w-[100%] px-[14px] lg:px-[20px] flex-col justify-end pb-14px lg:pb-[20px] relative">
                <textarea
                  readOnly
                  className="bg-[#f3f3f3] text-[#333] border-none h-[54px] lg:h-[6.8vh] w-[100%] rounded-[8px] p-[14px] mb-[20px] lg:mb-0 overflow-hidden font-size-14px relative text-input resize-none"
                ></textarea>
                <Image
                  src={send}
                  className="absolute right-[22px] lg:right-[28px] bottom-[30px] lg:bottom-[4vh] cursor-pointer"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;