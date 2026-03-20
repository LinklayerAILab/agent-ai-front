"use client"
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { MouseEventHandler, ReactNode } from "react";

export interface LLbuttonProps {
  loading?: boolean;
  children: ReactNode | string;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  height?: string;
  style?: React.CSSProperties;
  outClassName?: string;
  block?: boolean;
}
const LLButton = (props: LLbuttonProps) => {
  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (props.disabled || props.loading) {
      return;
    }
    e.stopPropagation();
    if (props.onClick) props.onClick(e);
  };
  return (
    <div className={`btn-out-box ${props.block ? 'block' : ''} ${props.outClassName}`} style={props.style}>
      {
        typeof props.loading === "boolean" ? <Spin spinning={props.loading} style={{ display: "block" }} indicator={<LoadingOutlined spin />}>
          <div
            className={`button ${props.className} ${(props.disabled || props.loading) && "disabled"
              }`}
            onClick={handleClick}
            style={props.style}
          >
            {props.children}
          </div>
        </Spin> : <div
          className={`button px-[12px] ${props.className} ${(props.disabled || props.loading) && "disabled"
            }`}
              style={props.style}
          onClick={handleClick}
        >
          {props.children}
        </div>
      }

    </div>
  );
};

export default LLButton;
