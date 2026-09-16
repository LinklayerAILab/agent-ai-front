# My Points (积分充值)

Points recharge page with a unified history of every points-earning event.

## Layout

- **Left panel** — recharge packages (basic / standard / professional) and payment
  methods. Order: USDT, USDC, Card (Stripe), LLA. Card payment needs no wallet;
  USDT/USDC pay via on-chain ERC20 `transfer`, LLA is disabled for now.
- **Right panel** — `PointsHistory`, a single scrollable table (no tabs, no
  pagination) mixing, sorted by time descending:
  - **Task point records** from `query_tasks` (types 1-7, e.g. bind wallet,
    follow X, invite, and type 7 "subscribe" which is how on-chain USDT/USDC
    recharges show up once confirmed). The page polls this feed every 8s —
    the same poll drives the "waiting for chain confirmation" toast.
  - **Paid Stripe orders** from `stripe_orders(status=paid)`, labeled
    `卡支付 · $xx.xx` with the full order no in the row tooltip.

## Files

- `page.tsx` — packages, payment methods, stripe checkout + 6006 pending-order
  resume, task-records polling
- `components/PointsHistory.tsx` — merged history table

## Mock mode

`NEXT_PUBLIC_STRIPE_MOCK=1` swaps the stripe API layer for an in-memory fake
backed by sessionStorage (`stripe_mock_orders`) so the checkout / pending-resume
flows can be walked through without the backend. Dev-only; no `.env` sets it.

## i18n

Keys live under `myPoints.stripe.*` in `public/locales/{en,zh,ja,ko,ru}/common.json`.
New keys must be added to all five locales.
