"use client";

import { SlidersHorizontal } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisRequestForm } from "@/features/analysis/analysis-request-form";
import type { AnalysisPayload } from "@/lib/analysis-request-schema";

export interface AnalysisSidebarProps {
  onValidatedSubmit: (payload: AnalysisPayload) => void;
  onFormReset: () => void;
}

export function AnalysisSidebar({
  onValidatedSubmit,
  onFormReset,
}: AnalysisSidebarProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <CardTitle>Параметры анализа</CardTitle>
        </div>
        <CardDescription>
          Форма запроса: провайдер, операция и поля по сценарию.
        </CardDescription>
      </CardHeader>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
        <AnalysisRequestForm
          onValidatedSubmit={onValidatedSubmit}
          onFormReset={onFormReset}
        />
      </div>
    </Card>
  );
}
