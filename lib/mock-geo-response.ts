import type {
  AnalysisPayload,
  GeoOperation,
  GeoProvider,
} from "@/lib/analysis-request-schema";

/** Элемент списка в ответе геосервиса (тот же контракт ожидается от backend). */
export type GeoResultItem = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  url?: string;
};

export type GeoQueryResponse = {
  provider: GeoProvider;
  operation: GeoOperation;
  count: number;
  items: GeoResultItem[];
};

/** Демо: в поле запроса введите «error» — симуляция ошибки провайдера. */
export function isMockErrorPayload(payload: AnalysisPayload): boolean {
  if (payload.operation === "text_search" || payload.operation === "geocode") {
    return payload.query.trim().toLowerCase() === "error";
  }
  return false;
}

/** Демо: в поле запроса введите «empty» — пустой список результатов. */
export function isMockEmptyPayload(payload: AnalysisPayload): boolean {
  if (payload.operation === "text_search" || payload.operation === "geocode") {
    return payload.query.trim().toLowerCase() === "empty";
  }
  return false;
}

export function buildMockGeoResponse(
  payload: AnalysisPayload,
): GeoQueryResponse {
  const { provider, operation } = payload;

  if (isMockEmptyPayload(payload)) {
    return { provider, operation, count: 0, items: [] };
  }

  switch (operation) {
    case "text_search": {
      const n = Math.min(Math.max(1, payload.limit), 5);
      const items: GeoResultItem[] = Array.from({ length: n }, (_, i) => ({
        id: `mock-ts-${i}`,
        name: `${["Кафе", "Ресторан", "Бар"][i % 3]} «Тверская ${i + 1}»`,
        address: `Москва, Тверская ул., ${12 + i}`,
        lat: 55.757 + i * 0.0012,
        lng: 37.61 + i * 0.0015,
        url: i === 0 ? "https://example.com/geo-demo" : undefined,
      }));
      return { provider, operation, count: items.length, items };
    }
    case "geocode": {
      const items: GeoResultItem[] = [
        {
          id: "mock-gc-0",
          name: payload.query.trim() || "Точка геокодирования",
          address: payload.query.trim() || "Адрес не указан",
          lat: 59.9343,
          lng: 30.3351,
          url: "https://example.com/geo-demo/geocode",
        },
      ];
      return { provider, operation, count: items.length, items };
    }
    case "reverse_geocode": {
      const items: GeoResultItem[] = [
        {
          id: "mock-rg-0",
          name: "Адрес по координатам (mock)",
          address: "Россия, Санкт-Петербург, центр",
          lat: payload.latitude,
          lng: payload.longitude,
        },
      ];
      return { provider, operation, count: items.length, items };
    }
    case "organizations_nearby": {
      const n = Math.min(Math.max(1, payload.limit), 4);
      const items: GeoResultItem[] = Array.from({ length: n }, (_, i) => ({
        id: `mock-on-${i}`,
        name: `Организация ${i + 1} (${payload.radius} м)`,
        address: `Рядом с ${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`,
        lat: payload.latitude + i * 0.0008,
        lng: payload.longitude + i * 0.0006,
        url: i === n - 1 ? "https://example.com/geo-demo/orgs" : undefined,
      }));
      return { provider, operation, count: items.length, items };
    }
  }
}

export function buildMockErrorMessage(): string {
  return "Провайдер недоступен (демо). Попробуйте другой запрос.";
}
