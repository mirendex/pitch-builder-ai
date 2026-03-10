import { CopyButton } from "@/components/copy-button";

type Metric = {
  label: string;
  value: string;
};

export function KeyMetricsCard({ metrics }: { metrics: Metric[] }) {
  const plainText = metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n");
  const markdown = [
    "## Key Metrics",
    ...metrics.map((metric) => `- **${metric.label}**: ${metric.value}`),
  ].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Key metrics</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{metric.label}</p>
            <p className="mt-2 text-xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}