"use client";

import { MapPin, Grid3x3, Users, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CityGridAnalysisResult } from "@/types/analysis";

import { cn } from "@/lib/utils";

export type AnalysisSummaryCardsProps = {
  result: CityGridAnalysisResult;
  className?: string;
};

export function AnalysisSummaryCards({ result, className }: AnalysisSummaryCardsProps) {
  const best = result.topZones[0];

  return (
    <div
      className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}
      role="region"
      aria-label="Сводка анализа"
    >
      <Card className="border-border/80 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Ячеек сетки</CardTitle>
          <Grid3x3 className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{result.totalCells}</p>
        </CardContent>
      </Card>
      <Card className="border-border/80 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Конкурентов (уник.)</CardTitle>
          <Users className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {result.totalCompetitorsFound}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80 bg-card/80 shadow-sm sm:col-span-2 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Лучшая зона</CardTitle>
          <Trophy className="size-4 text-amber-500/90" aria-hidden />
        </CardHeader>
        <CardContent className="space-y-1">
          {best ? (
            <>
              <p className="text-sm font-medium leading-snug text-foreground">{best.label}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="font-mono tabular-nums">
                  {best.centerLat.toFixed(4)}, {best.centerLon.toFixed(4)}
                </span>
                <span className="text-border">·</span>
                <span>score {best.score}</span>
              </p>
              <p className="text-xs leading-snug text-foreground/90">{best.shortRecommendation}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Нет данных по топу зон</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
