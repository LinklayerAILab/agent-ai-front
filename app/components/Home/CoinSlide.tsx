"use client";
import Image from "next/image";
import date2 from "@/app/images/home/date2.svg";
import right2 from "@/app/images/home/right2.svg";
import { RightOutlined } from "@ant-design/icons";
import { formatDate } from "@/app/utils";
export const CoinSlide = (props: {
  data: {
    update_time: number;
    symbol: string;
  };
  onClick?: (data: { update_time: number; symbol: string }) => void;
}) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(props.data);
    }
  }
  return (
    <div className="bg-[#ebebeb] rounded-[8px] h-[80px] lg:h-[10vh]" onClick={handleClick}>
      <div
        className={`bg-[#cf0] border-b-[#fff] border-b-[1px] border-b-solid  h-[40px] lg:h-[5vh] flex items-center justify-center`}
      >
        <span className="flex items-center justify-between lg:justify-center px-[14px] w-[100%] gap-[6px] font-bold italic coin-holder-list">
          <Image src={right2} alt=""></Image>
          {props.data.symbol ? props.data.symbol.split("USDT")[0] : '---'}/USDT
          <RightOutlined></RightOutlined>
        </span>
      </div>
      <div className="h-[40px] lg:h-[4.8vh] flex items-center justify-center">
        <div className="flex items-center px-[14px] justify-start lg:justify-center gap-2 text-[12px] w-[100%] flex h-[100%]">
          <Image src={date2} alt=""></Image>
          <span className="flex-1 lg:flex-none text-center">
            {props.data.update_time ? formatDate(props.data.update_time,'YYYY.MM.DD HH:mm:ss') : '--------'}
          </span>
        </div>
      </div>
    </div>
  );
};
