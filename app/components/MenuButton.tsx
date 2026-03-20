"use client";
import "./MenuButton.scss";
import { MouseEventHandler, ReactNode } from "react";

export interface MenuButtonProps {
  children: ReactNode;
  className?: string;
  checked?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}
export default function MenuButton(props: MenuButtonProps) {
  return (
    <div
      className={`menu-button text-center button ${props.className} ${
        props.checked ? "checked" : ""
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
