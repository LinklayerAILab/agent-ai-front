# useStrategies Hook

A custom React hook that provides access to 6 major categories of trading strategies with internationalized labels.

## Features

- ✅ 6 major strategy categories
- ✅ 81 total trading strategies
- ✅ Internationalization support (en, zh, ko, ja, ru)
- ✅ Type-safe with TypeScript
- ✅ Memoized for performance
- ✅ Easy to use and extend

## Categories

1. **Trend Tracking** (18 strategies) - MA, SAR, DMA, ADX, VWAP indicators
2. **Momentum** (22 strategies) - MACD, RSI, KDJ, ROC, CCI, WR indicators
3. **Overbought/Oversold** (6 strategies) - MFI analysis
4. **Volume-Price** (13 strategies) - OBV, volume analysis
5. **Pattern Recognition** (4 strategies) - Candlestick and chart patterns
6. **Volatility** (7 strategies) - Bollinger Bands, ATR indicators

## Installation

The hook is already available in the project. No additional installation needed.

## Usage

### Basic Usage

```typescript
import { useStrategies } from "@/app/hooks/useStrategies";

function MyComponent() {
  const strategies = useStrategies();

  return (
    <div>
      <h2>Trend Tracking Strategies</h2>
      {strategies.trendTracking.map((strategy) => (
        <div key={strategy.value}>
          {strategy.label} ({strategy.value})
        </div>
      ))}
    </div>
  );
}
```

### Using in a Select Dropdown

```typescript
import { useStrategies } from "@/app/hooks/useStrategies";
import { Select } from "antd";

function StrategySelector() {
  const strategies = useStrategies();

  return (
    <Select placeholder="Select a strategy">
      <Select.OptGroup label="Trend Tracking">
        {strategies.trendTracking.map((strategy) => (
          <Select.Option key={strategy.value} value={strategy.value}>
            {strategy.label}
          </Select.Option>
        ))}
      </Select.OptGroup>
      <Select.OptGroup label="Momentum">
        {strategies.momentum.map((strategy) => (
          <Select.Option key={strategy.value} value={strategy.value}>
            {strategy.label}
          </Select.Option>
        ))}
      </Select.OptGroup>
      {/* Add other categories as needed */}
    </Select>
  );
}
```

### Filtering Strategies

```typescript
import { useStrategies } from "@/app/hooks/useStrategies";

function FilteredStrategies() {
  const strategies = useStrategies();

  // Get all MA-related strategies from trend tracking
  const maStrategies = strategies.trendTracking.filter(s =>
    s.value.startsWith('ma_')
  );

  return (
    <div>
      <h2>MA Strategies</h2>
      {maStrategies.map((strategy) => (
        <div key={strategy.value}>{strategy.label}</div>
      ))}
    </div>
  );
}
```

### Combining Multiple Categories

```typescript
import { useStrategies } from "@/app/hooks/useStrategies";

function AllStrategies() {
  const strategies = useStrategies();

  // Combine all strategies into a single array
  const allStrategies = [
    ...strategies.trendTracking,
    ...strategies.momentum,
    ...strategies.overboughtOversold,
    ...strategies.volumePrice,
    ...strategies.pattern,
    ...strategies.volatility,
  ];

  return (
    <div>
      <h2>All Strategies ({allStrategies.length})</h2>
      {allStrategies.map((strategy) => (
        <div key={strategy.value}>{strategy.label}</div>
      ))}
    </div>
  );
}
```

## Data Structure

### Strategy Interface

```typescript
interface Strategy {
  label: string;  // Internationalized display label
  value: string;  // Strategy identifier (e.g., "ma_cross")
}
```

### StrategyCategory Interface

```typescript
interface StrategyCategory {
  trendTracking: Strategy[];
  momentum: Strategy[];
  overboughtOversold: Strategy[];
  volumePrice: Strategy[];
  pattern: Strategy[];
  volatility: Strategy[];
}
```

## Available Strategies

### 1. Trend Tracking (趋势跟踪策略)

| Value | Description |
|-------|-------------|
| `ma_cross` | MA Short-term crosses Long-term |
| `ma_bull_bear` | MA Bullish/Bearish Arrangement |
| `ma_overbought_oversold` | MA Price Deviation Overbought/Oversold |
| `ma_price_breakthrough` | MA Price Breakthrough |
| `ma_twist` | MA Convergence |
| `sar_trend` | SAR Trend Direction |
| `sar_reversal` | SAR Reversal Signal |
| `dma_through_ama` | DMA crosses AMA |
| `dma_ama_trend` | DMA/AMA Trend Direction |
| `dma_top_low` | DMA Top/Bottom |
| `adx_di_trough` | ADX +DI/-DI Cross |
| `adx_trend` | ADX Trend Strength |
| `vwap_above_strong` | Price Above VWAP Strong |
| `vwap_below_weak` | Price Below VWAP Weak |
| `vwap_breakout` | Breakout Above VWAP |
| `vwap_breakdown` | Breakdown Below VWAP |
| `vwap_support` | VWAP as Support |
| `vwap_resistance` | VWAP as Resistance |

