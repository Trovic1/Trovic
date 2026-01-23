interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="text-sm font-semibold uppercase tracking-widest text-commit-amber">
        {title}
      </div>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
