"use client";

import React, { useEffect, useRef, useState } from "react";
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
import google from "@/app/images/components/google.svg";
import diamond from "@/app/images/components/diamond.svg";
import percent12 from "@/app/images/points/12percent.svg";
import percent20 from "@/app/images/points/20percent.svg";
import {
  query_tasks,
  QueryTasksItem,
  QueryTasksParams,
  QueryTasksType,
} from "../api/agent_c";
import { Empty, message, Skeleton } from "antd";
import { formatDate } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { syncPoints } from "../store/userSlice";
import { useAccount, useChainId, useWriteContract, useSwitchChain } from "wagmi";
import { parseUnits } from "viem";
import erc20Abi from "@/app/abi/erc20.json";
interface ListItem {
  value: number;
  select: boolean;
  money: string;
  count: number;
}
interface CoinListItem {
  value: string;
  label: string;
  select: boolean;
  icon: string;
  disabled: boolean;
}
const Page = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [messageApi, messageContext] = message.useMessage();
  const dispatch = useDispatch<AppDispatch>();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [list, setList] = useState<ListItem[]>([
    {
      value: 1,
      select: true,
      money: "9.9",
      count: 990,
    },
    {
      value: 2,
      select: false,
      money: "29.9",
      count: 3400,
    },
    {
      value: 3,
      select: false,
      money: "99.9",
      count: 12500,
    },
  ]);

  const [coinList, setCoinList] = useState<CoinListItem[]>([
    {
      label: "USDT",
      value: "usdt",
      select: true,
      icon: usdt,
      disabled: false,
    },
    {
      label: "USDC",
      value: "usdc",
      select: false,
      icon: usdc,
      disabled: true,
    },
    {
      label: "LLA",
      value: "lla",
      select: false,
      icon: lla,
      disabled: true,
    },
    {
      label: "Google Pay",
      value: "google pay",
      select: false,
      icon: google,
      disabled: true,
    },
  ]);

  // handle list 椤圭偣鍑?
  const handleListItemClick = (clickedValue: number) => {
    setList((prevList) =>
      prevList.map((item) => ({
        ...item,
        select: item.value === clickedValue,
      }))
    );
  };

  // handle coinList 椤圭偣鍑?
  const handleCoinListClick = (item: CoinListItem) => {
    if (item.disabled) {
      messageApi.warning(t("common.coming"));
      return;
    }
    if (item.select) {
      return;
    }
    setCoinList((prevList) =>
      prevList.map((item) => ({
        ...item,
        select: item.value === item.value,
      }))
    );
  };

  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const [records, setRecords] = useState<QueryTasksItem[]>([]);
  const params = useRef<QueryTasksParams>({
    page: 1,
    size: 1000,
  });
  const [listLoading, setlistLoading] = useState(true);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const waitingConfirmationRef = useRef(false);
  const previousRecordsLengthRef = useRef(0);

  const handleGetList = async () => {
    try {
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
      const actualRecordsCount = newRecords.filter(r => r.timestamp !== undefined).length;
      if (waitingConfirmationRef.current && actualRecordsCount > previousRecordsLengthRef.current) {
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
  function getTypeKey(type: QueryTasksType) {
    switch (type) {
      case 1:
        return "bind_web3";
      case 2:
        return "bind_email";
      case 3:
        return "follow_x";
      case 4:
        return "telegram_group";
      case 5:
        return "new_user";
      case 6:
        return "invite_user";
      case 7:
        return "subcribe";
    }
  }

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

  // Poll user points every 5 seconds
  useEffect(() => {
    let pointsInterval: NodeJS.Timeout;

    const startPointsPolling = () => {
      // Clear any existing interval
      if (pointsInterval) {
        clearInterval(pointsInterval);
      }

      // Sync points immediately
      dispatch(syncPoints());

      // Then sync every 5 seconds
      pointsInterval = setInterval(() => {
        dispatch(syncPoints());
      }, 5000);
    };

    if (isLogin) {
      startPointsPolling();
    }

    // Cleanup on unmount
    return () => {
      if (pointsInterval) {
        clearInterval(pointsInterval);
      }
    };
  }, [isLogin, dispatch]);

  const handlePay = async () => {
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
    if (!selectedCoin || selectedCoin.value !== "usdt") {
      messageApi.warning(t("common.coming") || "Only USDT is supported right now");
      return;
    }

    const PAYEE_ADDRESS = process.env.NEXT_PUBLIC_PAYEE_ADDRESS;
    const USDT_MAINNET = process.env.NEXT_PUBLIC_USDT_MAINNET;
    const MOCK_USDT_TESTNET = process.env.NEXT_PUBLIC_MOCK_USDT_TESTNET;
    const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

    const defaultChainId = DEFAULT_CHAIN_ID ? parseInt(DEFAULT_CHAIN_ID) : 56;
    const isBscMainnet = chainId === 56;
    const isBscTestnet = chainId === 97;

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

    const tokenAddress = isBscTestnet ? MOCK_USDT_TESTNET : USDT_MAINNET;
    const decimals = isBscTestnet ? 6 : 18;

    try {
      const amount = parseUnits(selectedItem.money, decimals);
      await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [PAYEE_ADDRESS, amount],
      });

      // Record current records length before transaction
      previousRecordsLengthRef.current = records.filter(r => r.timestamp !== undefined).length;

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
                className={`border-[2px] border-solid border-black rounded-[8px] flex h-[42px] bg-[#EBEBEB] lg:h-[7vh] items-center justify-between px-[14px] w-[calc(50%-4px)] lg:w-[calc(50%-0.8vh)] ${
                  item.disabled ? "cursor-not-allowed" : "cursor-pointer "
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
                  <span className="font-bold">{item.label}</span>
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
            <div className="h-[100%] bg-black text-white text-[16px] font-bold text-center flex justify-center items-center rounded-[4px]" onClick={handlePay}>
              {t("myPoints.recharge")}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[8px] py-[18px] lg:py-[2vh] lg:w-[42%]">
          <div className="text-[16px] lg:text-[24px] flex items-center gap-[4px] justify-center font-bold">
            <Image src={diamond} className="lg:w-[24px]" alt="diamond"></Image>
            {t("myPoints.pointsRecord")}
          </div>
          <div className="rounded-[8px] overflow-hidden mx-[0] lg:mx-[3vh] list-box mt-[14px] lg:mt-[3vh] lg:h-[59vh] overflow-y-auto">
            {listLoading ? (
              // 楠ㄦ灦灞?
              <div className="p-4 space-y-2 w-[100%]">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-[4%]"
                  >
                    <Skeleton.Input
                      style={{
                        width: "35%",
                      }}
                      className="h-[36px] lg:h-[3.6vh] flex items-center"
                      active
                      size="small"
                    />
                    <Skeleton.Input
                      style={{
                        width: "35%",
                      }}
                      className="h-[36px] lg:h-[3.6vh] flex items-center"
                      active
                      size="small"
                    />
                    <Skeleton.Input
                      style={{
                        width: "25%",
                      }}
                      className="h-[36px] lg:h-[3.6vh] flex items-center"
                      active
                      size="small"
                    />
                  </div>
                ))}
              </div>
            ) : records.length ? (
              records.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center h-[40px] lg:h-[4.85vh] list-item-ele justify-evenly"
                >
                  <div className="flex-1 flex items-center justify-start text-[12px] lg:text-[14px] pl-[14px] font-bold">
                    {item.type ? t(`subscribe.${getTypeKey(item.type)}`) : ""}
                  </div>
                  {/* <div className="flex-1"><span className="lh-[16px] bg-[#cf0] px-[8px] text-[12px] rounded-[4px]">{t('common.success')}</span></div> */}
                  <div className="flex-1  flex justify-center items-center text-[12px] lg:text-[14px] font-bold">
                    {item.point}
                  </div>
                  <div className="flex-1 pl-[14px] flex justify-end items-center text-[14px] pr-[14px] font-bold">
                    {item.timestamp
                      ? formatDate(item.timestamp * 1000, "MM/DD HH:mm")
                      : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[100%] flex items-center justify-center">
                <Empty description={t("common.noData")} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;





