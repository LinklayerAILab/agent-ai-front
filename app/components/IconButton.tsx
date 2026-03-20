'use client'
import { ReactNode } from "react";
import "./IconButton.scss";
export interface IconButtonProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}
export default function IconButton({ children, ...props }: IconButtonProps) {
  return (
    <div
      className={`icon-button button bg-white ${props.className}`} style={props.style}
      onClick={props.onClick}
    >
      {children}
    </div>
  );
}
