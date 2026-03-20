import { useTranslation } from "react-i18next";

const Points = () => {
  const { t } = useTranslation();
  return (
    <div className="text-[11px] flex flex-col justify-around h-full">
      <div>
        <div className="font-bold text-[14px]">
          {t("order.points.smallTitle1")}
        </div>
        <div className="text-[14px]">{t("order.points.smallDesc1")}</div>
      </div>
      <div>
        <div className="font-bold text-[14px]">
          {t("order.points.smallTitle2")}
        </div>
        <div className="text-[14px]">{t("order.points.smallDesc2")}</div>
      </div>
    </div>
  );
};

export default Points;
