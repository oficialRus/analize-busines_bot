"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopZone } from "@/types/analysis";

import { cn } from "@/lib/utils";

export type AnalysisTopZonesProps = {
  zones: TopZone[];
  className?: string;
  /** Сколько показывать (по умолчанию все переданные). */
  limit?: number;
};

export function AnalysisTopZones({ zones, className, limit = 5 }: AnalysisTopZonesProps) {
  const list = zones.slice(0, limit);

  return (
    <Card className={cn("border-border/80 bg-card/80 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Топ-{limit} зон</CardTitle>
        <CardDescription>
          Сортировка по score (0–100): выше — привлекательнее для точки входа при текущей модели спроса и
          насыщения.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {list.map((z) => (
            <li
              key={`${z.rank}-${z.cellId}`}
              className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-foreground">
                  <span className="text-muted-foreground">#{z.rank}</span> {z.label}
                </span>
                <span className="shrink-0 rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {z.score}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">
                {z.centerLat.toFixed(5)}, {z.centerLon.toFixed(5)}
              </p>
              <p className="mt-2 text-xs font-medium leading-snug text-foreground">{z.shortRecommendation}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{z.summaryText}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
