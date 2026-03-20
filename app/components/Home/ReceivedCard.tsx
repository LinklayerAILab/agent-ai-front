import jinbi from "@/app/images/agent/jinbi.svg";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import Image from "next/image";
import PopoverContent from "../PopoverContent";

export const ReceivedCard = (props: {
  bg: string;
  title: string;
  desc: string
  children?: React.ReactNode;
}) => {
  return (
    <div className="border-[1px] border-solid border-black rounded-[8px] w-[100%] lg:flex-1 h-[100%] bg-white relative">
      <div
        className={`h-[70px] lg:h-[10vh] rounded-[8px] lg:rounded-[8px] ${props.bg} m-[1px] flex items-center flex-start lg:justify-between px-[14px] lg:px-[14px] text-[16px] lg:text-[18px] font-bold`}
      >
        <div className="flex items-center">
          <Image src={jinbi} alt="jinbi" className="inline-block w-[18px] h-[18px] mr-[8px] object-contain pointer-events-none select-none" />
          {props.title}</div>
        <div className="ml-[4px] lg:ml-0">
          <Popover content={<PopoverContent>{props.desc}</PopoverContent>}>
            <QuestionCircleOutlined></QuestionCircleOutlined>
          </Popover>
        </div>
      </div>
      <div className="lg:p-[14px]">
        {props.children}
      </div>
    </div>
  );
};
