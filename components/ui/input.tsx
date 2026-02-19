import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-emerald-300/20 placeholder:text-slate-500 focus:ring ${props.className ?? ""}`}
    />
  );
}
