export function NextStepsCard({ nextSteps }: { nextSteps: string[] }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Next steps</p>
      <ol className="mt-4 space-y-3 pl-5 text-sm text-[color:var(--foreground)]">
        {nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
