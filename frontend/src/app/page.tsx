"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ByokModal } from "@/components/byok-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAnalysis,
  fetchAnalyses,
  startAnalysis,
  uploadAnalysis,
} from "@/lib/api";
import type { AnalysisListItem } from "@/lib/analysis-types";
import { useUiStore } from "@/stores/ui";

export default function HomePage() {
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeAnalysisId = useUiStore((state) => state.activeAnalysisId);
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen);
  const setActiveAnalysisId = useUiStore((state) => state.setActiveAnalysisId);
  const analysesQuery = useQuery({
    queryKey: ["analyses"],
    queryFn: fetchAnalyses,
  });
  const analyzeMutation = useMutation({
    mutationFn: startAnalysis,
    onSuccess: (data) => {
      setActiveAnalysisId(data.analysis_id);
      router.push(`/analysis/${data.analysis_id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const uploadMutation = useMutation({
    mutationFn: uploadAnalysis,
    onSuccess: (data) => {
      setActiveAnalysisId(data.analysis_id);
      router.push(`/analysis/${data.analysis_id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: async (_, analysisId) => {
      await queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Analysis deleted.");
      if (activeAnalysisId === analysisId) {
        setActiveAnalysisId(null);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const dropzone = useDropzone({
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDropAccepted: (files) => {
      setSelectedFile(files[0] ?? null);
      if (files[0]) {
        toast.success(`Attached ${files[0].name}`);
      }
    },
  });

  return (
    <main className="shell px-0 py-6 sm:py-8 md:py-12 lg:py-14">
      <ByokModal />

      <section className="glass-card grid-dots rounded-[32px] px-4 py-5 sm:rounded-4xl sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-card bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-strong sm:text-xs sm:tracking-[0.24em]">
              <Sparkles className="h-4 w-4" />
              Sales intelligence in under 30 seconds
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
              Turn raw discovery notes into a boardroom-ready sales brief.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:mt-4 sm:text-base md:text-lg">
              Drop in transcripts, CRM exports, or messy notes. The dashboard
              extracts pain points, executive summaries, next steps, and
              follow-up emails with transparent live status.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setSettingsOpen(true)}
            variant="outline"
            aria-label="Open settings"
            className="w-full bg-white/70 sm:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Settings
          </Button>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] xl:gap-6">
          <div className="space-y-6">
            <div
              {...dropzone.getRootProps()}
              className="glass-card rounded-[28px] border border-dashed border-accent p-4 sm:p-6 md:p-8"
            >
              <input {...dropzone.getInputProps()} />
              <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
                Drop files here
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-tight sm:text-2xl">
                Massive drag-and-drop zone for raw sales materials
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                Supports .txt, .docx, .csv, and .pdf. The backend parser routes
                each file type to the right extraction service before the AI
                pipeline runs.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "Click or drag one file into this zone."}
                </p>
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (selectedFile) {
                      uploadMutation.mutate(selectedFile);
                    }
                  }}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Analyze file"}
                </Button>
              </div>
            </div>

            <div className="glass-card rounded-[28px] border border-dashed border-accent p-4 sm:p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
                Paste anything
              </p>
              <Textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="Paste discovery call transcripts, CRM notes, or rough talking points."
                className="mt-4 min-h-52 bg-surface p-4 sm:min-h-65 sm:p-5"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted">
                  Pasted input goes straight into the analysis pipeline without
                  any upload step.
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    analyzeMutation.mutate({
                      rawText,
                      filename: "pasted-input.txt",
                    })
                  }
                  disabled={!rawText.trim() || analyzeMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {analyzeMutation.isPending ? "Starting..." : "Analyze"}
                </Button>
              </div>
            </div>
          </div>

          <aside className="glass-card rounded-[28px] p-4 sm:p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
              Recent analyses
            </p>
            <div className="mt-4 space-y-3">
              {analysesQuery.isLoading ? <p>Loading...</p> : null}
              {Array.isArray(analysesQuery.data) &&
              analysesQuery.data.length > 0
                ? analysesQuery.data.map((analysis: AnalysisListItem) => (
                    <div
                      key={analysis.id}
                      className="flex items-start gap-3 rounded-2xl border border-card bg-white/70 p-4 transition hover:-translate-y-0.5"
                    >
                      <Link
                        href={`/analysis/${analysis.id}`}
                        className="min-w-0 flex-1"
                      >
                        <p className="truncate font-medium">
                          {analysis.source_filename ?? "Untitled input"}
                        </p>
                        <p className="mt-1 text-sm capitalize text-muted">
                          {analysis.status}
                        </p>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${analysis.source_filename ?? "analysis"}`}
                        className="h-9 w-9 text-muted hover:bg-red-50 hover:text-red-600"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete ${analysis.source_filename ?? "this analysis"}?`,
                          );

                          if (confirmed) {
                            deleteMutation.mutate(analysis.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                : null}
              {Array.isArray(analysesQuery.data) &&
              analysesQuery.data.length === 0 ? (
                <p className="text-sm text-muted">No analyses yet.</p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
