"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import "./BalanceOverview.scss";

interface BalanceOverviewProps {
  balance: number;
  totalEarned: number;
  totalConsumed: number;
}

const formatNumber = (num: number | string) => {
  const n = Number(num);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(2);
};

function BalanceOverview({ balance, totalEarned, totalConsumed }: BalanceOverviewProps) {
  const { t } = useTranslation();

  const cards = [
    { label: t("llax.balance"), value: balance, color: "#7A9900" },
    { label: t("llax.totalEarned"), value: totalEarned, color: "#8DB301" },
    { label: t("llax.totalConsumed"), value: totalConsumed, color: "#A0A0A0" },
  ];

  return (
    <div className="balance-overview">
      {cards.map((card) => (
        <div className="balance-card" key={card.label}>
          <div className="balance-card-value" style={{ color: card.color }}>
            {formatNumber(card.value)}
          </div>
          <div className="balance-card-label">{card.label}</div>
          <div className="balance-card-token">{t("llax.llaxToken")}</div>
        </div>
      ))}
    </div>
  );
}

export default BalanceOverview;
