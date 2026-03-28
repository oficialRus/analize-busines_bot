import type { AnalysisResult, HistoryEntry, Location } from "@/types";

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Москва, Тверская",
    lat: 55.757,
    lng: 37.615,
    region: "Центральный ФО",
  },
  {
    id: "loc-2",
    name: "Санкт-Петербург, Невский",
    lat: 59.934,
    lng: 30.335,
    region: "Северо-Запад",
  },
  {
    id: "loc-3",
    name: "Казань, Кремль",
    lat: 55.798,
    lng: 49.106,
    region: "Приволжье",
  },
];

export const mockResultsByLocation: Record<string, AnalysisResult[]> = {
  "loc-1": [
    {
      id: "res-1",
      locationId: "loc-1",
      score: 82,
      summary:
        "Высокая проходимость и концентрация смежных точек интереса. Хороший потенциал для ритейла.",
      generatedAt: "2026-03-27T10:00:00.000Z",
    },
  ],
  "loc-2": [
    {
      id: "res-2",
      locationId: "loc-2",
      score: 76,
      summary:
        "Стабильный трафик, сезонные колебания. Рекомендуется уточнить конкуренцию в радиусе 500 м.",
      generatedAt: "2026-03-26T14:30:00.000Z",
    },
  ],
  "loc-3": [
    {
      id: "res-3",
      locationId: "loc-3",
      score: 71,
      summary:
        "Растущий район, ниже среднего по готовой инфраструктуре, выше по темпам развития.",
      generatedAt: "2026-03-25T09:15:00.000Z",
    },
  ],
};

export const mockHistory: HistoryEntry[] = [
  {
    id: "h-1",
    query: "Тверская — пешеходный трафик, выходные",
    createdAt: "2026-03-27T11:20:00.000Z",
    status: "success",
  },
  {
    id: "h-2",
    query: "Невский — конкуренты в радиусе 1 км",
    createdAt: "2026-03-26T16:05:00.000Z",
    status: "success",
  },
  {
    id: "h-3",
    query: "Казань — демография + транспорт",
    createdAt: "2026-03-25T08:40:00.000Z",
    status: "idle",
  },
];

export const mockAnalysisParams = [
  { id: "radius", label: "Радиус анализа", value: "800 м" },
  { id: "period", label: "Период", value: "Последние 30 дней" },
  { id: "segment", label: "Сегмент", value: "Ритейл / HoReCa" },
] as const;
