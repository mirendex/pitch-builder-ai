"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Provider = "openrouter" | "ollama";

type SettingsState = {
  apiKey: string;
  baseUrl: string;
  provider: Provider;
  isConfigured: boolean;
  configure: (settings: Partial<Pick<SettingsState, "apiKey" | "baseUrl" | "provider">>) => void;
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
      configure: ({ apiKey, baseUrl, provider }) =>
        set((state) => {
          const nextProvider = provider ?? state.provider;

          return {
            apiKey: apiKey ?? state.apiKey,
            provider: nextProvider,
            baseUrl:
              baseUrl ?? (nextProvider === "ollama" ? OLLAMA_BASE_URL : OPENROUTER_BASE_URL),
            isConfigured: true,
          };
        }),
    }),
    {
      name: "sales-intelligence-settings",
    },
  ),
);

export { OLLAMA_BASE_URL, OPENROUTER_BASE_URL };
