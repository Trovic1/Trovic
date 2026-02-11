import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { AttackPanel } from "./components/AttackPanel";
import { ResourceBalance } from "./components/ResourceBalance";
import { TileGrid } from "./components/TileGrid";
import { WalletConnect } from "./components/WalletConnect";
import { LAND_ABI, RESOURCE_ABI } from "./contracts/abis";
import { useWallet } from "./hooks/useWallet";
import { publicClient, getWalletClient } from "./lib/web3";
import type { TileView } from "./types/game";

const LAND_ADDRESS = import.meta.env.VITE_LAND_CONTRACT as `0x${string}`;
const RESOURCE_ADDRESS = import.meta.env.VITE_RESOURCE_CONTRACT as `0x${string}`;

const DEMO_TILE_IDS = [0n, 1n, 2n, 3n, 4n];

export default function App() {
  const { address, connect } = useWallet();
  const [resourceBalance, setResourceBalance] = useState("0");
  const [tiles, setTiles] = useState<TileView[]>([]);
  const [selectedAttacker, setSelectedAttacker] = useState<bigint | null>(null);
  const [selectedDefender, setSelectedDefender] = useState<bigint | null>(null);

  const canRead = useMemo(() => Boolean(address && LAND_ADDRESS && RESOURCE_ADDRESS), [address]);

  async function loadState() {
    if (!canRead || !address) return;

    const [balance, loadedTiles] = await Promise.all([
      publicClient.readContract({
        address: RESOURCE_ADDRESS,
        abi: RESOURCE_ABI,
        functionName: "balanceOf",
        args: [address],
      }),
      Promise.all(
        DEMO_TILE_IDS.map(async (tileId) => {
          const owner = (await publicClient.readContract({
            address: LAND_ADDRESS,
            abi: LAND_ABI,
            functionName: "ownerOf",
            args: [tileId],
          })) as `0x${string}`;

          const [power, productionRate] = (await publicClient.readContract({
            address: LAND_ADDRESS,
            abi: LAND_ABI,
            functionName: "tileData",
            args: [tileId],
          })) as [bigint, bigint, bigint];

          return { tileId, owner, power, productionRate } satisfies TileView;
        })
      ),
    ]);

    setResourceBalance(formatUnits(balance as bigint, 18));
    setTiles(loadedTiles);
  }

  async function attack() {
    if (!selectedAttacker || !selectedDefender || !address) return;
    const wallet = getWalletClient();

    const hash = await wallet.writeContract({
      account: address,
      address: LAND_ADDRESS,
      abi: LAND_ABI,
      functionName: "attack",
      args: [selectedAttacker, selectedDefender],
      chain: wallet.chain,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await loadState();
  }

  async function claim(tileId: bigint) {
    if (!address) return;
    const wallet = getWalletClient();

    const hash = await wallet.writeContract({
      account: address,
      address: LAND_ADDRESS,
      abi: LAND_ABI,
      functionName: "claimResources",
      args: [tileId],
      chain: wallet.chain,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await loadState();
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", fontFamily: "Inter, sans-serif", padding: "1rem" }}>
      <h1>Avalon Rift (MVP)</h1>
      <WalletConnect address={address} onConnect={connect} />
      <button onClick={loadState} disabled={!canRead}>
        Refresh Game State
      </button>
      <ResourceBalance balance={resourceBalance} />
      <TileGrid
        tiles={tiles}
        selectedAttacker={selectedAttacker}
        selectedDefender={selectedDefender}
        onPickAttacker={setSelectedAttacker}
        onPickDefender={setSelectedDefender}
      />
      <AttackPanel
        attackerTileId={selectedAttacker}
        defenderTileId={selectedDefender}
        onAttack={attack}
        onClaim={claim}
      />
    </main>
  );
}
