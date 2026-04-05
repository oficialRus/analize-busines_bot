import { TwoGisClientError } from "./errors";
import { twoGisItemsResponseSchema, type TwoGisItemsResponse } from "./types";

const DEFAULT_BASE_URL = "https://catalog.api.2gis.com";
const DEFAULT_TIMEOUT_MS = 15_000;

export type TwoGisClientConfig = {
  apiKey: string;
  /** Базовый URL без завершающего слэша (on-premise при необходимости). */
  baseUrl?: string;
  timeoutMs?: number;
};

export type TwoGisItemsSearchQuery = {
  q: string;
  lon: number;
  lat: number;
  radius: number;
  page?: number;
  pageSize?: number;
};

function buildItemsSearchUrl(config: TwoGisClientConfig, query: TwoGisItemsSearchQuery): URL {
  const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = new URL(`${base}/3.0/items`);
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("q", query.q);
  url.searchParams.set("point", `${query.lon},${query.lat}`);
  url.searchParams.set("radius", String(Math.round(query.radius)));
  url.searchParams.set("type", "branch");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("location", `${query.lon},${query.lat}`);
  url.searchParams.set(
    "fields",
    "items.point,items.reviews,items.address,items.full_address_name,items.address_name",
  );
  const page = query.page ?? 1;
  const pageSize = Math.min(Math.max(query.pageSize ?? 50, 1), 50);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  return url;
}

export class TwoGisClient {
  constructor(private readonly config: TwoGisClientConfig) {
    if (!config.apiKey.trim()) {
      throw new TwoGisClientError("MISSING_API_KEY", "Пустой API-ключ 2GIS");
    }
  }

  /**
   * Поиск филиалов в радиусе (Places API /3.0/items).
   */
  async searchItems(query: TwoGisItemsSearchQuery): Promise<TwoGisItemsResponse> {
    const url = buildItemsSearchUrl(this.config, query);
    const timeoutMs = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (e) {
      if (e instanceof Error && e.name === "TimeoutError") {
        throw new TwoGisClientError("TIMEOUT", "Превышено время ожидания ответа 2GIS", {
          cause: e,
        });
      }
      throw new TwoGisClientError("NETWORK", "Сеть недоступна или запрос к 2GIS прерван", {
        cause: e,
      });
    }

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch (e) {
      throw new TwoGisClientError("INVALID_RESPONSE", "Ответ 2GIS не является JSON", {
        cause: e,
        httpStatus: res.status,
      });
    }

    const parsed = twoGisItemsResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new TwoGisClientError("INVALID_RESPONSE", "Структура ответа 2GIS не распознана", {
        httpStatus: res.status,
        meta: parsed.error.flatten(),
      });
    }

    const { meta } = parsed.data;
    if (meta.code !== 200) {
      const msg =
        meta.error?.message?.trim() ||
        `Код ответа каталога 2GIS: ${meta.code}`;
      throw new TwoGisClientError("UPSTREAM_ERROR", msg, {
        httpStatus: res.status,
        meta,
      });
    }

    return parsed.data;
  }
}
