"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GeoAnalysisProvider } from "@/lib/geo/provider";
import { GEO_PROVIDER_LABELS } from "@/lib/geo/provider";
import type { CityOption } from "@/types/geo";

const DEBOUNCE_MS = 380;

export interface CityDistrictsPanelProps {
  provider: GeoAnalysisProvider;
  selectedCity: CityOption | null;
  onSelectedCityChange: (city: CityOption | null) => void;
}

export function CityDistrictsPanel({
  provider,
  selectedCity: selected,
  onSelectedCityChange,
}: CityDistrictsPanelProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CityOption[]>([]);
  const [hitsLoading, setHitsLoading] = useState(false);
  const [hitsError, setHitsError] = useState<string | null>(null);

  const [districts, setDistricts] = useState<string[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setHitsError(null);
      setHitsLoading(false);
      return;
    }

    setHitsLoading(true);
    setHitsError(null);

    debounceRef.current = setTimeout(async () => {
      debounceRef.current = null;
      try {
        const res = await fetch(`/api/geo/cities?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as {
          cities?: CityOption[];
          error?: string;
        };
        if (!res.ok) {
          setHitsError(data.error ?? "Не удалось выполнить поиск");
          setHits([]);
          return;
        }
        setHits(data.cities ?? []);
      } catch {
        setHitsError("Сеть недоступна или сервер не отвечает");
        setHits([]);
      } finally {
        setHitsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const loadDistricts = useCallback(async (city: CityOption) => {
    setDistrictsLoading(true);
    setDistrictsError(null);
    setDistricts([]);
    try {
      const res = await fetch("/api/geo/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osmType: city.osmType,
          osmId: city.osmId,
          bbox: city.bbox,
        }),
      });
      const data = (await res.json()) as { districts?: string[]; error?: string };
      if (!res.ok) {
        setDistrictsError(data.error ?? "Не удалось загрузить районы");
        return;
      }
      setDistricts(data.districts ?? []);
    } catch {
      setDistrictsError("Сеть недоступна или сервер не отвечает");
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  const selectCity = useCallback(
    (city: CityOption) => {
      onSelectedCityChange(city);
      setHits([]);
      setQuery(city.displayName.split(",").slice(0, 2).join(",").trim());
      void loadDistricts(city);
    },
    [loadDistricts, onSelectedCityChange],
  );

  const clearSelection = useCallback(() => {
    onSelectedCityChange(null);
    setDistricts([]);
    setDistrictsError(null);
  }, [onSelectedCityChange]);

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
      <section className="flex min-h-[320px] flex-col lg:col-span-4">
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Город</CardTitle>
            </div>
            <CardDescription>
              Контекст: {GEO_PROVIDER_LABELS[provider]}. Введите название города и выберите вариант из
              списка. Районы — OpenStreetMap.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="space-y-2">
              <Label htmlFor="city-search">Поиск города</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="city-search"
                  className="pl-9"
                  placeholder="Например: Москва, Казань…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {hitsLoading ? (
                  <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </div>

            {hitsError ? (
              <p className="text-sm text-destructive" role="alert">
                {hitsError}
              </p>
            ) : null}

            {hits.length > 0 ? (
              <ScrollArea className="h-48 rounded-md border border-border">
                <ul className="p-1">
                  {hits.map((c) => (
                    <li key={`${c.osmType}-${c.osmId}`}>
                      <button
                        type="button"
                        className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => selectCity(c)}
                      >
                        {c.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : null}

            {selected ? (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Выбрано</p>
                <p className="mt-1 text-muted-foreground">{selected.displayName}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 px-2"
                  onClick={clearSelection}
                >
                  Сбросить
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="flex min-h-[320px] flex-col lg:col-span-8">
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-base">Районы</CardTitle>
            <CardDescription>
              Административные единицы и при отсутствии — кварталы по данным OSM.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Сначала выберите город слева.</p>
            ) : districtsLoading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Загрузка районов…</span>
              </div>
            ) : districtsError ? (
              <p className="text-sm text-destructive" role="alert">
                {districtsError}
              </p>
            ) : districts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Для этого города в OSM не найдено разбивки на районы с границами. Попробуйте другой вариант
                из поиска или более крупный населённый пункт.
              </p>
            ) : (
              <ScrollArea className="min-h-[280px] flex-1 rounded-md border border-border">
                <ol className="list-decimal p-4 pl-8 text-sm">
                  {districts.map((name) => (
                    <li key={name} className="py-1">
                      {name}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
