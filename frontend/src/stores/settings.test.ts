import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_MODEL,
  OLLAMA_BASE_URL,
  OPENROUTER_BASE_URL,
  useSettingsStore,
} from "./settings";

const initialState = useSettingsStore.getState();

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState(initialState, true);
  });

  it("defaults to the OpenRouter base URL and unconfigured state", () => {
    const state = useSettingsStore.getState();
    expect(state.provider).toBe("openrouter");
    expect(state.baseUrl).toBe(OPENROUTER_BASE_URL);
    expect(state.model).toBe(DEFAULT_MODEL);
    expect(state.isConfigured).toBe(false);
  });

  it("updates the selected model without touching other settings", () => {
    useSettingsStore.getState().configure({ apiKey: "sk-test" });
    useSettingsStore
      .getState()
      .configure({ model: "anthropic/claude-3.5-sonnet" });
    const state = useSettingsStore.getState();
    expect(state.model).toBe("anthropic/claude-3.5-sonnet");
    expect(state.apiKey).toBe("sk-test");
  });

  it("switches the base URL to Ollama's default when no explicit URL is given", () => {
    useSettingsStore.getState().configure({ provider: "ollama" });
    const state = useSettingsStore.getState();
    expect(state.provider).toBe("ollama");
    expect(state.baseUrl).toBe(OLLAMA_BASE_URL);
    expect(state.isConfigured).toBe(true);
  });

  it("keeps an explicitly provided base URL instead of the provider default", () => {
    useSettingsStore.getState().configure({
      provider: "ollama",
      baseUrl: "http://custom-host:11434/v1",
    });
    expect(useSettingsStore.getState().baseUrl).toBe(
      "http://custom-host:11434/v1",
    );
  });

  it("preserves the api key and provider when only partially reconfigured", () => {
    useSettingsStore.getState().configure({ apiKey: "sk-test" });
    useSettingsStore.getState().configure({ baseUrl: OPENROUTER_BASE_URL });
    const state = useSettingsStore.getState();
    expect(state.apiKey).toBe("sk-test");
    expect(state.provider).toBe("openrouter");
  });
});
