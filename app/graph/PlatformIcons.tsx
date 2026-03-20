import biana from "@/app/images/home/bian-a.svg";

import okxa from "@/app/images/home/okx-a.svg";

import bybita from "@/app/images/home/bybit-a.svg";

import bitgeta from "@/app/images/home/bitget-a.svg";

import baseb from "@/app/images/home/coinbase-d.svg";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type PlatformIconsProps = {
  activeValues: string[];
};

export const PlatformIcons = ({ activeValues }: PlatformIconsProps) => {
  const [normalizedActiveValues, setNormalizedActiveValues] = useState<string[]>([]);

  useEffect(() => {
    setNormalizedActiveValues(activeValues.map((value) => value.toLowerCase()));
  }, [activeValues]);

  const list = useMemo(
    () => [
      {
        icon: biana,
        value: 'binance',
      },
      {
        icon: okxa,
        value: 'okx',
      },
      {
        icon: bitgeta,
        value: 'bitget',
      },
      {
        icon: bybita,
        value: 'bybit',
      },
      {
        icon: baseb,
        value: 'base',
      },
    ],
    []
  );
  return (
    <div className="flex gap-[2px] lg:gap-[4px]">
      {list.map((item) => {
        const isActive = normalizedActiveValues.includes(item.value.toLowerCase());
        return (
          <Image
            src={item.icon}
            alt=""
            key={item.value}
            width={24}
            height={24}
            className="bg-white w-[19px] lg:w-[3vh]"
            style={isActive ? undefined : { filter: 'grayscale(100%)', opacity: 0.5 }}
          />
        );
      })}
    </div>
  );
};
