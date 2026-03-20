import React from "react";
import icon1 from "@/app/images/agent/icon1.svg";
import icon2 from "@/app/images/agent/icon2.svg";
import icon3 from "@/app/images/agent/icon3.svg";
import btnBox from "@/app/images/agent/btnBox.svg";
import "./SendStatus.scss";
import { message } from "antd";
import Image from "next/image";
import { useTranslation } from "react-i18next";
const SendStatus = (props: { selected: string }) => {
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const handleClick = () => {
    // Handle the click event here
    messageApi.warning({
      content: t("exchange.comingSoon"),
      duration: 2,
    });
  };
  return (
    <div
      className={`h-[40vh] lg:h-[40vh] rounded-[8px] p-[2vh]  flex flex-col justify-between ${
        props.selected === "1"
          ? "bg-[#F9FFE2]"
          : "bg-[white] border-[1px] border-[#ccc] border-solid"
      }`}
    >
      {messageContext}
      <div className="flex flex-col gap-[1vh] pt-[2vh] text-[12px] font-bold">
        <div className="flex justify-between items-center mb-[2vh] lg:mb-[2vh] rounded-[8px] border-[1px] border-solid border-[#999] px-[16px] bg-white h-[5vh] lg:h-[4vh]">
          <div>
            <Image src={icon1} alt="icon1"></Image>
          </div>
          <div className="flex-1 flex justify-center">{t("exchange.approved")}</div>
        </div>
        <div className="flex justify-between items-center mb-[2vh] lg:mb-[2vh] rounded-[8px] border-[1px] border-solid border-[#999] px-[16px] bg-white h-[5vh] lgh-[4vh]">
          <div>
            <Image src={icon2} alt="icon1"></Image>
          </div>
          <div className="flex-1 flex justify-center">{t("exchange.gasFee")}</div>
        </div>
        <div className="flex justify-between items-center mb-[2vh] lg:mb-[2vh] rounded-[8px] border-[1px] border-solid border-[#999] px-[16px] bg-white h-[5vh] lgh-[4vh]">
          <div>
            <Image src={icon3} alt="icon1"></Image>
          </div>
          <div className="flex-1 flex justify-center">{t("exchange.exchangeRate")}</div>
        </div>
      </div>
      <div className="flex justify-center items-center relative">
        <div className="relative">
          <div
            onClick={handleClick}
            className="confirmBtn w-[40px] h-[28px] rounded-[26px/18px] border-solid button-cj border-[2px] border-black bg-[#ccc]  absolute left-[33px] top-[0px]"
          ></div>

          <Image src={btnBox} alt="btnBox" />
        </div>
      </div>
    </div>
  );
};

export default SendStatus;
