"use client";

import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CityGridAnalysisResult } from "@/types/analysis";

import { AnalysisCellsTable } from "./cells-table";
import { AnalysisSummaryCards } from "./analysis-summary-cards";
import { AnalysisTopZones } from "./top-zones";

import { cn } from "@/lib/utils";

export type AnalysisResultsProps = {
  className?: string;
  loading: boolean;
  result: CityGridAnalysisResult | null;
  error: string | null;
};

export function AnalysisResults({ className, loading, result, error }: AnalysisResultsProps) {
  if (loading) {
    return (
      <Card className={cn("border-border/80 bg-card/80 shadow-sm", className)}>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-10">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Идёт обход ячеек и запросы к 2GIS…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive/40 bg-destructive/5 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-base text-destructive">Ошибка анализа</CardTitle>
          <CardDescription className="text-destructive/90">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className={cn("border-border/80 bg-card/60 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-base">Результат</CardTitle>
          <CardDescription>
            Укажите ключевой запрос и нажмите «Запустить анализ». Ответ появится после обработки всех
            ячеек.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/50 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Результат анализа</h3>
        <p className="font-mono text-xs text-muted-foreground">
          {result.requestId.slice(0, 8)}… · {new Date(result.generatedAt).toLocaleString("ru-RU")}
        </p>
      </div>
      <AnalysisSummaryCards result={result} />
      <AnalysisTopZones zones={result.topZones} limit={5} />
      <AnalysisCellsTable cells={result.cells} />
    </div>
  );
}
