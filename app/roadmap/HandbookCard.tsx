"use client";
import { MouseEventHandler, ReactNode } from "react";
import guideRightImg from "@/app/images/guide-card-right.svg";
import Image from "next/image";

export interface GuideProps {
  label: string;
  desc: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  rightIcon: ReactNode | string;
}
export default function HandbookCard(props: GuideProps) {
  return (
    <div
      onClick={props.onClick}
      className={`guide-card relative px-2 py-2 lg:px-10 lg:py-8 flex justify-between cursor-pointer rounded-md border-2 border-solid border-black h-20 lg:h-[17vh] w-full lg:w-[100%] hover:bg-[#cbff04] bg-[#EAEAEA]`}
    >
      <div className="w-4/5 flex items-center">
        <div>
          <div className="leading-5 lg:leading-10 text-base lg:text-2xl font-bold lg:mb-1.5">
            {props.label}
          </div>
          <div className="text-xs lg:text-base font-bold">{props.desc}</div>
        </div>
      </div>
      <div className="flex justify-center items-center w-1/5">
        <div className="w-16 lg:w-24 cursor-pointerflex justify-center items-center cursor-pointer">
          {props.rightIcon}
        </div>
      </div>
      <Image
        src={guideRightImg}
        className="h-[18px] lg:h-[26px] absolute right-[-1px] top-0"
        alt=""
      />
    </div>
  );
}
