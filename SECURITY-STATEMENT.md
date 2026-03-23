# Security Statement

Project: LinkLayerAI
Website: https://agent.linklayer.ai/
Office Website: https://www.linklayer.ai/
Contact: Stella
Email: stella@linklayer.ai
X (Twitter): https://x.com/LinkLayerAI
Telegram: https://t.me/stratosbloom

Date: 2026-03-20

## 1. Project Overview
LinkLayerAI is an AI agent–powered analytics and recommendation DApp. It provides portfolio analytics and strategy-based token recommendations based on user-provided Binance API keys with read-only permissions. Users can purchase internal points (credits) using USDT transfers to a designated account. Points are used for AI strategy recommendations and single-token analytics.

## 2. No Custom Smart Contracts
LinkLayerAI does not deploy or interact with any custom smart contracts. The DApp does not hold user funds, private keys, or seed phrases. It is a front-end information and analytics tool.

## 3. User Asset & Key Safety
- Users trigger any action manually (e.g., submitting API keys, initiating transfers).
- Binance API keys are read-only and must be manually provided by users.
- The DApp does not request or store private keys or seed phrases.

## 4. Points & Payment Flow
- Users purchase points by transferring USDT to a designated account.
- The DApp assigns points after transfer confirmation.
- The DApp does not custody assets on-chain and does not require smart contract interaction.

## 5. Security Practices
- Front-end input validation to reduce XSS and injection risks.
- Minimal permission scope (read-only API keys).
- User-triggered actions only; no background signing or hidden approvals.

## 6. Risk Disclosure
- AI recommendations are for informational purposes only and do not constitute financial advice.
- Users retain full control of their assets and decisions.

## 7. Contact
If you have any security concerns, please contact:
stella@linklayer.ai
