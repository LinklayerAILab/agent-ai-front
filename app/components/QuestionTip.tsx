"use client";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { ReactNode } from "react";
import PopoverContent from "./PopoverContent";

type QuestionTipProps = {
  content: ReactNode;
  className?: string;
  children?: ReactNode;
};

export default function QuestionTip({ content, className, children }: QuestionTipProps) {
  return (
    <Popover content={<PopoverContent>{content}</PopoverContent>} trigger="hover">
      {children ? (
        <span className="inline-flex items-center justify-center">{children}</span>
      ) : (
        <QuestionCircleOutlined className={`${className ?? "text-[12px] lg:text-[14px]"}`}></QuestionCircleOutlined>
      )}
    </Popover>
  );
}
