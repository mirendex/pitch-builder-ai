"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ByokModal } from "@/components/byok-modal";
import { fetchAnalyses, startAnalysis, uploadAnalysis } from "@/lib/api";
import { useUiStore } from "@/stores/ui";

export default function HomePage() {
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen);
  const setActiveAnalysisId = useUiStore((state) => state.setActiveAnalysisId);
  const analysesQuery = useQuery({ queryKey: ["analyses"], queryFn: fetchAnalyses });
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
  const dropzone = useDropzone({
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
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
    <main className="shell px-0 py-10 md:py-14">
      <ByokModal />

      <section className="glass-card grid-dots rounded-4xl px-6 py-6 md:px-10 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-card bg-white/60 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent-strong">
              <Sparkles className="h-4 w-4" />
              Sales intelligence in under 30 seconds
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              Turn raw discovery notes into a boardroom-ready sales brief.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
              Drop in transcripts, CRM exports, or messy notes. The dashboard extracts pain points,
              executive summaries, next steps, and follow-up emails with transparent live status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full border border-card bg-white/70 p-3"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div
              {...dropzone.getRootProps()}
              className="glass-card rounded-3xl border border-dashed border-accent p-6 md:p-8"
            >
              <input {...dropzone.getInputProps()} />
              <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
                Drop files here
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Massive drag-and-drop zone for raw sales materials</h2>
              <p className="mt-3 max-w-xl text-sm text-muted">
                Supports .txt, .docx, .csv, and .pdf. The backend parser routes each file type to the
                right extraction service before the AI pipeline runs.
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Click or drag one file into this zone."}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (selectedFile) {
                      uploadMutation.mutate(selectedFile);
                    }
                  }}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Analyze file"}
                </button>
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-dashed border-accent p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
                Paste anything
              </p>
              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="Paste discovery call transcripts, CRM notes, or rough talking points."
                className="mt-4 min-h-65 w-full resize-none rounded-3xl border border-card bg-surface p-5 outline-none focus:border-orange-600"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted">
                  Pasted input goes straight into the analysis pipeline without any upload step.
                </p>
                <button
                  type="button"
                  onClick={() => analyzeMutation.mutate({ rawText, filename: "pasted-input.txt" })}
                  disabled={!rawText.trim() || analyzeMutation.isPending}
                  className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analyzeMutation.isPending ? "Starting..." : "Analyze"}
                </button>
              </div>
            </div>
          </div>

          <aside className="glass-card rounded-3xl p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">
              Recent analyses
            </p>
            <div className="mt-4 space-y-3">
              {analysesQuery.isLoading ? <p>Loading...</p> : null}
              {Array.isArray(analysesQuery.data) && analysesQuery.data.length > 0
                ? analysesQuery.data.map((analysis: { id: string; source_filename?: string; status: string }) => (
                    <Link
                      key={analysis.id}
                      href={`/analysis/${analysis.id}`}
                      className="block rounded-2xl border border-card bg-white/70 p-4 transition hover:-translate-y-0.5"
                    >
                      <p className="font-medium">{analysis.source_filename ?? "Untitled input"}</p>
                      <p className="mt-1 text-sm capitalize text-muted">{analysis.status}</p>
                    </Link>
                  ))
                : null}
              {Array.isArray(analysesQuery.data) && analysesQuery.data.length === 0 ? (
                <p className="text-sm text-muted">No analyses yet.</p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
