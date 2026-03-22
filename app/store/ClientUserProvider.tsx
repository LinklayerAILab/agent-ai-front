"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { initializeFromLocalStorage, syncPoints } from "../store/userSlice";

export function ClientUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  useEffect(() => {
    dispatch(initializeFromLocalStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!isLogin) {
      return;
    }

    dispatch(syncPoints());

    const interval = setInterval(() => {
      dispatch(syncPoints());
    }, 7000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch, isLogin]);

  return <>{children}</>;
}
