import { Card, CardContent } from "@/components/ui/card";

type Step = { label: string; done: boolean };

export function DemoChecklist({ steps }: { steps: Step[] }) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold">Demo Mode</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <span>{step.label}</span>
              <span className={`text-xs ${step.done ? "text-emerald-300" : "text-slate-500"}`}>{step.done ? "Done" : "Pending"}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
