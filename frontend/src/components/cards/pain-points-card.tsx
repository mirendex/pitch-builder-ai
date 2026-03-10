import { CopyButton } from "@/components/copy-button";

type PainPoint = {
  title: string;
  description: string;
  severity: string;
};

export function PainPointsCard({ painPoints }: { painPoints: PainPoint[] }) {
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
              <p className="font-medium">{point.title}</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs uppercase text-accent-strong">
                {point.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{point.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
