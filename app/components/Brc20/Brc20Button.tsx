"use client"
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { MouseEventHandler, ReactNode } from "react";

export type ButtonSize = 'small' | 'medium' | 'large';

export interface Brc20ButtonProps {
  loading?: boolean;
  children: ReactNode | string;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  outClassName?: string;
  block?: boolean;
  size?: ButtonSize;
  type?: 'default' | 'black' | 'gray' | 'primary';
}

const SIZE_STYLES = {
  small: {
    fontSize: '12px',
    padding: '4px 4px',
    lineHeight: '24px',
    borderRadius: '6px',
    height: '28px',
    borderWidth: '1px',
  },
  medium: {
    fontSize: '13px',
    padding: '6px 6px',
    lineHeight: '34px',
    borderRadius: '7px',
    height: '34px',
    borderWidth: '1px',
  },
  large: {
    fontSize: '14px',
    padding: '8px 8px',
    lineHeight: '40px',
    borderRadius: '8px',
    height: '40px',
    borderWidth: '1px',
  }
};

const Brc20Button = (props: Brc20ButtonProps) => {
  const {
    loading = false,
    disabled = false,
    size = 'medium',
    type = 'default',
    block = false
  } = props;

  const sizeStyle = SIZE_STYLES[size];

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (disabled || loading) {
      return;
    }
    e.stopPropagation();
    if (props.onClick) props.onClick(e);
  };

  const getTypeClassName = () => {
    switch (type) {
      case 'black':
        return 'brc20-btn-black';
      case 'gray':
        return 'brc20-btn-gray';
      case 'primary':
        return 'brc20-btn-primary';
      default:
        return 'brc20-btn-default';
    }
  };

  const getSizeClassName = () => {
    switch (size) {
      case 'small':
        return 'brc20-btn-small';
      case 'large':
        return 'brc20-btn-large';
      default:
        return 'brc20-btn-medium';
    }
  };

  return (
    <div
      className={`brc20-btn-out ${block ? 'brc20-btn-block' : ''} ${props.outClassName || ''}`}
      style={props.style}
    >
      {loading ? (
        <Spin spinning={loading} style={{ display: "block" }} indicator={<LoadingOutlined spin />}>
          <div
            className={`brc20-btn ${getTypeClassName()} ${getSizeClassName()} ${props.className || ''} ${(disabled || loading) && 'brc20-btn-disabled'}`}
            onClick={handleClick}
            style={{
              ...sizeStyle,
              ...props.style
            }}
          >
            {props.children}
          </div>
        </Spin>
      ) : (
        <div
          className={`brc20-btn ${getTypeClassName()} ${getSizeClassName()} ${props.className || ''} ${(disabled || loading) && 'brc20-btn-disabled'}`}
          onClick={handleClick}
          style={{
            ...sizeStyle,
            ...props.style
          }}
        >
          {props.children}
        </div>
      )}
    </div>
  );
};

export default Brc20Button;

