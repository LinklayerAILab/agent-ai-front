"use client";
import { useEffect } from "react";

export function useKeyDown(call: (e: KeyboardEvent) => void) {
  useEffect(() => {
    document.addEventListener("keydown", call, false);
    return () => {
      document.removeEventListener("keydown", call, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
