import React, { CSSProperties } from 'react';

interface ReceiveBtnProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?:CSSProperties
}

export const ReceiveBtn: React.FC<ReceiveBtnProps> = ({
  onClick,
  disabled = false,
  children,
  className = '',
  style
}) => {
  return (
    <div style={style} className={`pb-[2px] w-auto lg:w-auto bg-white rounded-[8px] overflow-hidden transition-all ${disabled ? 'border-[#666]' : 'border-black'} border-[1px] border-solid`}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-[6px] lg:py-[1vh] rounded-[6px] font-medium transition-colors
        text-[16px] border-0 outline-none shadow-none w-[100%]
        ${disabled
          ? 'bg-[#D9D9D9] text-[#999] cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900'
        }
        ${className}
      `}
    >
      {children}
    </button>
    </div>

  );
};
