"use client";
import "./AiAgent.scss";
import { useEffect, useRef, useState } from "react";

import agent from "@/app/images/agent/agent.svg";

import chooseBot from "@/app/images/agent/chooseBot.svg";
import send from "@/app/images/agent/send.svg";
import radio from "@/app/images/ranking/radio.svg";
import community from "@/app/images/ranking/community.svg";
import { Drawer, Pagination } from "antd";
import { getSystemInfo } from "@/app/utils/system";
import { useTranslation } from "react-i18next";

import userIcon from "@/app/images/ranking/userIcon.svg";
import tgIcon from "@/app/images/ranking/tgIcon.svg";

import Image from "next/image";

import { RankCard } from "./RankCard";
import IconButton from "../components/IconButton";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function AiTribe() {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };

  const handleShowChat = () => {
    const system = getSystemInfo();
    if (system.isPC) {
      setOpen(false);
    }
  };
  useEffect(() => {
    handleShowChat();
    window.addEventListener("resize", handleShowChat);
    return () => {
      window.removeEventListener("resize", handleShowChat);
    };
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = [1, 2, 3, 4, 5, 6, 7];
  const handleToUpload = () => {
    router.push("/apiForm");
  };

  return (
    <div className="flex w-[100%] flex-col lg:flex-row justify-between items-center lg:h-[80vh] page-home-inner gap-[5px] lg:gap-[2vh] lg:mt-[14px] lg:mt-0 ">
      <div className="w-[calc(100vw-28px)] lg:w-[100%] h-auto lg:h-[83vh] lg:border-solid lg:border-black lg:border-2 lg:bg-[#EBEBEB] rounded-[8px] flex flex-col lg:flex-row items-center lg:p-[2vh]">
        <div className="rounded-[8px] w-[100%] lg:w-[100%] lg:h-[100%] flex flex-col lg:flex-row lg:gap-[2vh] lg:p-[0]">
          <div className="w-[100%] bg-white lg:w-[35%] overflow-hidden rounded-[8px]">
            <div className="left-card h-[100%] rounded-[8px] lg:p-[2vh] bg-white">
              <div className="bg-[#cf0] h-[56px] px-[14px] lg:px-0 lg:h-[13vh] border-[2px] border-solid border-black rounded-[8px] flex items-center">
                <div className="flex justify-between w-[100%] text-[14px] lg:text-[18px] font-bold lg:px-[18px]">
                  <div className="flex items-center gap-[10px]">
                    <Image src={userIcon} alt="" />
                    {t("ranking.newbieTrader")}
                  </div>
                  <div>0</div>
                </div>
              </div>
              <div className="h-[10px] lg:h-[1vh] relative">
                <div className="h-[10px] lg:h-[1vh] flex gap-[2px] absolute left-[22%] top-0">
                  <div className="bg-black w-[4px] bg-black h-[10px] lg:h-[1vh]"></div>
                  <div className="bg-black w-[4px] bg-black h-[10px] lg:h-[1vh]"></div>
                </div>
                <div className="h-[1vh] flex gap-[2px] absolute right-[22%] top-0">
                  <div className="bg-black w-[4px] bg-black h-[10px] lg:h-[1vh]"></div>
                  <div className="bg-black w-[4px] bg-black h-[10px] lg:h-[1vh]"></div>
                </div>
              </div>
              <div className="bg-[#BAB2FF] h-[56px] px-[14px] lg:px-0 lg:h-[13vh] border-[2px] border-solid border-black rounded-[8px] flex items-center">
                <div className="flex justify-between w-[100%] text-[14px] lg:text-[18px] font-bold lg:px-[18px]">
                  <div className="flex items-center gap-[10px]">
                    <Image src={tgIcon} alt="" />
                    {t("ranking.alphaTrader")}
                  </div>
                  <div>0</div>
                </div>
              </div>
              <div className="h-[14px] lg:h-[2vh] relative">
                <div className="h-[14px] lg:h-[2vh] flex gap-[2px] absolute left-[22%] top-0">
                  <div className="bg-black w-[4px] bg-black h-[14px] lg:h-[2vh]"></div>
                  <div className="bg-black w-[4px] bg-black h-[14px] lg:h-[2vh]"></div>
                </div>
                <div className="h-[1vh] flex gap-[2px] absolute right-[22%] top-0">
                  <div className="bg-black w-[4px] bg-black h-[14px] lg:h-[2vh]"></div>
                  <div className="bg-black w-[4px] bg-black h-[14px] lg:h-[2vh]"></div>
                </div>
              </div>
              <div className="border-[2px] border-solid border-black rounded-[8px] h-[140px] lg:h-[28vh] flex relative">
                <div className="w-[12px] h-[12px] rounded-full border-[3px] border-solid border-black bg-[#cf0] absolute left-[10px] top-[10px]"></div>
                <div className="w-[12px] h-[12px] rounded-full border-[3px] border-solid border-black bg-[#cf0] absolute right-[10px] top-[10px]"></div>
                <div className="flex-1 border-r-[2px] border-r-black border-r-solid flex items-center justify-center">
                  <div className="flex flex-col gap-[4px] lg:gap-[1vh]">
                    <div className="flex items-center justify-center">
                      <Image
                        src={radio}
                        className="h-[84px] w-[84px] lg:w-[14vh] lg:h-[14vh]"
                        alt=""
                      />
                    </div>
                    {/* <div className="flex flex-col mt-[1.5vh]">
                      <div className="text-[14px] lg:text-[18px] text-center font-bold">
                        0
                      </div>
                      <div className="text-[#444] text-[10px] lg:text-[14px] text-center">
                        {t("ranking.verifiedLonger")}
                      </div>
                    </div> */}
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col gap-[4px] lg:gap-[1vh]">
                    <div className="flex items-center justify-center">
                      <Image
                        src={community}
                        className="h-[84px] w-[84px] lg:w-[14vh] lg:h-[14vh]"
                        alt=""
                      />
                    </div>
                    {/* <div className="flex flex-col mt-[1.5vh]">
                      <div className="text-[14px] lg:text-[18px] text-center font-bold">
                        0
                      </div>
                      <div className="text-[#444] text-[10px] lg:text-[14px] text-center">
                        {t("ranking.verifiedShorter")}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div
                className="border-[2px] border-solid border-black rounded-[8px] h-[120px] lg:h-[16vh] flex mt-[18px] lg:mt-[1.4vh] items-center justify-evenly bg-[#393939] relative bottom-box-context"
                id="bottom-box"
              >
                <div className="w-[6px] h-[6px] rounded-full bg-[#cf0] left-[8px] top-[8px] absolute"></div>
                <div className="w-[6px] h-[6px] rounded-full bg-[#cf0] right-[8px] top-[8px] absolute"></div>
                <div className="w-[6px] h-[6px] rounded-full bg-[#cf0] left-[8px] bottom-[8px] absolute"></div>
                <div className="w-[6px] h-[6px] rounded-full bg-[#cf0] right-[8px] bottom-[8px] absolute"></div>
                <div className="text-[28px] text-white font-bold">
                  {t("ranking.uploadApi")}
                </div>
                <div>
                  <IconButton
                    className="flex items-center justify-center lg:w-[8vh] lg:h-[8vh]"
                    onClick={handleToUpload}
                  >
                    <PlusOutlined className="text-[24px] font-bold" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>

          <Drawer
            className="chat-drawer"
            closeIcon={<i className="i-mi-chevron-left text-[32px]"></i>}
            title={
              <div className="flex justify-center items-center gap-[6px]">
                <Image src={agent} className="h-[24px] rounded-[4px]" alt="" />
                <span className="text-[18px] font-bold">LinkLayerAI</span>
              </div>
            }
            placement="bottom"
            height={"70vh"}
            zIndex={10000}
            onClose={onClose}
            open={open}
          >
            <div className="bg-white h-[100%]">
              <div className="w-[100%] h-[75%] bg-white flex justify-center items-center rounded-[8px]">
                <div>
                  <div className="flex items-center justify-center">
                    <Image src={chooseBot} alt="" />
                  </div>
                  <div className="color-[#A3A3A3] text-center font-bold">
                    {t("common.coming")}
                    <i className="i-mi-arrow-right text-[#A3A3A3]"></i>
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  className="text-ipt-mobile h-[12vh] bg-[#F3F3F3] w-[100%] rounded-[8px] p-[1.2vh]"
                />
                <Image
                  src={send}
                  className="absolute right-[14px] top-[4vh] cursor-pointer"
                  alt=""
                />
              </div>
            </div>
          </Drawer>
          <div className="flex-1 mt-[14px] lg:mt-0 lg:p-[2vh] bg-[#EAEAEA] lg:bg-white rounded-[8px] flex flex-col gap-[1.4vh]">
            <div className="flex items-center gap-[14px]">
              <div className="bg-black rounded-t-[8px] lg:rounded-[8px] text-white flex-1 h-[52px] lg:h-[4.8vh] text-center flex items-center justify-center text-[18px] lg:text-[20px]">
                {t("ranking.alphaTraderRanking")}
              </div>
              <div className="hidden lg:block">
                <Pagination
                  simple
                  defaultCurrent={2}
                  total={50}
                  className="page-element"
                />
              </div>
            </div>
            <div className="px-[14px] pb-[14px] lg:pb-0 lg:p-0">
              <div className="mb-[14px] lg:mb-[1vh] flex justify-between font-bold text-[14px] lg:text-[16px] bg-[#cf0] h-[40px] lg:h-[6vh] border-[2px] border-solid border-black rounded-[8px] items-center px-[14px]">
                <div className="flex-1">{t("ranking.rank")}</div>
                <div className="w-[40%]">{t("ranking.address")}</div>
                <div className="flex-1 flex justify-end lg:justify-start">
                  {t("ranking.long")}
                </div>
                <div className="flex-1 flex justify-end lg:justify-start">
                  {t("ranking.short")}
                </div>
              </div>
              <div
                className="overflow-y-auto h-[390px] lg:h-[61vh] list-box"
                ref={scrollRef}
              >
                <RankCard
                  rank={"9.2K"}
                  name={"0xa3cE4f0f6c18E310D00baeeeD7542941644d5cdd"}
                  long={"0"}
                  short={"0"}
                  className="bottom-box bg-white"
                />
                {list.map((item, index) => (
                  <RankCard
                    key={index}
                    rank={item}
                    name={"0xa3cE4f0f6c18E310D00baeeeD7542941644d5cdd"}
                    long={"0"}
                    short={'0'}
                    className={`${
                      index % 2 === 0 ? "bg-[#EAEAEA]" : "bg-white"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center pt-[14px] lg:pt-0 lg:hidden">
                <Pagination
                  simple
                  defaultCurrent={2}
                  total={50}
                  className="page-element"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
