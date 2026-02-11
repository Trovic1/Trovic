type Props = {
  attackerTileId: bigint | null;
  defenderTileId: bigint | null;
  onAttack: () => Promise<void>;
  onClaim: (tileId: bigint) => Promise<void>;
};

export function AttackPanel({ attackerTileId, defenderTileId, onAttack, onClaim }: Props) {
  return (
    <section>
      <h2>Actions</h2>
      <p>Attacker: {attackerTileId?.toString() || "none"}</p>
      <p>Defender: {defenderTileId?.toString() || "none"}</p>
      <button disabled={!attackerTileId || !defenderTileId} onClick={onAttack}>
        Attack
      </button>
      {attackerTileId && <button onClick={() => onClaim(attackerTileId)}>Claim attacker resources</button>}
    </section>
  );
}
