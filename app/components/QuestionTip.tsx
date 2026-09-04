"use client";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { ReactNode } from "react";
import PopoverContent from "./PopoverContent";

type QuestionTipProps = {
  content: ReactNode;
  className?: string;
};

export default function QuestionTip({ content, className }: QuestionTipProps) {
  return (
    <Popover content={<PopoverContent>{content}</PopoverContent>}>
      <QuestionCircleOutlined className={`${className ?? "text-[12px] lg:text-[14px]"}`}></QuestionCircleOutlined>
    </Popover>
  );
}
