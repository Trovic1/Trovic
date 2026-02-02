import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { publicClient, getWalletClient } from "@/lib/chainClient";
import { priceAlertAbi } from "@/lib/priceAlert";

type ToolAction =
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

const COINGECKO_IDS: Record<string, string> = {
  AVAX: "avalanche-2",
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana"
};

function getContractAddress() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("CONTRACT_ADDRESS is not set.");
  }
  return address as `0x${string}`;
}

async function getCryptoPrice(symbol: string) {
  const id = COINGECKO_IDS[symbol.toUpperCase()];
  if (!id) {
    throw new Error(
      `Unsupported symbol ${symbol}. Try AVAX, BTC, ETH, or SOL.`
    );
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
  const response = await fetch(url, { next: { revalidate: 30 } });
  if (!response.ok) {
    throw new Error("Failed to fetch price from CoinGecko.");
  }
  const data = await response.json();
  const price = data?.[id]?.usd;
  if (typeof price !== "number") {
    throw new Error("CoinGecko returned an unexpected response.");
  }
  return price;
}

function serializeAlert(alert: {
  owner: string;
  symbol: string;
  targetPriceUsd: bigint;
  isAbove: boolean;
  createdAt: bigint;
  active: boolean;
}) {
  return {
    owner: alert.owner,
    symbol: alert.symbol,
    targetPriceUsd: alert.targetPriceUsd.toString(),
    isAbove: alert.isAbove,
    createdAt: alert.createdAt.toString(),
    active: alert.active
  };
}

async function listOnchainAlerts(owner: string) {
  const contractAddress = getContractAddress();
  const alerts = await publicClient.readContract({
    address: contractAddress,
    abi: priceAlertAbi,
    functionName: "getAlertsByOwner",
    args: [owner]
  });
  return alerts.map(serializeAlert);
}

async function createOnchainAlert(
  symbol: string,
  targetPriceUsd: number,
  isAbove: boolean
) {
  const contractAddress = getContractAddress();
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: priceAlertAbi,
    functionName: "createAlert",
    args: [symbol.toUpperCase(), BigInt(Math.round(targetPriceUsd)), isAbove]
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

function parsePriceRequest(message: string) {
  const match = message.match(/price(?: of)?\s+([a-zA-Z]{2,10})/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

function parseCreateAlert(message: string) {
  const regex =
    /alert(?: for)?\s+([a-zA-Z]{2,10})\s+(above|below|over|under|greater than|less than)\s+([\d.]+)/i;
  const match = message.match(regex);
  if (!match) {
    return null;
  }
  const symbol = match[1].toUpperCase();
  const direction = match[2].toLowerCase();
  const price = Number(match[3]);
  if (Number.isNaN(price)) {
    return null;
  }
  const isAbove = ["above", "over", "greater than"].includes(direction);
  return { symbol, targetPriceUsd: price, isAbove };
}

function parseOwnerAddress(message: string) {
  const match = message.match(/0x[a-fA-F0-9]{40}/);
  return match?.[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { reply: "Please provide a message for the agent." },
        { status: 400 }
      );
    }

    const createPayload = parseCreateAlert(message);
    if (createPayload) {
      const hash = await createOnchainAlert(
        createPayload.symbol,
        createPayload.targetPriceUsd,
        createPayload.isAbove
      );
      const reply = `Created an alert for ${createPayload.symbol} ${
        createPayload.isAbove ? "above" : "below"
      } $${createPayload.targetPriceUsd}. Transaction: ${hash}`;
      const actions: ToolAction[] = [
        {
          type: "createOnchainAlert",
          symbol: createPayload.symbol,
          targetPriceUsd: createPayload.targetPriceUsd,
          isAbove: createPayload.isAbove,
          txHash: hash
        }
      ];
      return NextResponse.json({ reply, actions });
    }

    const priceSymbol = parsePriceRequest(message);
    if (priceSymbol) {
      const price = await getCryptoPrice(priceSymbol);
      const reply = `${priceSymbol} is trading at $${price.toLocaleString()} USD right now.`;
      const actions: ToolAction[] = [
        { type: "getCryptoPrice", symbol: priceSymbol, priceUsd: price }
      ];
      return NextResponse.json({ reply, actions });
    }

    if (/show my alerts|list alerts|my alerts/i.test(message)) {
      const owner = parseOwnerAddress(message);
      if (!owner || !isAddress(owner)) {
        return NextResponse.json({
          reply:
            "Please include the wallet address you want to inspect, e.g. `show my alerts 0xabc...`."
        });
      }
      const alerts = await listOnchainAlerts(owner);
      const reply =
        alerts.length === 0
          ? "No alerts found for that address yet."
          : `Found ${alerts.length} alert(s) for ${owner}.`;
      const actions: ToolAction[] = [
        { type: "listOnchainAlerts", owner, alerts }
      ];
      return NextResponse.json({ reply, actions });
    }

    return NextResponse.json({
      reply:
        "I can fetch prices, create alerts, or list alerts. Try: `Price of AVAX`, `Create alert for AVAX above 50`, or `Show my alerts 0x...`."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json(
      { reply: `Agent error: ${message}` },
      { status: 500 }
    );
  }
}
