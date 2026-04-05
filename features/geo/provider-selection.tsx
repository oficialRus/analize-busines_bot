"use client";

import { MapPinned, Map as MapIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeoAnalysisProvider } from "@/lib/geo/provider";
import { GEO_PROVIDER_LABELS } from "@/lib/geo/provider";

import { cn } from "@/lib/utils";

export interface ProviderSelectionProps {
  onSelect: (provider: GeoAnalysisProvider) => void;
}

export function ProviderSelection({ onSelect }: ProviderSelectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Выберите провайдер для анализа
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Яндекс Карты или 2GIS — дальше откроется работа с городом и районами. Провайдер можно сменить.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("yandex")}
          className={cn(
            "text-left transition-colors",
            "rounded-lg border border-border bg-card shadow-sm",
            "hover:border-primary/50 hover:bg-accent/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <span className="mb-2 flex size-11 items-center justify-center rounded-md bg-[#FC3F1D]/12 text-[#FC3F1D]">
                <MapPinned className="size-6" aria-hidden />
              </span>
              <CardTitle className="text-lg">{GEO_PROVIDER_LABELS.yandex}</CardTitle>
              <CardDescription>Геокодирование и карты в экосистеме Яндекса.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-5">
              <span className="text-sm font-medium text-primary">Выбрать →</span>
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => onSelect("2gis")}
          className={cn(
            "text-left transition-colors",
            "rounded-lg border border-border bg-card shadow-sm",
            "hover:border-primary/50 hover:bg-accent/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <span className="mb-2 flex size-11 items-center justify-center rounded-md bg-sky-500/12 text-sky-600 dark:text-sky-400">
                <MapIcon className="size-6" aria-hidden />
              </span>
              <CardTitle className="text-lg">{GEO_PROVIDER_LABELS["2gis"]}</CardTitle>
              <CardDescription>Справочник и карты в 2GIS.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-5">
              <span className="text-sm font-medium text-primary">Выбрать →</span>
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
}
