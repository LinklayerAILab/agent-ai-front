"use client";
import "./BannerPanel.scss";
import left from "../../images/banner/left.svg";
import right from "../../images/banner/right.svg";
import { Carousel } from "antd";
import BannerCard1 from "./BannerCard1";
import BannerCard2 from "./BannerCard2";
import { useRef, useState, useEffect } from "react";
import { CarouselRef } from "antd/es/carousel";
import panzi from "../../images/banner/panzi1.svg";
import panzi2 from "../../images/banner/panzi2.svg";
import tit from "../../images/banner/tit.svg";
import Image from "next/image";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
const BannerPanel = () => {
  const ref = useRef<CarouselRef>(null);
  const isInitialMount = useRef(true);
  const [val, setVal] = useState(0);

  // Ensure initial state is correct
  useEffect(() => {
    // Ensure first slide is displayed after component mounts
    setVal(0);
  }, []);

  const onChange = (current: number, next: number) => {
    // Filter out calls during initialization
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVal(next);
  };

  const handelNext = (num: number) => {
    if (num === 0) {
      ref.current?.prev();
    } else {
      ref.current?.next();
    }
  };
  return (
    <div className="banner-panel w-full h-full rounded-[8px] bg-[#f0f0f0] relative overflow-hidden">
      <div className="flex justify-center items-start pt-[3vh] bottom-[0]">
        <div className="mx-[10px] relative flex lg:block">
          <Image
            src={left}
            className="lg:absolute h-[10px] lg:h-auto lg:left-[-30px] top-[0.8vh] mt-[6px] lg:mt-0 lg:top-[1vh]"
            alt=""
          />
          <Image src={tit} className="h-[40px] lg:h-[10vh]" alt="" />
          <Image
            src={right}
            className="lg:absolute h-[10px] lg:h-auto lg:right-[-30px] top-[0.8vh] mt-[6px] lg:mt-0 lg:top-[1vh]"
            alt=""
          />
        </div>
      </div>
      <div className="absolute z-[2] left-0 right-0">
        <Carousel
          dots={false}
          ref={ref}
          beforeChange={onChange}
          autoplay
        >
          <div>
            <BannerCard1></BannerCard1>
          </div>
          <div>
            <BannerCard2></BannerCard2>
          </div>
        </Carousel>
      </div>

      <div className="flex justify-center items-center gap-[20px] absolute bottom-[12px] lg:bottom-[6.2vh] w-full btn-next">
        <div
          onClick={() => handelNext(0)}
          className="w-[22px] h-[22px] rounded-[6.6px] bg-white hover:bg-black flex items-center justify-center cursor-pointer text-black hover:text-white border-2 border-solid border-black"
        >
          {/* <i className="i-mi-chevron-left text-[18px]"></i> */}
          <LeftOutlined />
        </div>
        <div
          onClick={() => handelNext(1)}
          className="w-[22px] h-[22px] rounded-[6.6px] bg-white hover:bg-black flex items-center justify-center cursor-pointer text-black hover:text-white border-2 border-solid border-black"
        >
          {/* <i className="i-mi-chevron-right text-[18px]"></i> */}
          <RightOutlined />
        </div>
      </div>
      <div className="absolute flex items-center justify-center bottom-[60px] lg:bottom-[3.6vh] z-[1] w-full  lg:h-[16vh]">
        <Image src={val === 0 ? panzi : panzi2} className="h-full" alt="" />
      </div>
    </div>
  );
};

export default BannerPanel;
