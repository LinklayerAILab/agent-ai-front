"use client";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import LLButton from "./LLButton";
import { useWalletLogin } from "../hooks/useWalletLogin";

interface LoginButtonProps {
  /**
   * Button text, defaults to translation "home.login"
   */
  buttonText?: string;
  /**
   * Button style object
   */
  buttonStyle?: React.CSSProperties;
  /**
   * Button class name
   */
  buttonClassName?: string;
  /**
   * Callback after successful login
   */
  onLoginSuccess?: (address: string) => void;
  /**
   * Callback after failed login
   */
  onLoginError?: (error: Error) => void;
  /**
   * Whether to display complete login interface (including dropdown menu, etc.)
   * Defaults to false, only display login button
   */
  showFullInterface?: boolean;
  /**
   * Whether to hide button when logged in (still display button after login)
   * Defaults to false, hide button after login
   */
  hideWhenLoggedIn?: boolean;
}

/**
 * Login button component
 *
 * Supports custom text, style, and loginSuccess callback
 * Reuses all login logic from Connect component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LoginButton />
 *
 * // Custom text and style
 * <LoginButton
 *   buttonText="Login By Wallet"
 *   buttonStyle={{ background: '#E9FF93' }}
 *   buttonClassName="custom-class"
 * />
 *
 * // With loginSuccess callback
 * <LoginButton
 *   onLoginSuccess={(address) => console.log('Logged in:', address)}
 * />
 *
 * // Still display button after login
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

  // If already logged in and hide is set, do not display button
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
