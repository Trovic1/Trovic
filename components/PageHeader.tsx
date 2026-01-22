import Link from "next/link";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function PageHeader({
  title,
  eyebrow,
  description,
  ctaLabel,
  ctaHref
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-widest text-commit-amber">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-commit-slate md:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-slate-600">{description}</p> : null}
      </div>
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="rounded-full border border-commit-blue/20 bg-commit-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-commit-slate"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
