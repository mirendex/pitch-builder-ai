"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FollowUpEmail } from "@/lib/analysis-types";
import { downloadAnalysisPdf } from "@/components/pdf/analysis-pdf";
import { ExecutiveSummaryCard } from "@/components/cards/executive-summary-card";
import { KeyMetricsCard } from "@/components/cards/key-metrics-card";
import { NextStepsCard } from "@/components/cards/next-steps-card";
import { PainPointsCard } from "@/components/cards/pain-points-card";
import { ProfileCard } from "@/components/cards/profile-card";
import { SolutionsCard } from "@/components/cards/solutions-card";
import { fetchAnalysisById, generateFollowUp, subscribeToStream } from "@/lib/api";
import { useUiStore } from "@/stores/ui";

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const analysisId = params.id;
  const [status, setStatus] = useState("Connecting...");
  const [followUp, setFollowUp] = useState<FollowUpEmail | null>(null);
  const editedAnalysis = useUiStore((state) => state.editedAnalysis);
  const activeAnalysisId = useUiStore((state) => state.activeAnalysisId);
  const setActiveAnalysisId = useUiStore((state) => state.setActiveAnalysisId);
  const initializeEditedAnalysis = useUiStore((state) => state.initializeEditedAnalysis);
  const resetEditedAnalysis = useUiStore((state) => state.resetEditedAnalysis);
  const analysisQuery = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () => fetchAnalysisById(analysisId),
    refetchInterval: (query) => (query.state.data?.status === "done" ? false : 3_000),
  });
  const followUpMutation = useMutation({
    mutationFn: () => generateFollowUp(analysisId, editedAnalysis),
    onSuccess: (data) => {
      setFollowUp(data);
      toast.success("Follow-up email drafted.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (activeAnalysisId !== analysisId) {
      setActiveAnalysisId(analysisId);
      resetEditedAnalysis();
      setFollowUp(null);
    }
  }, [activeAnalysisId, analysisId, resetEditedAnalysis, setActiveAnalysisId]);

  useEffect(() => {
    if (analysisQuery.data?.result_json) {
      initializeEditedAnalysis(analysisQuery.data.result_json);
    }
  }, [analysisQuery.data?.result_json, initializeEditedAnalysis]);

  useEffect(() => {
    if (analysisQuery.data?.status_message) {
      setStatus(analysisQuery.data.status_message);
    }
  }, [analysisQuery.data?.status_message]);

  useEffect(() => {
    const stream = subscribeToStream(analysisId);
    const handleStatusEvent = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as { status?: string };
      if (payload.status) {
        setStatus(payload.status);
      }
    };

    stream.addEventListener("status", handleStatusEvent);

    stream.onerror = () => {
      stream.close();
    };

    return () => {
      stream.removeEventListener("status", handleStatusEvent);
      stream.close();
    };
  }, [analysisId]);

  if (analysisQuery.isLoading) {
    return (
      <main className="shell py-6 sm:py-8 md:py-10">
        <div className="glass-card rounded-4xl p-5 sm:p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Processing</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{status}</h1>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-3xl bg-white/60" />
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

  const result = editedAnalysis ?? data.result_json;

  return (
    <main className="shell py-6 sm:py-8 md:py-10">
      <section className="glass-card rounded-4xl p-5 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Live status</p>
            <h1 className="mt-3 text-3xl font-semibold capitalize sm:text-4xl">{data.status}</h1>
            <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{status}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Click directly into any card below to correct wording, numbers, or mappings before export.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (result) {
                  void downloadAnalysisPdf(result, analysisId);
                }
              }}
              disabled={!result}
              className="min-h-11 w-full rounded-full border border-card bg-white/80 px-5 py-3 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => followUpMutation.mutate()}
              disabled={!result || followUpMutation.isPending}
              className="min-h-11 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {followUpMutation.isPending ? "Generating..." : "Generate follow-up"}
            </button>
          </div>
        </div>

        {followUp ? (
          <div className="mt-6 rounded-3xl border border-card bg-white/70 p-4 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Follow-up email</p>
            <p className="mt-3 text-base font-semibold sm:text-lg">{followUp.subject}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{followUp.body}</p>
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="mt-6 grid gap-5 xl:grid-cols-2 xl:gap-6">
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
