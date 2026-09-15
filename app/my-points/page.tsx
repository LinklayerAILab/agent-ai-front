"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import right from "@/app/images/components/right.svg";
import { LeftOutlined } from "@ant-design/icons";
import "./page.scss";
import pointer from "@/app/images/components/pointers.svg";
import { useRouter } from "next/navigation";
import Image from "next/image";
import usdt from "@/app/images/components/usdt.svg";
import usdc from "@/app/images/components/usdc.svg";
import lla from "@/app/images/components/lla.svg";
import card from "@/app/images/components/card.svg";
import diamond from "@/app/images/components/diamond.svg";
import percent12 from "@/app/images/points/12percent.svg";
import percent20 from "@/app/images/points/20percent.svg";
import {
  query_tasks,
  QueryTasksItem,
  QueryTasksParams,
} from "../api/agent_c";
import {
  stripe_checkout,
  savePendingOrder,
  STRIPE_ERROR_CODES,
  StripeCheckoutData,
  StripePackageType,
} from "../api/stripe";
import { message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useAccount, useChainId, useWriteContract, useSwitchChain, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { parseUnits } from "viem";
import erc20Abi from "@/app/abi/erc20.json";
import PointsHistory from "./components/PointsHistory";

interface ListItem {
  value: number;
  select: boolean;
  money: string;
  count: number;
  type: StripePackageType;
}
interface CoinListItem {
  value: string;
  label: string;
  select: boolean;
  icon: string;
  disabled: boolean;
  contract?: string
  decimal?:number
}

// ⚠️ TEMP MOCK for mobile style preview - flip to true (or delete) after review
const USE_MOCK_DATA = false;
// fixed epoch (~2026-09-14) instead of Date.now() so SSR and client render match
const MOCK_NOW = 1789400000;
const MOCK_RECORDS: QueryTasksItem[] = [
  { type: 7, point: "990", timestamp: MOCK_NOW - 60 * 10 },
  { type: 6, point: "50", timestamp: MOCK_NOW - 3600 * 2 },
  { type: 1, point: "100", timestamp: MOCK_NOW - 86400 },
  { type: 2, point: "100", timestamp: MOCK_NOW - 86400 - 3600 * 2 },
  { type: 3, point: "50", timestamp: MOCK_NOW - 86400 * 2 },
  { type: 4, point: "50", timestamp: MOCK_NOW - 86400 * 3 },
  { type: 5, point: "200", timestamp: MOCK_NOW - 86400 * 5 },
];

const getActualRecords = (records: QueryTasksItem[]) =>
  records.filter((record) => record.timestamp !== undefined);

const getRecordsSignature = (records: QueryTasksItem[]) =>
  getActualRecords(records)
    .map((record) => `${record.type ?? "unknown"}-${record.point ?? "unknown"}-${record.timestamp}`)
    .join("|");

const Page = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const config = useConfig();

  // Get token configuration
  const USDT_MAINNET = process.env.NEXT_PUBLIC_USDT_MAINNET;
  const USDC_MAINNET = process.env.NEXT_PUBLIC_USDC_MAINNET;
  const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

  const defaultChainId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 56;
  const isBscMainnet = chainId === 56;
  const isBscTestnet = chainId === 97;


  const [list, setList] = useState<ListItem[]>([
    {
      value: 1,
      select: true,
      money: "9.9",
      count: 990,
      type: "basic",
    },
    {
      value: 2,
      select: false,
      money: "29.9",
      count: 3400,
      type: "standard",
    },
    {
      value: 3,
      select: false,
      money: "99.9",
      count: 12500,
      type: "professional",
    },
  ]);

  const [coinList, setCoinList] = useState<CoinListItem[]>([
    {
      label: "USDT",
      value: "usdt",
      select: true,
      icon: usdt,
      disabled: false,
      contract: USDT_MAINNET,
      decimal: Number(process.env.NEXT_PUBLIC_USDT_DECIMAL) || 18
    },
    {
      label: "USDC",
      value: "usdc",
      select: false,
      icon: usdc,
      disabled: false,
      contract: USDC_MAINNET,
      decimal: Number(process.env.NEXT_PUBLIC_USDC_DECIMAL) || 18
    },
    {
      label: "Card",
      value: "stripe",
      select: false,
      icon: card,
      disabled: false,
    },
    {
      label: "LLA",
      value: "lla",
      select: false,
      icon: lla,
      disabled: true,
    },
  ]);

  const selectedCoin = useMemo(() => {
    return coinList.find((item) => item.select);
  }, [coinList]);
  const tokenAddress = selectedCoin?.contract as `0x${string}`;
  


  const getLatestTokenBalance = async () => {
    if (!address || !tokenAddress) {
      return null;
    }

    return await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }) as bigint;
  };
  // Handle list item click
  const handleListItemClick = (clickedValue: number) => {
    setList((prevList) =>
      prevList.map((item) => ({
        ...item,
        select: item.value === clickedValue,
      }))
    );
  };

  // Handle coin list item click
  const handleCoinListClick = (item: CoinListItem) => {
    if (item.disabled) {
      messageApi.warning(t("common.coming"));
      return;
    }
    if (item.select) {
      return;
    }
    const newList = coinList.map(it => ({
      ...it,
      select: it.disabled === false && it.value === item.value
    }));
    setCoinList(newList);
  };

  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const [stripePaying, setStripePaying] = useState(false);
  const [records, setRecords] = useState<QueryTasksItem[]>(
    USE_MOCK_DATA ? MOCK_RECORDS : []
  );
  const params = useRef<QueryTasksParams>({
    page: 1,
    size: 1000,
  });
  const [listLoading, setlistLoading] = useState(true);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const waitingConfirmationRef = useRef(false);

  // Handle close waiting confirmation
  const handleCloseWaitingConfirmation = () => {
    waitingConfirmationRef.current = false;
    setWaitingConfirmation(false);
  };
  const previousRecordsLengthRef = useRef(0);
  const previousRecordsSignatureRef = useRef("");

  const handleGetList = async () => {
    try {
      // TEMP MOCK: skip the api call and the 8s polling overwrite while
      // previewing (inside try so the finally still clears the loading state)
      if (USE_MOCK_DATA) return;
      const res = await query_tasks(params.current);
      const arr: QueryTasksItem[] = [];
      const total = 12;
      if (res.data?.Res && res.data.Res.length < total) {
        const len = total - res.data.Res.length;
        for (let t = 0; t < len; t++) {
          arr.push({
            type: undefined,
            point: undefined,
            timestamp: undefined,
          });
        }
      }
      const newRecords = res.data ? [...res.data?.Res, ...arr] : [...arr];

      // Check if waiting for confirmation and new data arrived
      // Compare actual record count (excluding empty placeholder records)
      const actualRecords = getActualRecords(newRecords);
      const actualRecordsCount = actualRecords.length;
      const recordsSignature = getRecordsSignature(newRecords);
      if (
        waitingConfirmationRef.current &&
        (
          actualRecordsCount > previousRecordsLengthRef.current ||
          recordsSignature !== previousRecordsSignatureRef.current
        )
      ) {
        waitingConfirmationRef.current = false;
        setWaitingConfirmation(false);
        messageApi.success(t("myPoints.subscribeSuccess") || "Subscribe successful!");
      }

      setRecords(newRecords);
    } finally {
      const t = setTimeout(() => {
        setlistLoading(false);
        clearTimeout(t);
      }, 400);
    }
  };
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isLogin) {
      handleGetList();
      t = setInterval(() => {
        handleGetList();
      }, 8000);
    }

    const t2 = setTimeout(() => {
      if (!isLogin) {
        setlistLoading(false);
        clearTimeout(t2);
      }
    }, 1000);

    return () => {
      clearInterval(t);
    };
  }, [isLogin]);

  // Stripe hosted checkout: create session then leave the SPA entirely.
  // No wallet connection required for card payment.
  const handleStripePay = async () => {
    if (stripePaying) return;

    if (!isLogin) {
      messageApi.error(t("login.connectFirst") || "Please log in first");
      return;
    }

    const selectedItem = list.find((item) => item.select);
    if (!selectedItem) {
      messageApi.warning(t("common.select") || "Please select a package");
      return;
    }

    setStripePaying(true);
    try {
      const res = await stripe_checkout(selectedItem.type);
      savePendingOrder({
        order_no: res.data.order_no,
        package_type: selectedItem.type,
        created_at: Math.floor(Date.now() / 1000),
      });
      // full page redirect to the Stripe hosted checkout page
      window.location.href = res.data.checkout_url;
    } catch (err) {
      const e = err as {
        code?: number;
        message?: string;
        data?: StripeCheckoutData;
      };
      if (e.code === STRIPE_ERROR_CODES.NOT_ENABLED) {
        messageApi.warning(t("myPoints.stripe.notAvailable"));
        // disable the card option and fall back to USDT
        setCoinList((prev) => {
          const next = prev.map((it) =>
            it.value === "stripe" ? { ...it, disabled: true, select: false } : it
          );
          if (!next.some((it) => it.select && !it.disabled)) {
            return next.map((it) => ({ ...it, select: it.value === "usdt" }));
          }
          return next;
        });
      } else if (e.code === STRIPE_ERROR_CODES.INVALID_PACKAGE) {
        messageApi.error(t("myPoints.stripe.invalidPackage"));
      } else if (e.code === STRIPE_ERROR_CODES.UPSTREAM_ERROR) {
        messageApi.error(t("myPoints.stripe.upstreamError"));
      } else if (e.code === STRIPE_ERROR_CODES.PENDING_LIMIT) {
        // 6006: the backend returns the existing pending order of the same
        // package in data - resume its checkout exactly like a fresh success.
        const conflict = e.data;
        if (conflict?.order_no && conflict.checkout_url) {
          savePendingOrder({
            order_no: conflict.order_no,
            package_type: selectedItem.type,
            created_at: Math.floor(Date.now() / 1000),
          });
          messageApi.info(t("myPoints.stripe.resumingPayment"));
          // full page redirect, same as the success path; early return keeps
          // the button in its "redirecting" state (no setStripePaying(false))
          window.location.href = conflict.checkout_url;
          return;
        }
        // backend did not send a usable checkout link - old behaviour
        messageApi.error(t("myPoints.stripe.pendingLimit"));
      } else if (e.code === 429) {
        messageApi.warning(t("myPoints.stripe.tooManyRequests"));
      } else {
        messageApi.error(e.message || t("common.transactionFailed") || "Request failed");
      }
      setStripePaying(false);
    }
  };

  const handlePay = async () => {
    // Stripe branch must run before wallet checks - card payment needs no wallet
    const payCoin = coinList.find((item) => item.select);
    if (payCoin?.value === "stripe") {
      await handleStripePay();
      return;
    }

    if (isPending) return;

    const selectedItem = list.find((item) => item.select);
    if (!selectedItem) {
      messageApi.warning(t("common.select") || "Please select a package");
      return;
    }

    if (!isConnected || !address) {
      messageApi.error(t("login.connectFirst") || "Please connect your wallet first");
      return;
    }

    const selectedCoin = coinList.find((item) => item.select);
    if (!selectedCoin) {
      messageApi.warning(t("common.coming"));
      return;
    }

    const PAYEE_ADDRESS = process.env.NEXT_PUBLIC_PAYEE_ADDRESS;

    // Auto-switch to default chain if not on correct network
    if (chainId !== defaultChainId) {
      try {
        switchChain({ chainId: defaultChainId });
      } catch {
        messageApi.error(t("common.switchNetwork") || "Please switch to the correct network");
        return;
      }
    }

    if (!isBscMainnet && !isBscTestnet) {
      messageApi.error(t("common.switchNetwork") || "Please switch to BSC Mainnet or BSC Testnet");
      return;
    }

    // Check balance
    const requiredAmount = parseUnits(selectedItem.money, selectedCoin.decimal!);
    let latestBalance: bigint | null = null;

    try {
      latestBalance = await getLatestTokenBalance();
    } catch {
      messageApi.error(t("common.transactionFailed") || "Transaction failed");
      return;
    }

    if (latestBalance === null || latestBalance < requiredAmount) {
      messageApi.error(t("common.insufficientBalance") || "Insufficient balance");
      return;
    }

    try {
      await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [PAYEE_ADDRESS, requiredAmount],
      });

      // Record current records length before transaction
      previousRecordsLengthRef.current = getActualRecords(records).length;
      previousRecordsSignatureRef.current = getRecordsSignature(records);

      // Start waiting for chain confirmation
      waitingConfirmationRef.current = true;
      setWaitingConfirmation(true);

      messageApi.success(t("common.transactionSubmitted") || "Transaction submitted");
    } catch {
      waitingConfirmationRef.current = false;
      setWaitingConfirmation(false);
      messageApi.error(t("common.transactionFailed") || "Transaction failed");
    }
  };
  return (
    <div className="page-my-points w-[100%] h-auto lg:h-[83vh] flex flex-col page-home-inner lg:border-solid lg:border-black lg:border-2 rounded-[8px]">
      <div
        className="h-[40px] lg:h-[4vh] bg-[#cf0] rounded-t-[8px] hidden lg:flex items-center px-[14px] cursor-pointer select-none"
        onClick={() => router.push("/")}
      >
        <LeftOutlined></LeftOutlined>{" "}
        <span className="text-[16px] ml-[4px] font-bold">
          {t("common.back")}
        </span>
      </div>
      {messageContext}

      {/* Waiting for chain confirmation message */}
      {waitingConfirmation && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">{t("myPoints.waitingConfirmation") || "Waiting for chain confirmation..."}</span>
          <button
            onClick={handleCloseWaitingConfirmation}
            className="ml-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
            title={t("common.close") || "Close"}
          >
            <CloseOutlined className="text-lg" />
          </button>
        </div>
      )}

      <div className="flex gap-[14px] lg:gap-[2vh] justify-between flex-col lg:flex-row-reverse h-[100%] py-0 lg:py-[3vh] lg:px-[20px] lg:h-[76vh]">
        <div className="lg:flex-1 lg:bg-white lg:rounded-[8px] lg:px-[4vh] lg:py-[2vh]">
          <div className="text-[18px] lg:text-[24px] font-bold flex items-center justify-center mb-[14px] lg:mb-0">
            {t("myPoints.rechargePoints")}
          </div>
          <div className="lg:mt-[2vh] flex flex-col gap-[8px] lg:gap-[1.6vh]">
            {list.map((item) => (
              <div
                key={item.value}
                className="flex justify-between items-center font-bold text-[14px] h-[54px] lg:h-[7.5vh] border-[1px] lg:border-[2px] border-solid border-black rounded-[8px] bg-white px-[14px] cursor-pointer"
                onClick={() => handleListItemClick(item.value)}
              >
                <div className="flex items-center gap-[4px] text-[14px]">
                  <div className="w-[22px] h-[22px] lg:w-[3vh] lg:h-[3vh] bg-black rounded-full flex items-center justify-center moneyIcon">
                    <Image
                      src={pointer}
                      alt="pointer"
                      className="pointerIcon w-[18px]"
                      objectFit="cover"
                    ></Image>
                  </div>
                  {item.count}
                  {item.value === 2 && (
                    <Image
                      src={percent12}
                      className="w-[80px] lg:w-[100px] h-[12px] lg:h-[14px] ml-[10px] lg:ml-[40px]"
                      width={100}
                      height={18}
                      alt=""
                    />
                  )}
                  {item.value === 3 && (
                    <Image
                      src={percent20}
                      className="w-[74px] lg:w-[100px] h-[12px] lg:h-[14px] ml-[6px] lg:ml-[34px]"
                      width={100}
                      height={18}
                      alt=""
                    />
                  )}
                </div>
                <div className="flex items-center gap-[4px] text-[14px] lg:text-[16px]">
                  <span>$ {item.money}</span>
                  <div
                    className={`w-[22px] h-[22px] flex items-center justify-center border-[1px] lg:border-[2px] border-solid border-black rounded-full select-ele ${
                      item.select ? "bg-[#DFFF67]" : ""
                    }`}
                  >
                    {item.select ? (
                      <Image src={right} alt="right"></Image>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[14px] lg:mt-[3vh] text-[14px] font-bold">
            {t("myPoints.paymentMethod")}
          </div>
          <div className="mt-[8px] gap-[8px] lg:gap-[1.6vh] lg:mt-[1.4vh] flex flex-wrap justify-between">
            {coinList.map((item) => (
              <div
                className={`border-[2px] border-solid border-black rounded-[8px] flex h-[42px] lg:h-[7vh] items-center justify-between px-[14px] w-[calc(50%-4px)] lg:w-[calc(50%-0.8vh)] ${
                  item.disabled ? "cursor-not-allowed bg-[#EBEBEB]" : "cursor-pointer bg-[#fff] hover:bg-[#eee]"
                }`}
                key={item.value}
                onClick={() => handleCoinListClick(item)}
              >
                <div className="flex items-center gap-[8px] text-[14px] lg:text-[16px]">
                  <Image
                    src={item.icon}
                    className="w-[24px] h-[24px]"
                    alt="icon"
                  ></Image>
                  <span className="font-bold">
                    {item.value === "stripe" ? t("myPoints.stripe.cardLabel") : item.label}
                  </span>
                </div>

                <div
                  className={`w-[22px] h-[22px] flex items-center justify-center border-[1px] border-solid border-black rounded-full select-ele ${
                    item.select ? "bg-[#DFFF67]" : ""
                  }`}
                >
                  {item.select ? (
                    <Image src={right} alt="right"></Image>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-[1px] border-solid border-black rounded-[5px] pb-[2px] h-[40px] lg:h-[6vh] mt-[14px] lg:mt-[3vh] cursor-pointer select-none">
            <div
              className={`h-[100%] bg-black text-white text-[16px] font-bold text-center flex justify-center items-center rounded-[4px] ${
                stripePaying ? "opacity-60 pointer-events-none" : ""
              }`}
              onClick={handlePay}
            >
              {stripePaying ? t("myPoints.stripe.redirecting") : t("myPoints.recharge")}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[8px] py-[18px] lg:py-[2vh] lg:w-[60%]">
          <div className="text-[14px] lg:text-[16px] flex items-center justify-center gap-[4px] font-bold">
            <Image src={diamond} className="lg:w-[24px]" alt="diamond"></Image>
            {t("myPoints.pointsRecord")}
          </div>
          <PointsHistory records={records} recordsLoading={listLoading} />
        </div>
      </div>
    </div>
  );
};

export default Page;
