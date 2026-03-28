import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GeoOperation, GeoProvider } from "@/lib/analysis-request-schema";
import type { GeoQueryResponse, GeoResultItem } from "@/lib/mock-geo-response";
import { cn } from "@/lib/utils";

const providerLabel = (p: GeoProvider): string =>
  p === "2gis" ? "2GIS" : "Яндекс";

const operationLabel = (o: GeoOperation): string => {
  const map: Record<GeoOperation, string> = {
    text_search: "Текстовый поиск",
    geocode: "Геокодирование",
    reverse_geocode: "Обратное гео",
    organizations_nearby: "Организации рядом",
  };
  return map[o];
};

function ResultRow({ item }: { item: GeoResultItem }) {
  return (
    <li className="rounded-md border border-border bg-muted/20 px-3 py-2.5">
      <p className="text-sm font-medium text-foreground">{item.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{item.address}</p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {item.lat.toFixed(6)}, {item.lng.toFixed(6)}
      </p>
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
        >
          {item.url}
        </a>
      ) : null}
    </li>
  );
}

function LoadingPlaceholder() {
  return (
    <div
      className="flex flex-col gap-3 py-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        <span>Имитация запроса (mock)…</span>
      </div>
      <div className="space-y-2">
        <div className="h-9 animate-pulse rounded-md bg-muted" />
        <div className="h-20 animate-pulse rounded-md bg-muted" />
        <div className="h-20 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export interface ResultsCardProps {
  isLoading: boolean;
  errorMessage: string | null;
  response: GeoQueryResponse | null;
  className?: string;
}

export function ResultsCard({
  isLoading,
  errorMessage,
  response,
  className,
}: ResultsCardProps) {
  return (
    <Card className={cn("flex min-h-0 flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">ResultsCard</CardTitle>
        </div>
        <CardDescription>
          Mock-ответ: провайдер, операция, счётчик и список точек.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {isLoading ? (
          <LoadingPlaceholder />
        ) : errorMessage ? (
          <div
            className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{errorMessage}</p>
          </div>
        ) : response ? (
          <>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Провайдер</dt>
                <dd className="font-medium text-foreground">
                  {providerLabel(response.provider)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Операция</dt>
                <dd className="font-medium text-foreground">
                  {operationLabel(response.operation)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Найдено</dt>
                <dd className="font-mono font-medium tabular-nums text-foreground">
                  {response.count}
                </dd>
              </div>
            </dl>
            <Separator />
            {response.items.length === 0 ? (
              <EmptyState
                title="Нет результатов"
                description="По этому запросу mock-ответ пустой. Для демо введите в запрос слово «empty»."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="space-y-2">
                {response.items.map((item) => (
                  <ResultRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
