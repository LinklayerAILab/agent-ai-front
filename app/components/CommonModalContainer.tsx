import { CSSProperties, ReactNode } from "react";
import logoWhite from "@/app/images/components/logo-white.svg";
import icon from "@/app/images/components/logoMini.svg";
import Image from "next/image";
type LayoutModalHeaderProps = {
  children: ReactNode | string;
  className?: string;
  title?: ReactNode | string;
  style?:CSSProperties
};
const CommonModalContainer = (props: LayoutModalHeaderProps) => {
  return (
    <div className={`${props.className}`}>
      <div
        className={`h-[50px] flex justify-start px-[10px] lg:px-[20px] items-center relative bg-black`}
        style={props.style}
      >
        {props.title ? (
          props.title
        ) : (
          <>
            <div className="flex items-center">
              <Image src={logoWhite} className="h-[21px]" alt="" />
              <Image
                src={icon}
                alt=""
                className="w-[20px] lg:w-[24px] ml-[5px]"
              />
            </div>
          </>
        )}
      </div>
      <div className="p-[14px] max-h-[600px] scrollbar-y">{props.children}</div>
    </div>
  );
};

export default CommonModalContainer;
