import { useSettingsStore } from "@/stores/settings";
import type {
  AnalysisDetail,
  AnalysisListItem,
  AnalysisResult,
  FollowUpEmail,
} from "@/lib/analysis-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

type AnalyzeRequest = {
  rawText?: string;
  filename?: string;
};

export async function uploadAnalysis(file: File) {
  const { apiKey, baseUrl, provider } = useSettingsStore.getState();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("base_url", baseUrl);
  formData.append("model", DEFAULT_MODEL);
  if (provider === "openrouter" && apiKey) {
    formData.append("api_key", apiKey);
  }

  const response = await fetch(`${API_URL}/api/v1/analyze/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Upload failed." }));
    throw new Error(error.detail ?? "Upload failed.");
  }

  return response.json();
}

export async function fetchAnalyses() {
  const response = await fetch(`${API_URL}/api/v1/analyses`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load analyses.");
  }

  return (await response.json()) as AnalysisListItem[];
}

export async function deleteAnalysis(analysisId: string) {
  const response = await fetch(`${API_URL}/api/v1/analyze/${analysisId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to delete analysis." }));
    throw new Error(error.detail ?? "Failed to delete analysis.");
  }
}

export async function startAnalysis(payload: AnalyzeRequest) {
  const { apiKey, baseUrl, provider } = useSettingsStore.getState();
  const response = await fetch(`${API_URL}/api/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw_text: payload.rawText,
      source_filename: payload.filename,
      api_key: provider === "openrouter" ? apiKey : null,
      base_url: baseUrl,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Analysis failed." }));
    throw new Error(error.detail ?? "Analysis failed.");
  }

  return response.json();
}

export async function fetchAnalysisById(analysisId: string) {
  const response = await fetch(`${API_URL}/api/v1/analyze/${analysisId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load analysis.");
  }

  return (await response.json()) as AnalysisDetail;
}

export async function generateFollowUp(
  analysisId: string,
  analysisResult?: AnalysisResult | null,
) {
  const { apiKey, baseUrl, provider } = useSettingsStore.getState();
  const response = await fetch(`${API_URL}/api/v1/generate-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      analysis_id: analysisId,
      api_key: provider === "openrouter" ? apiKey : null,
      base_url: baseUrl,
      analysis_result: analysisResult,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to generate follow-up." }));
    throw new Error(error.detail ?? "Failed to generate follow-up.");
  }

  return (await response.json()) as FollowUpEmail;
}

export function subscribeToStream(analysisId: string) {
  return new EventSource(`${API_URL}/api/v1/analyze/${analysisId}/stream`);
}
