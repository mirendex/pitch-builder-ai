"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchModels } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type ModelSelectProps = {
  baseUrl: string;
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export function ModelSelect({
  baseUrl,
  value,
  onChange,
  disabled,
}: ModelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: models,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["models", baseUrl],
    queryFn: () => fetchModels(baseUrl),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  function commitSearchAsValue() {
    const trimmed = search.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    }
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        commitSearchAsValue();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, search, value]);

  const filteredModels = useMemo(() => {
    if (!models) return [];
    const query = hasTyped ? search.trim().toLowerCase() : "";
    if (!query) return models;
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(query) ||
        model.name?.toLowerCase().includes(query),
    );
  }, [models, search, hasTyped]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={isOpen ? search : value}
        placeholder="Search or type a model id…"
        disabled={disabled}
        onFocus={(event) => {
          setSearch(value);
          setHasTyped(false);
          setIsOpen(true);
          event.target.select();
        }}
        onChange={(event) => {
          setSearch(event.target.value);
          setHasTyped(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitSearchAsValue();
          } else if (event.key === "Escape") {
            setSearch(value);
            setIsOpen(false);
          }
        }}
        className="bg-surface"
      />

      {isOpen ? (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-card bg-white shadow-lg">
          {isLoading ? (
            <p className="p-3 text-sm text-muted">Loading models…</p>
          ) : isError ? (
            <p className="p-3 text-sm text-muted">
              Couldn&apos;t load models. Type an exact model id above.
            </p>
          ) : filteredModels.length === 0 ? (
            <p className="p-3 text-sm text-muted">No matching models.</p>
          ) : (
            filteredModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id);
                  setSearch(model.id);
                  setHasTyped(false);
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm hover:bg-surface",
                  model.id === value && "bg-surface font-medium",
                )}
              >
                <span className="block">{model.name ?? model.id}</span>
                <span className="block text-xs text-muted">{model.id}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
