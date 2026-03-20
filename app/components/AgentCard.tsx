import { MouseEventHandler, ReactNode } from "react";
import "./AgentCard.scss";
import botr from "@/app/images/agent/botR.svg";
import Image from "next/image";
export interface AgentCardProps {
  label: ReactNode;
  desc: ReactNode;
  btnGroup: ReactNode;
  selected: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}
const AgentCard = (props: AgentCardProps) => {
  return (
    <div
      onClick={props.onClick}
      className={`hidden sm:flex h-auto py-[20px] xl:py-0 lg:h-[38vh] rounded-[8px] left-card px-[40px] items-center relative cursor-pointer ${
        props.selected ? "selected" : ""
      }`}
    >
      <div className="flex flex-col gap-[2vh] justify-evenly h-[80%]">
        <div className="text-lg font-bold">{props.label}</div>
        <div
          className="text-sm text-[#000] mt-[6px] leading-[3vh]"
          style={{ whiteSpace: "break-spaces"}}
        >
          {props.desc}
        </div>
        {/* <div className="flex text-sm gap-[10px]">
          <div className="bg-white rounded-[5px] h-[22px] w-[60px] flex justify-center items-center">
            <Image src={book} alt="" /> 45
          </div>
          <div className="bg-white rounded-[5px] h-[22px] w-[60px] flex justify-center items-center">
            <Image src={mask} alt="" /> 121
          </div>
          <div className="bg-white rounded-[5px] h-22px w-[60px] flex justify-center items-center">
            <Image src={safe} alt="" /> 6.7w
          </div>
        </div> */}
      </div>
      <div
        className={`absolute right-[0px] top-[4px] w-[44px] h-[44px] lg:w-[58px] lg:h-[58px] flex items-center justify-center rounded-full`}
      >
        <Image src={botr} alt="Selected" className="w-[50px]" />
      </div>
    </div>
  );
};

export default AgentCard;
