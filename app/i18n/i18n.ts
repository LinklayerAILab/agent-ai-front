'use client';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const defaultLang = 'en';
import zh from "@/public/locales/zh/common.json";
import en from "@/public/locales/en/common.json";
import ko from "@/public/locales/ko/common.json";
import ja from "@/public/locales/ja/common.json";
import ru from "@/public/locales/ru/common.json";
const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  ko: {
    translation: ko,
  },
  ja: {
    translation: ja,
  },
  ru: {
    translation: ru,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: defaultLang, // keep SSR + initial client render consistent
    fallbackLng: defaultLang,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
