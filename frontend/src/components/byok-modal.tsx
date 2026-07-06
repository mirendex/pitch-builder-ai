"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModelSelect } from "@/components/model-select";
import {
  DEFAULT_MODEL,
  OLLAMA_BASE_URL,
  OPENROUTER_BASE_URL,
  useSettingsStore,
} from "@/stores/settings";
import { useUiStore } from "@/stores/ui";

export function ByokModal() {
  const { apiKey, provider, model, isConfigured, hasHydrated, configure } =
    useSettingsStore();
  const { isSettingsOpen, setSettingsOpen } = useUiStore();
  const [draftKey, setDraftKey] = useState(apiKey);
  const [localMode, setLocalMode] = useState(provider === "ollama");
  const [draftModel, setDraftModel] = useState(model);

  useEffect(() => {
    if (hasHydrated && !isConfigured) {
      setSettingsOpen(true);
    }
  }, [hasHydrated, isConfigured, setSettingsOpen]);

  useEffect(() => {
    setDraftKey(apiKey);
    setLocalMode(provider === "ollama");
    setDraftModel(model);
  }, [apiKey, provider, model, isSettingsOpen]);

  const canSave = localMode || draftKey.trim().length > 0;
  const draftBaseUrl = localMode ? OLLAMA_BASE_URL : OPENROUTER_BASE_URL;

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content className="glass-card fixed left-1/2 top-1/2 max-h-[min(680px,calc(100vh-24px))] w-[min(560px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] p-5 sm:rounded-3xl sm:p-8">
          <Dialog.Title className="text-2xl font-semibold sm:text-3xl">
            Connect your AI provider
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-muted">
            Bring your own OpenRouter key or switch to local Ollama mode. Keys
            stay in your browser.
          </Dialog.Description>

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium">OpenRouter API key</span>
              <Input
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                disabled={localMode}
                placeholder="sk-or-v1-..."
                className="bg-surface"
              />
            </label>

            <div className="flex flex-col gap-4 rounded-2xl border border-card bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="pr-2">
                <p className="font-medium">Local Network (Ollama)</p>
                <p className="text-sm text-muted">
                  Route requests to http://localhost:11434/v1
                </p>
              </div>
              <Switch.Root
                checked={localMode}
                onCheckedChange={setLocalMode}
                className="relative h-7 w-12 rounded-full bg-muted data-[state=checked]:bg-orange-600"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white transition data-[state=checked]:translate-x-6" />
              </Switch.Root>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Model</span>
              <ModelSelect
                baseUrl={draftBaseUrl}
                value={draftModel}
                onChange={setDraftModel}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:mt-8 sm:flex-row sm:justify-end">
            {isConfigured ? (
              <Button
                type="button"
                onClick={() => setSettingsOpen(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                configure({
                  apiKey: localMode ? "" : draftKey.trim(),
                  provider: localMode ? "ollama" : "openrouter",
                  baseUrl: localMode ? OLLAMA_BASE_URL : OPENROUTER_BASE_URL,
                  model: draftModel.trim() || DEFAULT_MODEL,
                });
                setSettingsOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              Save and continue
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
