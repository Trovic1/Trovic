# CashflowVaults (Avalanche Hackathon MVP)

CashflowVaults is a Solidity-first MVP that tokenizes **simulated future cashflows** using an ERC-4626 style vault.

- Investors deposit mock USDC and receive fungible vault shares.
- A trusted `creator` periodically contributes cashflows to the vault via `CashflowSchedule`.
- Investors redeem shares for underlying assets. When the creator pays, assets increase while share supply stays fixed, so PPS increases.

> Trust model (explicit): this MVP is intentionally offchain-light. There is no oracle, KYC, legal enforcement, or payment guarantee. The creator is trusted to keep paying.

## Contracts

- `src/MockUSDC.sol`: 6-decimal mintable ERC20 for local testing.
- `src/CashflowVault.sol`: ERC-4626 style vault implementation with deposit/mint/withdraw/redeem.
- `src/CashflowSchedule.sol`: single agreement state machine (`ACTIVE/PAUSED/ENDED`) and periodic `pay()`.
- `src/CashflowShareNFT.sol`: optional ERC721 investor participation receipt (demo/storytelling only).

## Architecture (ASCII)

```text
 Creator                                  Investors
   |                                          |
   | approve + pay()                          | deposit()/mint()
   v                                          v
+-------------------+      transfer USDC   +-------------------+
| CashflowSchedule  | -------------------> |   CashflowVault   |
| - cadence         |                      | (share ERC20)      |
| - paymentAmount   |                      | - totalAssets      |
| - startTime       |                      | - totalSupply      |
| - state           |                      +-------------------+
+-------------------+                              |
                                                   | holds
                                                   v
                                             +-----------+
                                             | MockUSDC  |
                                             +-----------+

Optional:
CashflowVault -> mintReceipt() -> CashflowShareNFT (1st deposit receipt)
```

## Local Commands

```bash
cd contracts
forge build
forge test -vv
```

### Deploy script

```bash
cd contracts
CREATOR_ADDRESS=<creator_addr> \
PAYMENT_CADENCE=604800 \
PAYMENT_AMOUNT=100000000 \
START_TIME=<unix_ts> \
forge script script/Deploy.s.sol:DeployCashflowVaults --broadcast
```

## Scripted Demo (cast + scripts)

### A) One-command scripted flow with `Demo.s.sol`

```bash
cd contracts
CREATOR_PK=<hex_private_key> \
INVESTOR_PK=<hex_private_key> \
forge script script/Demo.s.sol:DemoCashflowVaults --broadcast
```

### B) Manual `cast` walkthrough (assuming deployed addresses)

```bash
# Environment
RPC_URL=<your_rpc>
CREATOR_PK=<creator_pk>
INVESTOR_PK=<investor_pk>
USDC=<mock_usdc_address>
VAULT=<vault_address>
SCHEDULE=<schedule_address>
INVESTOR=$(cast wallet address --private-key $INVESTOR_PK)

# 1) Mint investor + creator balances (demo token is permissionless mint)
cast send $USDC "mint(address,uint256)" $INVESTOR 1000000000 --private-key $INVESTOR_PK --rpc-url $RPC_URL
cast send $USDC "mint(address,uint256)" $(cast wallet address --private-key $CREATOR_PK) 10000000000 --private-key $CREATOR_PK --rpc-url $RPC_URL

# 2) Investor deposits 1,000 USDC
cast send $USDC "approve(address,uint256)" $VAULT 1000000000 --private-key $INVESTOR_PK --rpc-url $RPC_URL
cast send $VAULT "deposit(uint256,address)" 1000000000 $INVESTOR --private-key $INVESTOR_PK --rpc-url $RPC_URL

# 3) Creator pays twice
cast send $USDC "approve(address,uint256)" $SCHEDULE 200000000 --private-key $CREATOR_PK --rpc-url $RPC_URL
cast send $SCHEDULE "pay()" --private-key $CREATOR_PK --rpc-url $RPC_URL
# wait >= cadence
cast send $SCHEDULE "pay()" --private-key $CREATOR_PK --rpc-url $RPC_URL

# 4) Investor redeems all shares
SHARES=$(cast call $VAULT "balanceOf(address)(uint256)" $INVESTOR --rpc-url $RPC_URL)
cast send $VAULT "redeem(uint256,address,address)" $SHARES $INVESTOR $INVESTOR --private-key $INVESTOR_PK --rpc-url $RPC_URL
```

## Notes for Avalanche readiness

- Contracts use standard EVM Solidity (`^0.8.24`) only.
- No chain-specific precompiles/opcodes.
- Works on Avalanche C-Chain or any EVM-compatible network.
