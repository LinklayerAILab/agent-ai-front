import path from "path";

/** @type {import('next-i18next').UserConfig} */
const nextOption = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh", "ja", "ko", "ru"],
  },
  localeExtension: "json",
  localePath:
    typeof window === "undefined"
      ? path.resolve("./public/locales")
      : "/locales",
};

export default nextOption;

