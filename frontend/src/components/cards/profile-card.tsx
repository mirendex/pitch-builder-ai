"use client";

import { CopyButton } from "@/components/copy-button";
import { useUiStore } from "@/stores/ui";

type Profile = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
};

export function ProfileCard({ profile }: { profile: Profile }) {
  const updateProfileField = useUiStore((state) => state.updateProfileField);
  const plainText = [
    `Name: ${profile.name ?? "Unknown"}`,
    `Company: ${profile.company ?? "Unknown"}`,
    `Role: ${profile.role ?? "Unknown"}`,
    `Industry: ${profile.industry ?? "Unknown"}`,
  ].join("\n");

  const markdown = [
    "## Client Profile",
    `- Name: ${profile.name ?? "Unknown"}`,
    `- Company: ${profile.company ?? "Unknown"}`,
    `- Role: ${profile.role ?? "Unknown"}`,
    `- Industry: ${profile.industry ?? "Unknown"}`,
  ].join("\n");

  return (
    <article className="glass-card rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
          Client profile
        </p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted">
        {(
          [
            ["name", "Name"],
            ["company", "Company"],
            ["role", "Role"],
            ["industry", "Industry"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="block space-y-2">
            <span className="font-medium text-foreground">{label}</span>
            <input
              value={profile[field] ?? ""}
              onChange={(event) =>
                updateProfileField(field, event.target.value)
              }
              placeholder={`Add ${label.toLowerCase()}`}
              className="min-h-11 w-full rounded-2xl border border-card bg-white/70 px-4 py-3 text-sm text-foreground outline-none focus:border-orange-600"
            />
          </label>
        ))}
      </div>
    </article>
  );
}
