import { CopyButton } from "@/components/copy-button";

export function ExecutiveSummaryCard({ summary }: { summary: string }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Executive summary</p>
        <CopyButton plainText={summary} markdown={`## Executive Summary\n${summary}`} />
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{summary}</p>
    </article>
  );
}
