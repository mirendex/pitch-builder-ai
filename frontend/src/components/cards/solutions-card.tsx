type Solution = {
  title: string;
  description: string;
  linked_pain_points: string[];
};

export function SolutionsCard({ solutions }: { solutions: Solution[] }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Proposed solution</p>
      <div className="mt-4 space-y-3">
        {solutions.map((solution) => (
          <div key={solution.title} className="rounded-2xl bg-white/60 p-4">
            <p className="font-medium">{solution.title}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{solution.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">
              Links: {solution.linked_pain_points.join(", ") || "Not mapped"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
