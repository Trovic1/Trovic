import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { publicClient } from "@/lib/chainClient";
import { priceAlertAbi } from "@/lib/priceAlert";

function getContractAddress() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("CONTRACT_ADDRESS is not set.");
  }
  return address as `0x${string}`;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    if (!owner || !isAddress(owner)) {
      return NextResponse.json(
        { error: "Provide a valid owner address." },
        { status: 400 }
      );
    }

    const contractAddress = getContractAddress();
    const alerts = await publicClient.readContract({
      address: contractAddress,
      abi: priceAlertAbi,
      functionName: "getAlertsByOwner",
      args: [owner]
    });

    return NextResponse.json({
      alerts: alerts.map(serializeAlert)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
