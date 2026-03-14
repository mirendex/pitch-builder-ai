"use client";

import { create } from "zustand";
import type {
  AnalysisResult,
  KeyMetric,
  PainPoint,
  ProposedSolution,
} from "@/lib/analysis-types";

type UiState = {
  isSettingsOpen: boolean;
  activeAnalysisId: string | null;
  editedAnalysis: AnalysisResult | null;
  setSettingsOpen: (isOpen: boolean) => void;
  setActiveAnalysisId: (analysisId: string | null) => void;
  initializeEditedAnalysis: (analysis: AnalysisResult) => void;
  resetEditedAnalysis: () => void;
  updateExecutiveSummary: (summary: string) => void;
  updateProfileField: (
    field: keyof AnalysisResult["client_profile"],
    value: string,
  ) => void;
  updatePainPoint: (
    index: number,
    field: keyof PainPoint,
    value: string,
  ) => void;
  updateSolution: (
    index: number,
    field: keyof ProposedSolution,
    value: string | string[],
  ) => void;
  updateNextStep: (index: number, value: string) => void;
  updateMetric: (index: number, field: keyof KeyMetric, value: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSettingsOpen: false,
  activeAnalysisId: null,
  editedAnalysis: null,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setActiveAnalysisId: (analysisId) => set({ activeAnalysisId: analysisId }),
  initializeEditedAnalysis: (analysis) =>
    set((state) => {
      if (state.activeAnalysisId && state.editedAnalysis) {
        return state;
      }

      return {
        editedAnalysis: JSON.parse(JSON.stringify(analysis)) as AnalysisResult,
      };
    }),
  resetEditedAnalysis: () => set({ editedAnalysis: null }),
  updateExecutiveSummary: (summary) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            executive_summary: summary,
          }
        : null,
    })),
  updateProfileField: (field, value) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            client_profile: {
              ...state.editedAnalysis.client_profile,
              [field]: value,
            },
          }
        : null,
    })),
  updatePainPoint: (index, field, value) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            pain_points: state.editedAnalysis.pain_points.map(
              (point, pointIndex) =>
                pointIndex === index ? { ...point, [field]: value } : point,
            ),
          }
        : null,
    })),
  updateSolution: (index, field, value) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            proposed_solutions: state.editedAnalysis.proposed_solutions.map(
              (solution, solutionIndex) =>
                solutionIndex === index
                  ? { ...solution, [field]: value }
                  : solution,
            ),
          }
        : null,
    })),
  updateNextStep: (index, value) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            next_steps: state.editedAnalysis.next_steps.map(
              (step, stepIndex) => (stepIndex === index ? value : step),
            ),
          }
        : null,
    })),
  updateMetric: (index, field, value) =>
    set((state) => ({
      editedAnalysis: state.editedAnalysis
        ? {
            ...state.editedAnalysis,
            key_metrics: state.editedAnalysis.key_metrics.map(
              (metric, metricIndex) =>
                metricIndex === index ? { ...metric, [field]: value } : metric,
            ),
          }
        : null,
    })),
}));
