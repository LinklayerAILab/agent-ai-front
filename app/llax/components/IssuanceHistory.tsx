"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, Pagination, Skeleton } from "antd";
import { get_llax_issuance_records, LLAxIssuanceRecord } from "../../api/agent_c";
import { formatDate } from "../../utils";
import "./IssuanceHistory.scss";

interface IssuanceHistoryProps {
  isLogin: boolean;
}

function IssuanceHistory({ isLogin }: IssuanceHistoryProps) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<LLAxIssuanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const channelIdMap: Record<number, string> = {
    1: t("llax.channelId1"),
    2: t("llax.channelId2"),
    3: t("llax.channelId3"),
    4: t("llax.channelId4"),
    5: t("llax.channelId5"),
  };

  useEffect(() => {
    if (!isLogin) return;
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await get_llax_issuance_records({ page, size: pageSize });
        if (res?.data) {
          setRecords(res.data.records || []);
          setTotal(res.data.total || 0);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [isLogin, page]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }

  if (records.length === 0) {
    return <Empty description={t("llax.noRecords")} />;
  }

  return (
    <div className="issuance-history">
      <div className="history-table">
        <div className="history-header">
          <div className="col channel">{t("llax.channel")}</div>
          <div className="col amount">{t("llax.amount")}</div>
          <div className="col before">{t("llax.beforeBalance")}</div>
          <div className="col after">{t("llax.afterBalance")}</div>
          <div className="col date">{t("llax.date")}</div>
        </div>
        {records.map((record) => (
          <div className="history-row" key={record.id}>
            <div className="col channel">{channelIdMap[record.channel_id] || record.channel_name}</div>
            <div className="col amount positive">+{Number(record.amount).toLocaleString()}</div>
            <div className="col before">{Number(record.before_balance).toLocaleString()}</div>
            <div className="col after">{Number(record.after_balance).toLocaleString()}</div>
            <div className="col date">{formatDate(new Date(record.created_at).getTime(), 'YYYY.M.D HH:mm')}</div>
          </div>
        ))}
      </div>
      {total > pageSize && (
        <div className="history-pagination">
          <Pagination
            simple
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}

export default IssuanceHistory;
