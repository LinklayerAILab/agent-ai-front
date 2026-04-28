"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LLAxWalletSnapshotData } from "../../api/agent_c";
import "./ChannelCards.scss";

interface ChannelCardsProps {
  referralStats: {
    total_invitees: number;
    total_reward_earned: number;
    successful_referrals: number;
    max_referees?: number;
  };
  walletSnapshot: LLAxWalletSnapshotData | null;
}

function ChannelCards({ referralStats, walletSnapshot }: ChannelCardsProps) {
  const { t } = useTranslation();
  const otherInfo = useSelector((state: RootState) => state.user.otherInfo) as { invite_code?: string } | null;

  const packages = [
    { name: t("llax.packageBasic"), price: "$9.9", llax: "10,000" },
    { name: t("llax.packageStandard"), price: "$29.9", llax: "36,000" },
    { name: t("llax.packagePremium"), price: "$99.9", llax: "130,000" },
  ];

  return (
    <div className="channel-cards">
      {/* Points Purchase */}
      <div className="channel-card">
        <div className="channel-card-header">
          <span className="channel-card-icon purchase-icon">$</span>
          <span className="channel-card-title">{t("llax.channelPointsPurchase")}</span>
        </div>
        <div className="channel-card-desc">{t("llax.purchaseDesc")}</div>
        <div className="channel-card-packages">
          {packages.map((pkg) => (
            <div className="package-item" key={pkg.name}>
              <div className="package-name">{pkg.name}</div>
              <div className="package-price">{pkg.price}</div>
              <div className="package-llax">{t("llax.packageBonus")}: {pkg.llax}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API Contribution */}
      <div className="channel-card">
        <div className="channel-card-header">
          <span className="channel-card-icon api-icon">API</span>
          <span className="channel-card-title">{t("llax.channelApiContribution")}</span>
        </div>
        <div className="channel-card-desc">{t("llax.apiDesc")}</div>
        <div className="channel-card-tiers">
          <div className="tier-item">
            <span className="tier-label">{t("llax.historicalEvents")}</span>
            <span className="tier-value">1-5: 4,000 / 6-20: 12,800 / 21-50: 32,000 / 51+: 64,000</span>
          </div>
          <div className="tier-item">
            <span className="tier-label">{t("llax.monthlyEvents")}</span>
            <span className="tier-value">1-3: 960 / 4-10: 3,000 / 11-20: 6,000 / 21+: 10,800</span>
          </div>
        </div>
      </div>

      {/* Referral */}
      <div className="channel-card">
        <div className="channel-card-header">
          <span className="channel-card-icon referral-icon">@</span>
          <span className="channel-card-title">{t("llax.channelReferral")}</span>
        </div>
        <div className="channel-card-desc">{t("llax.referralDesc")}</div>
        <div className="channel-card-stats">
          <div className="stat-row">
            <span>{t("llax.totalReferrals")}</span>
            <span className="stat-value">{referralStats.total_invitees ?? 0}</span>
          </div>
          <div className="stat-row">
            <span>{t("llax.successfulReferrals")}</span>
            <span className="stat-value">{referralStats.successful_referrals ?? 0}</span>
          </div>
          <div className="stat-row">
            <span>{t("llax.totalReferralRewards")}</span>
            <span className="stat-value">{(Number(referralStats.total_reward_earned) || 0).toLocaleString()} LLAx</span>
          </div>
          {otherInfo?.invite_code && (
            <div className="stat-row">
              <span>{t("llax.referralCode")}</span>
              <span className="stat-value referral-code">{otherInfo.invite_code}</span>
            </div>
          )}
        </div>
        <div className="channel-card-tiers">
          <div className="tier-item small">{t("llax.referralTier1")}</div>
          <div className="tier-item small">{t("llax.referralTier2")}</div>
          <div className="tier-item small">{t("llax.referralTier3")}</div>
        </div>
      </div>

      {/* Wallet Snapshot */}
      <div className="channel-card">
        <div className="channel-card-header">
          <span className="channel-card-icon wallet-icon">W</span>
          <span className="channel-card-title">{t("llax.channelWalletSnapshot")}</span>
        </div>
        <div className="channel-card-desc">{t("llax.walletSnapshotDesc")}</div>
        <div className="channel-card-stats">
          {walletSnapshot ? (
            <>
              <div className="stat-row">
                <span>{t("llax.snapshotReward")}</span>
                <span className="stat-value">{t("llax.snapshotReward")}</span>
              </div>
              <div className="stat-row">
                <span>{t("llax.claimAmount")}</span>
                <span className={`stat-value ${walletSnapshot.is_issued ? "claimed" : "pending"}`}>
                  {walletSnapshot.is_issued ? t("llax.alreadyClaimed") : t("llax.notEligible")}
                </span>
              </div>
            </>
          ) : (
            <div className="stat-row">
              <span>{t("llax.notEligible")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChannelCards;
