"use client";

import { useCallback, useRef, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { AnalysisSidebar } from "@/features/analysis/analysis-sidebar";
import { HistoryPanel } from "@/features/analysis/history-panel";
import { MapPlaceholder } from "@/features/map/map-placeholder";
import {
  ResultsPanel,
  type ResultsPanelPhase,
} from "@/features/results/results-panel";
import type { AnalysisPayload } from "@/lib/analysis-request-schema";
import { formatMapPreviewLine } from "@/lib/map-preview";
import {
  buildMockErrorMessage,
  buildMockGeoResponse,
  isMockErrorPayload,
} from "@/lib/mock-geo-response";
import { formatErrorDebugJson, formatResultsDebugJson } from "@/lib/results-debug";
import type { AnalysisStatus } from "@/types";
import type { GeoQueryResponse } from "@/lib/mock-geo-response";

const MOCK_DELAY_MS = 550;

export default function Home() {
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<ResultsPanelPhase>("idle");
  const [debugJson, setDebugJson] = useState<string | null>(null);
  const [uiStatus, setUiStatus] = useState<AnalysisStatus>("idle");
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [response, setResponse] = useState<GeoQueryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (loadTimerRef.current !== null) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }, []);

  const handleValidatedSubmit = useCallback(
    (payload: AnalysisPayload) => {
      clearTimer();
      setPhase("loading");
      setDebugJson(null);
      setResponse(null);
      setErrorMessage(null);
      setUiStatus("loading");
      setCardKey((k) => k + 1);

      loadTimerRef.current = setTimeout(() => {
        loadTimerRef.current = null;

        if (isMockErrorPayload(payload)) {
          const message = buildMockErrorMessage();
          setErrorMessage(message);
          setResponse(null);
          setDebugJson(formatErrorDebugJson(payload, { message }));
          setPhase("ready");
          setUiStatus("error");
          setMapPreview(formatMapPreviewLine(payload));
          return;
        }

        const mockResponse = buildMockGeoResponse(payload);
        setResponse(mockResponse);
        setErrorMessage(null);
        setDebugJson(formatResultsDebugJson(payload, mockResponse));
        setPhase("ready");
        setUiStatus("success");
        setMapPreview(formatMapPreviewLine(payload));
      }, MOCK_DELAY_MS);
    },
    [clearTimer],
  );

  const handleFormReset = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setDebugJson(null);
    setResponse(null);
    setErrorMessage(null);
    setMapPreview(null);
    setUiStatus("idle");
  }, [clearTimer]);

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
              phase={phase}
              errorMessage={errorMessage}
              response={response}
              debugJson={debugJson}
              cardKey={cardKey}
            />
          </section>
        </div>
        <HistoryPanel />
      </main>
    </div>
  );
}
