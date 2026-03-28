"use client";

import { BarChart3 } from "lucide-react";

import { DebugCard } from "@/components/debug-card";
import { EmptyState } from "@/components/empty-state";
import { ResultsCard } from "@/components/results-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GeoQueryResponse } from "@/lib/mock-geo-response";

export type ResultsPanelPhase = "idle" | "loading" | "ready";

export interface ResultsPanelProps {
  phase: ResultsPanelPhase;
  errorMessage: string | null;
  response: GeoQueryResponse | null;
  debugJson: string | null;
  cardKey: number;
}

export function ResultsPanel({
  phase,
  errorMessage,
  response,
  debugJson,
  cardKey,
}: ResultsPanelProps) {
  const showPanel = phase !== "idle";

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <CardTitle>Результаты</CardTitle>
        </div>
        <CardDescription>
          Mock-список и JSON. Демо-ошибка: введите в запрос слово «error».
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
        {!showPanel ? (
          <EmptyState
            title="Ещё не отправляли"
            description="Заполните форму слева и нажмите «Отправить». Появится список точек и блок отладки."
            className="flex-1"
          />
        ) : (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="flex flex-col gap-4 pb-1">
              <ResultsCard
                key={`rc-${cardKey}`}
                isLoading={phase === "loading"}
                errorMessage={phase === "ready" ? errorMessage : null}
                response={phase === "ready" ? response : null}
              />
              <DebugCard json={debugJson} pending={phase === "loading"} />
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
