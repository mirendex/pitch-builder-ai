type Profile = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
};

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <article className="glass-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Client profile</p>
      <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
        <p><span className="font-medium text-[color:var(--foreground)]">Name:</span> {profile.name ?? "Unknown"}</p>
        <p><span className="font-medium text-[color:var(--foreground)]">Company:</span> {profile.company ?? "Unknown"}</p>
        <p><span className="font-medium text-[color:var(--foreground)]">Role:</span> {profile.role ?? "Unknown"}</p>
        <p><span className="font-medium text-[color:var(--foreground)]">Industry:</span> {profile.industry ?? "Unknown"}</p>
      </div>
    </article>
  );
}
