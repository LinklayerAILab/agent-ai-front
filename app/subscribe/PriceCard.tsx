import { MouseEventHandler, ReactNode } from "react";
import { useTranslation } from "react-i18next";
// import zhekou from "@/app/images/zhekou.svg";
import LLButton from "../components/LLButton";
// import Image from "next/image";
import "./PriceCard.scss";
export interface PriceData {
  title: string;
  desc: string;
  symbol: string;
  price: ReactNode;
  date: ReactNode;
  index: 1 | 2 | 3; // 1: quarter, 2: annual, 3: points
}
interface PriceCardProps {
  className?: string;
  background?: string;
  data: PriceData;
  desc: ReactNode;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  hasBtn?: boolean;
  smallTit?: string;
  index: number
}
const PriceCard = (props: PriceCardProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={`price-card border-[1px] lg:border-2 border-solid border-black rounded-lg lg:w-[100%] flex flex-col p-[2px] ${
        props.className ?? ""
      }`}
    >
      <div
        className={`b-top flex flex-col justify-around lg:justify-evenly min-h-[200px] lg:min-h-[38vh] p-[14px] lg:p-[2vh] rounded-lg ${
          props.background ?? ""
        }`}
      >
        <div className="text-[18px] lg:text-[20px] font-bold">{props.data.title}</div>
        <div className="text-[14px] lg:text-[16px]">{props.data.desc}</div>
        {props.data.price ? (
          <div className={`flex items-end h-[36px] lg:h-[4vh]`}>
            <span className="text-[16px] lg:text-[24px] leading-[30px]">
              {props.data.symbol}
            </span>
            <span className="text-[16px] lg:text-[20px] leading-[32px] font-bold mx-[4px]">
              {props.data.price}
            </span>
          </div>
        ) : (
          <div className="h-[4.5vh]"></div>
        )}

        {props.hasBtn === true && (
          <div className="flex items-center justify-center">
            <LLButton
              className={`${props.index === 1 ? "bg-[#fff]" : ""} ${props.index === 2 ? "bg-[#ccc]" : ""} text-center`}
              onClick={props.onClick}
              style={{width: "100%",display: 'block'}}
              loading={props.loading}
            >
              {props.index === 2 ? t('common.coming') :t("subscribe.subscription")}
            </LLButton>
          </div>
        )}
      </div>
      <div className="b-bottom lg:py-[14px] lg:py-[1vh] lg:h-[31vh] overflow-y-auto">
        <div className="px-[14px] lg:px-[2vh] py-[14px] lg:py-[1vh] h-[180px] lg:h-[25vh] overflow-y-auto">
          {props.desc}
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
