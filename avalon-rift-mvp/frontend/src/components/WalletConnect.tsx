type Props = {
  address: `0x${string}` | null;
  onConnect: () => Promise<void>;
};

export function WalletConnect({ address, onConnect }: Props) {
  return (
    <section>
      <h2>Wallet</h2>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={onConnect}>Connect MetaMask</button>
      )}
    </section>
  );
}
