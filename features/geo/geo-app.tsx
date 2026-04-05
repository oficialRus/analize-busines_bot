"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { AnalysisForm, type AnalysisFormSubmitValues } from "@/features/analysis/analysis-form";
import { AnalysisHistorySection } from "@/features/analysis/analysis-history";
import { AnalysisResults } from "@/features/analysis/analysis-results";
import { isCityGridAnalysisResult } from "@/features/analysis/analysis-type-guards";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { cityOptionShortLabel, cityOptionToBoundingBox } from "@/lib/geo/city-option";
import type { GeoAnalysisProvider } from "@/lib/geo/provider";
import { GEO_PROVIDER_LABELS } from "@/lib/geo/provider";
import type { AnalysisApiErrorResponse, CityGridAnalysisResult } from "@/types/analysis";
import type { CityOption } from "@/types/geo";

import { CityDistrictsPanel } from "./city-districts-panel";
import { ProviderSelection } from "./provider-selection";

export function GeoApp() {
  const router = useRouter();
  const [provider, setProvider] = useState<GeoAnalysisProvider | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CityGridAnalysisResult | null>(null);

  const handleSelectedCityChange = useCallback((city: CityOption | null) => {
    setSelectedCity(city);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  const handleChangeProvider = useCallback(() => {
    setProvider(null);
    setSelectedCity(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (provider !== null) {
      handleChangeProvider();
      return;
    }
    router.back();
  }, [handleChangeProvider, provider, router]);

  const runAnalysis = useCallback(
    async (values: AnalysisFormSubmitValues) => {
      if (!selectedCity || provider !== "2gis") return;

      setAnalysisLoading(true);
      setAnalysisError(null);
      setAnalysisResult(null);

      const bbox = cityOptionToBoundingBox(selectedCity);
      const body = {
        provider: "2gis" as const,
        city: cityOptionShortLabel(selectedCity),
        query: values.query,
        bbox: {
          west: bbox.west,
          south: bbox.south,
          east: bbox.east,
          north: bbox.north,
        },
        cellSizeMeters: values.cellSizeMeters,
        radiusMeters: values.radiusMeters,
      };

      try {
        const res = await fetch("/api/analysis/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json: unknown = await res.json();

        if (!res.ok) {
          const err = json as AnalysisApiErrorResponse;
          setAnalysisError(typeof err.error === "string" ? err.error : "Ошибка API");
          setAnalysisResult(null);
          return;
        }

        if (!isCityGridAnalysisResult(json)) {
          setAnalysisError("Некорректный ответ сервера");
          setAnalysisResult(null);
          return;
        }

        setAnalysisResult(json);
      } catch {
        setAnalysisError("Сеть недоступна или запрос прерван");
        setAnalysisResult(null);
      } finally {
        setAnalysisLoading(false);
      }
    },
    [provider, selectedCity],
  );

  const openHistoryResult = useCallback((result: CityGridAnalysisResult) => {
    setAnalysisError(null);
    setAnalysisResult(result);
  }, []);

  const analysisAvailable = provider === "2gis";
  const cityLabel = selectedCity ? cityOptionShortLabel(selectedCity) : "";
  const analysisBbox = selectedCity ? cityOptionToBoundingBox(selectedCity) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader onBack={handleHeaderBack} />
      <main className="flex flex-1 flex-col gap-4 p-4">
        {provider === null ? (
          <ProviderSelection onSelect={setProvider} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              <p>
                <span className="text-muted-foreground">Провайдер:</span>{" "}
                <span className="font-medium text-foreground">{GEO_PROVIDER_LABELS[provider]}</span>
              </p>
              <Button type="button" variant="outline" size="sm" onClick={handleChangeProvider}>
                Сменить провайдер
              </Button>
            </div>

            <CityDistrictsPanel
              provider={provider}
              selectedCity={selectedCity}
              onSelectedCityChange={handleSelectedCityChange}
            />

            {selectedCity ? (
              <section
                className="mt-2 space-y-4 border-t border-border/60 pt-6"
                aria-labelledby="analysis-section-title"
              >
                <h2
                  id="analysis-section-title"
                  className="text-sm font-semibold tracking-tight text-foreground"
                >
                  Конкурентная среда (2GIS)
                </h2>
                <div className="grid gap-4 xl:grid-cols-12">
                  <div className="flex flex-col gap-4 xl:col-span-4">
                    <AnalysisForm
                      cityLabel={cityLabel}
                      analysisBbox={analysisBbox}
                      analysisAvailable={analysisAvailable}
                      submitting={analysisLoading}
                      onSubmit={runAnalysis}
                    />
                    <AnalysisHistorySection enabled={analysisAvailable} onOpenResult={openHistoryResult} />
                  </div>
                  <div className="xl:col-span-8">
                    <AnalysisResults
                      loading={analysisLoading}
                      result={analysisResult}
                      error={analysisError}
                    />
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
