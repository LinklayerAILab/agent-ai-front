import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { message } from "antd";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

interface UseWalletLoginOptions {
  /**
   * Callback after successful login
   */
  onLoginSuccess?: (address: string) => void;
  /**
   * Callback after login failure
   */
  onLoginError?: (error: Error) => void;
}

/**
 * Wallet login Hook
 *
 * Provides wallet login functionality via ReOwn AppKit SIWE integration.
 * When the user clicks login, ReOwn handles the full flow:
 * connect wallet -> sign SIWE message -> verify with backend.
 *
 * @example
 * ```tsx
 * const { handleLogin, loading, isLogin } = useWalletLogin({
 *   onLoginSuccess: (address) => console.log('Logged in:', address)
 * });
 *
 * <button onClick={handleLogin} disabled={loading}>
 *   {isLogin ? 'Connected' : 'Login'}
 * </button>
 * ```
 */
export const useWalletLogin = (options: UseWalletLoginOptions = {}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [messageApi] = message.useMessage();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  // Notify parent component when login state changes
  useEffect(() => {
    if (isLogin && address && options.onLoginSuccess) {
      options.onLoginSuccess(address);
    }
  }, [isLogin, address]);

  // Login handler - ReOwn SIWE handles the full flow
  const handleLogin = useCallback(async () => {
    try {
      setLoading(true);
      await open();
    } catch (err) {
      console.error("Login error:", err);
      messageApi.error(t("login.authFailed") || "Login failed. Please try again");

      if (options.onLoginError) {
        options.onLoginError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [open, messageApi, t, options]);

  return {
    handleLogin,
    loading,
    isLogin,
    address,
    isConnected,
  };
};
