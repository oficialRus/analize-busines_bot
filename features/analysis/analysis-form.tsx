"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { estimateGridCellCount, suggestCellSizeMetersForMaxCells } from "@/lib/analysis/grid";
import { GRID_LIMITS, getMaxGridCellsClientHint } from "@/lib/analysis/limits";
import type { BoundingBox } from "@/types/geo";

import { cn } from "@/lib/utils";

export type AnalysisFormSubmitValues = {
  query: string;
  cellSizeMeters: number;
  radiusMeters: number;
};

export type AnalysisFormProps = {
  className?: string;
  /** Краткое название выбранного города (только отображение). */
  cityLabel: string;
  /** Bbox выбранного города — для оценки числа ячеек до запуска. */
  analysisBbox: BoundingBox | null;
  /** Для 2GIS — форма активна; для Яндекс.Карт анализ конкурентов недоступен. */
  analysisAvailable: boolean;
  submitting: boolean;
  onSubmit: (values: AnalysisFormSubmitValues) => void;
};

export function AnalysisForm({
  className,
  cityLabel,
  analysisBbox,
  analysisAvailable,
  submitting,
  onSubmit,
}: AnalysisFormProps) {
  const [query, setQuery] = useState("");
  const [cellSizeMeters, setCellSizeMeters] = useState("1000");
  const [radiusMeters, setRadiusMeters] = useState("700");

  const maxCellsHint = getMaxGridCellsClientHint();

  const gridHint = useMemo(() => {
    if (!analysisBbox) return null;
    const cell = Number.parseFloat(cellSizeMeters.trim().replace(",", "."));
    if (!Number.isFinite(cell)) return null;
    const n = estimateGridCellCount(analysisBbox, cell);
    if (n == null) return { kind: "invalid" as const };
    const suggest = suggestCellSizeMetersForMaxCells(analysisBbox, maxCellsHint);
    return { kind: "count" as const, n, suggest };
  }, [analysisBbox, cellSizeMeters, maxCellsHint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisAvailable || submitting) return;
    const cell = Number(cellSizeMeters.trim());
    const rad = Number(radiusMeters.trim());
    onSubmit({
      query: query.trim(),
      cellSizeMeters: cell,
      radiusMeters: rad,
    });
  };

  return (
    <Card className={cn("border-border/80 bg-card/80 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Анализ конкурентов</CardTitle>
        <CardDescription>
          Город: <span className="font-medium text-foreground">{cityLabel}</span>. Данные конкурентов — 2GIS
          Places (последовательный обход ячеек).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!analysisAvailable ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-200/90">
            Переключите провайдер карты на <strong>2GIS</strong>, чтобы запустить анализ по сетке.
          </p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="analysis-query">Ключевой запрос</Label>
              <Input
                id="analysis-query"
                placeholder="Например: кофейня"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="analysis-cell">Размер сетки, м</Label>
                <Input
                  id="analysis-cell"
                  inputMode="numeric"
                  value={cellSizeMeters}
                  onChange={(e) => setCellSizeMeters(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analysis-radius">Радиус поиска, м</Label>
                <Input
                  id="analysis-radius"
                  inputMode="numeric"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            {gridHint?.kind === "count" && gridHint.n > maxCellsHint ? (
              <p className="rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm leading-snug text-amber-100/95">
                При шаге <strong>{cellSizeMeters.trim() || "…"}</strong> м по границам города выйдет{" "}
                <strong>~{gridHint.n}</strong> ячеек (лимит {maxCellsHint} запросов к 2GIS за раз).
                Поле «Радиус поиска» на это число <strong>не влияет</strong>
                {gridHint.suggest != null ? (
                  <>
                    . Поставьте размер сетки не меньше <strong>{gridHint.suggest}</strong> м (или больше).
                  </>
                ) : (
                  <>.</>
                )}
              </p>
            ) : null}
            {gridHint?.kind === "count" && gridHint.n <= maxCellsHint ? (
              <p className="text-xs text-muted-foreground">
                Оценка: ~{gridHint.n} ячеек (максимум {maxCellsHint}).
              </p>
            ) : null}
            {gridHint?.kind === "invalid" ? (
              <p className="text-xs text-muted-foreground">
                Размер сетки: целое число от {GRID_LIMITS.MIN_CELL_METERS} до {GRID_LIMITS.MAX_CELL_METERS} м.
              </p>
            ) : null}
            <Button type="submit" disabled={submitting || !query.trim()}>
              {submitting ? "Выполняется…" : "Запустить анализ"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
