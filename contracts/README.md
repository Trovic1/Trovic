# CashflowVaults (Avalanche Hackathon MVP)
## Local Demo (Run in 30s)
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge test -vvv
forge script script/Demo.s.sol

CashflowVaults simulates tokenized future cashflows using an ERC-4626-style vault:
- investors deposit MockUSDC and receive vault shares,
- a trusted creator periodically pays cashflows into the vault,
- investors redeem shares for a larger share of assets after payments.

> Trust model (explicit): this MVP is fully simulated. There is no oracle, underwriting, KYC, or enforcement layer. The creator is trusted to keep paying.

## Architecture

```text
                 +----------------------+
                 |    CashflowSchedule  |
                 | creator, cadence,    |
                 | paymentAmount, state |
                 +----------+-----------+
                            | pay()
                            v
+-----------+ approve +-----+------------------+
|  Creator  +-------->+     CashflowVault      |
+-----------+         | ERC-4626-style shares  |
                      | asset = MockUSDC       |
+-----------+ deposit +-----------+------------+
| Investor  +-------->            |
+-----------+                     |
          redeem(shares)          | holds assets
                                  v
                           +------+------+
                           |   MockUSDC  |
                           +-------------+

(Optional)
Investor first deposit -> CashflowShareNFT receipt (demo storytelling only)
```

## Contracts

- `src/MockUSDC.sol`: mintable ERC20 with 6 decimals.
- `src/CashflowVault.sol`: ERC-4626-style vault accounting + share token.
- `src/CashflowSchedule.sol`: creator payment schedule with `ACTIVE/PAUSED/ENDED`.
- `src/CashflowShareNFT.sol`: optional participation receipt NFT.

## Local commands

```bash
cd contracts
forge build
forge test -vv
forge fmt
```

## Scripted deployment and demo (Foundry scripts)

### Deploy

```bash
cd contracts
export PRIVATE_KEY=<deployer_pk>
export CREATOR=<creator_address>
export CADENCE=604800
export PAYMENT_AMOUNT=100000000
export START_TIME=<unix_timestamp>

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### Demo with `cast` (step-by-step)

Assume these deployed addresses:
- `USDC=0x...`
- `VAULT=0x...`
- `SCHEDULE=0x...`
- `INVESTOR=0x...`
- `CREATOR=0x...`

```bash
# 1) Mint USDC to investor + creator
cast send $USDC "mint(address,uint256)" $INVESTOR 2000000000 --private-key $DEPLOYER_PK --rpc-url $RPC_URL
cast send $USDC "mint(address,uint256)" $CREATOR 500000000  --private-key $DEPLOYER_PK --rpc-url $RPC_URL

# 2) Investor approves + deposits 1,000 USDC
cast send $USDC "approve(address,uint256)" $VAULT 1000000000 --private-key $INVESTOR_PK --rpc-url $RPC_URL
cast send $VAULT "deposit(uint256,address)" 1000000000 $INVESTOR --private-key $INVESTOR_PK --rpc-url $RPC_URL

# 3) Creator approves vault for scheduled payments
cast send $USDC "approve(address,uint256)" $VAULT 500000000 --private-key $CREATOR_PK --rpc-url $RPC_URL

# 4) Trigger pay twice (after start time and cadence)
cast send $SCHEDULE "pay()" --private-key $INVESTOR_PK --rpc-url $RPC_URL
# wait cadence...
cast send $SCHEDULE "pay()" --private-key $INVESTOR_PK --rpc-url $RPC_URL

# 5) Investor redeems all shares
SHARES=$(cast call $VAULT "balanceOf(address)(uint256)" $INVESTOR --rpc-url $RPC_URL)
cast send $VAULT "redeem(uint256,address,address)" $SHARES $INVESTOR $INVESTOR --private-key $INVESTOR_PK --rpc-url $RPC_URL
```

## Foundry demo script

```bash
cd contracts
forge script script/Demo.s.sol:Demo \
  --sig "run(address,address,address,address,address)" \
  $USDC $VAULT $SCHEDULE $INVESTOR $CREATOR \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $DEPLOYER_PK
```
