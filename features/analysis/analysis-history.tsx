"use client";

import { useCallback, useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isCityGridAnalysisResult } from "@/features/analysis/analysis-type-guards";
import type { AnalysisHistoryListItem, CityGridAnalysisResult } from "@/types/analysis";

import { cn } from "@/lib/utils";

export type AnalysisHistorySectionProps = {
  className?: string;
  /** Показывать и подгружать историю только когда доступен сеточный анализ. */
  enabled: boolean;
  onOpenResult: (result: CityGridAnalysisResult) => void;
};

type HistoryListResponse = { items?: AnalysisHistoryListItem[] };

function isHistoryListResponse(v: unknown): v is HistoryListResponse {
  return typeof v === "object" && v !== null && Array.isArray((v as HistoryListResponse).items);
}

export function AnalysisHistorySection({
  className,
  enabled,
  onOpenResult,
}: AnalysisHistorySectionProps) {
  const [items, setItems] = useState<AnalysisHistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis/history?limit=30");
      const json: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Не удалось загрузить историю";
        setError(msg);
        setItems([]);
        return;
      }
      if (!isHistoryListResponse(json) || !json.items) {
        setError("Некорректный ответ списка истории");
        setItems([]);
        return;
      }
      setItems(json.items);
    } catch {
      setError("Сеть недоступна");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openById = useCallback(
    async (id: string) => {
      setOpeningId(id);
      setError(null);
      try {
        const res = await fetch(`/api/analysis/${encodeURIComponent(id)}`);
        const json: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof (json as { error?: string }).error === "string"
              ? (json as { error: string }).error
              : "Не удалось открыть анализ";
          setError(msg);
          return;
        }
        if (!isCityGridAnalysisResult(json)) {
          setError("Некорректный сохранённый результат");
          return;
        }
        onOpenResult(json);
      } catch {
        setError("Сеть недоступна");
      } finally {
        setOpeningId(null);
      }
    },
    [onOpenResult],
  );

  if (!enabled) return null;

  return (
    <Card className={cn("border-border/80 bg-card/80 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-muted-foreground" aria-hidden />
              История анализов
            </CardTitle>
            <CardDescription>
              Сохраняется локально (SQLite). Повторно откройте прошлый прогон без новых запросов к 2GIS.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {loading && !items.length ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Загрузка…
          </div>
        ) : null}
        {!loading && !items.length && !error ? (
          <p className="text-sm text-muted-foreground">Пока нет сохранённых запусков.</p>
        ) : null}
        {items.length > 0 ? (
          <ul className="max-h-[min(280px,40vh)] space-y-2 overflow-y-auto pr-1 text-sm">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/15 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {it.city} · {it.query}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {new Date(it.createdAt).toLocaleString("ru-RU")} · ячеек {it.totalCells} · уник.{" "}
                    {it.totalCompetitorsFound}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/80">{it.id.slice(0, 8)}…</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={openingId === it.id}
                  onClick={() => void openById(it.id)}
                >
                  {openingId === it.id ? (
                    <>
                      <Loader2 className="mr-1 size-3.5 animate-spin" aria-hidden />
                      Открытие…
                    </>
                  ) : (
                    "Открыть"
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
