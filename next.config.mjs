// import i18n from "./next-i18next.config.mjs";
/** @type {import('next').NextConfig} */
console.log('NEXT_PUBLIC_NODE_ENV:', process.env.NEXT_PUBLIC_NODE_ENV);
console.log('chain:', process.env.NEXT_PUBLIC_CHAIN_ID);

const nextConfig = {
  reactStrictMode: false,
  compiler: {
    // Remove console in production, but keep error and warn
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  assetPrefix: undefined,
  crossOrigin: "anonymous",
  async rewrites() {
    return [
      // {
      //   source: "/defai_api/:path*",
      //   // destination: "http://192.168.85.12:8888/:path*",
      //   destination: `${process.env.NEXT_API_DEFAI}/:path*`,
     
      // },
      {
        source: "/agent_c_api/:path*",
        // destination: "http://192.168.85.12:8888/:path*",
        destination: `${process.env.NEXT_API_AGENT_C}/:path*`,
      },
      {
        source: "/board_api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BOARD__HOST}/:path*`,
      },
      // Rewrite all /api/ requests to our streaming proxy
      {
        source: "/api/:path*",
        destination: "/api/proxy/:path*",
      },
    ];
  },
  // Special configuration for streaming responses
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Accel-Buffering", value: "no" },
          { key: "Cache-Control", value: "no-cache" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        source: "/agent_c_api/:path*",
        headers: [
          { key: "X-Accel-Buffering", value: "no" },
          { key: "Cache-Control", value: "no-cache" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.linklayer.ai", port: "", pathname: "/**" },
      { protocol: "https", hostname: "qc.linklayer.ai", port: "", pathname: "/**" },
      { protocol: "https", hostname: "t.me", port: "", pathname: "/**" },
      { protocol: "https", hostname: "telegram.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.telegram.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "web.telegram.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.t.me", port: "", pathname: "/**" },
      { protocol: "https", hostname: "cdn*.telegram.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "avatars.tdesktop.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.web.telegram.org", port: "", pathname: "/**" },
    ],
  },
  // i18n: i18n.i18n,
};

export default () => nextConfig;
