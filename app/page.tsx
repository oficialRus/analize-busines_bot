"use client";

import { useCallback, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { AnalysisSidebar } from "@/features/analysis/analysis-sidebar";
import { HistoryPanel } from "@/features/analysis/history-panel";
import { MapPlaceholder } from "@/features/map/map-placeholder";
import { ResultsPanel } from "@/features/results/results-panel";
import type { AnalysisPayload } from "@/lib/analysis-request-schema";
import { buildMockSubmitResult } from "@/lib/mock-submit-result";
import { formatMapPreviewLine } from "@/lib/map-preview";
import type { AnalysisStatus } from "@/types";

export default function Home() {
  const [debugJson, setDebugJson] = useState<string | null>(null);
  const [uiStatus, setUiStatus] = useState<AnalysisStatus>("idle");
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [mockKey, setMockKey] = useState(0);
  const [mockResult, setMockResult] = useState<
    ReturnType<typeof buildMockSubmitResult> | null
  >(null);

  const handleValidatedSubmit = useCallback((payload: AnalysisPayload) => {
    setDebugJson(JSON.stringify(payload, null, 2));
    setMockResult(buildMockSubmitResult(payload));
    setMockKey((k) => k + 1);
    setMapPreview(formatMapPreviewLine(payload));
    setUiStatus("success");
  }, []);

  const handleFormReset = useCallback(() => {
    setDebugJson(null);
    setMockResult(null);
    setMapPreview(null);
    setUiStatus("idle");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader uiStatus={uiStatus} />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-1">
          <section className="flex min-h-[min(520px,70vh)] flex-col md:col-span-1 lg:col-span-3 lg:min-h-0">
            <AnalysisSidebar
              onValidatedSubmit={handleValidatedSubmit}
              onFormReset={handleFormReset}
            />
          </section>
          <section className="flex min-h-[280px] flex-col md:col-span-1 lg:col-span-6 lg:min-h-0">
            <MapPlaceholder previewLine={mapPreview} />
          </section>
          <section className="flex min-h-0 flex-col md:col-span-2 lg:col-span-3">
            <ResultsPanel
              debugJson={debugJson}
              mockResult={mockResult}
              mockKey={mockKey}
            />
          </section>
        </div>
        <HistoryPanel />
      </main>
    </div>
  );
}
