"use client"

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import logoWhite from "@/app/images/logo-white.svg";
import logo from "@/app/images/logo.svg";
import icon from "@/app/images/logoMini.svg";
import loginBg from "@/app/images/login-bg.jpg";
import { Checkbox, CheckboxChangeEvent, message } from "antd";
import { Reg_email } from "@/app/enum/regrex";
import { post_send_captcha } from "@/app/api/agent_c";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import "./animations.css";
import AuthButton from "../components/AuthButton";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";

function SendEmailContent() {
  const emailRef = useRef<HTMLInputElement>(null)
  const {t} = useTranslation()
  const router = useRouter();
  // const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const searchParams = useSearchParams();
  const handleSendCode = async () => {
    try {
      setEmailLoading(true);
          await post_send_captcha({
        email,
        type:0
      });
      router.push(`/checkCaptcha?email=${email}&backURL=/sendEmail`);
      
    }catch(err){
      if(err.code === 3019 || err.code === 0) {
        router.push(`/checkCaptcha?email=${email}&backURL=/sendEmail`);
      }
      message.error(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleClick = () => {
    if(!checked) {
      message.warning(t('common.agreeTerms'));
      return;
    }
    if (!email) {
      message.warning(t('common.enterEmail'));
      return;
    }
    if (!Reg_email.test(email)) {
      message.warning(t('common.emailInvalid'));
      return;
    }
    handleSendCode();
  };

  const handleBack = () => {
    router.push(searchParams?.get("backURL") || "/");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleClick();
    }
  };

  useEffect(() => {
    emailRef.current?.focus()
  },[])


      const [checked, setChecked] = useState(true);
    const agreeChange = (e: CheckboxChangeEvent) => {
      setChecked(e.target.checked);
    };
  return (
    <div className="fixed left-0 top-0 right-0 bottom-0 z-[1001] transition-all duration-300 ease-in-out bg-cover bg-no-repeat bg-left-top" style={{backgroundImage: `url(${loginBg})`}}>

      {/* <Link className="flex items-center text-[24px] lg:text-[30px] fixed left-[14px] lg:left-[30px] top-8 cursor-pointer z-[1000]" href={"/"}>
            <Image src={logo} className="h-[27px]" alt="" />
            <Image src={icon} alt="" className="h-9 w-9 ml-[3px]" />
          </Link> */}
      <ArrowLeftOutlined className="text-[24px] lg:text-[28px] fixed left-[14px] lg:left-[30px] top-5 cursor-pointer z-[1000]"  onClick={handleBack}></ArrowLeftOutlined>
      <div className="backdrop-blur-[16px] gap-4 bg-[rgba(251,251,253,0.7)] w-screen h-screen flex flex-col justify-center items-center px-4 lg:px-0 transition-all duration-300 ease-in-out">
          <div className="flex items-center lg:fixed justify-center h-9 left-0 right-0 lg:top-[22vh] z-[100] mb-4">
        <div className="flex items-center justify-center">
          <Link className="flex items-center" href={"/"}>
            <Image src={logo} className="h-[27px]" alt="" />
            <Image src={icon} alt="" className="h-9 w-9 ml-[3px]" />
          </Link>
   
        </div>
      </div>
        <div className="pb-[23px] lg:pb-0 w-full lg:w-[470px] lg:h-[350px] border-2 border-solid border-black rounded-[12px] overflow-hidden bg-white relative">
          <div className="h-14 font-bold text-2xl px-[23px] bg-black text-white flex items-center">
            <Image src={logoWhite} className="h-[21px]" alt="" />
            <Image src={icon} alt="" className="h-7 w-7 ml-[5px]" />
          </div>
          <div className="text-center font-bold mt-10 lg:mt-10 text-[20px] lg:text-2xl leading-6">
            {t("sendEmail.tit")}
          </div>
          <div className="px-5 lg:px-[50px] mt-[15px] text-[13px] lg:text-[15px]">
          </div>
          <div>
            <div className="flex justify-center items-center mt-5 lg:mt-5 px-4">
              <input
                className="input-default w-full lg:w-[360px] font-bold"
                style={{ fontSize: "16px" }}
                type="email"
                name="email"
                placeholder={t("sendEmail.place")}
                value={email}
                ref={emailRef}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex justify-center items-center mt-[26px] lg:mt-[30px] px-4 lg:px-[14px]">
              <AuthButton
                onClick={handleClick}
                loading={emailLoading}
                text={t("sendEmail.send")}
              >
              </AuthButton>
            </div>
          </div>
            <div className="agree-box mt-4 flex justify-center items-center flex">
              <Checkbox checked={checked} onChange={agreeChange} />
              <div className="flex justify-center items-center text-[12px] font-bold ml-2">
                <div className="flex items-center">I agree to the
                <Link href="https://www.linklayer.ai/termsOfService" target="_blank" className="agreement text-[#677FFF] mx-[4px]">
                  Terms of Service
                </Link>
                and
                <Link href="https://www.linklayer.ai/privacyPolicy" target="_blank" className="agreement text-[#677FFF] mx-[4px]">
                  Privacy Policy
                </Link></div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendEmailContent />
    </Suspense>
  );
}
