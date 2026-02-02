# Crypto Radar AI Agent (Avalanche)

Crypto Radar is a hackathon-ready web app where users chat with an AI agent to fetch prices, create on-chain alerts, and monitor their alerts on Avalanche Fuji.

## Features
- **AI agent chat** for price queries, alert creation, and alert lookup.
- **On-chain price alert registry** with alerts stored in a smart contract.
- **Sidebar alert dashboard** tied to the connected wallet.
- **Quick actions** for demo-friendly workflows.

## Architecture
```
┌──────────────────────┐
│  Next.js Frontend    │
│  - Chat UI           │
│  - Wallet Connect    │
│  - Alerts Sidebar    │
└─────────┬────────────┘
          │ /api/agent + /api/alerts
┌─────────▼────────────┐
│ Next.js API Routes   │
│ - CoinGecko price    │
│ - viem read/write    │
└─────────┬────────────┘
          │ RPC_URL
┌─────────▼────────────┐
│ Avalanche Fuji       │
│ PriceAlertRegistry   │
└──────────────────────┘
```

## Tech stack
- Next.js App Router + TypeScript
- viem + wagmi
- Solidity + Foundry

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
```bash
cp .env.example .env.local
```

Fill in:
```
OPENAI_API_KEY=           # optional for future LLM expansion
RPC_URL=                  # Avalanche Fuji RPC
PRIVATE_KEY=              # deployer & tx sender
CONTRACT_ADDRESS=         # deployed PriceAlertRegistry
NEXT_PUBLIC_CHAIN_NAME=Avalanche Fuji
NEXT_PUBLIC_RPC_URL=      # optional public RPC for wallet reads
```

## Smart contract (Foundry)

### Install Foundry dependencies
```bash
cd contracts
forge install foundry-rs/forge-std
```

### Run tests
```bash
forge test
```

### Deploy to Avalanche Fuji
```bash
forge script script/Deploy.s.sol:DeployPriceAlertRegistry \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verify/interact (example)
```bash
cast send $CONTRACT_ADDRESS "createAlert(string,uint256,bool)" "AVAX" 50 true \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo script
1. Connect wallet on the top-right.
2. Click **Price of AVAX**.
3. Click **Create sample alert** (or ask: “Create alert for AVAX above 50”).
4. Click **Refresh alerts** or ask: “Show my alerts 0x...”.

## Folder structure
```
app/         # Next.js App Router UI + API routes
contracts/   # Foundry smart contract + tests + deploy script
lib/         # Shared helpers (ABI, chain config)
```
