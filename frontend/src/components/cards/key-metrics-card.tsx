type Metric = {
  label: string;
  value: string;
};

export function KeyMetricsCard({ metrics }: { metrics: Metric[] }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Key metrics</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{metric.label}</p>
            <p className="mt-2 text-xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}