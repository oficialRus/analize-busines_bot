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
import type { MockSubmitViewModel } from "@/lib/mock-submit-result";

export interface ResultsPanelProps {
  debugJson: string | null;
  mockResult: MockSubmitViewModel | null;
  /** Меняется после каждого успешного submit, чтобы при одинаковом тексте UI обновлялся */
  mockKey: number;
}

export function ResultsPanel({
  debugJson,
  mockResult,
  mockKey,
}: ResultsPanelProps) {
  const hasOutput = Boolean(debugJson && mockResult);

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <CardTitle>Результаты</CardTitle>
        </div>
        <CardDescription>
          Mock-ответ и отладочный payload после отправки формы.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
        {!hasOutput ? (
          <EmptyState
            title="Ещё не отправляли"
            description="Заполните форму слева и нажмите «Отправить», чтобы увидеть демо-результат и JSON."
            className="flex-1"
          />
        ) : (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="flex flex-col gap-4 pb-1">
              <ResultsCard key={`rc-${mockKey}`} data={mockResult} />
              <DebugCard json={debugJson} />
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
