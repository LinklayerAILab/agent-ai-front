"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import copyIcon from "@/app/images/mydata-copy.svg";
import successIcon from "@/app/images/success.svg";

export interface CopyProps {
  text: string;
  className?: string;
  width?: number;
  height?: number;
  onCopySuccess?: () => void;
}

const Copy = ({
  text,
  className = "",
  width = 13,
  height = 13,
  onCopySuccess,
}: CopyProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyWithTextarea = (value: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.readOnly = true;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";
    textArea.style.padding = "0";
    textArea.style.border = "0";
    textArea.style.outline = "0";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, value.length);

    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleCopy = async () => {
    if (!text) {
      message.error(t("common.copyEmpty", { defaultValue: "Nothing to copy" }));
      return;
    }

    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyWithTextarea(text);
      }
    } catch {
      try {
        copyWithTextarea(text);
      } catch (fallbackError) {
        console.error("Copy failed:", fallbackError);
        message.error(t("common.copyError", { defaultValue: "Copy failed" }));
        return;
      }
    }

    setCopied(true);
    message.success(t("common.copySuccess", { defaultValue: "Copied to clipboard" }));
    onCopySuccess?.();
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div
      className={`cursor-pointer inline-flex items-center justify-center bg-[#cf0] rounded-full p-[7px] ${className}`}
      onClick={handleCopy}
    >
      {copied ? (
        <Image src={successIcon} width={width} height={height} alt="copied" />
      ) : (
        <Image src={copyIcon} width={width} height={height} alt="copy" />
      )}
    </div>
  );
};

export default Copy;
