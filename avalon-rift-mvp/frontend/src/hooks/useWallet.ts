import { useState } from "react";
import { getAddress } from "viem";
import { getWalletClient } from "../lib/web3";

export function useWallet() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  async function connect() {
    const walletClient = getWalletClient();
    const [selected] = await walletClient.requestAddresses();
    setAddress(getAddress(selected));
  }

  return { address, connect };
}
