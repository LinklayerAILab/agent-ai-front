"use client";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface Strategy {
  label: string;
  value: string;
}

export interface StrategyCategory {
  trendTracking: Strategy[];
  momentum: Strategy[];
  overboughtOversold: Strategy[];
  volumePrice: Strategy[];
  pattern: Strategy[];
  volatility: Strategy[];
}

/**
 * Hook to get all trading strategies organized by 6 major categories
 * Each category contains an array of strategies with internationalized labels and values
 *
 * @returns StrategyCategory object containing 6 categories of strategies
 *
 * @example
 * const strategies = useStrategies();
 * console.log(strategies.trendTracking); // [{ label: "MA Short-term crosses Long-term", value: "ma_cross" }, ...]
 */
export function useStrategies(): StrategyCategory {
  const { t } = useTranslation();

  const strategies = useMemo<StrategyCategory>(() => {
    return {
      // 1. Trend tracking strategies (Trend Tracking Strategies)
      trendTracking: [
        {
          label: t("strategy.trendTracking.ma_cross"),
          value: "ma_cross",
        },
        {
          label: t("strategy.trendTracking.ma_bull_bear"),
          value: "ma_bull_bear",
        },
        {
          label: t("strategy.trendTracking.ma_overbought_oversold"),
          value: "ma_overbought_oversold",
        },
        {
          label: t("strategy.trendTracking.ma_price_breakthrough"),
          value: "ma_price_breakthrough",
        },
        {
          label: t("strategy.trendTracking.ma_twist"),
          value: "ma_twist",
        },
        {
          label: t("strategy.trendTracking.sar_trend"),
          value: "sar_trend",
        },
        {
          label: t("strategy.trendTracking.sar_reversal"),
          value: "sar_reversal",
        },
        {
          label: t("strategy.trendTracking.dma_through_ama"),
          value: "dma_through_ama",
        },
        {
          label: t("strategy.trendTracking.dma_ama_trend"),
          value: "dma_ama_trend",
        },
        {
          label: t("strategy.trendTracking.dma_top_low"),
          value: "dma_top_low",
        },
        {
          label: t("strategy.trendTracking.adx_di_trough"),
          value: "adx_di_trough",
        },
        {
          label: t("strategy.trendTracking.adx_trend"),
          value: "adx_trend",
        },
        {
          label: t("strategy.trendTracking.vwap_above_strong"),
          value: "vwap_above_strong",
        },
        {
          label: t("strategy.trendTracking.vwap_below_weak"),
          value: "vwap_below_weak",
        },
        {
          label: t("strategy.trendTracking.vwap_breakout"),
          value: "vwap_breakout",
        },
        {
          label: t("strategy.trendTracking.vwap_breakdown"),
          value: "vwap_breakdown",
        },
        {
          label: t("strategy.trendTracking.vwap_support"),
          value: "vwap_support",
        },
        {
          label: t("strategy.trendTracking.vwap_resistance"),
          value: "vwap_resistance",
        },
      ],

      // 2. Momentum indicator strategies (Momentum Strategies)
      momentum: [
        {
          label: t("strategy.momentum.macd_golden_cross"),
          value: "macd_golden_cross",
        },
        {
          label: t("strategy.momentum.macd_zero_cross"),
          value: "macd_zero_cross",
        },
        {
          label: t("strategy.momentum.macd_pos_neg"),
          value: "macd_pos_neg",
        },
        {
          label: t("strategy.momentum.macd_histogram_grow"),
          value: "macd_histogram_grow",
        },
        {
          label: t("strategy.momentum.macd_histogram_shrink"),
          value: "macd_histogram_shrink",
        },
        {
          label: t("strategy.momentum.macd_divergence"),
          value: "macd_divergence",
        },
        {
          label: t("strategy.momentum.rsi_overbought_oversold"),
          value: "rsi_overbought_oversold",
        },
        {
          label: t("strategy.momentum.rsi_midline_cross"),
          value: "rsi_midline_cross",
        },
        {
          label: t("strategy.momentum.rsi_divergence"),
          value: "rsi_divergence",
        },
        {
          label: t("strategy.momentum.kdj_cross"),
          value: "kdj_cross",
        },
        {
          label: t("strategy.momentum.kdj_overbought_oversold"),
          value: "kdj_overbought_oversold",
        },
        {
          label: t("strategy.momentum.kdj_compare_d"),
          value: "kdj_compare_d",
        },
        {
          label: t("strategy.momentum.kdj_compare_j"),
          value: "kdj_compare_j",
        },
        {
          label: t("strategy.momentum.roc_compare_value"),
          value: "roc_compare_value",
        },
        {
          label: t("strategy.momentum.roc_through_zero"),
          value: "roc_through_zero",
        },
        {
          label: t("strategy.momentum.roc_extreme_value"),
          value: "roc_extreme_value",
        },
        {
          label: t("strategy.momentum.roc_divergence"),
          value: "roc_divergence",
        },
        {
          label: t("strategy.momentum.cci_compare_value"),
          value: "cci_compare_value",
        },
        {
          label: t("strategy.momentum.cci_through"),
          value: "cci_through",
        },
        {
          label: t("strategy.momentum.wr_compare_value"),
          value: "wr_compare_value",
        },
        {
          label: t("strategy.momentum.wr_through"),
          value: "wr_through",
        },
        {
          label: t("strategy.momentum.stoch_rsi_compare"),
          value: "stoch_rsi_compare",
        },
      ],

      // 3. Overbought/oversold strategies (Overbought/Oversold Strategies)
      overboughtOversold: [
        // {
        //   label: t("strategy.overboughtOversold.mfi_analysis"),
        //   value: "mfi_analysis",
        // },
        {
          label: t("strategy.overboughtOversold.mfi_batch_analysis"),
          value: "mfi_batch_analysis",
        },
        {
          label: t("strategy.overboughtOversold.mfi_overbought"),
          value: "mfi_overbought",
        },
        {
          label: t("strategy.overboughtOversold.mfi_oversold"),
          value: "mfi_oversold",
        },
        {
          label: t("strategy.overboughtOversold.mfi_top_divergence"),
          value: "mfi_top_divergence",
        },
        {
          label: t("strategy.overboughtOversold.mfi_bottom_divergence"),
          value: "mfi_bottom_divergence",
        },
      ],

      // 4. Volume-price analysis strategies (Volume-Price Strategies)
      volumePrice: [
        {
          label: t("strategy.volumePrice.obv_sync_uptrend"),
          value: "obv_sync_uptrend",
        },
        {
          label: t("strategy.volumePrice.obv_top_divergence"),
          value: "obv_top_divergence",
        },
        {
          label: t("strategy.volumePrice.obv_bottom_divergence"),
          value: "obv_bottom_divergence",
        },
        {
          label: t("strategy.volumePrice.volume_price_rise"),
          value: "volume_price_rise",
        },
        {
          label: t("strategy.volumePrice.volume_price_divergence"),
          value: "volume_price_divergence",
        },
        {
          label: t("strategy.volumePrice.volume_retrace"),
          value: "volume_retrace",
        },
        {
          label: t("strategy.volumePrice.volume_price_drop_surge"),
          value: "volume_price_drop_surge",
        },
        {
          label: t("strategy.volumePrice.volume_price_extreme"),
          value: "volume_price_extreme",
        },
        {
          label: t("strategy.volumePrice.volume_price_minimum"),
          value: "volume_price_minimum",
        },
        {
          label: t("strategy.volumePrice.volume_surge"),
          value: "volume_surge",
        },
        {
          label: t("strategy.volumePrice.volume_compare_fold"),
          value: "volume_compare_fold",
        },
        {
          label: t("strategy.volumePrice.emv_compare_value"),
          value: "emv_compare_value",
        },
        {
          label: t("strategy.volumePrice.emv_divergence"),
          value: "emv_divergence",
        },
      ],

      // 5. Pattern recognition strategies (Pattern Recognition Strategies)
      pattern: [
        {
          label: t("strategy.pattern.candlestick_patterns"),
          value: "candlestick_patterns",
        },
        // {
        //   label: t("strategy.pattern.token_pattern_analysis"),
        //   value: "token_pattern_analysis",
        // },
        {
          label: t("strategy.pattern.consecutive_patterns"),
          value: "consecutive_patterns",
        },
        {
          label: t("strategy.pattern.chart_patterns"),
          value: "chart_patterns",
        },
      ],

      // 6. Volatility strategies (Volatility Strategies)
      volatility: [
        {
          label: t("strategy.volatility.bband_squeeze"),
          value: "bband_squeeze",
        },
        {
          label: t("strategy.volatility.bband_touch"),
          value: "bband_touch",
        },
        {
          label: t("strategy.volatility.bband_attach"),
          value: "bband_attach",
        },
        {
          label: t("strategy.volatility.bband_fake_breakout"),
          value: "bband_fake_breakout",
        },
        {
          label: t("strategy.volatility.bband_breakout"),
          value: "bband_breakout",
        },
        {
          label: t("strategy.volatility.atr_trend"),
          value: "atr_trend",
        },
        {
          label: t("strategy.volatility.atr_exceed_highest"),
          value: "atr_exceed_highest",
        },
      ],
    };
  }, [t]);

  return strategies;
}
