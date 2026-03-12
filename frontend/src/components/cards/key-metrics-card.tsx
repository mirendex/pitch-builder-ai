"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

type Metric = {
  label: string;
  value: string;
};

export function KeyMetricsCard({ metrics }: { metrics: Metric[] }) {
  const updateMetric = useUiStore((state) => state.updateMetric);
  const plainText = metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n");
  const markdown = [
    "## Key Metrics",
    ...metrics.map((metric) => `- **${metric.label}**: ${metric.value}`),
  ].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Key metrics</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-white/60 p-4">
            <input
              value={metric.label}
              onChange={(event) => updateMetric(metrics.indexOf(metric), "label", event.target.value)}
              className="min-h-11 w-full rounded-xl border border-card bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted outline-none focus:border-orange-600"
            />
            <input
              value={metric.value}
              onChange={(event) => updateMetric(metrics.indexOf(metric), "value", event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-card bg-white/80 px-3 py-2 text-lg font-semibold outline-none focus:border-orange-600 sm:text-xl"
            />
          </div>
        ))}
      </div>
    </article>
  );
}