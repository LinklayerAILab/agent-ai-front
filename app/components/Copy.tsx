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

  const handleCopy = async () => {
    if (!text) return;

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

      setCopied(true);
      message.success(t("common.copySuccess") || "Copied to clipboard");
      onCopySuccess?.();
    } catch (error) {
      console.error("Copy failed:", error);
      message.error(t("common.copyError") || "Copy failed");
    }
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
