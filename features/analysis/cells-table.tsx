"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AnalyzedGridCell } from "@/types/analysis";

import { cn } from "@/lib/utils";

export type AnalysisCellsTableProps = {
  cells: AnalyzedGridCell[];
  className?: string;
};

export function AnalysisCellsTable({ cells, className }: AnalysisCellsTableProps) {
  return (
    <Card className={cn("border-border/80 bg-card/80 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ячейки сетки</CardTitle>
        <CardDescription>
          Конкуренты и отзывы — по уникальным объектам в ячейке после дедупликации между соседними
          ячейками.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-0">
        <ScrollArea className="h-[min(420px,55vh)] w-full rounded-md border border-border/60">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 backdrop-blur-sm">ID</th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 backdrop-blur-sm">Центр</th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 text-right backdrop-blur-sm tabular-nums">
                  Конкуренты
                </th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 text-right backdrop-blur-sm tabular-nums">
                  Avg ★
                </th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 text-right backdrop-blur-sm tabular-nums">
                  Отзывы Σ
                </th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 text-right backdrop-blur-sm tabular-nums">
                  Score
                </th>
                <th className="sticky top-0 z-[1] bg-muted/95 min-w-[200px] px-3 py-2 backdrop-blur-sm">
                  Рекомендация
                </th>
                <th className="sticky top-0 z-[1] bg-muted/95 px-3 py-2 backdrop-blur-sm">Топ имён</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15"
                >
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{c.id}</td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums text-foreground/90">
                    {c.centerLat.toFixed(5)}
                    <span className="text-muted-foreground">, </span>
                    {c.centerLon.toFixed(5)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.competitorsCount}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {c.avgRating != null ? c.avgRating.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.totalReviews}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{c.score}</td>
                  <td className="max-w-[240px] px-3 py-2 text-xs leading-snug text-muted-foreground">
                    {c.recommendation.shortRecommendation}
                  </td>
                  <td className="max-w-[220px] px-3 py-2 text-xs leading-snug text-muted-foreground">
                    {c.topNames.length ? c.topNames.join(" · ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
