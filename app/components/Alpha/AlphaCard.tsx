
import "./AlphaCard.scss";
import LLButton from "../LLButton";
import { Skeleton } from "antd";
import zichan from "@/app/images/alpha/zichan.svg";
import rise from "@/app/images/alpha/rise.svg";
import downRed from "@/app/images/alpha/down-red.svg";
import downYellow from "@/app/images/alpha/down-yellow.svg";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { AlphaTokenItem } from "@/app/api/agent_c";
import StreamingModal from "@/app/components/StreamingModal";

interface AlphaCardProps {
    title: string,
    price: string,
    depth: string,
    icon: string,
    color?: string,
    priceLoaded?: boolean,
    liquidityLoaded?: boolean,
    data: AlphaTokenItem
}

export const AlphaCard = ({
  title = "Token Name",
  price = "0.00",
  depth = "--",
  icon = '',
  color,
  priceLoaded = false,
  liquidityLoaded = false,
  data
}: AlphaCardProps) => {
    const { t } = useTranslation();

    // 灏嗙姸鎬佹彁鍗囧埌缁勪欢椤跺眰锛岀‘淇?hooks 璋冪敤椤哄簭涓€鑷?
    const [randomDelay, setRandomDelay] = useState('0.00');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // 鍙湪瀹㈡埛绔敓鎴愰殢鏈哄欢杩?
        setRandomDelay((Math.random() * 1 + 0.5).toFixed(2));
    }, []);

  const handleClass = () => {
    if (color === 'GREEN') {
      return 'text-[#2EC94C] border-[#2EC94C] bg-[#F3FFEF]';
    }
    if (color === 'RED') {
      return 'text-[#F44A40] border-[#F44A40] bg-[#FFFDF4]';
    }
    if (color === 'YELLOW') {
      return 'text-[#B1B100] border-[#B1B100] bg-[#FFF7F7]';
    }
    return undefined;
  };

  const handleIcon = () => {
    if (color === 'GREEN') {
      return rise;
    }
    if (color === 'RED') {
      return downRed;
    }
    if (color === 'YELLOW') {
      return downYellow;
    }
    return undefined;
  };

    const renderClass = (str: string) => {
        if(str ==='GREEN') return 'gradientFade1'
        if(str ==='RED') return 'gradientFade2'
        if(str ==='YELLOW') return 'gradientFade3'
    }

    const LightStatus = () => {
        // gradientFade1 缁? gradientFade2 绾? gradientFade3  榛?
        // Use color parameter for background, with animation
        if (color) {
            return (
                <div
                    className={`alpha-status w-[44px] h-[44px] lg:w-[5.6vh] lg:h-[5.6vh] xl:w-[5vh] xl:h-[5vh] rounded-full border-[2px] border-solid border-black`}
                    style={{
                        animation: `${renderClass(color)} 4s ease-in-out ${randomDelay}s infinite`,
                    }}
                ></div>
            );
        }

        return null;
    }
  const handleExplorer = () => {
    window.open(`https://bscscan.com/token/${data.token_address}`,'__blank')
  }

  const handleAanlize = () => {
    setIsModalOpen(true);
  }

  return (
    <div className="alpha-card flex gap-3 py-[14px] px-[14px] lg:px-[1.5vh] lg:py-[1.5vh] h-[184px] w-full">
        <div className="flex items-center justify-center flex-col gap-2 border-[2px] border-solid border-black rounded-[8px] p-[10px] w-[76px]">
            <div className="w-[44px] h-[44px] lg:w-[5.6vh] lg:h-[5.6vh] xl:w-[5vh] xl:h-[5vh] rounded-full border-[2px] border-solid border-black">
                {icon && icon.length > 0 ? (
                    <Image src={icon} alt="icon" width={24} height={24} className="w-full h-full rounded-full"></Image>
                ) : (
                    <Skeleton.Avatar active size="large" className="w-full h-full rounded-full" />
                )}
            </div>
            {liquidityLoaded ? LightStatus() : (
                <Skeleton.Avatar active size="large" className="w-[4vh] h-[4vh] rounded-full" />
            )}
        </div>
      <div className="alpha-card-content flex-1 lg:px-2 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <div className=" font-bold text-[16px]">{title}</div>
            <div>--</div>
        </div>
        <div className="flex justify-between items-center">
            <div className=" font-bold">{t('alpha.card.price')}</div>
            <div className="flex items-center gap-1"> <Image src={zichan} alt=""></Image> <span>{priceLoaded ? price : <Skeleton.Input active size="small" className="w-[60px]" />}</span></div>
        </div>
                <div className="flex justify-between items-center">
            <div className=" font-bold">{t('alpha.card.lpDepth')}</div>
            <div className={`20px lg:h-[2vh] border-[1px] border-solid ${handleClass()} rounded-full flex items-center justify-center px-2 text-[12px] font-bold`}> <Image src={handleIcon()} alt="" /> <span>{depth}(15m)</span></div>
        </div>
        <div className="h-[2px] bg-black my-[0.5vh]"></div>
        <div className="flex justify-between items-center gap-4">
            <LLButton outClassName="flex-1" style={{fontSize:'14px'}} onClick={handleExplorer}>{t('alpha.card.explorer')}</LLButton>
            <LLButton outClassName="flex-1" style={{fontSize:'14px'}} onClick={handleAanlize}>{t('alpha.card.agent') }</LLButton>
        </div>
      </div>
      <StreamingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        query={data}
      />
    </div>
  );
};
