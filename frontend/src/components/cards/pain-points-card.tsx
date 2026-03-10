"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

type PainPoint = {
  title: string;
  description: string;
  severity: string;
};

export function PainPointsCard({ painPoints }: { painPoints: PainPoint[] }) {
  const updatePainPoint = useUiStore((state) => state.updatePainPoint);
  const plainText = painPoints
    .map((point) => `${point.title} (${point.severity}): ${point.description}`)
    .join("\n");
  const markdown = [
    "## Pain Points",
    ...painPoints.map((point) => `- **${point.title}** (${point.severity}): ${point.description}`),
  ].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Pain points</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3">
        {painPoints.map((point) => (
          <div key={`${point.title}-${point.severity}`} className="rounded-2xl bg-white/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <input
                value={point.title}
                onChange={(event) => updatePainPoint(painPoints.indexOf(point), "title", event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-card bg-white/80 px-3 py-2 font-medium outline-none focus:border-orange-600"
              />
              <select
                value={point.severity}
                onChange={(event) => updatePainPoint(painPoints.indexOf(point), "severity", event.target.value)}
                className="rounded-full border border-card bg-orange-100 px-3 py-2 text-xs uppercase text-accent-strong outline-none"
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>
            <textarea
              value={point.description}
              onChange={(event) => updatePainPoint(painPoints.indexOf(point), "description", event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-card bg-white/70 px-3 py-3 text-sm text-muted outline-none focus:border-orange-600"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
