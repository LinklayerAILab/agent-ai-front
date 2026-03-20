"use client";
import { Provider } from "react-redux";
import { store } from "../store";
import { useEffect } from "react";
import { initializeFromLocalStorage } from "../store/userSlice";

export function ClientUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    store.dispatch(initializeFromLocalStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
