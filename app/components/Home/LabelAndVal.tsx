import React from "react";

export const LabelAndVal = (props: {
  label: React.ReactNode;
  className?: string;
  value: React.ReactNode;
}) => {
  return (
    <div
      className={`flex items-center justify-between bg-[#EBEBEB] lg:h-[4.1vh] rounded-[4px] h-[32px] px-[14px] ${props.className}`}
    >
      <span className="text-[14px] text-[#676767]">{props.label}</span>
      <span className="text-[14px] italic">{props.value}</span>
    </div>
  );
};
