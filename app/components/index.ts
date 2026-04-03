import dynamic from "next/dynamic";

// Dynamically import LayoutModal and disable SSR
export const LayoutModal = dynamic(() => import("./LayoutModal"), {
  ssr: false,
});
