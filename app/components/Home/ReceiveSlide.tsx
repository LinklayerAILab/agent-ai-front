import daka from "@/app/images/home/daka.svg";
import Image from "next/image";
import successIcon from "@/app/images/home/successIcon.svg";
import clock from "@/app/images/home/clock.svg";
import timeoutIcon from "@/app/images/home/timeout.svg";
import { ClaimInfoItem } from "@/app/api/agent_c";
import dayjs from "dayjs";
import { isProd } from "@/app/enum";

const diff = isProd ? 2592000000 : 3600000;
export const ReceiveSlide = (props: { data: ClaimInfoItem }) => {
  const handleClass = (item: ClaimInfoItem) => {
    // If claimed
    if (item.claim_flag || handleType(item) === 0) {
      return "bg-[#cf0] border-b-[#fff]";
    }
    // If period_end is in the past (expired)
    if (dayjs().valueOf() - item.period_end > diff) {
      return "bg-[#CECECE] border-b-white lg:border-b-black";
    }
    // Active
    return "bg-[#cf0] border-b-[#fff]";
  };

  const handleType = (item: ClaimInfoItem) => {
    if(item.period_start === 0){
      return 0
    }
    if (item.claim_flag) {
      return 1;
    }
    if (dayjs().valueOf() - item.period_end > diff) {
      return 2;
    }
    return 3;
  };

  const handleImg = (item: ClaimInfoItem) => {
    if(handleType(item) === 0){
      return clock;
    }
    // If claimed, return successIcon
    if (item.claim_flag) {
      return successIcon;
    }
    // If current date > period_end (expired), return timeoutIcon
    if (dayjs().valueOf() - item.period_end > diff) {
      return timeoutIcon;
    }
    // If period_end >= current date (active), return clock
    return clock;
  };
  return (
    <div className="bg-white lg:bg-[#ebebeb] rounded-[8px] h-[140px] lg:h-[16vh]">
      <div
        className={`${handleClass(
          props.data
        )} border-b-[1px] border-b-solid  h-[50px] lg:h-[5vh] flex items-center justify-center`}
      >
        <span className="flex items-center gap-[6px] font-bold">
          <Image src={daka} alt=""></Image>
          {handleType(props.data) === 0 ?  '---': handleType(props.data) === 1 ? dayjs(props.data.claim_time).format("YYYY-MM-DD") : dayjs(props.data.period_end).format("YYYY-MM-DD")} 
        </span>
      </div>
      <div>
        <div className="flex items-center justify-center py-[10px] lg:py-[1vh] h-[38px] lg:h-[6vh] relative">
          <Image
            src={handleImg(props.data)}
            className={`h-[28px] lg:h-[4vh] ${
              handleType(props.data) === 2
                ? "absolute lg:top-[-1.7vh] top-[-10px] w-[48px] h-[48px] lg:w-[8vh] lg:h-[8vh]"
                : ""
            }`}
            alt="successIcon"
          ></Image>
        </div>
        <div className="font-bold flex items-center justify-center">
          <div>
            <span>{props.data.claim_amount || "--"}</span> <span>LLAx</span>
          </div>
        </div>
      </div>
    </div>
  );
};
