"use client";
import bot from "../../images/banner/bot1.svg";
// import pdf from '../../assets/banner/pdf.svg'
// import word from "../../assets/banner/word.svg";
// import excel from "../../assets/banner/excel.svg";
// import text from "../../assets/banner/text.svg";
import battery from "../../images/banner/battery.svg";
// import eth from "../../assets/banner/eth.svg";
// import ton from "../../assets/banner/ton.svg";
// import bnb from "../../assets/banner/bnb.svg";
// import sol from "../../assets/banner/sol.svg";
import MusicAnimate from "./../MusicAnimate";

import bian from "../../images/banner/bian.svg";
import okx from "../../images/banner/okx.svg";
import liquid from "../../images/banner/liquid.svg";
import aster from "../../images/banner/aster.svg";
import upbit from "../../images/agent/upbit.svg";
import uniswap from "../../images/agent/uniswap.svg";
import "./BannerCard.scss";
import Image from "next/image";
const BannerCard1 = () => {
  return (
    <div className="h-[500px] lg:h-[68vh] relative">
      <div className="flex justify-center items-start">
        <div className="w-[15vw] lg:mt-[8vh] hidden lg:block">
          <div className="flex justify-center items-center">
            <Image src={bian} className="float-1" alt="" />
          </div>
          <div className="flex justify-end items-center my-[2vh]">
            {/* <img src={eth} className="float-5 mt-1vh" alt="" /> */}
            <Image src={okx} className="float-2" alt="" />
          </div>
          <div className="flex justify-center items-center">
            <Image src={upbit} className="float-6" alt="" />
          </div>
        </div>
        <div className="relative h-[300px]">
          <Image src={bot} className="h-[280px] lg:mt-[2vh]" alt="" />
          <div className="absolute flex justify-center items-center top-[60px] lg:top-[78px] z-2 w-full pr-[6px] h-[62px] lg:h-[60px]">
            <MusicAnimate />
          </div>
        </div>

        <div className="w-[15vw] mt-[8vh] hidden lg:block">
          <div className="flex justify-center items-center">
            <Image src={liquid} className="float-3" alt="" />
          </div>
          <div className="flex justify-start items-center my-[2vh]">
            <Image src={uniswap} className="float-7" alt="" />
            {/* <img src={sol} className="float-8  mt-1vh" alt="" /> */}
          </div>
          <div className="flex justify-center items-center">

            <Image src={aster} className="float-4" alt="" />
          </div>
        </div>
      </div>
      <div className="absolute flex justify-center items-center top-[230px] lg:bottom-[5vh] z-[12] w-full">
        <Image src={battery} className="h-[100px] lg:h-[25vh]" alt="" />
      </div>
    </div>
  );
};

export default BannerCard1;
