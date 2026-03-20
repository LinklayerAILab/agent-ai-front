import { useTranslation } from "react-i18next";
import check from "@/app/images/bill/check.svg";
import Image from "next/image";
const Quarter = () => {
  const { t } = useTranslation();
  return (
    <div className="text-[12px] flex flex-col justify-around h-full">
      <div className="flex items-start">
        <Image src={check} className="mr-[5px]  mt-[5px]" alt="" />
        <div>{t("order.quarter.benefitDesc1")}</div>
      </div>
      <div className="flex items-start">
        <Image src={check} className="mr-[5px]  mt-[5px]" alt="" />
        <div>{t("order.quarter.benefitDesc2")}</div>
      </div>
      <div className="flex items-start">
        <Image src={check} className="mr-[5px]  mt-[5px]" alt="" />
        <div>{t("order.quarter.benefitDesc3")}</div>
      </div>
      <div className="flex items-start">
        <Image src={check} className="mr-[5px]  mt-[5px]" alt="" />
        <div>{t("order.quarter.benefitDesc4")}</div>
      </div>
    </div>
  );
};

export default Quarter;
