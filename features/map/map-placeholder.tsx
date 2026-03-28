"use client";

import { Layers, MapPinned } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";

export function MapPlaceholder() {
  const selectedLocation = useDashboardStore((s) => s.selectedLocation);

  return (
    <Card
      className={cn(
        "relative flex min-h-[280px] flex-1 flex-col overflow-hidden lg:min-h-0",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-sky-500/10 blur-3xl" />

      <CardHeader className="relative z-[1] pb-2">
        <div className="flex items-center gap-2">
          <MapPinned className="size-4 text-muted-foreground" />
          <CardTitle>Карта</CardTitle>
        </div>
        <CardDescription>
          Провайдер карты будет подключён на следующем этапе.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-background/80 shadow-sm backdrop-blur">
          <Layers className="size-8 text-primary" aria-hidden />
        </div>
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Map provider will be connected here
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Здесь появится интерактивная карта, слои и выбор зоны анализа.
          </p>
          {selectedLocation ? (
            <p className="mt-4 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm text-foreground">
              Выбрано:{" "}
              <span className="font-medium">{selectedLocation.name}</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
