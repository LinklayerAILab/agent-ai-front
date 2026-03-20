# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LinkLayer AI Agent is a Next.js 15-based Web3 application that provides AI-powered trading agents and crypto analysis tools. The application integrates with multiple blockchain wallets (MetaMask, Binance Web3 Wallet, Bitget Wallet) using WalletConnect and features streaming AI chat responses, real-time data analysis, and internationalization support.

## Key Technologies

- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript (strict mode disabled, but strictNullChecks enabled)
- **Styling**: SCSS modules + Tailwind CSS + Ant Design v5
- **State Management**: Redux Toolkit with slices for user, modal, pageDirection, assets, and menus
- **Web3**: wagmi v2, viem v2, ethers v6, @reown/appkit (WalletConnect v2)
- **Internationalization**: next-i18next with locales: en, zh, ja, ko
- **API Client**: Axios with custom interceptors + native fetch for streaming
- **Charts**: ECharts
- **Deployment**: PM2 for production/test environments

## Development Commands

```bash
# Development (runs on port 3002, listens on all network interfaces)
npm run dev

# Build for production
npm run build

# Build for test environment (requires large memory allocation)
npm run build:test

# Start production server
npm start

# PM2 deployment commands (test environment)
npm run start:test      # Start with PM2 (port 14002)
npm run stop:test       # Stop PM2 process
npm run restart:test    # Restart PM2 process
npm run deploy:test     # Build and restart/start with PM2

# Linting
npm run lint
```

## Architecture & Code Organization

### Directory Structure

```
app/
├── api/                    # API route handlers and client utilities
│   ├── proxy/[...path]/   # Streaming proxy for API requests
│   ├── service.ts         # Axios instance with auth interceptors
│   ├── request.ts         # Fetch utilities (request + streamingRequest)
│   └── *.ts              # Domain-specific API modules (user, chat, board, etc.)
├── components/            # React components
│   ├── WagmiProvider.tsx # Web3 wallet connection provider
│   ├── StoreProvider.tsx # Redux store provider
│   └── ...               # UI components
├── config/
│   └── appkit.ts         # WalletConnect & wagmi configuration
├── store/                # Redux slices
│   ├── index.ts          # Store configuration
│   ├── userSlice.ts
│   ├── modalSlice.ts
│   ├── pageDirectionSlice.ts
│   ├── assetsSlice.ts
│   └── menuSlice.ts
├── utils/                # Utility functions
│   ├── wallet.ts
│   ├── chainConfig.ts
│   └── ...
├── enum/                 # Constants and enums
│   ├── index.ts          # Environment flags, chain configs
│   ├── routes.ts
│   └── regrex.ts
├── hooks/                # Custom React hooks
├── styles/               # Global SCSS files
├── i18n/                 # Internationalization setup
└── [pages]/              # Route-based page directories
```

### State Management

The app uses Redux Toolkit with 5 main slices:
- **user**: User authentication, wallet address, tokens
- **modal**: Global modal state management
- **pageDirection**: Page navigation/transition direction tracking
- **assets**: Asset/token data
- **menus**: Menu state management

All Redux state is typed with `RootState` and `AppDispatch` types exported from `app/store/index.ts`.

### Web3 Integration

Multi-wallet support is configured in `app/config/appkit.ts`:
- Uses @reown/appkit (WalletConnect v2 SDK)
- Supports Binance Web3 Wallet (@binance/w3w-wagmi-connector-v2)
- Supports Bitget Wallet (@bitget-wallet/omni-connect)
- Chain selection based on environment (NEXT_PUBLIC_NODE_ENV):
  - `prod`: Binance Smart Chain (BSC mainnet)
  - `dev`: Sepolia testnet
  - `test`: BSC testnet

The `WagmiProvider` component wraps the app with wagmi + React Query providers and initializes the AppKit modal.

### API Request Patterns

Two request utilities are available in `app/api/request.ts`:

1. **request()** - Standard fetch with auth headers and 401 handling
2. **streamingRequest()** - Async generator for Server-Sent Events (SSE) streaming
   - Supports SSE format (text/event-stream)
   - Parses event data and yields individual messages
   - Handles workflow events (workflow_started, workflow_finished, message_end)

Both utilities:
- Automatically inject `Authorization`, `Address`, and `Web-App-Data` headers from localStorage
- Dispatch `unauthorized` event on 401 responses
- Use 60-second timeout

