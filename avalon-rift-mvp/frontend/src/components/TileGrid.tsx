import type { TileView } from "../types/game";

type Props = {
  tiles: TileView[];
  selectedAttacker: bigint | null;
  selectedDefender: bigint | null;
  onPickAttacker: (tileId: bigint) => void;
  onPickDefender: (tileId: bigint) => void;
};

export function TileGrid({
  tiles,
  selectedAttacker,
  selectedDefender,
  onPickAttacker,
  onPickDefender,
}: Props) {
  return (
    <section>
      <h2>Tiles</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        {tiles.map((tile) => (
          <article key={tile.tileId.toString()} style={{ border: "1px solid #888", padding: 10 }}>
            <p>ID: {tile.tileId.toString()}</p>
            <p>Power: {tile.power.toString()}</p>
            <p>Rate: {tile.productionRate.toString()}/s</p>
            <button onClick={() => onPickAttacker(tile.tileId)} disabled={selectedAttacker === tile.tileId}>
              {selectedAttacker === tile.tileId ? "Attacker Selected" : "Select Attacker"}
            </button>
            <button onClick={() => onPickDefender(tile.tileId)} disabled={selectedDefender === tile.tileId}>
              {selectedDefender === tile.tileId ? "Defender Selected" : "Select Defender"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
