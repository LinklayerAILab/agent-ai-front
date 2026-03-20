"use client";
import React, { useEffect } from "react";
import { store } from "../store";
import { Provider } from "react-redux";
import { ClientUserProvider } from "../store/ClientUserProvider";
import Menus from "./Menus";
import { ConfigProvider, App } from "antd";
import i18nIns from "../i18n/i18n";

const supportedLanguages = ["zh", "en", "ja", "ko", "ru"];
const langKey = "local-lang";

const StoreProvider = (props: { children?: React.ReactNode }) => {
  useEffect(() => {
    const stored = localStorage.getItem(langKey) || "";
    const browser = navigator.language?.split("-")[0] || "";
    const next = supportedLanguages.includes(stored)
      ? stored
      : supportedLanguages.includes(browser)
        ? browser
        : "en";

    if (i18nIns.language !== next) {
      i18nIns.changeLanguage(next);
    }

    if (!stored) {
      localStorage.setItem(langKey, next);
    }
  }, []);

  return (
    <div>
      <Provider store={store}>
        <ClientUserProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#8AA90B',
              },
            }}
          >
            <App>
              <Menus>{props.children}</Menus>
            </App>
          </ConfigProvider>
        </ClientUserProvider>
      </Provider>
    </div>
  );
};

export default StoreProvider;
