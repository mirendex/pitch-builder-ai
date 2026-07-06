"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Provider = "openrouter" | "ollama";

type SettingsState = {
  apiKey: string;
  baseUrl: string;
  provider: Provider;
  model: string;
  isConfigured: boolean;
  hasHydrated: boolean;
  configure: (
    settings: Partial<
      Pick<SettingsState, "apiKey" | "baseUrl" | "provider" | "model">
    >,
  ) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OLLAMA_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      baseUrl: OPENROUTER_BASE_URL,
      provider: "openrouter",
      model: DEFAULT_MODEL,
      isConfigured: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      configure: ({ apiKey, baseUrl, provider, model }) =>
        set((state) => {
          const nextProvider = provider ?? state.provider;

          return {
            apiKey: apiKey ?? state.apiKey,
            provider: nextProvider,
            model: model ?? state.model,
            baseUrl:
              baseUrl ??
              (nextProvider === "ollama"
                ? OLLAMA_BASE_URL
                : OPENROUTER_BASE_URL),
            isConfigured: true,
          };
        }),
    }),
    {
      name: "sales-intelligence-settings",
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        provider: state.provider,
        model: state.model,
        isConfigured: state.isConfigured,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export { DEFAULT_MODEL, OLLAMA_BASE_URL, OPENROUTER_BASE_URL };
