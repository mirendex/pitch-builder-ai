"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

type Solution = {
  title: string;
  description: string;
  linked_pain_points: string[];
};

export function SolutionsCard({ solutions }: { solutions: Solution[] }) {
  const updateSolution = useUiStore((state) => state.updateSolution);
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
    <article className="glass-card rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Proposed solution</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3">
        {solutions.map((solution) => (
          <div key={solution.title} className="rounded-2xl bg-white/60 p-3 sm:p-4">
            <input
              value={solution.title}
              onChange={(event) => updateSolution(solutions.indexOf(solution), "title", event.target.value)}
              className="min-h-11 w-full rounded-xl border border-card bg-white/80 px-3 py-2 font-medium outline-none focus:border-orange-600"
            />
            <textarea
              value={solution.description}
              onChange={(event) => updateSolution(solutions.indexOf(solution), "description", event.target.value)}
              className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-card bg-white/70 px-3 py-3 text-sm text-muted outline-none focus:border-orange-600 sm:min-h-24"
            />
            <label className="mt-3 block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-accent-strong">Linked pain points</span>
              <input
                value={solution.linked_pain_points.join(", ")}
                onChange={(event) =>
                  updateSolution(
                    solutions.indexOf(solution),
                    "linked_pain_points",
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                className="min-h-11 w-full rounded-xl border border-card bg-white/80 px-3 py-2 text-sm outline-none focus:border-orange-600"
              />
            </label>
          </div>
        ))}
      </div>
    </article>
  );
}

