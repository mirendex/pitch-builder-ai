"use client";

import { create } from "zustand";

type UiState = {
  isSettingsOpen: boolean;
  activeAnalysisId: string | null;
  setSettingsOpen: (isOpen: boolean) => void;
  setActiveAnalysisId: (analysisId: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSettingsOpen: false,
  activeAnalysisId: null,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setActiveAnalysisId: (analysisId) => set({ activeAnalysisId: analysisId }),
}));
