import { TwoGisClient, getTwoGisMaxPageSize } from "./client";
import { TwoGisClientError } from "./errors";
import { mapTwoGisItemsToCompetitors } from "./mapper";
import type { CompetitorItem } from "@/types/analysis";

export type TwoGisSearchParams = {
  query: string;
  lat: number;
  lon: number;
  /** Радиус в метрах (как в Places API, вместе с текстовым запросом до 40 000). */
  radius: number;
  /** Верхняя граница — см. getTwoGisMaxPageSize() (демо: 10, полный ключ: DGIS_MAX_PAGE_SIZE). */
  limit?: number;
};

function requireApiKey(): string {
  const key = process.env.DGIS_API_KEY?.trim();
  if (!key) {
    throw new TwoGisClientError(
      "MISSING_API_KEY",
      "Не задана переменная окружения DGIS_API_KEY (ключ только на сервере).",
    );
  }
  return key;
}

/**
 * Поиск конкурентов (филиалов) через 2GIS Places API. Только server-side.
 */
export async function searchCompetitorsTwoGis(
  params: TwoGisSearchParams,
): Promise<readonly CompetitorItem[]> {
  const apiKey = requireApiKey();
  const client = new TwoGisClient({ apiKey });

  const maxPs = getTwoGisMaxPageSize();
  const limit = params.limit ?? maxPs;
  const response = await client.searchItems({
    q: params.query.trim(),
    lon: params.lon,
    lat: params.lat,
    radius: params.radius,
    page: 1,
    pageSize: Math.min(Math.max(limit, 1), maxPs),
  });

  return mapTwoGisItemsToCompetitors(response.result.items);
}
