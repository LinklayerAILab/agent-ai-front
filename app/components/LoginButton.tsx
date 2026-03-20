"use client";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import LLButton from "./LLButton";
import { useWalletLogin } from "../hooks/useWalletLogin";

interface LoginButtonProps {
  /**
   * button文案，defaultuse翻译 "home.login"
   */
  buttonText?: string;
  /**
   * buttonstylepair象
   */
  buttonStyle?: React.CSSProperties;
  /**
   * buttonclass名
   */
  buttonClassName?: string;
  /**
   * loginSuccessaftercallback
   */
  onLoginSuccess?: (address: string) => void;
  /**
   * loginFailedaftercallback
   */
  onLoginError?: (error: Error) => void;
  /**
   * isnoDisplay完整logininterface（package括down拉menu等）
   * defaultfor false，只Displayloginbutton
   */
  showFullInterface?: boolean;
  /**
   * isnohide已loginstate（loginafterstillDisplaybutton）
   * defaultfor false，loginafterhidebutton
   */
  hideWhenLoggedIn?: boolean;
}

/**
 * loginbuttoncomponent
 *
 * support自Define文案、styleandloginSuccesscallback
 * 复用了 Connect componentalllogin逻辑
 *
 * @example
 * ```tsx
 * // 基础用法
 * <LoginButton />
 *
 * // 自Define文案andstyle
 * <LoginButton
 *   buttonText="Login By Wallet"
 *   buttonStyle={{ background: '#E9FF93' }}
 *   buttonClassName="custom-class"
 * />
 *
 * // 带loginSuccesscallback
 * <LoginButton
 *   onLoginSuccess={(address) => console.log('Logged in:', address)}
 * />
 *
 * // loginafterstillDisplaybutton
 * <LoginButton
 *   hideWhenLoggedIn={false}
 *   buttonText={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Login'}
 * />
 * ```
 */
const LoginButton = ({
  buttonText,
  buttonStyle,
  buttonClassName,
  onLoginSuccess,
  onLoginError,
  hideWhenLoggedIn = true,
}: LoginButtonProps) => {
  const { t } = useTranslation();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const { handleLogin, loading } = useWalletLogin({
    onLoginSuccess,
    onLoginError,
  });

  // ifalreadylogin且settings了hide，不Displaybutton
  if (isLogin && hideWhenLoggedIn) {
    return null;
  }

  return (
    <LLButton
      className={buttonClassName}
      style={buttonStyle}
      loading={loading}
      onClick={handleLogin}
    >
      {buttonText || t("home.login")}
    </LLButton>
  );
};

export default LoginButton;
