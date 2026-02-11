# Avalon Rift MVP (Avalanche Fuji)

## 1) System Architecture

### High-level components
1. **AvalonRiftLand (ERC721 game contract)**
   - Source of truth for tile ownership.
   - Stores per-tile battle/resource stats (`power`, `productionRate`, `lastClaimedAt`).
   - Enforces adjacency checks and battle resolution.
   - Emits indexable gameplay events (`TileMinted`, `TileAttacked`, `TileClaimed`).
2. **AvalonResourceToken (ERC20 reward token)**
   - In-game fungible resource token (`ARR`).
   - Minting gated to the game contract (single trusted minter).
3. **Frontend (React + Vite + viem)**
   - Wallet connect via MetaMask.
   - Reads tile ownership/stats and token balances.
   - Sends `attack` and `claimResources` transactions.
4. **Off-chain indexer/UI layer (optional for hackathon)**
   - Subgraph or custom listener consumes events for tile history and leaderboard.

### Data model
- `tileId = y * gridWidth + x`.
- Tile ownership is provided by ERC721 `ownerOf(tileId)`.
- Tile metadata:
  - `power`: battle strength.
  - `productionRate`: resource units generated per second.
  - `lastClaimedAt`: timestamp checkpoint for lazy accrual.

### Core game flows
1. **Mint tile**
   - Admin calls `mintTile(to, x, y, power, productionRate)`.
   - Contract validates bounds + non-existing tile.
2. **Resource accrual and claim**
   - Claim amount = `(block.timestamp - lastClaimedAt) * productionRate`.
   - Owner calls `claimResources(tileId)` to mint ARR.
3. **Attack**
   - Attacker must own `attackerTileId`.
   - Defender must be adjacent (`Manhattan distance = 1`).
   - Pseudo-randomness from block fields decides winner.
   - On win: defender tile transfers to attacker.

### Security + gas notes
- Solidity `0.8.24`, optimizer enabled, custom errors.
- `nonReentrant` on state-changing economic functions.
- Tile struct uses packed `uint64` fields for lower storage cost.
- MVP randomness is block-based and not cryptographically secure (acceptable for hackathon demo only).

---

## 2) Smart Contracts Included

- `contracts/contracts/AvalonResourceToken.sol`
- `contracts/contracts/AvalonRiftLand.sol`
- `contracts/scripts/deploy.js`
- `contracts/hardhat.config.js`

---

## 3) Deployment Instructions (Fuji)

### Prerequisites
- Node.js 20+
- MetaMask funded with Fuji AVAX
- Fuji RPC URL

### Steps
1. `cd avalon-rift-mvp/contracts`
2. Install deps:
   - `npm install`
3. Create `.env`:
   - `FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc`
   - `DEPLOYER_PRIVATE_KEY=0x...`
   - `GRID_WIDTH=10`
   - `GRID_HEIGHT=10`
4. Compile:
   - `npm run build`
5. Deploy:
   - `npm run deploy:fuji`
6. Save printed addresses:
   - `AvalonResourceToken`
   - `AvalonRiftLand`

---

## 4) Frontend Starter Structure (React + Vite)

```text
avalon-rift-mvp/frontend
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src
    ├── App.tsx
    ├── main.tsx
    ├── components
    │   ├── AttackPanel.tsx
    │   ├── ResourceBalance.tsx
    │   ├── TileGrid.tsx
    │   └── WalletConnect.tsx
    ├── contracts
    │   └── abis.ts
    ├── hooks
    │   └── useWallet.ts
    ├── lib
    │   └── web3.ts
    └── types
        └── game.ts
```

### Frontend setup
1. `cd avalon-rift-mvp/frontend`
2. `npm install`
3. Create `.env`:
   - `VITE_LAND_CONTRACT=0x...`
   - `VITE_RESOURCE_CONTRACT=0x...`
4. Run:
   - `npm run dev`

---

## 5) Why Avalanche fits Avalon Rift

- **Fast finality + low fees**: frequent attacks/claims are cheap enough for gameplay loops.
- **EVM compatibility**: deploy with standard Solidity/OpenZeppelin tools.
- **High throughput**: supports many player actions during demo sessions.
- **Fuji testnet availability**: easy hackathon iteration before mainnet decisions.

---

## 6) Scaling path with Avalanche Subnets

1. **Move game execution to a dedicated Subnet**
   - Isolate game traffic from broader C-Chain volatility.
2. **Custom fee/token policy**
   - Use game-native gas/tokenomics if desired.
3. **App-specific validators / tuning**
   - Tune block parameters for faster game ticks.
4. **Interop bridge strategy**
   - Keep key assets portable between Subnet and C-Chain for liquidity and marketplace exposure.

---

## 7) Hackathon scope guardrails (48–72h)

- Keep single-map world (e.g., 10x10).
- Limit battle logic to one-step adjacency and simple random modifier.
- Use event-driven indexing for frontend state refresh.
- Defer advanced anti-cheat randomness and matchmaking to post-MVP.
