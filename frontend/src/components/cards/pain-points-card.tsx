type PainPoint = {
  title: string;
  description: string;
  severity: string;
};

export function PainPointsCard({ painPoints }: { painPoints: PainPoint[] }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Pain points</p>
      <div className="mt-4 space-y-3">
        {painPoints.map((point) => (
          <div key={`${point.title}-${point.severity}`} className="rounded-2xl bg-white/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{point.title}</p>
              <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs uppercase text-[color:var(--accent-strong)]">
                {point.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{point.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
