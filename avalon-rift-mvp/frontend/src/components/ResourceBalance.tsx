type Props = {
  balance: string;
};

export function ResourceBalance({ balance }: Props) {
  return (
    <section>
      <h2>Resources</h2>
      <p>{balance} ARR</p>
    </section>
  );
}
