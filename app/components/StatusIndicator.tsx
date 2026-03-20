"use client"
import { useMemo } from "react";
import "./StatusIndicator.scss";

export type StatusColor = 'GREEN' | 'RED' | 'YELLOW' | 'GRAY' | 'PRIMARY';

export interface StatusIndicatorProps {
  statusColor?: StatusColor;
  size?: number; // 宽高，默认24
  borderWidth?: number; // 边框宽度，默认2
  className?: string;
  pulse?: boolean; // 是否显示脉冲效果，默认true
  loading?: boolean; // 加载状态
}

export const StatusIndicator = ({
  statusColor = 'GRAY',
  size = 24,
  borderWidth = 2,
  className = '',
  pulse = true,
  loading = false
}: StatusIndicatorProps) => {

  const randomDelay = useMemo(() => (Math.random() * 2 + 0.5).toFixed(2), []);

  const getStatusClass = () => {
    if (loading) return 'status-loading';
    switch (statusColor) {
      case 'GREEN':
        return 'status-green';
      case 'RED':
        return 'status-red';
      case 'YELLOW':
        return 'status-yellow';
      case 'PRIMARY':
        return 'status-primary';
      case 'GRAY':
      default:
        return 'status-gray';
    }
  };

  const getSizeClass = () => {
    if (size <= 16) return 'status-small';
    if (size <= 24) return 'status-medium';
    if (size <= 32) return 'status-large';
    return 'status-xlarge';
  };

  return (
    <div
      className={`status-indicator ${getStatusClass()} ${getSizeClass()} ${pulse ? 'status-pulse' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderWidth}px`,
        animationDelay: `${randomDelay}s`,
      }}
    />
  );
};

export default StatusIndicator;
