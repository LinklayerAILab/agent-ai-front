"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { addressDots } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import LLButton from "./LLButton";
import {
  logout,
  setOtherInfo,
} from "../store/userSlice";
import { CaretDownOutlined } from "@ant-design/icons";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Dropdown, Modal, message } from "antd";
import pointer from "@/app/images/components/pointers.svg";
import email from "@/app/images/loginPanel/email.svg";
import toLink from "@/app/images/agent/toLink.svg";
import music from "@/app/images/loginPanel/music.svg";
import Link from "next/link";
import { get_llax_balance, get_user_info } from "../api/agent_c";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { disconnect } from "wagmi/actions";
import { config } from "../config/appkit";
import { useRouter } from "next/navigation";
import bg3 from "@/app/images/banner/bg3.svg";
import bgaite from "@/app/images/banner/bgaite.svg";
import share from "@/app/images/invitePanel/share.svg";
import gift from "@/app/images/invitePanel/gift.svg";
import money from "@/app/images/invitePanel/money.svg";
import icon from "@/app/images/loginPanel/icon.svg";
import iconRounded from "@/app/images/loginPanel/iconRounded.svg";
import wallet from "@/app/images/loginPanel/wallet.svg";
import binded from "@/app/images/loginPanel/binded.svg";
import Copy from "./Copy";
import smallPeople from "@/app/images/loginPanel/smallPeople.svg";
import smallMoney from "@/app/images/loginPanel/smallMoney.svg";

const INVITE_CODE_KEY = "invite_code";

// Internal component to handle URL parameter
const URLParamsHandler = () => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const extractInviteCode = () => {
      const directInviteCode = searchParams?.get("invite_code");
      if (directInviteCode) return directInviteCode;

      const toUrl = searchParams?.get("toUrl");
      if (!toUrl || typeof window === "undefined") return null;

      try {
        const decoded = decodeURIComponent(toUrl);
        const url = new URL(decoded, window.location.origin);
        return url.searchParams.get("invite_code");
      } catch {
        try {
          const url = new URL(toUrl, window.location.origin);
          return url.searchParams.get("invite_code");
        } catch {
          return null;
        }
      }
    };

    const inviteCode = extractInviteCode();
    if (inviteCode) {
      localStorage.setItem(INVITE_CODE_KEY, inviteCode);
    }
  }, [searchParams?.toString()]);

  return null;
};

