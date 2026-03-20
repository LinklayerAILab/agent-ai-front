"use client";
import openai from "../../images/banner/openai.svg";
import meta from "../../images/banner/meta.svg";
import unknowIcon from "../../images/banner/unknow.svg";
import deepseek from "../../images/banner/deepseek.svg";
import sol2 from "../../images/banner/sol2.svg";
import eth2 from "../../images/banner/eth2.svg";
import bnb from "../../images/banner/bnb2.svg";
// import ton from "../../assets/banner/ton2.svg";
// import ins from "../../assets/banner/ins.svg";
// import tg from '../../assets/banner/tg.svg'
// import talk from "../../assets/banner/talk.svg";
// import discord from "../../assets/banner/discord.svg";
import bot from "../../images/banner/bot1.svg";
import MusicAnimate from "../../components/MusicAnimate";
import desktop from "../../images/banner/desktop.svg";
import btc from "../../images/banner/btc.svg";
import "./BannerCard.scss";
import Image from "next/image";
const BannerCard2 = () => {
  return (
    <div className="h-[500px] lg:h-[68vh] relative">
      <div className="flex justify-center items-center">
        <div className="w-[16vw] flex-col justify-center lg:h-[40vh] relative  hidden lg:block">
          {/* <img
            src={eth2}
            className="run-left-1 absolute left-0 top-10vh w-60px"
            alt=""
          /> */}
          <Image
            src={meta}
            className="run-left-2 run-left-2 absolute left-[7vw] top-[10vh] w-[51px]"
            alt=""
          />
          {/* <img
            src={sol2}
            className="run-left-3  absolute left-3vw top-24vh w-50px"
            alt=""
          /> */}
          <Image
            src={openai}
            className="run-left-4 absolute left-[10vw] top-[22vh]"
            alt=""
          />
          <Image
            src={deepseek}
            className=" run-left-5 absolute left-[6vw] top-[34vh] w-[50px]"
            alt=""
          />
          <Image
            src={unknowIcon}
            className="run-left-6 absolute right-[10vw] top-[22vh]"
            alt=""
          />
        </div>
        <div className="relative h-[300px]">
          <Image src={bot} className="h-[280px] lg:mt-[2vh]" alt="" />
          <div className="absolute flex justify-center items-center top-[60px] lg:top-[78px] z-2 w-full pr-[6px] h-[62px] lg:h-[60px]">
            <MusicAnimate />
          </div>
        </div>
        <div className="w-[16vw] flex-col justify-center lg:h-[40vh] relative  hidden lg:block">
          <Image
            src={eth2}
            className="run-right-1 absolute right-[7vw] top-[10vh] w-[51px]"
            alt=""
          />
          {/* <img
            src={eth2}
            className="run-right-2 absolute right-0 top-10vh w-60px"
            alt=""
          /> */}
          <Image
            src={btc}
            className="run-right-3 absolute right-[10vw] top-[22vh]"
            alt=""
          />
          {/* <img
            src={discord}
            className="run-right-4 absolute right-3vw top-24vh w-50px"
            alt=""
          /> */}
          <Image
            src={bnb}
            className="run-right-5 absolute right-[1vw] top-[21vh] w-[50px]"
            alt=""
          />
          <Image
            src={sol2}
            className="run-right-6 absolute right-[6vw] top-[34vh] w-[50px]"
            alt=""
          />
        </div>
      </div>
      <div className="flex justify-center items-center z-[12] w-full absolute top-[230px] lg:bottom-[5vh]">
        <Image src={desktop} className="h-[100px] lg:h-[25vh]" alt="" />
      </div>
    </div>
  );
};

export default BannerCard2;
