"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  /** Для 2GIS — форма активна; для Яндекс.Карт анализ конкурентов недоступен. */
  analysisAvailable: boolean;
  submitting: boolean;
  onSubmit: (values: AnalysisFormSubmitValues) => void;
};

export function AnalysisForm({
  className,
  cityLabel,
  analysisAvailable,
  submitting,
  onSubmit,
}: AnalysisFormProps) {
  const [query, setQuery] = useState("");
  const [cellSizeMeters, setCellSizeMeters] = useState("1000");
  const [radiusMeters, setRadiusMeters] = useState("700");

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
            <Button type="submit" disabled={submitting || !query.trim()}>
              {submitting ? "Выполняется…" : "Запустить анализ"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
