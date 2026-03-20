"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { addressDots } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
// import logoutIcon from "@/app/images/header/logout.svg";
import LLButton from "./LLButton";
import {
  getSiweNonce,
  verifySiweMessage,
  user_rewardpoints,
} from "../api/user";
import {
  logout,
  setOtherInfo,
  setUserInfo,
  syncPoints,
} from "../store/userSlice";
import { CaretDownOutlined } from "@ant-design/icons";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Dropdown, Modal, message } from "antd";
import { SiweMessage } from "siwe";
import pointer from "@/app/images/components/pointers.svg";
import email from "@/app/images/loginPanel/email.svg";
import toLink from "@/app/images/agent/toLink.svg";
import music from "@/app/images/loginPanel/music.svg";
import Link from "next/link";
import { get_user_info } from "../api/agent_c";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
// import success from "@/app/images/subscribe/success.svg";
import { useSignMessage } from "wagmi";
import { CHAIN_ID } from "../enum";
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
// internalcomponenthandle URL parameter
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
  const [hasManualLogout, setHasManualLogout] = useState(false); // 标记用户是否主动退出登�?

  const points = useSelector((state: RootState) => state.user.points);
  const dispatch = useDispatch<AppDispatch>();
  const otherInfo = useSelector((state: RootState) => state.user.otherInfo);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [earnDropdownOpen, setEarnDropdownOpen] = useState(false);
  // const [rewardPoints, setRewardPoints] = useState<number>(0);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  // listen钱packageconnection状�?connectionafter自动trigger手�?SIWE signature
  useEffect(() => {
    // ifuser主动退出login，不自动trigger登�?
    if (isConnected && address && !isLogin && !hasManualLogout) {
      localStorage.setItem("address", address);
      // 钱packageconnectionSuccess且未login,调用手动 SIWE signature
      handleManualSign();
    }
  }, [isConnected, address, isLogin, hasManualLogout]);

  // listen钱package账号切换event
  useEffect(() => {
    const savedAddress = localStorage.getItem("address");

    // when钱package已connection、已login、且address发生change�?账号切换)
    if (
      isConnected &&
      address &&
      savedAddress &&
      address !== savedAddress &&
      isLogin
    ) {
      setNewAddress(address);
      // 弹出confirmpair话�?
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
  // loginSuccessaftersync积�?
  useEffect(() => {
    if (isLogin) {
      dispatch(syncPoints());
      get_user_info().then((res: { data: unknown }) => {
        if (res) {
          dispatch(setOtherInfo(res.data));
        }
      });
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
    // 直接调用loginmethod
    await handleManualSign();
  };

  const handleCancelAccountChange = () => {
    setShowAccountChangeDialog(false);
  };

  const { signMessageAsync } = useSignMessage();

  // 手动 SIWE 一key登�?Ethereum
  const handleManualSign = async () => {
    if (!address || !isConnected) {
      console.error("Please connect wallet first");
      messageApi.error(
        t("login.connectFirst") || "Please connect wallet first",
      );
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
      // 3. requestsignature - use walletProvider 来support社交登�?
      const message = siweMessage.prepareMessage();

      const signature = await signMessageAsync({ message });
      const invite_code = localStorage.getItem(INVITE_CODE_KEY) || "";
      // 4. verificationsignature并获�?access_token
      const result = await verifySiweMessage({
        message,
        signature,
        invite_code,
      });

      // 5. save access_token
      localStorage.setItem("access_token", result.data.access_token);

      // 6. 调用after端login API

      dispatch(setUserInfo(result.data));

      // loginSuccessafterreset退出login标�?
      setHasManualLogout(false);

      messageApi.success(t("login.success") || "Login successful!");

      // 7. immediatelyrefresh积分anduser信�?
      dispatch(syncPoints());
      get_user_info().then((res: { data: unknown }) => {
        if (res) {
          dispatch(setOtherInfo(res.data));
        }
      });

      // 8. trigger自Defineevent，notificationotherpageaddress已变�?
      const addressChangedEvent = new CustomEvent("addressChanged", {
        detail: { address: address },
      });
      window.dispatchEvent(addressChangedEvent);
    } catch (error) {
      console.error("SIWE login failed:", error);
      messageApi.error(
        t("login.authFailed") || "Login failed. Please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  // down拉框open时sync积�?
  const handleDropdownClick = async () => {
    if (!dropdownOpen && isLogin) {
      handleRefreshUserInfo();
      // fetch奖励积分
      try {
        await user_rewardpoints();
        // if (res && res.data) {
        //   setRewardPoints(res.data.reward_points);
        // }
      } catch (error) {
        console.error("Failed to fetch reward points:", error);
      }
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // disconnect钱packageconnection
      await disconnect(config);
    } catch (error) {
      console.error("Disconnect wallet failed:", error);
    }

    dispatch(logout());
    setDropdownOpen(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("address");
    // settingslogo，表示user主动退出登�?
    setHasManualLogout(true);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      // user手动点击login，reset退出login标�?
      setHasManualLogout(false);
      // use Reown AppKit openconnectionmodalproceed社交login
      await open();
    } catch (err) {
      console.error("Social auth error:", err);
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

    // handle分享逻辑
    const link = createLink();
    const backUrl = window.location.origin;
    const baseUrl = `${window.location.origin}/toDapp?toUrl=`;
    const fullLink = `${
      baseUrl + encodeURIComponent(link)
    }&backUrl=${encodeURIComponent(backUrl)}`;
    if (fullLink) {
      // 直接复制link并弹出复制Success消�?
      copyToClipboardLocal(fullLink);
    }
  };

  // 复制到剪贴板辅助函�?
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
      message.success(t("common.copySuccess") || "链接已复制到剪贴");
    } catch (error) {
      console.error("复制失败:", error);
      message.error(t("common.copyError") || "复制失败，请手动复制");
    }
  };

  // refreshuserinformation
  const handleRefreshUserInfo = async () => {
    try {
      const res = await get_user_info();
      if (res && res.data) {
        dispatch(setOtherInfo(res.data));
        // 同时refresh积分
        dispatch(syncPoints());
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error);
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
          {/* <div className="text-[12px] text-gray-800 flex flex-wrap items-center gap-1 font-bold ">
            {t("header.myPoints")}
            <span>
              <span> {pointsLoading ? "..." : points || 0}</span>
            </span>
          </div> */}
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
          {/* <Image src={logoutIcon} alt="" className="w-[22px]"></Image> */}
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
                {otherInfo.email || "---"}
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
          <div className="bg-[#E9FF93] rounded-[8px] w-[55%] rounded-[8px] h-[50px] lg:h-[60px]  px-2 py-3">
            <div className="h-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src={smallMoney} alt="" />
                <div className="text-[#666666] text-[12px]">
                  {t("wallet.myPoints")}
                </div>
              </div>
              <div className="font-bold text-black">
                {points || '---'}
              </div>
            </div>
          </div>
          <div className="bg-[#F9FFE2] rounded-[8px] w-[43%] rounded-[8px] h-[50px] lg:h-[60px] px-2 py-3">
            <div className="h-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src={smallPeople} alt="" />
                <div className="text-[#666666] text-[12px]">
                  {t("wallet.myInvite")}
                </div>
              </div>
              <div className="font-bold text-black">
                {otherInfo.invite_count || "---"}
              </div>
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
        {/* 用户可以在这里自定义内容 */}
        <Image src={bg3} alt="bg3"></Image>
        {/* {t("wallet.inviteTip")} */}
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
              <span className="text-[12px] lg:text-[16px]">
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
            <span className="text-[12px] lg:text-[16px]">{points}</span>
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
            {isLogin && address ? (
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
                    title={address}
                    className="flex items-center justify-center gap-1 lg:gap-2 text-[12px] lg:text-[16px]"
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
                      {addressDots(address || "", 4, 4)}
                    </span>
                  </div>
                  <CaretDownOutlined className="text-gray-500 ml-1" />
                  {/* <UserPanel /> */}
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
