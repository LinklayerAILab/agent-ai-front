import Image from "next/image"
import lv1 from "@/app/images/ranking/lv1.svg"
import lv2 from "@/app/images/ranking/lv2.svg"
import lv3 from "@/app/images/ranking/lv3.svg"
import time from '@/app/images/ranking/time.svg'
import { addressDots } from "../utils"
export const RankCard = (props:{
    className?:string
    short?:string
    name:string
    long?: string
    rank?:number| string
}) => {
    return (
        <div className={`rank-card flex h-[40px] lg:h-[6.3vh] border-[2px] cursor-pointer border-solid border-black rounded-[8px] items-center px-[14px] lg:font-bold mb-[10px] lg:mb-[14px] flex items-center justify-between ${props.className}`}>
            <div className="flex-1 text-[14px] lg:text-[16px]">
                {
                    props.rank === 1 ? <Image src={lv1} width={24} height={24} alt="rank1" className="w-[30px] h-[30px]" /> :''
      
                }
                {
                    props.rank === 2 ? <Image src={lv2} width={24} height={24} alt="rank2" className="w-[30px] h-[30px]" /> :''
                }
                {
                    props.rank === 3 ? <Image src={lv3} width={24} height={24} alt="rank3" className="w-[30px] h-[30px]" /> :''
                }
                {
                    props.rank !== 1 && props.rank !== 2 && props.rank !== 3 ?<div className="text-[14px] lg:text-[18px] font-bold">{props.rank}</div> :''
                }
            </div>
            <div className="w-[40%] flex items-center">
                <div className="block lg:hidden">{addressDots(props.name,6,6)}</div>
                <div className="hidden lg:block">{addressDots(props.name,13,13)}</div>
            </div>
            <div className="flex-1 flex justify-end items-center gap-[4px] lg:justify-start"><Image src={time} width={16} height={16} alt="time" className="w-[16px] h-[16px]" /> {props.long}</div>
            <div className="flex-1 flex justify-end gap-[4px] lg:justify-start items-center gap-[4px]"><Image src={time} width={16} height={16} alt="time" className="w-[16px] h-[16px]" /> {props.short}</div>
        </div>
    )
}