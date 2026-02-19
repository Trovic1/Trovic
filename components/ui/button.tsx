import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
};

export function Button({ variant = "default", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    default: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
    outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
    ghost: "text-slate-200 hover:bg-white/10",
    destructive: "bg-rose-500 text-white hover:bg-rose-400"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
