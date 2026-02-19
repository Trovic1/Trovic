"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useMemo } from "react";
import { cashflowChainId, fujiRpcUrl } from "@/app/lib/cashflowContracts";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const config = useMemo(
    () =>
      createConfig({
        chains: [avalancheFuji],
        connectors: [injected()],
        transports: {
          [cashflowChainId]: http(fujiRpcUrl)
        }
      }),
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
