import { TwoGisClientError } from "./errors";
import { twoGisItemsResponseSchema, type TwoGisItemsResponse } from "./types";

const DEFAULT_BASE_URL = "https://catalog.api.2gis.com";
const DEFAULT_TIMEOUT_MS = 15_000;

/** Демо-ключи 2GIS: page_size не больше 10. Полный ключ — часто до 50; задайте DGIS_MAX_PAGE_SIZE. */
const DEFAULT_MAX_PAGE_SIZE = 10;
const ABSOLUTE_MAX_PAGE_SIZE = 50;

export function getTwoGisMaxPageSize(): number {
  const raw = process.env.DGIS_MAX_PAGE_SIZE?.trim();
  if (raw === undefined || raw === "") return DEFAULT_MAX_PAGE_SIZE;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_PAGE_SIZE;
  return Math.min(ABSOLUTE_MAX_PAGE_SIZE, n);
}

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

function catalogLocale(): string {
  return process.env.DGIS_LOCALE?.trim() || "ru_RU";
}

function buildItemsSearchUrl(config: TwoGisClientConfig, query: TwoGisItemsSearchQuery): URL {
  const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = new URL(`${base}/3.0/items`);
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("locale", catalogLocale());
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
  const maxPs = getTwoGisMaxPageSize();
  const pageSize = Math.min(Math.max(query.pageSize ?? maxPs, 1), maxPs);
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
      const msg = meta.error?.message?.trim() ?? "";
      /** Пустая выдача — не ошибка приложения: ячейка без конкурентов по этому запросу. */
      if (/results?\s+not\s+found/i.test(msg) || /ничего\s+не\s+найден/i.test(msg)) {
        return {
          ...parsed.data,
          meta: { ...parsed.data.meta, code: 200 },
          result: { total: 0, items: [] },
        };
      }
      const errMsg = msg || `Код ответа каталога 2GIS: ${meta.code}`;
      throw new TwoGisClientError("UPSTREAM_ERROR", errMsg, {
        httpStatus: res.status,
        meta,
      });
    }

    return parsed.data;
  }
}
