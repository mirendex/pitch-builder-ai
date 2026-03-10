"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

export function ExecutiveSummaryCard({ summary }: { summary: string }) {
  const updateExecutiveSummary = useUiStore((state) => state.updateExecutiveSummary);

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Executive summary</p>
        <CopyButton plainText={summary} markdown={`## Executive Summary\n${summary}`} />
      </div>
      <textarea
        value={summary}
        onChange={(event) => updateExecutiveSummary(event.target.value)}
        className="mt-4 min-h-40 w-full resize-none rounded-3xl border border-card bg-white/70 p-4 text-sm leading-7 text-foreground outline-none focus:border-orange-600"
      />
    </article>
  );
}
