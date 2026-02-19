import { Card, CardContent } from "@/components/ui/card";
import { formatUnits } from "viem";

type Props = {
  totalAssets?: bigint;
  totalSupply?: bigint;
  userShares?: bigint;
  userClaimableAssets?: bigint;
};

const fmt = (value?: bigint) => (value !== undefined ? Number(formatUnits(value, 6)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-");

export function VaultOverview({ totalAssets, totalSupply, userShares, userClaimableAssets }: Props) {
  const pps = totalSupply && totalSupply > 0n && totalAssets !== undefined ? Number(totalAssets) / Number(totalSupply) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardContent><p className="text-xs text-slate-400">Total Assets (USDC)</p><p className="mt-2 text-2xl font-semibold">{fmt(totalAssets)}</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-slate-400">Total Supply (Shares)</p><p className="mt-2 text-2xl font-semibold">{fmt(totalSupply)}</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-slate-400">Price Per Share</p><p className="mt-2 text-2xl font-semibold">{pps.toFixed(6)}</p></CardContent></Card>
      <Card><CardContent><p className="text-xs text-slate-400">Your Shares / Claimable</p><p className="mt-2 text-2xl font-semibold">{fmt(userShares)} / {fmt(userClaimableAssets)}</p></CardContent></Card>
    </div>
  );
}
