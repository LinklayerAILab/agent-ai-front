"use client"

import { KeyboardEvent, useEffect, useRef, useState, Suspense } from "react";
import "./animations.css";
import logoWhite from "@/app/images/logo-white.svg";
import logo from "@/app/images/logo.svg";
import icon from "@/app/images/logoMini.svg";
import loginBg from "@/app/images/login-bg.jpg";
import { message, Tooltip } from "antd";
import {
  post_send_captcha,
  post_user_bind_email,
} from "@/app/api/agent_c";
import { useTranslation, Trans } from "react-i18next";
import LLButton from "../components/LLButton";
import AuthButton from "../components/AuthButton";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftOutlined, RedoOutlined } from "@ant-design/icons";

function BindEmailModalContent() {
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { t } = useTranslation()
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const searchParams = useSearchParams();
  const [bindLoading, setBindLoading] = useState(false);
  const [messageApi, messageContext] = message.useMessage()
  const [loading, setLoading] = useState(false);
  const handleSendCode = async () => {
    if (loading || isCountDown) {
      return;
    }
    try {
      const email = searchParams?.get("email") || "";
      setLoading(true);
      await post_send_captcha({
        email: email,
        type: 0
      });
      handleShowSendTip();
      codeRefs.current[0]?.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      messageApi.error(err?.data?.msg);
    } finally {
      setLoading(false);
      handleCountDown();
    }
  };
  async function handleVerifyClick() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      messageApi.error(t("checkCode.completeCode"));
      return;
    }
    try {
      setBindLoading(true);
      await post_user_bind_email({
        captcha: fullCode,
        email: searchParams?.get("email") || "",
        type: 0
      });
      message.success(t("checkCode.bindSuccess"));
      router.push("/");
    } catch (err) {
      if (err.code === 3018) {
        router.push(`/sendEmail?backURL=${searchParams?.get("backURL") || "/"}`);
      } else {
        messageApi.error(err?.message);
      }

    } finally {
      setBindLoading(false);
    }
  };

  const handleBack = () => {
    router.push(searchParams?.get("backURL") || "/sendEmail");
  };
  const timeCount = 60;
  const [isCountDown, setIsCountDown] = useState(true);
  const [countDown, setCountDown] = useState(timeCount);
  const timeRef = useRef<number>(0);
  const handleCountDown = () => {
    clearInterval(timeRef.current);
    setIsCountDown(true);
    timeRef.current = Number(
      setInterval(() => {
        // const newVal = countDown - 1
        if (countDown === 0) {
          setCountDown(timeCount);
          setIsCountDown(false);
          clearInterval(timeRef.current);
        }
        setCountDown((countDown) => countDown - 1);
      }, 1000)
    );
  };
  useEffect(() => {
    if (!isCountDown) {
      clearInterval(timeRef.current);
      setCountDown(timeCount);
      return;
    }
    handleCountDown();
    return () => {
      clearInterval(timeRef.current);
    };
  }, [countDown, isCountDown, handleCountDown]);
  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  // use useEffect listen code change，确保自动submit逻辑正确execute
  useEffect(() => {
    if (code.every(digit => digit) && code.join("").length === 6) {
      const timer = setTimeout(() => {
        handleVerifyClick();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [code]); // 依赖 code 状态

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      codeRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerifyClick();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }

    setCode(newCode);

    // Focus the last filled input or first empty
    const lastFilledIndex = pastedData.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
      codeRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      codeRefs.current[5]?.focus();
    }

    // 不need手动submit，useEffect 会自动handle
  };
  useEffect(() => {
    codeRefs.current[0]?.focus();
  }, [])
  const [sendSuccess, setSendSuccess] = useState(false);
  const handleShowSendTip = () => {
    if (sendSuccess) {
      return;
    }
    setSendSuccess(true);
    const t = setTimeout(() => {
      setSendSuccess(false);
      clearTimeout(t);
    }, 6000);
  };


  return (
    <div className="fixed left-0 top-0 right-0 bottom-0 z-[1001] transition-all duration-300 ease-in-out bg-cover bg-no-repeat bg-left-top" style={{ backgroundImage: `url(${loginBg})` }}>
      {messageContext}
      {/* <div className="flex items-center lg:fixed justify-center h-9 left-0 right-0 top-[120px] z-[100]">
        <div className="flex items-center justify-center">
          <Link className="flex items-center" href={"/"}>
            <Image src={logo} className="h-[27px]" alt="" />
            <Image src={icon} alt="" className="h-9 w-9 ml-[3px]" />
          </Link>

        </div>
      </div> */}

      <ArrowLeftOutlined className="text-[24px] lg:text-[28px] fixed left-[14px] lg:left-[30px] top-5 cursor-pointer z-[1000]" onClick={handleBack}></ArrowLeftOutlined>

      <div className="backdrop-blur-[16px] gap-4 bg-[rgba(251,251,253,0.7)] w-screen h-screen flex flex-col justify-center items-center px-4 lg:px-0 transition-all duration-300 ease-in-out">
          <div className="flex items-center lg:fixed justify-center h-9 left-0 right-0 lg:top-[22vh] z-[100] mb-4">
        <div className="flex items-center justify-center">
          <Link className="flex items-center" href={"/"}>
            <Image src={logo} className="h-[27px]" alt="" />
            <Image src={icon} alt="" className="h-9 w-9 ml-[3px]" />
          </Link>
   
        </div>
      </div>
        <div className="pb-[23px] lg:pb-0 w-full lg:w-[470px] lg:h-[380px] border-2 border-solid border-black rounded-[12px] overflow-hidden bg-white relative">
          <div className="h-14 font-bold text-2xl px-[23px] bg-black text-white flex items-center">
            <Image src={logoWhite} className="h-[21px]" alt="" />
            <Image src={icon} alt="" className="h-7 w-7 ml-[5px]" />
          </div>
          <div className="text-center font-bold mt-[30px] lg:mt-10 text-[20px] lg:text-2xl leading-6">
            {t("checkCode.tit")}
          </div>
          <div className="flex items-center justify-center mt-4 text-gray-500 font-bold text-[16px]">
            <Trans
              i18nKey="checkCode.sendTo"
              values={{ email: searchParams?.get("email") }}
              components={{
                1: <span className="text-black px-2 font-bold py-1 rounded-md" />
              }}
            />
          </div>
          <div>
            <div className="flex flex-col justify-center items-center mt-[30px] lg:mt-8 px-4">
              {/* 6-digit verification code inputs */}
              <div className="flex gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeRefs.current[index] = el; }}
                    className="bg-[#F3F3F3] w-10 lg:w-9 h-12 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-[#ccff00] transition-all duration-200"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
                <Tooltip
                  color="white"
                  open={sendSuccess}
                  title={
                    <span className="text-black font-bold text-[12px] flex items-center">
                      <i className="i-ep-success-filled text-[#c9ec02] text-base mr-1"></i>
                      {t("checkCode.checkTip")}
                    </span>
                  }
                >
                  <LLButton
                    onClick={handleSendCode}
                    className="h-11 w-10 lg:w-[90px]"
                    loading={loading}
                    disabled={isCountDown && countDown > 0 ? true : false}
                  >
                    {isCountDown ? countDown : <>
                      <span className="hidden lg:block">{t("checkCode.resend")}</span>
                      <RedoOutlined className="block lg:hidden" />
                    </>}
                  </LLButton>
                </Tooltip>
              </div>


            </div>
            <div className="flex justify-center items-center mt-5 lg:mt-8 px-4 lg:px-0">
              <AuthButton
                text={t("common.confirm")}
                icon=""
                loading={bindLoading}
                onClick={handleVerifyClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BindEmailModal() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BindEmailModalContent />
    </Suspense>
  );
}
