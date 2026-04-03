"use client";
import './SwapBox.scss'
import { useState } from "react";
import { message, Select } from "antd";
import { ReceiveBtn } from "../Home/ReceiveBtn";
import llax from '@/app/images/rewards/llax.svg'
import lla from '@/app/images/rewards/lla.svg'
import Image from "next/image";
import { useTranslation } from "react-i18next";
import bottomIcon from '@/app/images/rewards/bottom.svg'

interface SwapBoxProps {
  className?: string;
}

export const SwapBox: React.FC<SwapBoxProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  // Swap state management
  const [fromToken, setFromToken] = useState<'LLAx' | 'LLA'>('LLA');
  const [swapAmount, setSwapAmount] = useState<string>('');

  // Simulated balance data
  const [balances] = useState({
    LLAx: 0,
    LLA: 0
  });

  // Get target token
  const getToToken = () => {
    return fromToken === 'LLAx' ? 'LLA' : 'LLAx';
  };

  // Get current from and to tokens
  const getSwapTokens = () => {
    const to = getToToken();
    return {
      from: fromToken,
      to,
      fromBalance: balances[fromToken],
      toBalance: balances[to]
    };
  };
  const [messageApi,messageContext] = message.useMessage()
  // Set quick amount
  const handleQuickAmount = (percentage: number) => {
    const { fromBalance } = getSwapTokens();
    const amount = (fromBalance * percentage / 100).toFixed(2);
    setSwapAmount(amount);
  };

  // Handle swap
  const handleSwap = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      messageApi.warning(t('common.coming'))
      return;
    }
    const { from, to } = getSwapTokens();
    console.log(`Swap ${swapAmount} ${from} to ${to}`);
    // Add actual Web3 swap logic here
  };

  return (
    <div className={`rounded-[8px] ${className}`}>
      {messageContext}
      <div className="bg-[#fff] p-4 flex flex-col gap-4 rounded-[8px] mb-[14px]">
        {/* From Token */}
        <div className="rounded-lg py-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-[16px] font-bold w-[40%]">
              <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-xl font-bold outline-none bg-transparent "
            />
            </span>
            <div className="flex items-center mr-[-12px]">
              <Image src={fromToken === 'LLA' ? llax : lla} alt={fromToken}></Image>
              <Select
              id="select-1"
              value={fromToken}
              onChange={(value) => {
                setFromToken(value);
                setSwapAmount('');
              }}
              className="font-bold text-[18px] select-token"
              variant={'outlined'}
              options={[
                { value: 'LLAx', label: 'LLAx' },
                { value: 'LLA', label: 'LLA'}
              ]}
            />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[#999999]">≈$--</div>
             <div className="flex items-center gap-2"><span className="text-[#999] text-sm">
              {t('exchange.balance')}: {getSwapTokens().fromBalance.toFixed(2)}
            </span>
             {/* Quick select buttons */}
          <div className="flex gap-2 border-l-[1px] border-solid border-l-[#eee] pl-[10px]">
            <button
              onClick={() => handleQuickAmount(50)}
              className="px-2 py-[2px] hover:bg-gray-200 rounded-full border-[1px] border-solid border-[#eee] text-[12px] font-medium transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => handleQuickAmount(100)}
              className="px-2 py-[2px] hover:bg-gray-200 rounded-full border-[1px] border-solid border-[#eee] text-[12px] font-medium transition-colors"
            >
              {t('exchange.max')}
            </button>
          </div></div>
          </div>

        </div>

        {/* Swap arrow button */}
        {/* <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="bg-white border-4 border-gray-100 rounded-full p-2 hover:bg-gray-50 transition-all hover:rotate-180 duration-300"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div> */}
        <div className="h-0 border-b-[1px] border-b-solid border-[#eee]"></div>
        {/* To Token */}
        <div className="rounded-lg py-1">
          <div className='text-[#999] flex items-center gap-1'><Image src={bottomIcon} alt='bottomIcon'></Image> You Receive</div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-[16px] font-bold w-[40%]">
                  <input
              type="text"
              value={swapAmount ? (parseFloat(swapAmount) * 1).toFixed(2) : ''}
              disabled
              placeholder="0.00"
              className="flex-1 text-xl font-bold outline-none bg-transparent text-gray-600 "
            />
            </span>
              <div className="px-1 lg:px-4 py-2 lg:px-0 rounded-lg font-bold flex items-center gap-[11px]" id="select-2">
                <Image src={fromToken === 'LLA' ? lla: llax} alt=""></Image>
              <span className='text-[18px]'>{getSwapTokens().to}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[#999999]">≈$--</div>
            <span className="text-[#999] text-sm">
              {t('exchange.balance')}: {getSwapTokens().toBalance?.toFixed(2)}
            </span>

          </div>
        </div>


      </div>
              {/* Swap button */}
        <ReceiveBtn
          className='w-[100%]'
          onClick={handleSwap}
        >
         {t('exchange.confirm')}
        </ReceiveBtn>
    </div>
  );
};
