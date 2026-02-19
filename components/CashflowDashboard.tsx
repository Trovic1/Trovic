"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useConnect, useDisconnect, usePublicClient, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { avalancheFuji } from "wagmi/chains";
import { cashflowChainId, cashflowContracts } from "@/app/lib/cashflowContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActionsPanel } from "@/components/cashflow/ActionsPanel";
import { VaultOverview } from "@/components/cashflow/VaultOverview";
import { DemoChecklist } from "@/components/cashflow/DemoChecklist";
import { PpsChart, PpsPoint } from "@/components/cashflow/PpsChart";
import type { ToastItem } from "@/components/cashflow/types";

const usdcDecimals = 6;
const mintExists = cashflowContracts.mockUsdc.abi.some((item) => item.type === "function" && item.name === "mint");

export default function CashflowDashboard() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const isFuji = chainId === cashflowChainId;
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [depositAmount, setDepositAmount] = useState("");
  const [redeemShares, setRedeemShares] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [ppsPoints, setPpsPoints] = useState<PpsPoint[]>([]);

  const pushToast = (type: ToastItem["type"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const { data: totalAssets } = useReadContract({ ...cashflowContracts.vault, functionName: "totalAssets" });
  const { data: totalSupply } = useReadContract({ ...cashflowContracts.vault, functionName: "totalSupply" });
  const { data: userShares } = useReadContract({ ...cashflowContracts.vault, functionName: "balanceOf", args: [address!], query: { enabled: !!address } });
  const { data: userClaimableAssets } = useReadContract({ ...cashflowContracts.vault, functionName: "convertToAssets", args: [userShares ?? 0n], query: { enabled: userShares !== undefined } });
  const { data: creator } = useReadContract({ ...cashflowContracts.schedule, functionName: "creator" });
  const { data: usdcAllowanceToVault } = useReadContract({ ...cashflowContracts.mockUsdc, functionName: "allowance", args: [address!, cashflowContracts.vault.address], query: { enabled: !!address } });
  const { data: usdcAllowanceToSchedule } = useReadContract({ ...cashflowContracts.mockUsdc, functionName: "allowance", args: [address!, cashflowContracts.schedule.address], query: { enabled: !!address } });
  const { data: usdcBalance } = useReadContract({ ...cashflowContracts.mockUsdc, functionName: "balanceOf", args: [address!], query: { enabled: !!address } });

  const isCreator = !!address && !!creator && address.toLowerCase() === creator.toLowerCase();

  const runTx = async (label: string, tx: () => Promise<`0x${string}`>) => {
    try {
      pushToast("pending", `${label} pending...`);
      const hash = await tx();
      await publicClient?.waitForTransactionReceipt({ hash });
      pushToast("success", `${label} confirmed`);
    } catch (error) {
      pushToast("error", `${label} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // PPS = totalAssets / totalSupply. Vault and USDC both use 6 decimals so ratio can be displayed directly.
  useEffect(() => {
    if (totalAssets === undefined || totalSupply === undefined) return;
    const timer = setInterval(async () => {
      const assets = (await publicClient?.readContract({ ...cashflowContracts.vault, functionName: "totalAssets" })) as bigint | undefined;
      const supply = (await publicClient?.readContract({ ...cashflowContracts.vault, functionName: "totalSupply" })) as bigint | undefined;
      const pps = supply && supply > 0n && assets !== undefined ? Number(assets) / Number(supply) : 0;
      setPpsPoints((prev) => [...prev.slice(-24), { label: new Date().toLocaleTimeString(), pps }]);
    }, 12000);
    return () => clearInterval(timer);
  }, [publicClient, totalAssets, totalSupply]);

  useEffect(() => {
    if (totalAssets === undefined || totalSupply === undefined) return;
    const pps = totalSupply > 0n ? Number(totalAssets) / Number(totalSupply) : 0;
    setPpsPoints((prev) => (prev.length ? prev : [{ label: "Now", pps }]));
  }, [totalAssets, totalSupply]);

  const steps = useMemo(
    () => [
      { label: "Connect wallet", done: isConnected },
      { label: "Mint mock USDC", done: (usdcBalance ?? 0n) > 0n },
      { label: "Approve Vault", done: (usdcAllowanceToVault ?? 0n) > 0n },
      { label: "Deposit", done: (userShares ?? 0n) > 0n },
      { label: "Creator approve + pay twice", done: isCreator ? (usdcAllowanceToSchedule ?? 0n) > 0n && ppsPoints.length >= 3 : true },
      { label: "Redeem", done: (userShares ?? 0n) === 0n && (userClaimableAssets ?? 0n) === 0n }
    ],
    [isConnected, usdcBalance, usdcAllowanceToVault, userShares, isCreator, usdcAllowanceToSchedule, ppsPoints.length, userClaimableAssets]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-emerald-500/10">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">CashflowVaults • Avalanche Fuji</p>
          <h1 className="mt-3 text-4xl font-semibold">Tokenize future cashflows into yield-bearing vault shares.</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Deposit USDC into an ERC-4626 vault, trigger scheduled creator payments that increase price per share, and redeem shares for realized profits.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!isConnected ? (
              <Button onClick={() => connect({ connector: connectors[0] })}>Connect MetaMask</Button>
            ) : (
              <>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <Button variant="outline" onClick={() => disconnect()}>Disconnect</Button>
              </>
            )}
            <span className="text-sm text-slate-300">Network: {isFuji ? "Avalanche Fuji" : `Chain ${chainId}`}</span>
            {!isFuji && isConnected && (
              <Button variant="outline" onClick={() => switchChain({ chainId: avalancheFuji.id })}>Switch to Fuji</Button>
            )}
          </div>
        </section>

        <VaultOverview totalAssets={totalAssets} totalSupply={totalSupply} userShares={userShares} userClaimableAssets={userClaimableAssets} />

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <PpsChart points={ppsPoints} />
            <Card><CardContent><h3 className="text-lg font-semibold">Explorer Links</h3><div className="mt-3 grid gap-2 text-sm text-emerald-300">{Object.entries(cashflowContracts).map(([k, c]) => (<a key={k} className="hover:underline" href={`https://testnet.snowtrace.io/address/${c.address}`} target="_blank">{k} • {c.address}</a>))}</div></CardContent></Card>
          </div>

          <div className="space-y-6">
            <ActionsPanel
              isCreator={isCreator}
              isFuji={isFuji}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              redeemShares={redeemShares}
              setRedeemShares={setRedeemShares}
              onApproveVault={() =>
                void runTx("Approve vault", () => writeContractAsync({ ...cashflowContracts.mockUsdc, functionName: "approve", args: [cashflowContracts.vault.address, parseUnits("1000000000", usdcDecimals)] }))
              }
              onDeposit={() =>
                void runTx("Deposit", () => {
                  const amount = parseUnits(depositAmount || "0", usdcDecimals);
                  return writeContractAsync({ ...cashflowContracts.vault, functionName: "deposit", args: [amount, address!] });
                })
              }
              onRedeem={() =>
                void runTx("Redeem", () => {
                  const shares = parseUnits(redeemShares || "0", usdcDecimals);
                  return writeContractAsync({ ...cashflowContracts.vault, functionName: "redeem", args: [shares, address!, address!] });
                })
              }
              onMaxRedeem={() => setRedeemShares(formatUnits(userShares ?? 0n, usdcDecimals))}
              onApproveSchedule={() =>
                void runTx("Approve schedule", () => writeContractAsync({ ...cashflowContracts.mockUsdc, functionName: "approve", args: [cashflowContracts.schedule.address, parseUnits("1000000000", usdcDecimals)] }))
              }
              onPay={() => void runTx("Schedule pay", () => writeContractAsync({ ...cashflowContracts.schedule, functionName: "pay" }))}
            />

            <DemoChecklist steps={steps} />

            {mintExists && (
              <Button className="w-full" variant="outline" onClick={() => void runTx("Mint mock USDC", () => writeContractAsync({ ...cashflowContracts.mockUsdc, functionName: "mint", args: [address!, parseUnits("5000", usdcDecimals)] }))}>
                Mint 5,000 Mock USDC
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`min-w-64 rounded-lg border px-4 py-2 text-sm ${toast.type === "success" ? "border-emerald-400/40 bg-emerald-400/10" : toast.type === "error" ? "border-rose-400/40 bg-rose-400/10" : "border-white/20 bg-slate-800"}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
