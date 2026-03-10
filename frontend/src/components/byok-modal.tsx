"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";
import { OLLAMA_BASE_URL, OPENROUTER_BASE_URL, useSettingsStore } from "@/stores/settings";
import { useUiStore } from "@/stores/ui";

export function ByokModal() {
  const { apiKey, provider, isConfigured, configure } = useSettingsStore();
  const { isSettingsOpen, setSettingsOpen } = useUiStore();
  const [draftKey, setDraftKey] = useState(apiKey);
  const [localMode, setLocalMode] = useState(provider === "ollama");

  useEffect(() => {
    if (!isConfigured) {
      setSettingsOpen(true);
    }
  }, [isConfigured, setSettingsOpen]);

  useEffect(() => {
    setDraftKey(apiKey);
    setLocalMode(provider === "ollama");
  }, [apiKey, provider, isSettingsOpen]);

  const canSave = localMode || draftKey.trim().length > 0;

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/35" />
        <Dialog.Content className="glass-card fixed left-1/2 top-1/2 w-[min(560px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-8">
          <Dialog.Title className="text-3xl font-semibold">Connect your AI provider</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm text-[color:var(--muted)]">
            Bring your own OpenRouter key or switch to local Ollama mode. Keys stay in your browser.
          </Dialog.Description>

          <div className="mt-8 space-y-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium">OpenRouter API key</span>
              <input
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                disabled={localMode}
                placeholder="sk-or-v1-..."
                className="w-full rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--surface)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--surface)] p-4">
              <div>
                <p className="font-medium">Local Network (Ollama)</p>
                <p className="text-sm text-[color:var(--muted)]">Route requests to http://localhost:11434/v1</p>
              </div>
              <Switch.Root
                checked={localMode}
                onCheckedChange={setLocalMode}
                className="relative h-7 w-12 rounded-full bg-[color:var(--muted)] data-[state=checked]:bg-[color:var(--accent)]"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white transition data-[state=checked]:translate-x-6" />
              </Switch.Root>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {isConfigured ? (
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full border border-[color:var(--card-border)] px-5 py-2.5"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                configure({
                  apiKey: localMode ? "" : draftKey.trim(),
                  provider: localMode ? "ollama" : "openrouter",
                  baseUrl: localMode ? OLLAMA_BASE_URL : OPENROUTER_BASE_URL,
                });
                setSettingsOpen(false);
              }}
              className="rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and continue
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
