import Link from "next/link";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#agents", label: "Agents" },
  { href: "/app", label: "Dashboard" }
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-commit-amber/10">
            <span className="text-lg font-semibold text-commit-amber">C</span>
          </div>
          <span className="text-lg font-semibold text-commit-slate">Commit Coach</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-commit-slate">
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/app/onboarding"
          className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-commit-slate"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
