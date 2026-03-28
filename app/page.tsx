"use client";

import { AppHeader } from "@/components/app-header";
import { AnalysisSidebar } from "@/features/analysis/analysis-sidebar";
import { HistoryPanel } from "@/features/analysis/history-panel";
import { MapPlaceholder } from "@/features/map/map-placeholder";
import { ResultsPanel } from "@/features/results/results-panel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-1">
          <section className="flex min-h-0 flex-col md:col-span-1 lg:col-span-3">
            <AnalysisSidebar />
          </section>
          <section className="flex min-h-[280px] flex-col md:col-span-1 lg:col-span-6 lg:min-h-0">
            <MapPlaceholder />
          </section>
          <section className="flex min-h-0 flex-col md:col-span-2 lg:col-span-3">
            <ResultsPanel />
          </section>
        </div>
        <HistoryPanel />
      </main>
    </div>
  );
}
