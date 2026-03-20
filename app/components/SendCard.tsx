import React from "react";
import greenIcon from "@/app/images/greenIcon.png";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const SendCard = (props: { selected: string }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`h-[16vh] lg:h-[14vh] rounded-[8px] p-[2vh] flex flex-col justify-between ${
        props.selected === "1"
          ? "bg-[#cf0]"
          : "bg-[#ececec] border-[1px] border-[#ccc] border-solid"
      }`}
    >
      <div className="flex justify-between">
        <div className="w-[100px] h-[5vh] bg-[white] rounded-[8px] flex items-center px-[8px]">
          <Image
            src={greenIcon}
            alt={"send icon"}
            className="my-[0.5vh] w-[3vh] h-[3vh]"
          ></Image>
          <div className="font-bold ml-[10px] text-[14px]">LLA</div>
        </div>
        <div className="text-[20px]">0</div>
      </div>
      <div className="flex justify-between text-[#666] text-[13px]">
        <div>{t("exchange.balance")}</div>
        <div>$0</div>
      </div>
    </div>
  );
};

export default SendCard;
