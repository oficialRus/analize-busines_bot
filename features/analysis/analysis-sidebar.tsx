"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockAnalysisParams, mockLocations } from "@/lib/mock-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";

export function AnalysisSidebar() {
  const selectedLocation = useDashboardStore((s) => s.selectedLocation);
  const setSelectedLocation = useDashboardStore((s) => s.setSelectedLocation);
  const setUiStatus = useDashboardStore((s) => s.setUiStatus);

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <CardTitle>Параметры анализа</CardTitle>
        </div>
        <CardDescription>
          Заглушка: позже здесь будет форма и вызов backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4 pt-0">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Локации (mock)
          </p>
          <ScrollArea className="h-[min(220px,40vh)] pr-3">
            <ul className="flex flex-col gap-1.5">
              {mockLocations.map((loc) => {
                const active = selectedLocation?.id === loc.id;
                return (
                  <li key={loc.id}>
                    <Button
                      type="button"
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "h-auto w-full justify-start whitespace-normal py-2 text-left",
                        active && "shadow-sm",
                      )}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setUiStatus("success");
                      }}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{loc.name}</span>
                        {loc.region ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            {loc.region}
                          </span>
                        ) : null}
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
        <Separator />
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Параметры (mock)
          </p>
          <ul className="space-y-2 text-sm">
            {mockAnalysisParams.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"
              >
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-medium text-foreground">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
