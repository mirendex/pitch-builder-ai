import { CopyButton } from "@/components/copy-button";

type Solution = {
  title: string;
  description: string;
  linked_pain_points: string[];
};

export function SolutionsCard({ solutions }: { solutions: Solution[] }) {
  const plainText = solutions
    .map(
      (solution) =>
        `${solution.title}: ${solution.description} | Links: ${solution.linked_pain_points.join(", ") || "Not mapped"}`,
    )
    .join("\n");
  const markdown = [
    "## Proposed Solution",
    ...solutions.map(
      (solution) =>
        `- **${solution.title}**: ${solution.description} _(Links: ${solution.linked_pain_points.join(", ") || "Not mapped"})_`,
    ),
  ].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Proposed solution</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3">
        {solutions.map((solution) => (
          <div key={solution.title} className="rounded-2xl bg-white/60 p-4">
            <p className="font-medium">{solution.title}</p>
            <p className="mt-2 text-sm text-muted">{solution.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent-strong">
              Links: {solution.linked_pain_points.join(", ") || "Not mapped"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

