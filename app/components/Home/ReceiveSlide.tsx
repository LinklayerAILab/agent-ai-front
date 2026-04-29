import daka from "@/app/images/home/daka.svg";
import Image from "next/image";
import successIcon from "@/app/images/home/successIcon.svg";
import clock from "@/app/images/home/clock.svg";
import { ClaimInfoItem } from "@/app/api/agent_c";
import dayjs from "dayjs";

export const ReceiveSlide = (props: { data: ClaimInfoItem }) => {
  const isPlaceholder = !props.data.id;

  return (
    <div className="bg-white lg:bg-[#ebebeb] rounded-[8px] h-[140px] lg:h-[16vh]">
      <div
        className={`bg-[#cf0] border-b-[#fff] border-b-[1px] border-b-solid h-[50px] lg:h-[5vh] flex items-center justify-center`}
      >
        <span className="flex items-center gap-[6px] font-bold">
          <Image src={daka} alt=""></Image>
          {isPlaceholder ? "---" : dayjs(props.data.created_at).format("YYYY-MM-DD")}
        </span>
      </div>
      <div>
        <div className={`flex items-center justify-center py-[10px] lg:py-[0vh] ${props.data.channel_id ? 'h-[38px] lg:h-[4.5vh]' : 'h-[52px] lg:h-[6vh]  py-1'} relative`}>
          <Image
            src={isPlaceholder ? clock : successIcon}
            className={` ${props.data.channel_id ? 'h-[28px] lg:h-[2vh]' : 'h-[28px] lg:h-[4vh]'}`}
            alt="successIcon"
          ></Image>
        </div>
        <div className="font-bold flex items-center justify-center">
          <div className="text-center">
             {
              props.data.channel_type &&  <div className="text-[12px]">{isPlaceholder ? "--" : props.data.channel_type}</div>
             }
            <div>
              <span className="text-[12px]">{isPlaceholder ? "--" : props.data.amount}</span> <span>LLAx</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
