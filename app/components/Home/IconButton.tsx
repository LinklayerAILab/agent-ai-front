"use client";
import { ReactNode } from "react";
import "./IconButton.scss";
export interface IconButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
export default function IconButton({ children, ...props }: IconButtonProps) {
  return (
    <div
      className={`icon-button button ${props.className}`}
      onClick={props.onClick}
    >
      {children}
    </div>
  );
}