The `app/api/service.ts` provides an axios instance with similar interceptors for non-streaming requests.

### Internationalization

The app uses next-i18next with:
- Locales: en (default), zh, ja, ko
- Translation files in `public/locales/[locale]/`
- Configuration in `next-i18next.config.mjs`

## Environment Configuration

Environment variables are managed through `.env.*` files:
- `.env.development` - Local development
- `.env.test.local` - Test environment
- `.env.production.local` - Production

Key variables:
```bash
# Environment type (affects chain selection)
NEXT_PUBLIC_NODE_ENV=dev|test|prod

# API endpoints (proxied via next.config.mjs rewrites)
NEXT_API_DEFAI=<backend-url>
NEXT_API_AGENT_C=<agent-c-url>
NEXT_PUBLIC_BOARD__HOST=<board-api-url>

# Blockchain configuration
NEXT_PUBLIC_CHAIN_ID=11155111         # Chain ID
NEXT_PUBLIC_CHAIN_NAME=Sepolia        # Chain display name
NEXT_PUBLIC_CURRENCY=SepoliaETH       # Native currency
NEXT_PUBLIC_CONTRACT=0x...            # Main contract address
NEXT_PUBLIC_ERC20_CONTRACT=0x...      # ERC20 token contract

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<project-id>

# Telegram Bot integration
NEXT_PUBLIC_BOT_ID=<bot-id>
NEXT_PUBLIC_BOT_NAME=<bot-name>

# Cloudflare Turnstile (captcha)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>
```

## API Proxy Configuration

The Next.js app proxies backend requests to prevent CORS issues (see `next.config.mjs`):
- `/defai_api/*` → `$NEXT_API_DEFAI/*`
- `/agent_c_api/*` → `$NEXT_API_AGENT_C/*`
- `/board_api/*` → `$NEXT_PUBLIC_BOARD__HOST/*`
- `/api/*` → `/api/proxy/*` (streaming proxy route)

All proxied routes have special headers to support streaming:
- `X-Accel-Buffering: no` (disable nginx buffering)
- `Cache-Control: no-cache`
- CORS headers for cross-origin requests

## Styling Conventions

The project uses a hybrid approach:
1. **SCSS Modules** - Component-specific styles (e.g., `Component.scss`)
2. **Tailwind CSS** - Utility classes for layout and spacing
3. **Ant Design** - UI components with customizations in `app/styles/antd.scss`
4. **CSS Variables** - Defined in `globals.css` and `common.scss`

**Important**: Per user instructions, when modifying CSS variables, always use `#7A9900` for the primary hue-saturation-light color (overriding any default values).

## TypeScript Configuration

- Target: ES2017
- Strict mode: **disabled** (except `strictNullChecks: true`)
- Path alias: `@/*` maps to project root
- Module resolution: bundler mode (Next.js 15)

When writing code, be mindful that strict mode is off but null checks are enforced.

## Common Patterns

### Authentication Flow
1. User connects wallet via WagmiProvider/AppKit
2. Wallet address and access token stored in localStorage
3. All API requests include `Authorization` and `Address` headers
4. 401 responses trigger `unauthorized` event → logout flow

### Streaming Chat Responses
Use `streamingRequest()` for AI chat endpoints:
```typescript
for await (const chunk of streamingRequest<ChatResponse>(url, config, { parseMode: 'sse' })) {
  if (chunk.event === 'message') {
    // Handle message chunk
  } else if (chunk.event === 'workflow_finished') {
    // Handle completion
  }
}
```

### Modal Management
Use the `modalSlice` Redux slice to control global modals instead of local state when the modal affects multiple components or needs persistence.

## Important Notes

- **Console Logs**: Removed in production except `console.error` and `console.warn`
- **React Strict Mode**: Disabled (`reactStrictMode: false`)
- **Dynamic Rendering**: Enabled globally (`export const dynamic = 'force-dynamic'` in layout.tsx)
- **Image Optimization**: Remote image patterns configured for Telegram and LinkLayer CDN domains
- **Viewport**: Mobile-optimized (user-scalable disabled, max-scale 1)

## PM2 Deployment

Test environment uses PM2 with config in `ecosystem.test.config.js`:
- App name: `ll-agenttest`
- Port: 14002
- Environment: test
- Env file: `.env.test.local`

Production deployment follows similar pattern with production-specific config.
