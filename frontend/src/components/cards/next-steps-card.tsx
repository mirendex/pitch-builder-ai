import { CopyButton } from "@/components/copy-button";

export function NextStepsCard({ nextSteps }: { nextSteps: string[] }) {
  const plainText = nextSteps.join("\n");
  const markdown = ["## Next Steps", ...nextSteps.map((step) => `1. ${step}`)].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Next steps</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <ol className="mt-4 space-y-3 pl-5 text-sm text-foreground">
        {nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
