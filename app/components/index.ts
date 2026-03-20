import dynamic from "next/dynamic";

// dynamicimport LayoutModal，并disable SSR
export const LayoutModal = dynamic(() => import("./LayoutModal"), {
  ssr: false,
});
