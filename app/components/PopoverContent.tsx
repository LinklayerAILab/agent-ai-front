import { ReactNode } from "react";
import tip from "@/app/images/components/tip.svg";
import Image from "next/image";
type PopoverContentProps = {
  children?: ReactNode;
};
export default function PopoverContent(props: PopoverContentProps) {
  return (
    <div className="flex justify-between ">
      <div className="w-[30px]">
        <Image src={tip} className="w-[30px] lg:w-[30px]" alt="" />
      </div>
      <div className="text-left pl-[10px] max-w-[60vw] max-w-[100%] lg:max-w-[200px]">
        {props.children}
      </div>
    </div>
  );
}
