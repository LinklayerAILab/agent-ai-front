"use client"
import biana from "@/app/images/home/bian-a.svg";
import bianb from "@/app/images/home/bian-d.svg";
import okxa from "@/app/images/home/okx-a.svg";
import okxb from "@/app/images/home/okx-d.svg";
import bybita from "@/app/images/home/bybit-a.svg";
import bybitb from "@/app/images/home/bybit-d.svg";
import bitgeta from "@/app/images/home/bitget-a.svg";
import bitgetb from "@/app/images/home/bitget-d.svg";
import coinbasea from "@/app/images/home/coinbase-a.svg";
import coinbaseb from "@/app/images/home/coinbase-d.svg";
import gatea from "@/app/images/home/gate-a.svg";
import gateb from "@/app/images/home/gate-d.svg";
import coola from "@/app/images/home/cool-a.svg";
import coolb from "@/app/images/home/cool-d.svg";
import ma from "@/app/images/home/m-a.svg";
import mb from "@/app/images/home/m-d.svg";
import { useEffect, useState } from "react";
import Image from "next/image";
import IconButton from "../IconButton";
import { useTranslation } from "react-i18next";
import { Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import PopoverContent from "../PopoverContent";
import { get_cex } from "@/app/api/agent_c";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { setSelectCex } from "@/app/store/assetsSlice";
// import { QuestionCircleOutlined } from "@ant-design/icons";
// import { Popover } from "antd";
export interface PlatformItem {
  name: CEX_NAME;
  imgA: string;
  imgB: string;
  selected: boolean;
  disabled: boolean;
  doc_pc?: string;
  doc_mobile?: string;
}

export type CEX_NAME =
  | "Binance"
  | "OKX"
  | "Bybit"
  | "Bitget"
  | "Coinbase"
  | "Gate.io"
  | "KuCoin"
  | "MEXC";

export const platformListData: PlatformItem[] = [
  {
    name: "Binance",
    imgA: biana,
    imgB: bianb,
    selected: false,
    disabled: true,
    doc_pc: "https://doc.linklayer.ai/guide/bnpc",
    doc_mobile:
      "https://doc.linklayer.ai/guide/bnapp",
  },
  { name: "OKX", imgA: okxa, imgB: okxb, selected: false, disabled: true,
    doc_pc: "https://doc.linklayer.ai/guide/okxpc",
    doc_mobile:
      "https://doc.linklayer.ai/guide/okxapp",
   },
  {
    name: "Bybit",
    imgA: bybita,
    imgB: bybitb,
    selected: false,
    disabled: true,
    doc_pc: "https://doc.linklayer.ai/guide/bybitpc",

  },
  {
    name: "Bitget",
    imgA: bitgeta,
    imgB: bitgetb,
    selected: false,
    disabled: true,
    doc_pc: "https://doc.linklayer.ai/guide/bitgetpc",
    doc_mobile:
      "https://doc.linklayer.ai/guide/bitgetapp",
  },
  {
    name: "Coinbase",
    imgA: coinbasea,
    imgB: coinbaseb,
    selected: false,
    disabled: true,
  },
  // { name: "Upbit", imgA: upa, imgB: upb, selected: false, disabled: true },
  {
    name: "Gate.io",
    imgA: gatea,
    imgB: gateb,
    selected: false,
    disabled: true,
  },
  {
    name: "KuCoin",
    imgA: coola,
    imgB: coolb,
    selected: false,
    disabled: true,
  },
  { name: "MEXC", imgA: ma, imgB: mb, selected: false, disabled: true },
];
export default function PlatformList(props: {
  handleClick?: (item: PlatformItem) => void;
  handleUpload?: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>()
  const selectCex = useSelector((state:RootState) => state.assets.selectCex)
  const [list, setList] = useState(platformListData.map(item => item));
  const { t } = useTranslation();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const handleClick = (item: PlatformItem) => {
    if (item.disabled) return;
    const newList = list.map((item) => item);
    newList.forEach((i) => {
      i.selected = false;
    });
    const index = newList.findIndex((i) => i.name === item.name);
    newList[index].selected = true;
    setList(newList);
    dispatch(setSelectCex(newList[index].name.toLowerCase()))
    if (props.handleClick) {
      props.handleClick(item);
    }
  };

  useEffect(() => {
    if (isLogin) {
      get_cex().then((res) => {
        const arr = list.map((a) => a);
        arr.forEach((item) => {
          if (res.data.cex.includes(item.name.toLowerCase())) {
            item.disabled = false;
          }
          if(item.name.toLowerCase() === selectCex){
            item.selected = true
          } else {
            item.selected = false
          }
        });
        
        setList(arr);
      });
    }
  }, [isLogin]);

  return (
    <div className="flex lg:flex-col flex-col-reverse h-[100%] overflow-hidden lg:gap-[1.4vh] lg:border-b-solid lg:border-b-[1px] lg:border-b-[#d6d6d6]">
      <div className="mt-[20px] lg:mt-0">
        <div className="upload-btn bg-[#cf0] flex items-center rounded-[8px] px-[16px] lg:px-[14px] h-[100%] lg:h-[6vh] w-[100%] gap-2 justify-between cursor-pointer py-[12px] lg:py-0 xl:py-[3px]">
          <div className="text-[14px] lg:text-[15px] font-bold flex items-center gap-1 ">
            <span>{t("apiForm.uploadReadOnlyApi2")}</span>
            <Popover
              trigger={"hover"}
              content={
                <PopoverContent>
                  {t("apiForm.uploadReadOnlyApiDesc")}
                </PopoverContent>
              }
            >
              <QuestionCircleOutlined />
            </Popover>
          </div>

          <div>
            <IconButton
              onClick={props.handleUpload}
              style={{ width: "32px", height: "32px" }}
            >
              <svg
                className="w-[13px] h-[13px]"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0386 7.00755H6.91059V11.2315H4.12659V7.00755H-0.00140619V4.22355H4.12659V-0.000453949H6.91059V4.22355H11.0386V7.00755Z"
                  fill="black"
                />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>
      <div
        data-menu-swipe-ignore="true"
        className="flex items-center justify-between w-auto lg:pl-0 lg:w-[100%] overflow-x-scroll lg:overflow-x-hidden flex-nowrap gap-2 lg:gap-1"
        style={{ touchAction: "pan-x" }}
      >
        {list.map((item, index) => (
          <div
            key={index}
            className={`${
              item.selected ? "border-b-[#cf0]  " : "border-b-[#fff]"
            } border-b-[4px] border-solid lg:border-none`}
          >
            <div
              key={index}
              onClick={() => handleClick(item)}
              className={`flex-shrink-0 select-none w-[48px] h-[48px] lg:w-[5.4vh] lg:h-[5.4vh] flex flex-col justify-center items-center border-[4px] ${
                item.selected ? "border-[#cf0]" : "border-white"
              } ${
                item.disabled ? "cursor-not-allowed" : "cursor-pointer"
              }  rounded-full bg-white`}
            >
              <Image
                src={item.selected ? item.imgA : item.imgB}
                alt={item.name}
                className="w-[44px] h-[44px] lg:w-[4.6vh] lg:h-[4.6vh] object-contain select-none "
                style={{ filter: item.selected ? "none" : "grayscale(100%)" }}
              />
            </div>
            <div className="flex lg:hidden items-center justify-center text-[10px] font-bold">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
