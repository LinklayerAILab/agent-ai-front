"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as echarts from "echarts";
import { LLAxPool } from "../../api/agent_c";
import "./PoolProgress.scss";

interface PoolProgressProps {
  pools: LLAxPool[];
}

function PoolProgress({ pools }: PoolProgressProps) {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const channelIdMap: Record<number, string> = {
    1: t("llax.channelId1"),
    2: t("llax.channelId2"),
    3: t("llax.channelId3"),
    4: t("llax.channelId4"),
    5: t("llax.channelId5"),
  };

  useEffect(() => {
    if (!chartRef.current || pools.length === 0) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      grid: {
        left: "3%",
        right: "8%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "#7A9900",
        textStyle: { color: "#fff" },
        formatter: (params: unknown) => {
          const items = params as Array<{ seriesName: string; value: number; axisValue: string }>;
          if (!Array.isArray(items)) return "";
          let total = 0;
          items.forEach((item) => { total += item.value; });
          let html = `<div style="font-weight:600;margin-bottom:4px">${items[0]?.axisValue || ""}</div>`;
          items.forEach((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            html += `<div>${item.seriesName}: ${Number(item.value).toLocaleString()} (${pct}%)</div>`;
          });
          return html;
        },
      },
      legend: {
        data: [t("llax.issued"), t("llax.remaining")],
        top: 0,
        textStyle: { color: "#666", fontSize: 12 },
      },
      xAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: {
          color: "#666",
          formatter: (val: number) => {
            if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(0) + "B";
            if (val >= 1_000_000) return (val / 1_000_000).toFixed(0) + "M";
            return val.toString();
          },
        },
        splitLine: { lineStyle: { color: "#f5f5f5" } },
      },
      yAxis: {
        type: "category",
        data: pools.map((p) => channelIdMap[p.id] || p.name),
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: { color: "#666", fontSize: 12 },
      },
      series: [
        {
          name: t("llax.issued"),
          type: "bar",
          stack: "total",
          data: pools.map((p) => Number(p.issued_amount)),
          itemStyle: {
            color: "#7A9900",
            borderRadius: [0, 0, 4, 4],
          },
          barWidth: 20,
        },
        {
          name: t("llax.remaining"),
          type: "bar",
          stack: "total",
          data: pools.map((p) => Number(p.remaining_amount)),
          itemStyle: {
            color: "#D4E8A0",
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: 20,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [pools, t]);

  if (pools.length === 0) return null;

  return (
    <div className="pool-progress">
      <div ref={chartRef} className="pool-chart" />
      <div className="pool-details">
        {pools.map((pool) => (
          <div className="pool-detail-item" key={pool.id}>
            <div className="pool-detail-name">
              {channelIdMap[pool.id] || pool.name}
            </div>
            <div className="pool-detail-bar">
              <div
                className="pool-detail-bar-fill"
                style={{ width: `${Math.min(Number(pool.usage_percent) || 0, 100)}%` }}
              />
            </div>
            <div className="pool-detail-info">
              <span>{(Number(pool.usage_percent) || 0).toFixed(1)}%</span>
              <span className={pool.is_exhausted ? "exhausted" : ""}>
                {pool.is_exhausted ? t("llax.exhausted") : `${Number(pool.remaining_amount).toLocaleString()} ${t("llax.remaining")}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PoolProgress;
