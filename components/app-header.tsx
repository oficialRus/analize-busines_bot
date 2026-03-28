"use client";

import { MapPin } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";
import type { AnalysisStatus } from "@/types";

export interface AppHeaderProps {
  uiStatus: AnalysisStatus;
}

export function AppHeader({ uiStatus }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex items-center gap-2 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Geo Analysis</span>
            <span className="text-xs text-muted-foreground">
              Панель геоаналитики
            </span>
          </div>
        </div>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Статус интерфейса
          </span>
          <StatusBadge status={uiStatus} />
        </div>
      </div>
    </header>
  );
}
