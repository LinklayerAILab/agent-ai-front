"use client";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import nullImage from "@/app/images/noData/null.svg";
import "./AlphaEmptyState.scss";

type AlphaEmptyStateProps = {
  description?: string;
  imageClassName?: string;
  descriptionClassName?: string;
  className?: string;
};

export const AlphaEmptyState = ({
  description,
  imageClassName,
  descriptionClassName,
  className,
}: AlphaEmptyStateProps) => {
  const { t } = useTranslation();
  const text = description || t("alpha.noDataDescription");

  return (
    <div className={`alpha-empty-state bg-[#EBEBEB] w-full h-full rounded-[8px] ${className || ""}`}>
      <div className="empty-state-icon">
        <Image
          src={nullImage}
          alt="No data"
          width={200}
          height={200}
          className={`empty-state-image ${imageClassName || ""}`}
        />
      </div>
      <div className={`empty-state-description ${descriptionClassName || ""}`}>{text}</div>
    </div>
  );
};
