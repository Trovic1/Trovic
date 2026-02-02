"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ActionPayload =
  | {
      type: "getCryptoPrice";
      symbol: string;
      priceUsd: number;
    }
  | {
      type: "listOnchainAlerts";
      owner: string;
      alerts: Array<{
        owner: string;
        symbol: string;
        targetPriceUsd: string;
        isAbove: boolean;
        createdAt: string;
        active: boolean;
      }>;
    }
  | {
      type: "createOnchainAlert";
      symbol: string;
      targetPriceUsd: number;
      isAbove: boolean;
      txHash: string;
    };

type AlertItem = {
  owner: string;
  symbol: string;
  targetPriceUsd: string;
  isAbove: boolean;
  createdAt: string;
  active: boolean;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to Crypto Radar AI Agent. Ask me for prices, create alerts, or list alerts."
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actions, setActions] = useState<ActionPayload[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const primaryConnector = connectors[0];
  const chainName =
    process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Avalanche Fuji";

  const formattedActions = useMemo(
    () =>
      actions.map((action, index) => ({
        id: `${action.type}-${index}`,
        detail: action
      })),
    [actions]
  );

  const fetchAlerts = async () => {
    if (!address) {
      return;
    }
    setAlertsLoading(true);
    setAlertsError(null);
    try {
      const response = await fetch(`/api/alerts?owner=${address}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load alerts.");
      }
      setAlerts(data.alerts ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      setAlertsError(message);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchAlerts();
    } else {
      setAlerts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      return;
    }
    setIsSending(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.reply ?? "Agent request failed.");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
      if (Array.isArray(data.actions)) {
        setActions(data.actions);
      }
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Unknown error.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Agent error: ${messageText}` }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    void sendMessage(action);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Crypto Radar AI Agent
            </p>
            <h1 className="text-2xl font-semibold">Avalanche Alert Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-emerald-300 hover:text-emerald-200"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                disabled={!primaryConnector || isPending}
                onClick={() => connect({ connector: primaryConnector })}
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isPending ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Chain</p>
              <p className="text-lg font-semibold text-white">{chainName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction("Price of AVAX")}
                className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-200 hover:border-emerald-300"
              >
                Price of AVAX
              </button>
              <button
                onClick={() => handleQuickAction("Create alert for AVAX above 50")}
                className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-200 hover:border-emerald-300"
              >
                Create sample alert
              </button>
              <button
                onClick={fetchAlerts}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:border-emerald-300"
              >
                Refresh alerts
              </button>
              {isConnected && address ? (
                <button
                  onClick={() =>
                    handleQuickAction(`Show my alerts ${address}`)
                  }
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white hover:border-emerald-300"
                >
                  Ask agent for my alerts
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-slate-800/80 text-slate-100"
                    : "bg-emerald-400/20 text-emerald-50"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {message.role === "assistant" ? "Agent" : "You"}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          {formattedActions.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-widest text-emerald-300">
                Latest tool actions
              </p>
              <div className="mt-3 space-y-3 text-xs text-slate-200">
                {formattedActions.map(({ id, detail }) => (
                  <pre
                    key={id}
                    className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[0.72rem] text-slate-200"
                  >
                    {JSON.stringify(detail, null, 2)}
                  </pre>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the agent to fetch a price or create an alert..."
              className="flex-1 rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending}
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                My Alerts
              </p>
              <p className="text-lg font-semibold text-white">On-chain registry</p>
            </div>
            <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-200">
              {isConnected ? "Connected" : "Wallet required"}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {!isConnected ? (
              <p className="text-slate-400">
                Connect a wallet to load your on-chain alert history.
              </p>
            ) : alertsLoading ? (
              <p>Loading alerts...</p>
            ) : alertsError ? (
              <p className="text-rose-300">{alertsError}</p>
            ) : alerts.length === 0 ? (
              <p className="text-slate-400">
                No alerts yet. Create one using the chat or the quick action.
              </p>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={`${alert.symbol}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {alert.symbol} {alert.isAbove ? "above" : "below"} $
                    {alert.targetPriceUsd}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Status: {alert.active ? "Active" : "Inactive"}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