const Connect = () => {
  const { t } = useTranslation();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const points = useSelector((state: RootState) => state.user.points);
  const dispatch = useDispatch<AppDispatch>();
  const otherInfo = useSelector((state: RootState) => state.user.otherInfo);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [earnDropdownOpen, setEarnDropdownOpen] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const localAddress = useSelector((state: RootState) => state.user.address);
  const [llaxBalance, setLlaxBalance] = useState<number | null>(null);

  // Sync wallet address to localStorage when connected
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem("address", address);
    }
  }, [isConnected, address]);

  // Listen to wallet account switch event
  useEffect(() => {
    const savedAddress = localStorage.getItem("address");

    // When wallet is connected, logged in, and address has changed (account switch)
    if (
      isConnected &&
      address &&
      savedAddress &&
      address !== savedAddress &&
      isLogin
    ) {
      setNewAddress(address);
      // Show confirmation dialog
      setShowAccountChangeDialog(true);
    }
  }, [address, isConnected, isLogin]);

  const authFailEvent = () => {
    handleLogout();
    setShowAuthDialog(true);
  };

  useEffect(() => {
    window.addEventListener("unauthorized", authFailEvent);
    return () => {
      window.removeEventListener("unauthorized", authFailEvent);
    };
  }, []);

  const fetchLlaxBalance = async () => {
    try {
      const res = await get_llax_balance();
      setLlaxBalance(res?.data?.balance?.balance ?? null);
    } catch (error) {
      console.error("failed to fetch llax balance:", error);
      setLlaxBalance(null);
    }
  };

  // Sync user profile and llax balance after successful login
  useEffect(() => {
    if (isLogin) {
      get_user_info().then((res: { data: unknown }) => {
        if (res) {
          dispatch(setOtherInfo(res.data));
        }
      });
      fetchLlaxBalance();
    } else {
      setLlaxBalance(null);
    }
  }, [isLogin, dispatch]);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAccountChangeDialog, setShowAccountChangeDialog] = useState(false);
  const [newAddress, setNewAddress] = useState<string>("");

  const handleConfirmRelogin = async () => {
    setShowAuthDialog(false);
    handleLogin();
  };

  const handleConfirmAccountChange = async () => {
    setShowAccountChangeDialog(false);
    // Re-open the login modal to sign in with the new account
    handleLogin();
  };

  const handleCancelAccountChange = () => {
    setShowAccountChangeDialog(false);
  };

  // Refresh llax balance when dropdown opens
  const handleDropdownClick = async () => {
    if (!dropdownOpen && isLogin) {
      handleRefreshUserInfo();
      fetchLlaxBalance();
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await disconnect(config);
    } catch (error) {
      console.error("Disconnect wallet failed:", error);
    }

    dispatch(logout());
    setDropdownOpen(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("address");
  };

  const handleLogin = async () => {
    if (isLogin) return;
    try {
      setLoading(true);
      // ReOwn SIWE handles the full flow: connect -> sign -> verify
      await open();
    } catch (err) {
      const errorObj = err as {
        message?: string;
        cause?: unknown;
        stack?: string;
      };
      console.error("[Auth] open() failed", {
        message: errorObj?.message || String(err),
        cause: errorObj?.cause,
        stack: errorObj?.stack,
        raw: err,
      });
      messageApi.error(
        t("login.authFailed") || "Login failed. Please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  const createLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}?invite_code=${otherInfo.invite_code}`;
  };

  const handleShareX = () => {
    if (typeof window === "undefined") return;

    const link = createLink();
    const backUrl = window.location.origin;
    const baseUrl = `${window.location.origin}/toDapp?toUrl=`;
    const inviteUrl = `${
      baseUrl + encodeURIComponent(link)
    }&backUrl=${encodeURIComponent(backUrl)}`;
    const queryParams = {
      text: `Turn your trading data into real-time market intelligence with @LinkLayerAI Agents. \n\nToken insights, liquidity signals, and Agent-powered analysis.  \n\nStart here:`,
      url: inviteUrl,
    };
    let s = "";
    Object.keys(queryParams).forEach((key) => {
      const newKey = key;
      s += `${newKey}=${encodeURIComponent(queryParams[newKey])}&`;
    });
    const url = `https://twitter.com/intent/tweet?${s.slice(0, s.length - 1)}`;
    window.open(url, "_blank");
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;

    const link = createLink();
    const backUrl = window.location.origin;
    const baseUrl = `${window.location.origin}/toDapp?toUrl=`;
    const fullLink = `${
      baseUrl + encodeURIComponent(link)
    }&backUrl=${encodeURIComponent(backUrl)}`;
    if (fullLink) {
      copyToClipboardLocal(fullLink);
    }
  };

  const copyToClipboardLocal = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      message.success(t("common.copySuccess") || "link copied to clipboard");
    } catch (error) {
      console.error("copy failed:", error);
      message.error(t("common.copyError") || "copy failed, please copy manually");
    }
  };

  // Refresh user information
  const handleRefreshUserInfo = async () => {
    try {
      const res = await get_user_info();
      if (res && res.data) {
        dispatch(setOtherInfo(res.data));
        fetchLlaxBalance();
      }
    } catch (error) {
      console.error("failed to refresh user info:", error);
    }
  };

  const handleCancel = () => {
    setShowAuthDialog(false);
  };

  const dropdownMenu = (
    <div className="bg-white rounded-lg shadow-xl min-w-[360px] p-4 rounded-[8px] border-[2px] border-solid border-black mt-[5px]">
      <div className="flex justify-between items-center rounded-[8px] h-[60px]">
        <div className="px-2 py-2 flex items-center gap-2">
          {contextHolder}
          {otherInfo.image ? (
            <Image
              src={otherInfo.image}
              className="rounded-full border-[2px] border-solid border-black"
              alt="user logo"
              width={44}
              height={44}
            ></Image>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          )}
          <div className="flex gap-2 items-center">
            <Image src={icon} alt="icon"></Image>
            <Image src={iconRounded} alt="iconRounded"></Image>
          </div>
        </div>
        <div
          className="flex items-center gap-2 button rounded-[8px] cursor-pointer px-3 h-[32px] lg:h-[36px] bg-[#cf0]"
          onClick={handleLogout}
          style={{ padding: "0 12px" }}
        >
          <span className="text-gray-800 text-[12px]">{t("home.logout")}</span>
        </div>
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="h-[60px] lg:h-[60px] bg-[#F2F2F2] rounded-[8px] px-2 py-3 flex">
          <div className="flex gap-2">
            <div>
              <Image src={wallet} alt=""></Image>
            </div>
            <div>
              <div className="text-[#666666] text-[12px]">
                {t("wallet.evmAddress")}
              </div>
              <div className="font-bold text-[12px] text-black block lg:hidden">{addressDots(address || '',12,12)}</div>
              <div className="font-bold text-[12px] text-black hidden lg:block">{address}</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <Copy text={address || ""}></Copy>
          </div>
        </div>
        <div className="h-[60px] lg:h-[60px] bg-[#F2F2F2] rounded-[8px] px-2 py-3 flex">
          <div className="flex gap-2">
            <div>
              <Image src={email} alt=""></Image>
            </div>
            <div>
              <div className="text-[#666666] text-[12px]">
                {t("wallet.emailAddress")}
              </div>
              <div className="font-bold text-[12px] text-black">
                {otherInfo.email || "--"}
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end">
            {otherInfo.email ? (
              <Image src={binded} alt="binded"></Image>
            ) : (
              <div className="bg-[#cf0] rounded-[4px] h-[20px] flex items-center text-[12px] px-2 cursor-pointer select-none font-bold">
                <Link href="/sendEmail">{t("common.bind")} +10</Link>{" "}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-[4px] mt-[8px]">
              <div className="bg-[#cf0] rounded-[8px] rounded-[8px] h-[50px] w-[20%] lg:h-[60px] px-2 py-3">
            <div className="h-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src={smallPeople} alt="" />
              </div>
              <div className="font-bold text-black">
                {otherInfo.invite_count || "--"}
              </div>
            </div>
          </div>
          <div className="bg-[#E9FF93] rounded-[8px] w-[55%] rounded-[8px] h-[50px] lg:h-[60px]  px-2 py-3 flex-1">
            <div className="h-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src={smallMoney} alt="" />
                <div className="text-[#666666] text-[12px]">
                  LLAx
                </div>
              </div>
              <div className="font-bold text-black">
                {llaxBalance ?? "--"}
              </div>
              <LLButton
                className="bg-[#eee]"
                onClick={() => messageApi.info("Coming soon")}
              >
                <span className="text-[12px]">Claim</span>
              </LLButton>
            </div>
          </div>
      
        </div>
      </div>
      <div className="flex items-center mt-4">
        <Image src={music} alt="music" className="w-full"></Image>
      </div>
    </div>
  );

  const earnDropdownMenu = (
    <div className="bg-white rounded-lg shadow-xl min-w-[200px] p-[14px] lg:p-[20px] rounded-[8px]">
      <div className="text-center rounded-[8px] bg-white font-bold relative">
        <Image
          src={bgaite}
          alt="bgaite"
          className="absolute left-[-26px] top-[-22px]"
        ></Image>
        <Image src={bg3} alt="bg3"></Image>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <Image src={share} alt="share"></Image>{" "}
          <div>{t("wallet.shareInviteCode")}</div>
        </div>
        <div className="flex gap-2 items-center">
          <Image src={gift} alt="gift"></Image>{" "}
          <div>{t("wallet.earlyAdopter")}</div>
        </div>
        <div className="flex gap-2 items-center">
          <Image src={money} alt="money"></Image>{" "}
          <div>{t("wallet.doublePoints")}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center gap-4">
        <LLButton
          block
          className="rounded-r-md bg-[#cf0] block flex-1"
          style={{ flex: 1 }}
          onClick={handleShare}
        >
          {t("common.copy")}
        </LLButton>

        <LLButton
          block
          style={{ flex: 1 }}
          className="rounded-r-md bg-[#cf0] px-[14px] block"
          onClick={handleShareX}
        >
          {t("common.xPost")}
        </LLButton>
      </div>
    </div>
  );

  const handleToPoint = () => {
    router.replace("my-points");
  };

  return (
    <>
      <Suspense fallback={null}>
        <URLParamsHandler />
      </Suspense>
      {isLogin ? (
        <LLButton className="bg-[#cf0] h-[38px] lg:h-[5vh]">
          <Dropdown
            open={earnDropdownOpen}
            onOpenChange={setEarnDropdownOpen}
            popupRender={() => earnDropdownMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center justify-center gap-1 px-1 lg:px-2">
              <span className="text-[12px] lg:text-[14px]">
                {t("menu.earn")}
              </span>
              <Image className="hidden lg:block" src={toLink} alt=""></Image>
            </div>
          </Dropdown>
        </LLButton>
      ) : (
        <></>
      )}
      {isLogin ? (
        <LLButton className="h-[38px] lg:h-[5vh]" onClick={handleToPoint}>
          <div className="flex items-center justify-center gap-1 px-1 lg:px-2">
            <div className="w-[24px] h-[24px] rounded-full bg-black flex items-center justify-center">
              <Image
                src={pointer}
                className="w-[18px] h-[18px] icon-pointer"
                alt=""
              ></Image>
            </div>
            <span className="text-[12px] lg:text-[14px]">{points ?? "--"}</span>
          </div>
        </LLButton>
      ) : (
        <></>
      )}

      <LLButton
        className="h-[38px] lg:h-[5vh]"
        style={{ padding: "0" }}
        loading={loading}
      >
        <div className="flex items-center h-[100%] justify-center gap-1 text-base">
          <div
            className={`flex justify-center items-center ${
              isLogin ? "" : "px-2"
            }`}
          >
            {isLogin ? (
              <Dropdown
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                popupRender={() => dropdownMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div
                  className="flex items-center gap-1 h-[40px] lg:h-[5vh] cursor-pointer hover:opacity-80 transition-opacity  px-2"
                  onClick={handleDropdownClick}
                >
                  <div
                    title={localAddress}
                    className="flex items-center justify-center gap-1 lg:gap-2 text-[12px] lg:text-[14px]"
                  >
                    {otherInfo.image ? (
                      <Image
                        src={otherInfo.image}
                        width={20}
                        height={20}
                        className="rounded-full"
                        alt=""
                      ></Image>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300 hidden lg:block"></div>
                    )}
                    <span className="flex">
                      {addressDots(localAddress || "", 4, 4)}
                    </span>
                  </div>
                  <CaretDownOutlined className="text-gray-500 ml-1" />
                </div>
              </Dropdown>
            ) : (
              <div
                className="flex items-center justify-center gap-2 px-2"
                onClick={handleLogin}
              >
                <span>{t("home.login")}</span>
              </div>
            )}
          </div>
        </div>
      </LLButton>
      <Modal
        title={t("home.loginExpired")}
        closable={{ "aria-label": "Custom Close Button" }}
        open={showAuthDialog}
        onOk={handleConfirmRelogin}
        onCancel={handleCancel}
      >
        <p className="text-[14px]">{t("home.loginExpiredDesc")}</p>
      </Modal>
      <Modal
        title={t("wallet.accountChanged") || "Account Changed"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={showAccountChangeDialog}
        onOk={handleConfirmAccountChange}
        onCancel={handleCancelAccountChange}
        okText={t("common.confirm") || "Confirm"}
        cancelText={t("common.cancel") || "Cancel"}
        maskClosable={false}
      >
        <p className="text-[14px]">
          {t("wallet.accountChangedDesc") ||
            "Wallet account has changed. Do you want to login with the new account?"}
        </p>
        {newAddress && (
          <p className="text-[12px] text-gray-500 mt-2">
            {t("wallet.newAccount") || "New account"}:{" "}
            {addressDots(newAddress, 6, 6)}
          </p>
        )}
      </Modal>
    </>
  );
};

export default Connect;
