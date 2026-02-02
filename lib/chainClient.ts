import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defaultChain } from "./priceAlert";

const rpcUrl =
  process.env.RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(rpcUrl)
});

export function getWalletClient() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set.");
  }
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    account,
    chain: defaultChain,
    transport: http(rpcUrl)
  });
}
