"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export default function TopLoadingBar() {
  const ref = useRef<LoadingBarRef>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // startload
    if (ref.current) {
      ref.current.continuousStart();
    }

    // completeload
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.complete();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return (
    <LoadingBar
      color="#ccff00"
      height={5}
      shadow={true}
      ref={ref}
      waitingTime={400}
    />
  );
}
