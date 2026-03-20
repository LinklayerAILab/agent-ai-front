"use client";
import React from "react";
import { useStrategies } from "@/app/hooks/useStrategies";

/**
 * Example component demonstrating how to use the useStrategies hook
 * This component displays all 6 categories of trading strategies
 */
export default function StrategyExample() {
  const strategies = useStrategies();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Trading Strategies</h1>

      {/* 1. Trend Tracking Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>1. Trend Tracking Strategies ({strategies.trendTracking.length})</h2>
        <ul>
          {strategies.trendTracking.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Momentum Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>2. Momentum Strategies ({strategies.momentum.length})</h2>
        <ul>
          {strategies.momentum.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Overbought/Oversold Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>
          3. Overbought/Oversold Strategies (
          {strategies.overboughtOversold.length})
        </h2>
        <ul>
          {strategies.overboughtOversold.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Volume-Price Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>4. Volume-Price Strategies ({strategies.volumePrice.length})</h2>
        <ul>
          {strategies.volumePrice.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Pattern Recognition Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>5. Pattern Recognition Strategies ({strategies.pattern.length})</h2>
        <ul>
          {strategies.pattern.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Volatility Strategies */}
      <div style={{ marginBottom: "30px" }}>
        <h2>6. Volatility Strategies ({strategies.volatility.length})</h2>
        <ul>
          {strategies.volatility.map((strategy) => (
            <li key={strategy.value}>
              <strong>{strategy.value}</strong>: {strategy.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div style={{ marginTop: "40px", padding: "20px", background: "#f0f0f0" }}>
        <h3>Summary</h3>
        <p>
          <strong>Total Strategies:</strong>{" "}
          {strategies.trendTracking.length +
            strategies.momentum.length +
            strategies.overboughtOversold.length +
            strategies.volumePrice.length +
            strategies.pattern.length +
            strategies.volatility.length}
        </p>
        <ul>
          <li>Trend Tracking: {strategies.trendTracking.length}</li>
          <li>Momentum: {strategies.momentum.length}</li>
          <li>Overbought/Oversold: {strategies.overboughtOversold.length}</li>
          <li>Volume-Price: {strategies.volumePrice.length}</li>
          <li>Pattern Recognition: {strategies.pattern.length}</li>
          <li>Volatility: {strategies.volatility.length}</li>
        </ul>
      </div>
    </div>
  );
}
