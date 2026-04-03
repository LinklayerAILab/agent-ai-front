"use client";
import PriceCard from "./PriceCard";
import "./Subscribe.scss";
import { useEffect, useRef, useState } from "react";
import Quarter from "./Quarter";
import Annual from "./Annual";
import { useTranslation } from "react-i18next";
// import abi from "../abi/productScription.json";
import { message, Skeleton, Empty } from "antd";
// import { CHAIN_ID, CONTRACT, ERC20_CONTRACT, isProd } from "../enum";
// import { useSwitchChain } from "wagmi";
// import { readContract} from "wagmi/actions";
import { query_tasks, QueryTasksItem, QueryTasksParams, QueryTasksType } from "../api/agent_c";
import { useSelector } from "react-redux";
import { RootState } from "../store";
// import erc20Abi from "../abi/erc20.json"
// import { config } from "../config/appkit";
import { formatDate } from "../utils";
// import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
// import { useDisconnect } from "wagmi";
// import { preventiveSessionCheck } from "../utils/walletConnectFix";
// import { 
//   getFriendlyErrorMessage 
// } from "../utils/connectionRecovery";
// import { getChainName } from "../utils/chainConfig";
// import { formatUnits } from "viem";


const Subscribe = () => {
  const { t } = useTranslation();
  // const { address, isConnected } = useAppKitAccount();
  // const { chainId } = useAppKitNetwork()
  // const { open } = useAppKit()

  // const { switchChainAsync } = useSwitchChain()
  // const { disconnect } = useDisconnect()
  const [messageApi, contextHolder] = message.useMessage();
  const [loading,] = useState(false);
  const [loading2,] = useState(false);
  // const [orderModalVisible, setOrderModalVisible] = useState(false);
  // const [orderType, setOrderType] = useState<number>(1);
  // const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(undefined);
  // const [allowance, setAllowance] = useState<bigint | undefined>(undefined);

  // Wallet error modal state
  // const [walletErrorVisible, setWalletErrorVisible] = useState(false);
  // const [walletError, setWalletError] = useState<string>('');

 

  const handleSubscribe = async () => {
    // Temporarily disable subscribe functionality, show coming soon message
    messageApi.warning(t("common.coming"));
    return;

    // if(!isLogin){
    //   messageApi.warning(t("agent.toLogin"))
    //   return
    // }


    // if (type === 2) {
    //   messageApi.info(t("common.coming"));
    //   return
    // }

    // // // 1. Connect wallet
    // if (!address) {
    //   localStorage.setItem("subscribeType", type + "")
    //   await open()
    //   return
    // }

    // // // 2. Display order modal directly
    // setOrderType(type);
    // setOrderModalVisible(true);

  };


  // useEffect(() => {
  //   if (Number(chainId) !== CHAIN_ID) {
  //     console.warn("switch chain", CHAIN_ID)
  //     switchChainAsync({ chainId: CHAIN_ID! })
  //   }
  // }, [chainId])

  // Fetch token balance and allowance amount
  // useEffect(() => {
  //   if (address && chainId && chainId === CHAIN_ID) {
  //     fetchTokenData();
  //   }
  // }, [address, chainId])

  // Listen to address change event, refresh page data
  // useEffect(() => {
  //   const handleAddressChanged = (event: CustomEvent) => {
  //     console.log('Address changed event received:', event.detail);
  //     // refreshing token data
  //     if (address && chainId && chainId === CHAIN_ID) {
  //       fetchTokenData();
  //     }
  //   };

  //   window.addEventListener('addressChanged', handleAddressChanged as EventListener);

  //   return () => {
  //     window.removeEventListener('addressChanged', handleAddressChanged as EventListener);
  //   };
  // }, [address, chainId])

  // useEffect(() => {
  //   const type = localStorage.getItem("subscribeType")
  //   if (type && isConnected && address) {
  //     localStorage.removeItem("subscribeType")
  //     setOrderType(parseInt(type));
  //     setOrderModalVisible(true);
  //   }
  // }, [address, isConnected])

  // Refresh token balance and allowance when opening order modal
  // useEffect(() => {
  //   if (orderModalVisible && address && chainId && chainId === CHAIN_ID) {
  //     console.log("Order modal opened, refreshing token data...");
  //     fetchTokenData();
  //   }
  // }, [orderModalVisible, address, chainId])

  // const getOrderAmount = () => {
  //   return orderType === 1 ? "5.9" : "100";
  // };

  // const getOrderTitle = () => {
  //   return orderType === 1 ? t("order.quarter.title") : t("order.annual.title");
  // };

  // const { data: hash, writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract()

  // const { isLoading: isConfirming } = useWaitForTransactionReceipt({
  //   hash,
  // })

  // Define product data type
  // type ProductData = {
  //   amount: bigint;
  //   productId: bigint;
  //   totalDays: bigint;

  // };

  // Fetch token balance and allowance amount async function
  // const fetchTokenData = async () => {
  //   if (!address || !chainId || chainId !== CHAIN_ID) return;


  //   try {
  //     const [balanceResult, allowanceResult] = await Promise.all([
  //       readContract(config, {
  //         address: ERC20_CONTRACT as `0x${string}`,
  //         abi: erc20Abi,
  //         functionName: 'balanceOf',
  //         args: [address],
  //         chainId: CHAIN_ID,
  //       }),
  //       readContract(config, {
  //         address: ERC20_CONTRACT as `0x${string}`,
  //         abi: erc20Abi,
  //         functionName: 'allowance',
  //         args: [address, CONTRACT],
  //         chainId: CHAIN_ID,
  //       })
  //     ]);
      

  //     setTokenBalance(balanceResult as bigint);
  //     setAllowance(allowanceResult as bigint);
  //   } catch (error) {
  //     console.error('Failed to fetch token data:', error);
  //   }
  // };

  // Fetch product information async function
  // const fetchProductData = async () => {
  //   try {
  //     const productResult = await readContract(config, {
  //       address: CONTRACT as `0x${string}`,
  //       abi: abi.abi,
  //       functionName: 'getProduct',
  //       args: [1],
  //       chainId: CHAIN_ID,
  //     });
  //     return productResult as ProductData;
  //   } catch (error) {
  //     console.error('Failed to fetch product data:', error);
  //     throw error;
  //   }
  // };

  // Fetch allowance amount
  // const fetchAllowance = async () => {
  //   try {
  //     const allowanceResult = await readContract(config, {
  //       address: ERC20_CONTRACT as `0x${string}`,
  //       abi: erc20Abi,
  //       functionName: 'allowance',
  //       args: [address, CONTRACT],
  //       chainId: CHAIN_ID,
  //     });
  //     return allowanceResult as bigint;
  //   } catch (error) {
  //     console.error('Failed to fetch allowance:', error);
  //     throw error;
  //   }
  // };

  // Refresh allowance amount (update state)
  // const refetchAllowance = async () => {
  //   if (!address || !chainId || chainId !== CHAIN_ID) return;

  //   try {
  //     const allowanceResult = await fetchAllowance();
  //     setAllowance(allowanceResult);
  //   } catch (error) {
  //     console.error('Failed to refetch allowance:', error);
  //   }
  // };

  // Format balance display (assumes token has 18 decimal places)
  // const formatTokenBalance = (balance: bigint | undefined, decimals: number = 18) => {
  //   if (!balance) return "0";
  //   return formatUnits(balance, decimals);
  // };

  // Check if authorization is needed
  // const needsApproval = (amount: bigint | undefined, currentAllowance: bigint | undefined) => {
  //   if (!amount || !currentAllowance) return true;
  //   return currentAllowance < amount;
  // };

  // Remove auto-success handling, manually handle after transaction confirmation

  // useEffect(() => {
  //   if (writeError) {
  //     messageApi.error(`${t("order.transactionFailedPrefix")} ${writeError.message}`);
  //   }
  // }, [writeError, messageApi]);

  // const handleConfirmOrder = async () => {
  //   // Temporarily disable order placement functionality
  //   messageApi.info(t("common.coming"));
  //   return;

  //   // /**
  //   //  * @param productId Product ID
  //   //  * @param orderId Order ID
  //   //  * @param payToken Payment token address
  //   //  * @param userId User ID
  //   //  */

  //   // try {
  //   //   console.log('🔍 Execute order before session check...')
  //   //   const hadIssues = preventiveSessionCheck()
  //   //   if (hadIssues) {
  //   //     messageApi.info(t("order.walletCacheCleaned"))
  //   //     await new Promise(resolve => setTimeout(resolve, 1000))
  //   //   }

  //   //   // 1. Strictly check wallet connection state
  //   //   if (!address || !isConnected) {
  //   //     messageApi.error(t("order.walletNotConnected"));
  //   //     await open();
  //   //     return;
  //   //   }

  //   //
  //   //   // 2. Force refresh connection state - await wallet state sync
  //   //   console.log('Connection state before:', { address, isConnected, chainId });
  //   //   await new Promise(resolve => setTimeout(resolve, 500));

  //   //   // 2. Check and switch to correct network
  //   //   if (Number(chainId) !== CHAIN_ID) {
  //   //     try {
  //   //       console.log('Switching network:', { from: chainId, to: CHAIN_ID });
  //   //       await switchChainAsync({ chainId: CHAIN_ID });
  //   //       // awaitWait for network switch to complete
  //   //       await new Promise(resolve => setTimeout(resolve, 1500));
  //   //       console.log('Network switch successful');
  //   //     } catch (switchError) {
  //   //       console.error('Network switch failed:', switchError);
  //   //       const errorMessage = switchError.message || switchError.toString();

  //   //       if (errorMessage.includes('Chain not configured')) {
  //   //         messageApi.error(`${t("order.chainNotConfigured")} ${CHAIN_ID}`);
  //   //       } else if (errorMessage.includes('User rejected')) {
  //   //         messageApi.error(t("order.userRejectedNetworkSwitch"));
  //   //       } else {
  //   //         messageApi.error(`${t("order.networkSwitchFailed")}: ${errorMessage}`);
  //   //       }
  //   //       return;
  //   //     }
  //   //   }

  //   //   // 3. Verify connection state again（after network switch）
  //   //   if (!address || !isConnected) {
  //   //     messageApi.error(t("order.walletConnectionLost"));
  //   //     return;
  //   //   }
  //   //   fetchTokenData()
  //   //   // Dynamically fetch product data、authorization amount and token decimals
  //   //   console.log("Fetching product information、authorization amount and token decimals...");
  //   //   const [currentProductData, currentAllowance, tokenDecimals] = await Promise.all([
  //   //     fetchProductData(),
  //   //     fetchAllowance(),
  //   //     readContract(config, {
  //   //       address: ERC20_CONTRACT as `0x${string}`,
  //   //       abi: erc20Abi,
  //   //       functionName: 'decimals',
  //   //       chainId: CHAIN_ID,
  //   //     }).then((v) => Number(v as unknown as string | number))
  //   //   ]);
  //   //   console.log("Product information:", currentProductData);
  //   //   console.log("whenbeforeauthorization amount:", currentAllowance);
  //   //   console.log("Token decimals:", tokenDecimals);

  //   //   if (!currentProductData?.amount || currentAllowance === undefined || !tokenDecimals) {
  //   //     console.error('Product amount error', currentProductData)
  //   //     console.error('Authorization amount error', currentAllowance)
  //   //     console.error('Token decimalserror', tokenDecimals)
  //   //     messageApi.error(t("order.failedToFetchData"));
  //   //     return;
  //   //   }

  //   //   // Convert contract returned amount to actual token amount
  //   //   // currentProductData.amount inis stored with 18 decimals precision storage (BASE_DECIMALS = 18)
  //   //   // Need to convert based on ERC20 actual token decimals
  //   //   // Formula: actualAmount = contractAmount * (10^tokenDecimals) / (10^18)
  //   //   // Example:
  //   //   //   Contract amount = 5.9 * 10^18 = 5900000000000000000
  //   //   //   Token decimals = 6 (USDT on testnet)
  //   //   //   Actual authorization amount = 5900000000000000000 / 10^(18-6) = 5900000

  //   //   const BASE_DECIMALS = BigInt(18);
  //   //   const tokenDecimalsBigInt = BigInt(tokenDecimals);

  //   //   let approvalAmount: bigint;
  //   //   if (tokenDecimalsBigInt < BASE_DECIMALS) {
  //   //     // Token decimalsless than 18,need to divide by difference
  //   //     const decimalDiff = BASE_DECIMALS - tokenDecimalsBigInt;
  //   //     approvalAmount = currentProductData.amount / (BigInt(10) ** decimalDiff);
  //   //   } else if (tokenDecimalsBigInt > BASE_DECIMALS) {
  //   //     // Token decimalsgreater than 18,need to multiply by difference
  //   //     const decimalDiff = tokenDecimalsBigInt - BASE_DECIMALS;
  //   //     approvalAmount = currentProductData.amount * (BigInt(10) ** decimalDiff);
  //   //   } else {
  //   //     // Decimals same,use directly
  //   //     approvalAmount = currentProductData.amount;
  //   //   }

  //   //   console.log("Amount calculation:", {
  //   //     contractAmount: currentProductData.amount.toString(),
  //   //     contractDecimals: 18,
  //   //     tokenDecimals: tokenDecimals,
  //   //     approvalAmount: approvalAmount.toString(),
  //   //     humanReadable: `${Number(approvalAmount) / (10 ** Number(tokenDecimals))} USDT`
  //   //   });

  //   //   // Check if authorization is needed
  //   //   if (needsApproval(approvalAmount, currentAllowance)) {
  //   //     console.log("Need authorization，whenbeforeauthorization amount:", currentAllowance, "required amount:", approvalAmount);

  //   //     // 4. Final verification of connection state before authorization
  //   //     if (!address || !isConnected) {
  //   //       messageApi.error(t("order.walletConnectionLost"));
  //   //       return;
  //   //     }

  //   //     // First authorize contract to use wallet tokens
  //   //     console.log('Authorization parameters:', {
  //   //       chain: isProd ? 'BSC' : 'BSC Testnet',
  //   //       isProd,
  //   //       address: ERC20_CONTRACT,
  //   //       contract: CONTRACT,
  //   //       amount: approvalAmount.toString(),
  //   //       decimals: tokenDecimals
  //   //     });

  //   //     // Verify connection again before authorization
  //   //     if (!address || !isConnected) {
  //   //       throw new Error('Wallet connection disconnected, please reconnect')
  //   //     }

  //   //     console.log('🔄 Executing authorization transaction...')
  //   //     const approveHash = await writeContractAsync({
  //   //       address: ERC20_CONTRACT as `0x${string}`,
  //   //       abi: erc20Abi,
  //   //       functionName: "approve",
  //   //       args: [CONTRACT, approvalAmount]
  //   //     });
  //   //     console.log("Authorization transaction submitted:", approveHash);

  //   //     // Wait for authorization transaction to be packed and confirmed
  //   //     await waitForTransactionReceipt(config, {
  //   //       hash: approveHash,
  //   //     });
  //   //     console.log("Authorization transaction confirmed, refresh authorization amount");

  //   //     // Refresh authorization amount (sync triggers re-query)
  //   //     await refetchAllowance();
  //   //     console.log("Authorization amount triggered re-query");

  //   //     // Wait a short time for query to complete
  //   //     await new Promise(resolve => setTimeout(resolve, 1000));
  //   //     console.log("Start executing purchase");

  //   //   } else {
  //   //     console.log("Already have sufficient authorization amount, skip authorization step");
  //   //   }
  //   //   const data = await get_orderid()
  //   //   if (!data || !data.data || !data.data.order_id) {
  //   //     messageApi.error(t("order.getOrderFailed"));
  //   //     return
  //   //   }
  //   //   const order_id = data.data.order_id
  //   //
  //   //   // 5. Final verification of connection state before purchase
  //   //   if (!address || !isConnected) {
  //   //     messageApi.error(t("order.walletConnectionLost"));
  //   //     return;
  //   //   }

  //   //   // Execute purchase contract call
  //   //   console.log('Purchase parameters:', {
  //   //     chain: isProd ? 'BSC' : 'BSC Testnet',
  //   //     isProd,
  //   //     contract: CONTRACT,
  //   //     productId: 1,
  //   //     orderId: order_id,
  //   //     payToken: ERC20_CONTRACT,

  //   //   });

  //   //   const purchaseHash = await writeContractAsync({
  //   //     address: CONTRACT as `0x${string}`,
  //   //     abi: abi.abi,
  //   //     functionName: "purchaseProduct",
  //   //     args: [1, order_id, ERC20_CONTRACT],
  //   //   });

  //   //   console.log("Purchase transaction submitted:", purchaseHash);

  //   //   // Wait for purchase transaction to confirm
  //   //   await waitForTransactionReceipt(config, {
  //   //     hash: purchaseHash,
  //   //   });

  //   //   console.log("Purchase transaction confirmed");
  //   //   messageApi.success(t("order.orderPurchaseSuccess"));
  //   //   setOrderModalVisible(false);

  //   // } catch (error) {
  //   //   console.error("Transaction failed:", error);
  //   //   console.error("Error details:", {
  //   //     name: error.name,
  //   //     message: error.message,
  //   //     cause: error.cause,
  //   //     stack: error.stack
  //   //   });

  //   //   const errorMessage = error.message || error.toString();
  //   //
  //   //  if (errorMessage.includes('session topic doesn\'t exist') ||
  //   //              errorMessage.includes('no matching key') ||
  //   //              errorMessage.includes('getDefaultChain')) {
  //   //     console.log('🚨 Detected WalletConnect session error，display fix modal');
  //   //     // setWalletError(errorMessage);
  //   //     // setWalletErrorVisible(true);
  //   //   } else if (errorMessage.includes("switch")) {
  //   //     messageApi.error(t("order.networkSwitchFailed"));
  //   //   } else {
  //   //     // Use friendly error message
  //   //     const friendlyMessage = getFriendlyErrorMessage(error);
  //   //     messageApi.error(friendlyMessage);
  //   //   }
  //   // } finally {
  //   //   // refreshauthorization amount (sync triggers re-query)
  //   //   await refetchAllowance();
  //   // }
  // };

  // const handleCancelOrder = () => {
  //   setOrderModalVisible(false);
  // };

  // const handleDisconnect = () => {
  //   disconnect();
  //   setOrderModalVisible(false);
  //   // Reset all loading states
  //   setTokenBalance(undefined);
  //   setAllowance(undefined);
  //   // Clear any stored subscription type
  //   localStorage.removeItem("subscribeType");
  //   messageApi.success(t("common.walletDisconnected"));
  // };
  const [list, setList] = useState<QueryTasksItem[]>([])
  const params = useRef<QueryTasksParams>({
    page: 1,
    size: 1000
  })
  const [listLoading, setlistLoading] = useState(true)
  const handleGetList = async () => {
    try {
      const res = await query_tasks(params.current)
      setList(res.data ? [...res.data?.Res] : [])
    } finally {
      const t = setTimeout(() => {
        setlistLoading(false)
        clearTimeout(t)
      }, 400)
    }
  }
  const isLogin = useSelector((state: RootState) => state.user.isLogin)
  // const loggedInAddress = useSelector((state: RootState) => state.user.address)

  // Check if address matches
  // const isAddressMatched = !address || !loggedInAddress || address.toLowerCase() === loggedInAddress.toLowerCase()

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isLogin) {
      handleGetList()
      t = setInterval(() => {
        handleGetList()
      }, 8000)
    }

    const t2 = setTimeout(() => {
      if (!isLogin) {
        setlistLoading(false)
        clearTimeout(t2)
      }
    }, 1000)

    return () => {
      clearInterval(t)
    }
  }, [isLogin])

  function getTypeKey(type: QueryTasksType) {
    switch (type) {
      case 1:
        return 'bind_web3';
      case 2:
        return 'bind_email';
      case 3:
        return 'follow_x';
      case 4:
        return 'telegram_group';
      case 5:
        return 'new_user';
      case 6:
        return 'invite_user';
      case 7:
        return 'subcribe';
    }
  }

  const boxRef = useRef<HTMLDivElement>(null);
  const handleStop = (e: Event) => {
    e.stopPropagation();
  }
    useEffect(() => {
    const currentRef = boxRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleStop);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleStop);
      }
    }
  }, [])
  return (
    <div className="page-subscribe lg:flex justify-center items-center gap-5 lg:mx-[2vh] lg:py-6 2xl:py-[3vh] w-[100%] lg:h-[91vh]">
      <div className="lg:flex gap-5 w-full">
        {contextHolder}

        {/* Order confirmation modal */}
        {/* <Modal
          title={t("order.orderConfirmTitle")}
          open={orderModalVisible}
          onCancel={handleCancelOrder}
          footer={[
            <Button key="cancel" style={{padding:"0 6px"}} onClick={handleCancelOrder} disabled={isWritePending || isConfirming}>
              {t("order.cancel")}
            </Button>,
            <Button key="disconnect"  style={{padding:"0 6px"}} onClick={handleDisconnect} disabled={isWritePending || isConfirming} danger>
              {t("common.disconnectWallet")}
            </Button>,
            <Button
              key="confirm"
              type="primary"
              style={{padding:"0 6px"}}
              onClick={handleConfirmOrder}
              loading={(isWritePending || isConfirming) && (!writeError)}
              disabled={!isAddressMatched || isWritePending || isConfirming}
            >
              {isWritePending ? t("order.transactionConfirming") : isConfirming ? t("order.transactionProcessing") : t("order.placeOrder")}
            </Button>,
          ]}
          width={500}
        >
          <div className="space-y-4 mt-6">
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">{t("order.orderDetails")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.packageType")}</span>
                  <span className="font-medium">{getOrderTitle()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.orderAmount")}</span>
                  <span className="font-medium">{getOrderAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.bonusPoints")}</span>
                  <span className="font-medium">{t("order.points600")}</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold mb-3">{t("order.walletInfo")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.chainId")}</span>
                  <span className="font-medium">({getChainName(Number(chainId))}){chainId || t("order.notConnected")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("order.walletAddress")}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${!isAddressMatched ? 'text-red-500' : ''}`} title={address}>
                      {address ? `${address.slice(0, 12)}...${address.slice(-6)}` : t("order.notConnected")}
                    </span>
                    {!isAddressMatched && address && (
                      <span className="text-red-500 text-xs">⚠️</span>
                    )}
                  </div>
                </div>
                {!isAddressMatched && address && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
                    <p className="text-red-600 text-xs">
                      {t("order.addressMismatch")}
                    </p>
                    <p className="text-red-500 text-xs mt-1">
                      {t("order.expectedAddress")}: {loggedInAddress ? `${loggedInAddress.slice(0, 12)}...${loggedInAddress.slice(-6)}` : ''}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.tokenBalance")}</span>
                  <span className="font-medium">{formatTokenBalance(tokenBalance, !isProd ? 6 : 18)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order.authorizedAmount")}</span>
                  <span className="font-medium">{formatTokenBalance(allowance, !isProd ? 6 : 18)} USDT</span>
                </div>

              </div>
            </div>

            <div className="text-sm text-gray-500">
              {t("order.confirmOrderInfo")}
            </div>
          </div>
        </Modal> */}

        <div className="w-[100%] lg:w-3/4 h-full flex flex-col gap-[2vh]">
          <div className="hidden lg:flex border-2 border-solid border-black rounded-lg w-full bg-white h-[7vh]  items-center justify-center text-[20px] font-bold">
            {t("subscribe.title")}
          </div>
          <div className="lg:border-2 lg:border-solid lg:border-black rounded-lg w-full bg-white lg:h-[74vh] flex flex-col lg:flex-row gap-3 lg:gap-5 lg:p-[2vh]">
            <div className="w-auto lg:w-[50%]">
              <PriceCard
                loading={loading}
                onClick={() => handleSubscribe()}
                index={1}
                hasBtn={true}
                data={{
                  title: t("order.quarter.title"),
                  desc: t("order.quarter.desc"),
                  price: t("order.quarter.date"),
                  symbol: "$",
                  date: t("order.quarter.dateSymbol"),
                  index: 1,
                }}
                smallTit={t("order.quarter.smallTit")}
                desc={<Quarter />}
                background="bg-[#cf0]"
              />
            </div>
            <div className="hidden lg:block lg:w-[50%]">
              <PriceCard
                loading={loading2}
                hasBtn={true}
                index={2}
                onClick={() => handleSubscribe()}
                data={{
                  title: t("order.annual.title"),
                  desc: t("order.annual.desc"),
                  price: "----",
                  symbol: "$",
                  date: t("order.annual.date"),
                  index: 2,
                }}
                smallTit={t("order.annual.smallTit")}
                desc={<Annual />}
                background="bg-[#C9CEFF]"
              />
            </div>
          </div>
        </div>
        <div className="flex w-[100%] lg:w-1/3 h-full flex-col gap-[14px] lg:gap-[2vh] mt-[20px] lg:mt-0">
          <div className="border-2 border-solid border-black rounded-lg w-full bg-white h-[40px] lg:h-[7vh] flex items-center justify-center text-[16px] lg:text-[20px] font-bold">
            {t("subscribe.pointTit")}
          </div>
          <div className="flex flex-col border-[2px] border-solid border-black rounded-[8px] overflow-x-hidden w-[100%] bg-white h-[360px] lg:h-[74vh] points-list-box">
            <div className="overflow-y-auto h-[600px] lg:h-[74vh] w-[100%]" ref={boxRef}>
              {
                listLoading ?       // Skeleton loading
                  <div className="p-4 space-y-2 w-[100%]">
                    {Array.from({ length: 13 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between gap-[4%]">
                        <Skeleton.Avatar size={24} className=" flex items-center w-[8%]" active />
                        <Skeleton.Input style={{
                          width:'35%',
                        }} className='h-[36px] lg:h-[3.6vh] flex items-center' active size="small" />
                        <Skeleton.Input style={{
                          width:'35%',
                        }}  className='h-[36px] lg:h-[3.6vh] flex items-center' active size="small" />
                       <Skeleton.Avatar size={24} shape="square" className="w-[5%] flex items-center" active />
                      </div>
                    ))}
                  </div>
                  :
                  list.length ?
                    list.map((item, idx) => <div key={idx} className="flex items-center text-[13px] h-[36px] lg:h-[5vh] px-[14px] lg:px-[2vh] point-card">
                      <div className="w-[36%] font-bold">{item.type ? t(`subscribe.${getTypeKey(item.type)}`) : ''}</div>
                      <div className="flex-1"><span className="lh-[16px] bg-[#cf0] px-[8px] text-[12px] rounded-[4px]">{t('common.success')}</span></div>
                      <div className="flex-1 flex items-center justify-center">{item.point}</div>
                      <div className="flex-1 flex items-center justify-end">{item.timestamp? formatDate(item.timestamp * 1000,'MM/DD HH:mm') : ''}</div>
                    </div>)
                    : <div className="h-[100%] flex items-center justify-center"><Empty description={t('common.noData')} /></div>
              }
            </div>

          </div>
        </div>
      </div>

      {/* Wallet error handling modal */}
      {/* <WalletErrorModal
        visible={walletErrorVisible}
        error={walletError}
        onClose={() => setWalletErrorVisible(false)}
        onRetry={handleWalletErrorRetry}
        onReset={handleWalletErrorReset}
      /> */}
    </div>
  );
};

export default Subscribe;