### 2. Momentum (动量指标策略)

| Value | Description |
|-------|-------------|
| `macd_golden_cross` | MACD DIF crosses DEA |
| `macd_zero_cross` | MACD Zero Line Cross |
| `macd_pos_neg` | MACD Histogram Positive/Negative |
| `macd_histogram_grow` | MACD Histogram Growing |
| `macd_histogram_shrink` | MACD Histogram Shrinking |
| `macd_divergence` | MACD Divergence |
| `rsi_overbought_oversold` | RSI Overbought/Oversold |
| `rsi_midline_cross` | RSI Crosses 50 Midline |
| `rsi_divergence` | RSI Divergence |
| `kdj_cross` | KDJ Golden/Death Cross |
| `kdj_overbought_oversold` | KDJ-K Value Range |
| `kdj_compare_d` | KDJ-D Value Range |
| `kdj_compare_j` | KDJ-J Value Range |
| `roc_compare_value` | ROC Value Comparison |
| `roc_through_zero` | ROC Zero Line Cross |
| `roc_extreme_value` | ROC Extreme Value |
| `roc_divergence` | ROC Divergence |
| `cci_compare_value` | CCI Value Comparison |
| `cci_through` | CCI Threshold Cross |
| `wr_compare_value` | WR Value Comparison |
| `wr_through` | WR Threshold Cross |
| `stoch_rsi_compare` | Stochastic RSI Comparison |

### 3. Overbought/Oversold (超买超卖策略)

| Value | Description |
|-------|-------------|
| `mfi_analysis` | MFI Single Token Analysis |
| `mfi_batch_analysis` | MFI Batch Analysis |
| `mfi_overbought` | MFI>80 Overbought |
| `mfi_oversold` | MFI<20 Oversold |
| `mfi_top_divergence` | MFI Top Divergence |
| `mfi_bottom_divergence` | MFI Bottom Divergence |

### 4. Volume-Price (量价分析策略)

| Value | Description |
|-------|-------------|
| `obv_sync_uptrend` | Price and OBV Sync Uptrend |
| `obv_top_divergence` | OBV Top Divergence |
| `obv_bottom_divergence` | OBV Bottom Divergence |
| `volume_price_rise` | Volume Price Rise Together |
| `volume_price_divergence` | Volume Price Divergence |
| `volume_retrace` | Volume Retrace |
| `volume_price_drop_surge` | Volume Price Drop Surge |
| `volume_price_extreme` | Extreme Volume Price |
| `volume_price_minimum` | Minimum Volume Price |
| `volume_surge` | Volume Surge |
| `volume_compare_fold` | Volume vs Average Multiple |
| `emv_compare_value` | EMV Value Comparison |
| `emv_divergence` | EMV Divergence |

### 5. Pattern Recognition (形态识别策略)

| Value | Description |
|-------|-------------|
| `candlestick_patterns` | Candlestick Pattern Scanning |
| `token_pattern_analysis` | Token Pattern Analysis |
| `consecutive_patterns` | Consecutive Patterns |
| `chart_patterns` | Chart Pattern Scanning |

### 6. Volatility (波动率策略)

| Value | Description |
|-------|-------------|
| `bband_squeeze` | Bollinger Bands Squeeze |
| `bband_touch` | Bollinger Bands Touch |
| `bband_attach` | Bollinger Bands Attach |
| `bband_fake_breakout` | Bollinger Bands Fake Breakout |
| `bband_breakout` | Bollinger Bands Breakout |
| `atr_trend` | ATR Trend |
| `atr_exceed_highest` | ATR Exceed Highest |

## Internationalization

The hook automatically uses the current language setting from i18next. Supported languages:

- English (en)
- 简体中文 (zh)
- 한국어 (ko)
- 日本語 (ja)
- Русский (ru)

To change the language:

```typescript
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <button onClick={() => i18n.changeLanguage('zh')}>
      Switch to Chinese
    </button>
  );
}
```

## Performance

The hook uses `useMemo` to cache the strategy data, so it will only recompute when the language changes. This ensures optimal performance even with frequent re-renders.

## TypeScript Support

The hook is fully typed with TypeScript. Import the types as needed:

```typescript
import { useStrategies, type Strategy, type StrategyCategory } from "@/app/hooks/useStrategies";
```

## Example Component

See `app/components/StrategyExample.tsx` for a complete example of how to use this hook.

## Related Files

- Hook: `app/hooks/useStrategies.ts`
- Locale files:
  - `public/locales/en/common.json`
  - `public/locales/zh/common.json`
  - `public/locales/ko/common.json`
  - `public/locales/ja/common.json`
  - `public/locales/ru/common.json`
- Strategy definitions: `app/picker/index.ts`
- Example component: `app/components/StrategyExample.tsx`
