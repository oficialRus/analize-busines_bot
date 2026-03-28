import type { AnalysisPayload } from "@/lib/analysis-request-schema";

export interface MockSubmitViewModel {
  title: string;
  summary: string;
  meta: string[];
}

export function buildMockSubmitResult(payload: AnalysisPayload): MockSubmitViewModel {
  const providerLabel = payload.provider === "2gis" ? "2GIS" : "Яндекс";

  switch (payload.operation) {
    case "text_search":
      return {
        title: "Текстовый поиск (демо)",
        summary: `Провайдер ${providerLabel} вернул бы список объектов по запросу «${payload.query}». Сейчас это заглушка без сети.`,
        meta: [`limit: ${payload.limit}`, `operation: text_search`],
      };
    case "geocode":
      return {
        title: "Геокодирование (демо)",
        summary: `Адрес «${payload.query}» был бы преобразован в координаты через ${providerLabel}. Ответ не запрашивался.`,
        meta: [`limit: ${payload.limit}`, `operation: geocode`],
      };
    case "reverse_geocode":
      return {
        title: "Обратное гео (демо)",
        summary: `Координаты ${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)} были бы разрешены в адрес (${providerLabel}).`,
        meta: [
          `limit: ${payload.limit}`,
          `lat: ${payload.latitude}`,
          `lon: ${payload.longitude}`,
        ],
      };
    case "organizations_nearby":
      return {
        title: "Организации рядом (демо)",
        summary: `В радиусе ${payload.radius} м от точки были бы найдены организации (провайдер ${providerLabel}). Данные не загружались.`,
        meta: [
          `limit: ${payload.limit}`,
          `radius_m: ${payload.radius}`,
          `center: ${payload.latitude}, ${payload.longitude}`,
        ],
      };
  }
}
