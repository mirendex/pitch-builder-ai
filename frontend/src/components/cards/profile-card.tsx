import { CopyButton } from "@/components/copy-button";

type Profile = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
};

export function ProfileCard({ profile }: { profile: Profile }) {
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
    <article className="glass-card rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Client profile</p>
        <CopyButton plainText={plainText} markdown={markdown} />
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted">
        <p><span className="font-medium text-foreground">Name:</span> {profile.name ?? "Unknown"}</p>
        <p><span className="font-medium text-foreground">Company:</span> {profile.company ?? "Unknown"}</p>
        <p><span className="font-medium text-foreground">Role:</span> {profile.role ?? "Unknown"}</p>
        <p><span className="font-medium text-foreground">Industry:</span> {profile.industry ?? "Unknown"}</p>
      </div>
    </article>
  );
}
