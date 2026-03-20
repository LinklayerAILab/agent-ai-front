"use client";

import React, { useMemo, useRef, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { CheckOutlined, DownOutlined } from "@ant-design/icons";
import { useStrategies } from "../hooks/useStrategies";
import rightIcon from "@/app/images/agent/right.svg";
import billIcon from "@/app/images/agent/bill.svg";
import billIconGary from "@/app/images/agent/billIconGary.svg";

interface TrendBoxProps {
  onAnalyze: (strategy: { label: string; value: string }) => void;
}

const TrendBox: React.FC<TrendBoxProps> = ({
  onAnalyze
}) => {
  const { t } = useTranslation();
  const strategies = useStrategies();
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const [selectType, setSelectType] = useState<{
    value: string;
  }>({
    value: 'trendTracking',
  });


  const childs = useMemo<{ label: string; value: string }[]>(() => {
    let list: { label: string; value: string }[] = [];
    Object.keys(strategies).forEach(key => {
      if (key === selectType.value) {
        list = strategies[key as keyof typeof strategies];
      }
    });
    return list;
  }, [selectType, strategies]);

  // 策略typemap
  const strategyTypeMap: Record<string, string> = useMemo(() => ({
    'trendTracking': t('strategy.types.trendTracking'),
    'momentum': t('strategy.types.momentum'),
    'overboughtOversold': t('strategy.types.overboughtOversold'),
    'volumePrice': t('strategy.types.volumePrice'),
    'pattern': t('strategy.types.pattern'),
    'volatility': t('strategy.types.volatility')
  }), [t]);

  const items: MenuProps['items'] = useMemo(() => [
    {
      key: 'trendTracking',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.trendTracking')}</span> {selectType.value === 'trendTracking' ? <CheckOutlined /> : null}</div>,
    },
    {
      key: 'momentum',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.momentum')}</span> {selectType.value === 'momentum' ? <CheckOutlined /> : null}</div>,
    },
    {
      key: 'overboughtOversold',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.overboughtOversold')}</span> {selectType.value === 'overboughtOversold' ? <CheckOutlined /> : null}</div>,
    },
    {
      key: 'volumePrice',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.volumePrice')}</span> {selectType.value === 'volumePrice' ? <CheckOutlined /> : null}</div>,
    },
    {
      key: 'pattern',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.pattern')}</span> {selectType.value === 'pattern' ? <CheckOutlined /> : null}</div>,
    },
    {
      key: 'volatility',
      label: <div className="flex items-center justify-between"><span>{t('strategy.types.volatility')}</span> {selectType.value === 'volatility' ? <CheckOutlined /> : null}</div>,
    }
  ], [t, selectType.value]);

  return (
    <div className="w-[100%] lg:p-[1vh] bg-[#F1F1F1] lg:border-[2px] lg:border-black lg:border-solid rounded-[8px]" id="tend-inner-box">
      <div className="border-[2px] border-black rounded-[8px] bg-black flex justify-center items-center">
        <div className="text-white text-center font-bold text-[18px] h-[100%] flex items-center justify-center w-[100%]">
          <Dropdown
            placement="bottomLeft"
            trigger={['click']}
            menu={{
              items,
              selectable: true,
              defaultSelectedKeys: ['trendTracking'],
              onSelect: (e) => {
                const key = e.key as string;
                setSelectType({
                  value: key
                });
              }
            }}
          >
            <div className="flex justify-center items-center cursor-pointer gap-2 h-[40px] lg:h-[6vh] w-[100%] px-3">
              <span className="truncate flex-1 text-center" title={strategyTypeMap[selectType.value]}> {strategyTypeMap[selectType.value]}</span>
              <DownOutlined />
            </div>
          </Dropdown>
        </div>
      </div>
      <div
        ref={scrollBoxRef}
        className="rounded-[8px] h-[73vh] lg:h-[64vh] bg-[#F1F1F1] overflow-y-auto mt-[14px] lg:mt-[2vh]"
        id="scrollBox"
      >
        {
          childs.map((item: { label: string; value: string }, idx) => <div key={item.value} className="child-item flex items-center justify-between h-[44px] rounded-[4px] lg:h-[48px] px-4 bg-white mb-[10px] lg:mb-[10px] lg:mr-[4px]">
            <div className="font-bold text-[14px] flex items-center gap-2"><Image src={idx % 2 === 0 ? billIconGary : billIcon} alt=""></Image> {item.label}</div>
            <Image src={rightIcon} alt="right icon" className="cursor-pointer" width={18} height={18} onClick={() => onAnalyze(item)} />
          </div>)
        }
      </div>
    </div>
  );
};

export default TrendBox;
