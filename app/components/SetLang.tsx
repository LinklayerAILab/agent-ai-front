"use client";
import { Cascader } from "antd";
import { useEffect, useMemo } from "react";
import "./SetLang.scss";
import { useTranslation, I18nextProvider } from "react-i18next";
import i18nIns from "./../i18n/i18n";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons";
const SetLang = () => {
  const { i18n } = useTranslation();
  const options = [
    {
      value: "en",
      label: "English",
    },
    {
      value: "zh",
      label: "中文",
    },
    {
      value: "ja",
      label: "日本語",
    },
    {
      value: "ko",
      label: "한국어",
    },
    {
      value: "ru",
      label: "Русский",
    },
  ];
  const langKey = "local-lang";
  const onChange = (arr: string[]) => {
    const lang = arr[0];
    i18nIns.changeLanguage(lang);
    localStorage.setItem(langKey, lang);
  };
  const langName = useMemo(() => {
    return options.find((item) => item.value === i18nIns.language)?.label;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18nIns.language,i18n]);
  const langVal = useMemo(() => {
    return options.find((item) => item.value === i18n.language)?.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18nIns.language,i18n.language]);

  useEffect(() => {
    const lang = localStorage.getItem(langKey);
    if (lang) {
      i18nIns.changeLanguage(lang);
    }
  }, []);
  return (
    <I18nextProvider i18n={i18nIns}>
      <div className="lg:px-[16px] xl:px-[16px] mt-[4px] lg:mb-0 bg-white">
        <Cascader
          options={options}
          onChange={onChange}
          placement="bottomLeft"
          value={[langVal || "en"]}
        >
          <div className="platform-card">
            <div className="icon-box">
              <GlobalOutlined style={{fontSize:30}} />
              {/* {langName} */}
            </div>
            <div className="font-size-12px font-bold text-left pl-[6px] h-[100%] flex-1">
              <span className="flex items-center justify-between select-none cursor-pointer h-[100%]">
                <span className="flex-1 text-xs">{langName || "English"}</span>{" "}
                <DownOutlined className="text-[12px]" />
              </span>
            </div>
          </div>
        </Cascader>
      </div>
    </I18nextProvider>
  );
};

export default SetLang;
