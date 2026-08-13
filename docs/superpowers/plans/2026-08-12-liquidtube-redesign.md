# LiquidTube Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Brc20 `LiquidTube` as a cartoon thermometer vector with a black outline, green liquid fill, and Binance market liquidity-driven height.

**Architecture:** Keep the current Canvas-based component, but simplify it into a deterministic path renderer with three layers: outer shell outline, inner liquid column, and top arrow. Fetch `binance_market_liquidity` once in the parent and pass its `healthScore` to the tube so the component stays presentational and easier to reuse.

**Tech Stack:** React, TypeScript, Canvas 2D, existing `request` API wrapper, Next.js App Router

---

### Task 1: Replace the tube renderer with a deterministic thermometer drawing

**Files:**
- Modify: `app/components/Brc20/LiquidTube.tsx`

- [ ] **Step 1: Read the current renderer and replace the old animated color logic with a single height-driven drawing path.**

```tsx
// Remove the old red/yellow/green interpolation and the requestAnimationFrame loop.
// The component should accept a numeric healthScore and render one static frame.
```

- [ ] **Step 2: Implement three Canvas layers: outer black outline, solid green liquid body, and solid green upward arrow.**

```tsx
// Outer shell: top semicircle arch, vertical tube, bottom circular bulb, no fill.
// Liquid: solid #00dd44, clipped to the shell, with a round bottom bulb and a vertical column.
// Arrow: solid green triangle at the top of the liquid column.
```

- [ ] **Step 3: Map `healthScore` to liquid height with clamping from 0 to 100.**

```tsx
const pct = Math.max(0, Math.min(100, healthScore));
const fillTop = tubeBottom - tubeHeight * (pct / 100);
```

- [ ] **Step 4: Verify the component still respects `className` and the existing `h5` size preset.**

```tsx
<LiquidTube healthScore={72} className="h-[14vh] w-[8vh]" />
```

### Task 2: Wire Binance market liquidity into the Brc20 panel

**Files:**
- Modify: `app/components/Brc20/Brc20.tsx`
- Modify: `app/api/agent_c.ts`

- [ ] **Step 1: Confirm the API response shape already exposes `healthScore` and `level`.**

```ts
export interface MarketLiquidityResponseData {
  level: string;
  healthScore: number;
}
```

- [ ] **Step 2: Replace the random test timer with a one-time fetch of `get_binance_market_liquidity()`.**

```tsx
useEffect(() => {
  get_binance_market_liquidity()
    .then((res) => setLiquidPercentage(res.data.healthScore))
    .catch(() => setLiquidPercentage(0));
}, []);
```

- [ ] **Step 3: Pass the fetched score into both desktop and mobile `LiquidTube` usages.**

```tsx
<LiquidTube healthScore={liquidPercentage} className="h-[14vh] w-[8vh]" />
<LiquidTube healthScore={liquidPercentage} h5 className="w-[4rem] ml-[-0.22rem]" />
```

- [ ] **Step 4: Remove obsolete random refresh comments and keep the rest of the Brc20 layout unchanged.**

```tsx
// No periodic random updates; the tube now reflects API-backed market liquidity.
```

### Task 3: Verify the redraw and sizing behavior

**Files:**
- Modify: `app/components/Brc20/LiquidTube.tsx`

- [ ] **Step 1: Render the component in both size modes and confirm the outline stays crisp at the existing dimensions.**

```tsx
// Desktop and mobile sizes should share the same path geometry with scaled canvas dimensions.
```

- [ ] **Step 2: Check that the shell remains white-filled only by the page background and that the tube itself has no gradients, shadows, or textures.**

```tsx
// The component should only use black stroke and #00dd44 fill.
```

- [ ] **Step 3: Run the project lint/build check that best fits this change and confirm there are no type or import errors.**

```bash
npm run lint
```

