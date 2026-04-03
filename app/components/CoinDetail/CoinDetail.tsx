"use client";
import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { Progress } from "antd";
import { LeftOutlined, ShareAltOutlined } from "@ant-design/icons";

// importimage
import jt from "@/app/images/agent/jt.svg";

// importcomponent
import SmaltImage from "../SmaltImage/SmaltImage";
import Typewriter from "../Typewriter";

// typeDefine
export interface CoinItem {
  symbol: string;
  price: number;
  gain: number;
  image: string;
  collect: boolean;
  loading?: boolean;
}

export interface CoinDetail {
  data?: {
    analyse_result?: {
      output?: {
        output?: string;
      };
    };
  };
}

export interface CoinDetailProps {
  /** Currently selected coin */
  currentCoin?: CoinItem;
  /** Details data */
  detail?: CoinDetail;
  /** Whether currently loading details */
  loading: boolean;
  /** Loading progress */
  loadingPercent: number;
  /** Close details callback */
  onClose: () => void;
  /** Container height */
  containerHeight?: string;
}

const CoinDetail: React.FC<CoinDetailProps> = ({
  currentCoin,
  detail,
  loading,
  loadingPercent,
  onClose,
  containerHeight = "h-[600px] lg:h-[72vh]"
}) => {
  const { t } = useTranslation();

  return (
    <div className={`detail-box flex flex-col w-[100%] ${containerHeight} rounded-[8px] overflow-hidden`}>
      {/* Detail header */}
      <div className="flex justify-between items-center w-[100%] text-[18px] lg:px-[14px] h-[5vh] bg-[#F3F3F3]">
        <div className="flex items-center">
          <LeftOutlined onClick={onClose} className="cursor-pointer" />
        </div>
        <div>
          <ShareAltOutlined className="cursor-pointer" />
        </div>
      </div>

      {/* Coin information */}
      <div className="flex h-[100px] lg:h-[14vh] gap-[14px] lg:gap-[2vh] bg-[#f5f5f5] mt-[1vh] lg:mx-[14px] border-[2px] border-solid border-black rounded-[8px] px-[14px]">
        <div className="flex-1 flex items-center justify-center">
          <Image
            className="w-[8vh] bg-white p-1 rounded-full overflow-hidden"
            width={80}
            height={80}
            src={`https://cdn.linklayer.ai/coinimages/${currentCoin?.image}`}
            alt=""
          />
        </div>
        <div className="w-[74%] flex items-center justify-center">
          <div className="flex-1 flex gap-[1vh] flex-col">
            <div className="flex justify-between pr-[20px] text-[18px]">
              <span className="text-box">{t('agent.price')}</span>
              <span className="text-[#8AA90B] font-bold">
                $ {currentCoin?.price}
              </span>
            </div>
            <div className="border-t-[1px] border-t-solid border-t-black"></div>
            <div className="flex justify-start pr-[20px] gap-4 font-bold">
              <Link
                target="_blank"
                href={`https://www.binance.com/en/trade/${currentCoin?.symbol.split("USDT")[0]}_USDT?type=spot`}
              >
                <span className="text-[14px] cursor-pointer flex items-center gap-2 justify-center">
                  TRADING{" "}
                  <SmaltImage
                    src={jt}
                    width={20}
                    height={20}
                    alt=""
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis result */}
      <div className="flex-1 mt-[14px] lg:mt-[1vh] lg:h-[100%] border-[2px] mb-[14px] lg:mb-[0] border-solid border-black bg-white rounded-[8px] lg:mx-[14px] overflow-y-scroll h-[50vh]">
        <div className="h-[100%]">
          {loading ? (
            <div className="w-[100%] h-[100%] flex justify-center py-20 items-center">
              <div>
                <div className="flex items-center justify-center">
                  <Progress
                    percent={loadingPercent}
                    type="circle"
                    strokeColor={"#7A9900"}
                    size={"small"}
                  />
                </div>
                <div className="flex items-center justify-center text-[#7A9900] text-[12px] mt-2">
                  {`Analyzing ${currentCoin?.symbol}, please wait...`}
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[30vh] overflow-auto html-box rounded-[8px] overflow-hidden">
              <Typewriter text={detail?.data?.analyse_result?.output?.output || ""} currentCoin={currentCoin} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;