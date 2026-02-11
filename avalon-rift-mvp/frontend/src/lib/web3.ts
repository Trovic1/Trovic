import { createPublicClient, createWalletClient, custom, http } from "viem";
import { avalancheFuji } from "viem/chains";

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

export const getWalletClient = () => {
  if (!(window as Window & { ethereum?: unknown }).ethereum) {
    throw new Error("MetaMask not found");
  }

  return createWalletClient({
    chain: avalancheFuji,
    transport: custom((window as Window & { ethereum: any }).ethereum),
  });
};
