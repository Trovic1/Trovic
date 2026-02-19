import mockUsdcAbi from "./abi/MockUSDC.json";
import cashflowVaultAbi from "./abi/CashflowVault.json";
import cashflowScheduleAbi from "./abi/CashflowSchedule.json";
import cashflowShareNftAbi from "./abi/CashflowShareNFT.json";

export const cashflowChainId = 43113;

export const cashflowContracts = {
  mockUsdc: {
    address: "0x76491A6B6AAEB808fA0CE1A5041F4998244DE6F2" as const,
    abi: mockUsdcAbi
  },
  vault: {
    address: "0xE8665936630608a077fF78204F45167A7F6b52A3" as const,
    abi: cashflowVaultAbi
  },
  schedule: {
    address: "0x7f09A950FD3B011F5d9ABd15d1e775481f7F313C" as const,
    abi: cashflowScheduleAbi
  },
  shareNft: {
    address: "0x7C693ae7016bd786612430d654D82DC80114d041" as const,
    abi: cashflowShareNftAbi
  }
};

export const fujiRpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://api.avax-test.network/ext/bc/C/rpc";
