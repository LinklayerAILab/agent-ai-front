import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getSiweNonce, verifySiweMessage } from "../api/user";
import { setOtherInfo } from "../store/userSlice";
import { setUserInfo, syncPoints } from "../store/userSlice";
import { message } from "antd";
import { SiweMessage } from "siwe";
import { useAccount, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { get_user_info } from "../api/agent_c";
import { CHAIN_ID } from "../enum";

const INVITE_CODE_KEY = "invite_code";

interface UseWalletLoginOptions {
  /**
   * loginSuccessaftercallback
   */
  onLoginSuccess?: (address: string) => void;
  /**
   * loginFailedaftercallback
   */
  onLoginError?: (error: Error) => void;
}

/**
 * 钱packagelogin Hook
 *
 * provide完整钱packageloginfunctionality，package括：
 * - 钱packageconnection
 * - SIWE signature
 * - 自动login（钱package已connection时）
 * - userinformationsync
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
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [messageApi] = message.useMessage();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const [hasManualLogout, setHasManualLogout] = useState(false);

  // listen钱packageconnectionstate，connectionafter自动trigger SIWE signature
  useEffect(() => {
    if (isConnected && address && !isLogin && !hasManualLogout) {
      localStorage.setItem("address", address);
      handleManualSign();
    }
  }, [isConnected, address, isLogin, hasManualLogout]);

  // 手动 SIWE 一keylogin
  const handleManualSign = async () => {
    if (!address || !isConnected) {
      console.error("Please connect wallet first");
      messageApi.error(t("login.connectFirst") || "Please connect wallet first");
      return;
    }

    try {
      setLoading(true);

      // 1. fetch nonce
      const {
        data: { nonce },
      } = await getSiweNonce();

      // 2. Create SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to LinkLayer AI Agent",
        uri: window.location.origin,
        version: "1",
        chainId: CHAIN_ID,
        nonce: nonce,
      });

      // 3. requestsignature
      const message = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message });
      const invite_code = localStorage.getItem(INVITE_CODE_KEY) || "";

      // 4. verificationsignature并fetch access_token
      const result = await verifySiweMessage({
        message,
        signature,
        invite_code,
      });

      // 5. save access_token
      localStorage.setItem("access_token", result.data.access_token);

      // 6. 调用after端login API
      dispatch(setUserInfo(result.data));

      // loginSuccessafterreset退出loginlogo
      setHasManualLogout(false);

      messageApi.success(t("login.success") || "Login successful!");

      // 7. immediatelyrefresh积分anduserinformation
      dispatch(syncPoints());
      get_user_info().then((res: { data: unknown }) => {
        if (res) {
          dispatch(setOtherInfo(res.data));
        }
      });

      // 8. trigger自Defineevent，notificationotherpageaddress已change
      const addressChangedEvent = new CustomEvent("addressChanged", {
        detail: { address: address },
      });
      window.dispatchEvent(addressChangedEvent);

      // 9. 调用loginSuccesscallback
      if (options.onLoginSuccess) {
        options.onLoginSuccess(address);
      }
    } catch (error) {
      console.error("SIWE login failed:", error);
      messageApi.error(t("login.authFailed") || "Login failed. Please try again");

      if (options.onLoginError) {
        options.onLoginError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // loginhandlefunction
  const handleLogin = useCallback(async () => {
    try {
      setLoading(true);
      // user手动点击login，reset退出loginlogo
      setHasManualLogout(false);
      // use Reown AppKit openconnectionmodalproceed社交login
      await open();
    } catch (err) {
      console.error("Social auth error:", err);
      messageApi.error(t("login.authFailed") || "Login failed. Please try again");

      if (options.onLoginError) {
        options.onLoginError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [open, messageApi, t, options]);

  return {
    handleLogin,
    handleManualSign,
    loading,
    isLogin,
    address,
    isConnected,
  };
};
