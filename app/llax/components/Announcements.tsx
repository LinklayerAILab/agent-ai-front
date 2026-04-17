"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "antd";
import { LLAxAnnouncement } from "../../api/agent_c";
import { formatDate } from "../../utils";
import "./Announcements.scss";

interface AnnouncementsProps {
  announcements: LLAxAnnouncement[];
}

function Announcements({ announcements }: AnnouncementsProps) {
  const { t } = useTranslation();

  if (!announcements || announcements.length === 0) {
    return <Empty description={t("llax.noAnnouncements")} />;
  }

  return (
    <div className="announcements">
      {announcements.map((item) => (
        <div className="announcement-item" key={item.id}>
          <div className="announcement-header">
            <span className="announcement-title">{item.title}</span>
            {item.is_pinned && <span className="pinned-tag">Pinned</span>}
            <span className="announcement-date">{formatDate(item.created_at / 1000)}</span>
          </div>
          <div className="announcement-content">{item.content}</div>
        </div>
      ))}
    </div>
  );
}

export default Announcements;
