# LinkLayer AI Agent

A modern Web3 application providing AI-powered trading agents and cryptocurrency analysis tools. Built with Next.js 15, React 19, and integrated with multiple blockchain wallets through WalletConnect.

## Features

- **Multi-Wallet Support**: Connect with MetaMask, Binance Web3 Wallet, and Bitget Wallet via WalletConnect v2
- **AI Chat Interface**: Streaming AI responses with Server-Sent Events (SSE) for real-time interactions
- **Crypto Analysis Tools**: Comprehensive market analysis, position tracking, and trading insights
- **Internationalization**: Full support for English, Chinese, Japanese, and Korean
- **Real-time Data**: Live market updates and interactive charts with ECharts
- **Telegram Bot Integration**: Seamless connection with Telegram for notifications and updates
- **Modern UI**: Built with Ant Design v5, Tailwind CSS, and SCSS modules

## Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features and optimizations
- **TypeScript** - Type-safe development (strictNullChecks enabled)

### Styling
- **SCSS Modules** - Component-scoped styles
- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design v5** - Enterprise UI component library with React 19 support

### State Management
- **Redux Toolkit** - Predictable state container
  - userSlice: User authentication and wallet data
  - modalSlice: Global modal management
  - pageDirectionSlice: Navigation tracking
  - assetsSlice: Asset/token data
  - menuSlice: Menu state management

### Web3 Integration
- **wagmi v2** - React Hooks for Ethereum
- **viem v2** - TypeScript interface for Ethereum
- **ethers v6** - Ethereum library for wallet interactions
- **@reown/appkit** - WalletConnect v2 SDK (formerly WalletConnect)
- **@binance/w3w-wagmi-connector-v2** - Binance Web3 Wallet integration
- **@bitget-wallet/omni-connect** - Bitget Wallet integration

### Blockchain Support
- **Development**: Sepolia testnet (Chain ID: 11155111)
- **Test**: BSC Testnet
- **Production**: Binance Smart Chain (BSC)

### Data & Charts
- **ECharts** - Interactive charting library
- **Axios** - HTTP client with interceptors
- **React Query** - Data fetching and caching

### Internationalization
- **next-i18next** - i18n framework for Next.js
- **react-i18next** - React bindings for i18next

### Deployment
- **PM2** - Process manager for production environments

## Project Structure

```
app/
├── api/                    # API route handlers and utilities
│   ├── proxy/[...path]/   # Streaming proxy for API requests
│   ├── service.ts         # Axios instance with auth interceptors
│   ├── request.ts         # Fetch utilities (request + streamingRequest)
│   └── *.ts              # Domain-specific API modules
├── components/            # React components
│   ├── WagmiProvider.tsx # Web3 wallet connection provider
│   ├── StoreProvider.tsx # Redux store provider
│   └── ...               # UI components
├── config/
│   └── appkit.ts         # WalletConnect & wagmi configuration
├── store/                # Redux slices
├── utils/                # Utility functions
├── enum/                 # Constants and enums
├── hooks/                # Custom React hooks
├── styles/               # Global SCSS files
├── i18n/                 # Internationalization setup
└── [pages]/              # Route-based page directories
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Backend API endpoints configured

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agent-ai-front
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your configuration:
```env
# Node environment (development, test, or production)
NEXT_PUBLIC_NODE_ENV=development

# API endpoints
NEXT_API_DEFAI=http://localhost:6888
NEXT_API_AGENT_C=http://localhost:6888
NEXT_PUBLIC_BOARD__HOST=http://localhost:3001

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Chain configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia
NEXT_PUBLIC_CURRENCY=SepoliaETH

# Telegram Bot (optional)
NEXT_PUBLIC_BOT_ID=your_bot_id
NEXT_PUBLIC_BOT_NAME=your_bot_name

# Cloudflare Turnstile (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
```

### Development

Run the development server (available on all network interfaces at port 3002):

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Build

Production build:
```bash
npm run build
```

Test environment build (requires large memory allocation):
```bash
npm run build:test
```

### Production

Start the production server:
```bash
npm start
```

Using PM2 (recommended for production):
```bash
# Start with PM2 (test environment)
npm run start:test

# Stop PM2 process
npm run stop:test

# Restart PM2 process
npm run restart:test

# Build and deploy
npm run deploy:test
```

## Key Features Implementation

### Multi-Wallet Support

The application supports three major wallets through WalletConnect v2:
- **MetaMask**: Most popular Web3 wallet
- **Binance Web3 Wallet**: Official Binance wallet with enhanced features
- **Bitget Wallet**: Feature-rich Web3 wallet

Wallet connection is managed through `app/config/appkit.ts` and the `WagmiProvider` component.

### Streaming AI Responses

AI chat responses use Server-Sent Events (SSE) for real-time streaming:

```typescript
import { streamingRequest } from '@/app/api/request';

for await (const chunk of streamingRequest(url, config, { parseMode: 'sse' })) {
  if (chunk.event === 'message') {
    // Handle message chunk
  } else if (chunk.event === 'workflow_finished') {
    // Handle completion
  }
}
```

### Authentication Flow

1. User connects wallet via AppKit modal
2. Wallet address stored in Redux state and localStorage
3. Access token obtained and stored
4. All API requests include `Authorization` and `Address` headers
5. 401 responses trigger logout flow

### Internationalization

The app supports four languages with locale detection and switching:
- English (`en`) - Default
- Chinese (`zh`)
- Japanese (`ja`)
- Korean (`ko`)

Translation files are located in `public/locales/[locale]/`.

## API Proxy Configuration

The Next.js app proxies backend requests to prevent CORS issues:

- `/defai_api/*` → Backend API
- `/agent_c_api/*` → Agent C API
- `/board_api/*` → Board API
- `/api/*` → Streaming proxy route

All proxied routes include special headers for streaming support.

## Styling Customization

The project uses a hybrid styling approach:
- **SCSS Modules**: Component-specific styles
- **Tailwind CSS**: Utility classes for layout
- **Ant Design**: UI components with custom theme
- **CSS Variables**: Defined in `globals.css` and `common.scss`

**Primary Theme Color**: `#7A9900` (custom hue-saturation-light)

## TypeScript Configuration

- Target: ES2017
- Strict mode: Disabled (except `strictNullChecks: true`)
- Path alias: `@/*` maps to project root
- Module resolution: Bundler mode (Next.js 15)

## Browser Support

- Modern browsers with ES2017+ support
- Mobile-optimized viewport configuration
- PWA manifest support

## Security Features

- Cloudflare Turnstile integration for bot protection
- Secure header configurations
- Wallet authentication through SIWE (Sign-In with Ethereum)
- Environment-based API endpoint configuration

## Performance Optimization

- Dynamic imports for code splitting
- Image optimization for remote patterns
- Console logs removed in production (except errors/warnings)
- React Strict Mode disabled for performance
- Force dynamic rendering globally

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Write clean, commented code
4. Test changes across all supported wallets
5. Ensure internationalization keys are added for all locales

## License

[Your License Here]

## Support

For issues and questions:
- GitHub Issues: [Repository Issues]
- Documentation: See `CLAUDE.md` for detailed architecture and patterns
