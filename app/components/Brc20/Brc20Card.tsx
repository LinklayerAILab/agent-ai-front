"use client"
import Image from "next/image";
import Brc20Button from "./Brc20Button";
import StatusIndicator from "@/app/components/StatusIndicator";
import priceIcon from "@/app/images/brc20/price.svg";
import topIcon from "@/app/images/brc20/top.svg";
import { BinanceTokenScreenItem } from "@/app/api/binance";
import { useTranslation } from "next-i18next";

interface Brc20CardProps {
  token?: BinanceTokenScreenItem;
}

/**
 * Format token price, handle very small numbers and scientific notation
 * @param price Price value
 * @returns Formatted price string
 */
const formatPrice = (price: number): string => {
  if (price === 0) return '0';

  // For very small numbers (less than 0.000001), display complete decimal form
  if (price < 0.000001 && price > 0) {
    // Convert to string, remove scientific notation
    const str = price.toPrecision();
    const num = parseFloat(str);
    // Use toLocaleString to ensure complete decimal places are displayed
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 15,
      maximumFractionDigits: 15,
      useGrouping: false
    });
  }

  // For small numbers (0.000001 - 0.01), display up to 8 decimal places
  if (price < 0.01) {
    return price.toFixed(8).replace(/\.?0+$/, '');
  }

  // For very large numbers (greater than 1,000,000), use thousand separators
  if (price >= 1000000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Normal range numbers, keep up to 6 decimal places, remove trailing zeros
  return parseFloat(price.toFixed(6)).toString();
};


export function Brc20Card({ token }: Brc20CardProps) {
  const { t } = useTranslation();
  const handleTrade = () => {
    window.open(`https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=${token?.contractAddress}`,'__blank')
  }
  return (
    <div className="w-full sm:w-1/2 sm:w-[48.4%] lg:w-[48.8%] xl:w-[32.45%] flex flex-row lg:gap-[1vh] bg-[#F3F3F3] rounded-[8px] p-[14px] lg:p-[1.8vh] lg:h-[16.5vh]">
      {/* Card content goes here */}
      <div className="flex w-full h-full">
        <div className="flex flex-col pr-[14px] lg:pr-[1.5vh] border-r-[1px] border-r-[#E7E7E7] border-r-solid w-full gap-[10px] lg:gap-[1vh]">
          <div className="flex gap-[10px] justify-between">
            <div className="flex items-center justify-center gap-[10px]">
              <Image
                src={token?.imageUrl || ''}
                alt="aster"
                width={40}
                height={40}
                className="lg:w-[5vh] lg:h-[5vh] w-[34px] h-[34px] rounded-full bg-white"
              ></Image>
              <div className="flex gap-1 flex-col">
              <div className="font-bold text-[14px] lg:text-[16px]">{token?.tokenSymbol.toUpperCase() || token?.tokenName || t('brc20.loading')}</div>
              <div className="flex items-center gap-1 text-[12px] font-bold">
                <Image
                  src={priceIcon}
                  className="w-[14px] h-[16px] lg:w-[1.6vh] lg:h-[2vh]"
                  alt="price"
                />{" "}
                {token?.price !== undefined && token?.price !== null
                  ? `$${formatPrice(token.price)}`
                  : '-'}
              </div>
            </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="flex gap-[4px] h-[24px] items-center lg:items-center lg:h-[24px]">
              <StatusIndicator statusColor="GREEN" size={20} borderWidth={1} />
              <div className="text-[10px]">{t('brc20.optimal')}</div>
            </div>
            <div>
              1111
            </div>
            </div>
          </div>

          <div className="text-[12px] border-t-[#E7E7E7] border-t-[1px] pt-[14px] lg:pt-[2vh] flex gap-1 font-bold lg:mt-[1vh]">
            <div className="flex items-center px-1 justify-center flex-1 h-[30px] lg:h-[3.2vh] gap-1 rounded-[15px] lg:rounded-[1.5vh] bg-white border border-[#D8E2B1] text-[#789600]">
              {t('brc20.lpDepth')}  <Image src={topIcon} alt="top" className="w-[1vh] h-[1vh]" />
            </div>
            <div className="flex items-center px-1 justify-center flex-1 h-[30px] lg:h-[3.2vh] gap-1 rounded-[15px] lg:rounded-[1.5vh] bg-white border border-[#D8E2B1] text-[#789600]">
              {t('brc20.lpStability')} <Image src={topIcon} alt="top" className="w-[1vh] h-[1vh]" />
            </div>
          </div>
        </div>
        <div></div>
      </div>
      <div className="flex flex-col gap-[14px] lg:gap-[2.5vh] pl-[14px] lg:pl-[0.5vh] items-center justify-between h-full">
        <Brc20Button size="large" className="w-full" style={{width:'100%'}} onClick={handleTrade}>
          {t('brc20.trade')}
        </Brc20Button>
        <Brc20Button size="large" type="primary" className="w-full" style={{width:'100%'}}>
          {t('brc20.agent')}
        </Brc20Button>
      </div>
    </div>
  );
}
