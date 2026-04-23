import "@ant-design/v5-patch-for-react-19";
import "./globals.css";
import "./styles/animate.scss";
import "./common.scss";
import React from "react";
import "./styles/antd.scss";

import { Metadata, Viewport } from "next";
import './styles/common.scss';
import './styles/reown-appkit.css';
import { GoogleAnalytics } from "@next/third-parties/google";
import { isProd, isTest } from "./enum";
import GlobalLoading from "./components/GlobalLoading";
import { Suspense } from "react";
import TopLoadingBar from "./components/TopLoadingBar";

import ClientProviders from "./components/ClientProviders";



export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`antialiased`}
      >
        <Suspense>
          <TopLoadingBar />
        </Suspense>
        <div id="portal-root"></div>
        <GlobalLoading />

        <div>
          <ClientProviders>{children}</ClientProviders>
          {isProd || isTest && <GoogleAnalytics gaId="G-HY9CWG33BL" />}
        </div>


      </body>

    </html>
  );
}
