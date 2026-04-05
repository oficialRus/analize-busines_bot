import type { BoundingBox } from "@/types/geo";
import type { AnalysisProvider } from "@/types/provider";

/** Вход сеточного анализа города (POST /api/analysis/run). */
export type CityGridAnalysisInput = {
  provider: AnalysisProvider;
  city: string;
  query: string;
  bbox: BoundingBox;
  cellSizeMeters: number;
  radiusMeters: number;
};

/** Ячейка сетки (центр). */
export type GridCell = {
  id: string;
  centerLat: number;
  centerLon: number;
};

/** Эвристическая метка сценария для ячейки (см. lib/analysis/scoring.ts). */
export type CellRecommendationKind =
  | "high_competition_proven_demand"
  | "moderate_test_zone"
  | "low_activity_demand_risk"
  | "dense_compact_format"
  | "mixed_signal";

export type CellRecommendation = {
  kind: CellRecommendationKind;
  shortRecommendation: string;
};

/** Ячейка после обхода 2GIS в центре (метрики по уникальным в ячейке после межъячеечного дедупа). */
export type AnalyzedGridCell = GridCell & {
  competitorsCount: number;
  avgRating: number | null;
  totalReviews: number;
  topNames: string[];
  /** 0–100, см. README и комментарии в scoring.ts */
  score: number;
  recommendation: CellRecommendation;
};

/** Источник записи о конкуренте (нормализованный провайдер). */
export type CompetitorSourceProvider = "2gis" | "yandex" | "osm";

/** Точка конкурента или релевантного POI. */
export type CompetitorItem = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  coordinates: { lat: number; lon: number };
  address: string;
  rating?: number;
  reviewsCount?: number;
  sourceProvider: CompetitorSourceProvider;
  distanceMeters?: number;
};

/** Ответ сеточного анализа. */
export type CityGridAnalysisResult = {
  requestId: string;
  generatedAt: string;
  city: string;
  query: string;
  provider: AnalysisProvider;
  bbox: BoundingBox;
  cells: AnalyzedGridCell[];
  totalCells: number;
  /** Уникальные id конкурентов по всей сетке (после дедупликации по порядку ячеек). */
  totalCompetitorsFound: number;
  topZones: TopZone[];
};

/** Лучшая зона для размещения (краткий топ). */
export type TopZone = {
  rank: number;
  cellId: string;
  score: number;
  label: string;
  centerLat: number;
  centerLon: number;
  shortRecommendation: string;
  summaryText: string;
};

/** Краткая запись в списке истории анализов. */
export type AnalysisHistoryListItem = {
  id: string;
  createdAt: string;
  city: string;
  query: string;
  totalCells: number;
  totalCompetitorsFound: number;
};

/** Тело ошибки от POST /api/analysis/run (клиентский разбор). */
export type AnalysisApiErrorResponse = {
  error: string;
  code?: string;
  details?: unknown;
};
