import { beforeEach, describe, expect, it } from "vitest";

import type { AnalysisResult } from "@/lib/analysis-types";

import { useUiStore } from "./ui";

const initialState = useUiStore.getState();

const sampleAnalysis: AnalysisResult = {
  client_profile: {
    name: "Jane Doe",
    company: "Acme",
    role: null,
    industry: null,
  },
  pain_points: [
    {
      title: "Slow onboarding",
      description: "Too many steps",
      severity: "high",
    },
  ],
  proposed_solutions: [],
  executive_summary: "Initial summary",
  next_steps: ["Follow up next week"],
  key_metrics: [{ label: "MRR", value: "$10k" }],
};

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState(initialState, true);
  });

  it("deep-clones the analysis on initialization so edits don't mutate the source", () => {
    useUiStore.getState().initializeEditedAnalysis(sampleAnalysis);
    useUiStore.getState().updateExecutiveSummary("Edited summary");

    expect(sampleAnalysis.executive_summary).toBe("Initial summary");
    expect(useUiStore.getState().editedAnalysis?.executive_summary).toBe(
      "Edited summary",
    );
  });

  it("does not overwrite in-progress edits when re-initialized for the same active analysis", () => {
    useUiStore.setState({ activeAnalysisId: "analysis-1" });
    useUiStore.getState().initializeEditedAnalysis(sampleAnalysis);
    useUiStore.getState().updateExecutiveSummary("Edited summary");

    useUiStore.getState().initializeEditedAnalysis(sampleAnalysis);

    expect(useUiStore.getState().editedAnalysis?.executive_summary).toBe(
      "Edited summary",
    );
  });

  it("updates a single pain point without affecting the others", () => {
    const analysisWithTwoPoints: AnalysisResult = {
      ...sampleAnalysis,
      pain_points: [
        { title: "First", description: "A", severity: "low" },
        { title: "Second", description: "B", severity: "medium" },
      ],
    };
    useUiStore.getState().initializeEditedAnalysis(analysisWithTwoPoints);

    useUiStore.getState().updatePainPoint(1, "title", "Second updated");

    const painPoints = useUiStore.getState().editedAnalysis?.pain_points;
    expect(painPoints?.[0].title).toBe("First");
    expect(painPoints?.[1].title).toBe("Second updated");
  });

  it("resets edited analysis to null", () => {
    useUiStore.getState().initializeEditedAnalysis(sampleAnalysis);
    useUiStore.getState().resetEditedAnalysis();
    expect(useUiStore.getState().editedAnalysis).toBeNull();
  });
});
