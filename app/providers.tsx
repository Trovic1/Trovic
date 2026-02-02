"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useMemo } from "react";

const defaultRpc =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://api.avax-test.network/ext/bc/C/rpc";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const config = useMemo(
    () =>
      createConfig({
        chains: [avalancheFuji],
        connectors: [injected()],
        transports: {
          [avalancheFuji.id]: http(defaultRpc)
        }
      }),
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
