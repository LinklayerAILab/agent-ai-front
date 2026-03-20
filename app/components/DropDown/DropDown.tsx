"use client"
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import successImg from "@/app/images/success.svg";
import Image from "next/image";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
export type DropDownItem = { label: string; value: string | number };
export interface DropDownProps {
  data: Array<DropDownItem>;
  value: string | number;
  onChange: (e: DropDownItem) => void;
}
export default function DropDown(props: DropDownProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false);

  const handleDocumentClick = (e: MouseEvent | Event) => {
    if (!(menuRef.current)?.contains((e.target as Node))) {
      setShowMenu(false);
    }
  };
  const [selectStr, setSelectStr] = useState(props.data.find(item => item.value === props.value)?.label)
  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleOpen: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };


  return (
    <div className="dropdown w-full h-[30px] relative flex justify-center items-center">
      <div
        ref={menuRef}
        className="flex w-full px-2 md:px-[10px] xl:px-[10px] justify-between relative items-center text-[14px] lg:text-[16px] font-bold cursor-pointer select-none"

        onClick={handleOpen}
      >
        <div>{selectStr}</div>
        <div className="text-[14px] lg:text-[15px] absolute right-1 top-1 flex items-center justify-center">
          {showMenu ? <UpOutlined /> : <DownOutlined />}
        </div>
      </div>

      <div
        className={`absolute left-0 right-0 top-[40px] z-[1000]  ${showMenu ? "" : "hidden"
          }`}
      >
        <div className="mt-1 border-2 border-black border-solid rounded-lg overflow-hidden bg-white">
          {props.data.map((item) => (
            <div className="flex justify-between items-center" key={item.value}>
              <div
                className="leading-[40px] hover:bg-[#cf0] w-full flex items-center px-[10px] transition ease-in-out duration-300"
                onClick={() => {
                  setSelectStr(item.label);
                  props.onChange(item);
                }}
              >
                <div className="w-4 lg:w-[30px]">
                  {props.value === item.value ? (
                    <Image src={successImg} alt=""></Image>
                  ) : (
                    ""
                  )}
                </div>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
