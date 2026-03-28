"use client";

import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockResultsByLocation } from "@/lib/mock-data";
import { useDashboardStore } from "@/store/dashboard-store";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ResultsPanel() {
  const selectedLocation = useDashboardStore((s) => s.selectedLocation);
  const results = selectedLocation
    ? mockResultsByLocation[selectedLocation.id] ?? []
    : [];

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <CardTitle>Результаты</CardTitle>
        </div>
        <CardDescription>
          Итоги анализа по выбранной точке (mock).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-4 pt-0">
        {!selectedLocation ? (
          <EmptyState
            title="Точка не выбрана"
            description="Выберите локацию в левой панели, чтобы увидеть демо-результат."
            className="flex-1"
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="Нет данных для этой точки"
            description="Для выбранной локации пока нет записей в mock-наборе."
            className="flex-1"
          />
        ) : (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <ul className="space-y-3">
              {results.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Оценка зоны
                    </span>
                    <span className="text-2xl font-semibold tabular-nums text-foreground">
                      {item.score}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-sm leading-relaxed text-foreground">
                    {item.summary}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(item.generatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
