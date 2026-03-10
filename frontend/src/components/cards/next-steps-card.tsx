"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

export function NextStepsCard({ nextSteps }: { nextSteps: string[] }) {
  const updateNextStep = useUiStore((state) => state.updateNextStep);
  const plainText = nextSteps.join("\n");
  const markdown = ["## Next Steps", ...nextSteps.map((step) => `1. ${step}`)].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Next steps</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3">
        {nextSteps.map((step, index) => (
          <div key={`${step}-${index}`} className="flex items-start gap-3">
            <span className="pt-3 text-sm font-medium text-accent-strong">{index + 1}.</span>
            <input
              value={step}
              onChange={(event) => updateNextStep(index, event.target.value)}
              className="w-full rounded-2xl border border-card bg-white/70 px-4 py-3 text-sm text-foreground outline-none focus:border-orange-600"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
