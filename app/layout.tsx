import "@ant-design/v5-patch-for-react-19";
import "./globals.css";
import "./styles/animate.scss";
import "./common.scss";
import React from "react";
import "./styles/antd.scss";

import { Viewport } from "next";
import './styles/common.scss';
import './styles/reown-appkit.css';
import StoreProvider from "./components/StoreProvider";
import WagmiProvider from "./components/WagmiProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { isProd } from "./enum";
import GlobalLoading from "./components/GlobalLoading";
import TopLoadingBar from "./components/TopLoadingBar";
export const dynamic = 'force-dynamic';



export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <TopLoadingBar />
        <div id="portal-root"></div>
        <GlobalLoading />

        <div>
          <WagmiProvider>
            <StoreProvider>{children}</StoreProvider>
          </WagmiProvider>
          {isProd && <GoogleAnalytics gaId="G-HY9CWG33BL" />}
        </div>


      </body>

    </html>
  );
}
