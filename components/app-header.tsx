"use client";

import { ArrowLeft, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface AppHeaderProps {
  /** Сброс шага в приложении и при необходимости history.back() — передаётся из родителя. */
  onBack: () => void;
}

export function AppHeader({ onBack }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-2 px-4 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Назад
        </Button>
        <div className="flex min-w-0 items-center gap-2 text-foreground">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex flex-col leading-tight">
            <span className="truncate text-sm font-semibold">Геоаналитика</span>
            <span className="truncate text-xs text-muted-foreground">Город и районы (OSM)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
