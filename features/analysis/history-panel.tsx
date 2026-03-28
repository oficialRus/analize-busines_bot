"use client";

import { History } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockHistory } from "@/lib/mock-data";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function HistoryPanel() {
  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <CardTitle>История запросов</CardTitle>
        </div>
        <CardDescription>
          Последние обращения к анализу (демо-данные).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[min(200px,32vh)] pr-3">
          <ul className="space-y-2">
            {mockHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.query}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
                <StatusBadge status={entry.status} className="shrink-0" />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
