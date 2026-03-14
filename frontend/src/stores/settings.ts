"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Provider = "openrouter" | "ollama";

type SettingsState = {
  apiKey: string;
  baseUrl: string;
  provider: Provider;
  isConfigured: boolean;
  hasHydrated: boolean;
  configure: (
    settings: Partial<Pick<SettingsState, "apiKey" | "baseUrl" | "provider">>,
  ) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OLLAMA_BASE_URL = "http://localhost:11434/v1";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      baseUrl: OPENROUTER_BASE_URL,
      provider: "openrouter",
      isConfigured: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      configure: ({ apiKey, baseUrl, provider }) =>
        set((state) => {
          const nextProvider = provider ?? state.provider;

          return {
            apiKey: apiKey ?? state.apiKey,
            provider: nextProvider,
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
        isConfigured: state.isConfigured,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export { OLLAMA_BASE_URL, OPENROUTER_BASE_URL };
