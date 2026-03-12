"use client";

import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUiStore } from "@/stores/ui";

export function ExecutiveSummaryCard({ summary }: { summary: string }) {
  const updateExecutiveSummary = useUiStore((state) => state.updateExecutiveSummary);

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader>
        <p className="text-sm uppercase tracking-[0.24em] text-accent-strong">Executive summary</p>
        <CopyButton plainText={summary} markdown={`## Executive Summary\n${summary}`} />
      </CardHeader>
      <CardContent>
        <Textarea
          value={summary}
          onChange={(event) => updateExecutiveSummary(event.target.value)}
          className="min-h-32 bg-white/70 p-4 text-sm leading-7 sm:min-h-40"
        />
      </CardContent>
    </Card>
  );
}
