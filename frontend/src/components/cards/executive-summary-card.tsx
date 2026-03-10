export function ExecutiveSummaryCard({ summary }: { summary: string }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Executive summary</p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{summary}</p>
    </article>
  );
}
