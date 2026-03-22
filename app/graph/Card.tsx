"use client";
import "./Card.scss";
import Image from "next/image";
import { platformListData } from "../components/Home/PlatformList";
import { InviteItem } from "./page";
import { useSelector } from "react-redux";
import { RootState } from "../store";
export const Card = (props: { data: InviteItem }) => {
  const normalizedActiveValues = (props.data.cex_names || []).map((name) => name.toLowerCase());
  const list = platformListData.filter(
    (item) => item.name !== "MEXC" && item.name !== "KuCoin"
  );
  const isLogin = useSelector((state:RootState) => state.user.isLogin)
  return (
    <div
      className={`graph-card border-[2px] border-solid border-black rounded-[8px] flex justify-between flex-col w-full min-w-0 h-[150px]`}
    >
      <div
        className={`flex items-center gap-[6px] px-[2vh] h-[90px] lg:h-[13.4vh]`}
      >
        {
          isLogin ? <div className="rounded-full border-[2px] border-solid border-black overflow-hidden"><Image
          src={props.data.icon}
          width={40}
          height={40}
          className={`w-[50px] lg:w-[7vh] h-[50px] lg:h-[7vh]`}
          alt=""
        ></Image></div>:<Image
          src={props.data.icon}
          width={40}
          height={40}
          className={`w-[50px] lg:w-[7vh] h-[50px] lg:h-[7vh]`}
          alt=""
        ></Image>
        }
        
        <div className="address-box line-clamp-2 break-all underline font-bold">
          {props.data.address}
        </div>
      </div>
      <div
        className={`h-[50px] lg:h-[7vh] bg-[#EBEBEB] px-[14px] lg:px-[2vh] rounded-b-[8px] flex items-center justify-between`}
      >
        {list.map((item, idx) => (
          <div
            key={idx}
            className="w-[3.4vh] h-[3.4vh] rounded-full flex items-center justify-center"
          >
            <Image
              className="w-full"
              src={item.imgA}
              alt={item.name}
              width={40}
              height={40}
              style={{
                filter: normalizedActiveValues.includes(item.name.toLowerCase())
                  ? "none"
                  : "grayscale(100%)",
                  opacity: normalizedActiveValues.includes(item.name.toLowerCase())? 1 : 0.5
              }}
            ></Image>
          </div>
        ))}
      </div>
    </div>
  );
};
