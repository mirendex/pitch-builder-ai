"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExecutiveSummaryCard } from "@/components/cards/executive-summary-card";
import { KeyMetricsCard } from "@/components/cards/key-metrics-card";
import { NextStepsCard } from "@/components/cards/next-steps-card";
import { PainPointsCard } from "@/components/cards/pain-points-card";
import { ProfileCard } from "@/components/cards/profile-card";
import { SolutionsCard } from "@/components/cards/solutions-card";
import { fetchAnalysisById, subscribeToStream } from "@/lib/api";

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const analysisId = params.id;
  const [status, setStatus] = useState("Connecting...");
  const analysisQuery = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () => fetchAnalysisById(analysisId),
    refetchInterval: (query) => (query.state.data?.status === "done" ? false : 3_000),
  });

  useEffect(() => {
    const stream = subscribeToStream(analysisId);
    stream.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { status?: string };
      if (payload.status) {
        setStatus(payload.status);
      }
    };

    stream.onerror = () => {
      stream.close();
    };

    return () => stream.close();
  }, [analysisId]);

  if (analysisQuery.isLoading) {
    return (
      <main className="shell py-10">
        <div className="glass-card rounded-[32px] p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Processing</p>
          <h1 className="mt-4 text-4xl font-semibold">{status}</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-[24px] bg-white/60" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const data = analysisQuery.data;

  if (!data) {
    return null;
  }

  const result = data.result_json;

  return (
    <main className="shell py-10">
      <section className="glass-card rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Live status</p>
        <h1 className="mt-3 text-4xl font-semibold capitalize">{data.status}</h1>
        <p className="mt-2 text-[color:var(--muted)]">{status}</p>
      </section>

      {result ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <ProfileCard profile={result.client_profile} />
          <ExecutiveSummaryCard summary={result.executive_summary} />
          <PainPointsCard painPoints={result.pain_points} />
          <SolutionsCard solutions={result.proposed_solutions} />
          <NextStepsCard nextSteps={result.next_steps} />
          <KeyMetricsCard metrics={result.key_metrics} />
        </section>
      ) : null}
    </main>
  );
}
