"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Skeleton } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  get_llax_balance,
  get_llax_pools,
  get_llax_announcements,
  get_llax_referral_stats,
  get_llax_wallet_snapshot_status,
  LLAxPool,
  LLAxAnnouncement,
  LLAxWalletSnapshotData,
} from "../api/agent_c";
import "./page.scss";
import BalanceOverview from "./components/BalanceOverview";
import PoolProgress from "./components/PoolProgress";
import ChannelCards from "./components/ChannelCards";
import IssuanceHistory from "./components/IssuanceHistory";
import Announcements from "./components/Announcements";

function Page() {
  const router = useRouter();
  const { t } = useTranslation();

  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  // Public data
  const [pools, setPools] = useState<LLAxPool[]>([]);
  const [announcements, setAnnouncements] = useState<LLAxAnnouncement[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);

  // Auth data
  const [balance, setBalance] = useState({ balance: 0, total_earned: 0, total_consumed: 0 });
  const [referralStats, setReferralStats] = useState({ total_referrals: 0, total_rewards: 0, successful_referrals: 0 });
  const [walletSnapshot, setWalletSnapshot] = useState<LLAxWalletSnapshotData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Track which auth APIs are available (backend may not have registered routes yet)
  const [balanceAvailable, setBalanceAvailable] = useState(false);

  // Fetch public data
  useEffect(() => {
    const fetchPublicData = async () => {
      setPoolsLoading(true);
      try {
        const [poolsRes, announcementsRes] = await Promise.all([
          get_llax_pools(),
          get_llax_announcements(),
        ]);
        if (poolsRes?.data) setPools(poolsRes.data);
        if (announcementsRes?.data?.announcements) setAnnouncements(announcementsRes.data.announcements);
      } catch {
        // Public APIs failed silently
      } finally {
        setPoolsLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  // Fetch auth data - gracefully handle APIs not yet available on backend
  useEffect(() => {
    if (!isLogin) {
      setAuthLoading(false);
      return;
    }
    const fetchAuthData = async () => {
      setAuthLoading(true);
      try {
        const balanceRes = await get_llax_balance();
        if (balanceRes?.data) {
          setBalance(balanceRes.data);
          setBalanceAvailable(true);
        }
      } catch {
        // Balance API not available yet
      }
      try {
        const referralRes = await get_llax_referral_stats();
        if (referralRes?.data) setReferralStats(referralRes.data);
      } catch {
        // Referral stats API not available yet
      }
      try {
        const snapshotRes = await get_llax_wallet_snapshot_status();
        if (snapshotRes?.data) setWalletSnapshot(snapshotRes.data);
      } catch {
        // Wallet snapshot API not available yet
      }
      setAuthLoading(false);
    };
    fetchAuthData();
  }, [isLogin]);

  return (
     <div className="page-my-llax w-[100%] h-auto lg:h-[83vh] overflow-y-auto flex flex-col page-home-inner lg:border-solid lg:border-black lg:border-2 rounded-[8px]">
  
    <div className="llax-page">
      <div className="llax-header">
        <div className="back-btn" onClick={() => router.back()}>
          <LeftOutlined />
        </div>
        <span className="llax-title">{t("llax.title")}</span>
      </div>

      <div className="llax-content">
        {/* Balance Overview - login required */}
        {isLogin && balanceAvailable && (
          authLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <BalanceOverview
              balance={balance.balance}
              totalEarned={balance.total_earned}
              totalConsumed={balance.total_consumed}
            />
          )
        )}
        {!isLogin && (
          <div className="llax-login-tip">{t("llax.loginRequired")}</div>
        )}

        {/* Pool Progress - public */}
        <div>
          <div className="llax-section-title">{t("llax.channelPools")}</div>
          {poolsLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <PoolProgress pools={pools} />
          )}
        </div>

        {/* Earning Channels - login required */}
        {isLogin && !authLoading && (
          <div>
            <div className="llax-section-title">{t("llax.earningChannels")}</div>
            <ChannelCards
              referralStats={referralStats}
              walletSnapshot={walletSnapshot}
            />
          </div>
        )}

        {/* Issuance History - login required */}
        {isLogin && (
          <div>
            <div className="llax-section-title">{t("llax.issuanceHistory")}</div>
            <IssuanceHistory isLogin={isLogin} />
          </div>
        )}

        {/* Announcements - public */}
        <div>
          <div className="llax-section-title">{t("llax.announcements")}</div>
          <Announcements announcements={announcements} />
        </div>
      </div>
    </div>
    </div>
  );
}

export default Page;
