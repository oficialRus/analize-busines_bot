import { searchCompetitorsTwoGis } from "@/lib/providers/2gis/search";
import type {
  AnalyzedGridCell,
  CityGridAnalysisInput,
  CityGridAnalysisResult,
  CompetitorItem,
} from "@/types/analysis";

import { normalizeBoundingBox } from "./bbox";
import { collectFirstSeenCompetitors, uniqueCompetitorTotal } from "./dedupe";
import { AnalysisValidationError } from "./errors";
import { generateGridFromBBox } from "./grid";
import { GRID_LIMITS } from "./limits";
import { enrichAnalyzedCell, rankTopOpportunityZones } from "./scoring";

function aggregateCellMetrics(items: readonly CompetitorItem[]): {
  competitorsCount: number;
  avgRating: number | null;
  totalReviews: number;
  topNames: string[];
} {
  const competitorsCount = items.length;
  let ratingSum = 0;
  let ratingN = 0;
  let totalReviews = 0;

  for (const it of items) {
    if (it.rating != null && Number.isFinite(it.rating)) {
      ratingSum += it.rating;
      ratingN += 1;
    }
    if (it.reviewsCount != null && Number.isFinite(it.reviewsCount)) {
      totalReviews += it.reviewsCount;
    }
  }

  const avgRating = ratingN > 0 ? ratingSum / ratingN : null;

  const sorted = [...items].sort((a, b) => {
    const ra = a.rating ?? -1;
    const rb = b.rating ?? -1;
    if (rb !== ra) return rb - ra;
    return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
  });

  const topNames: string[] = [];
  const seen = new Set<string>();
  for (const it of sorted) {
    const n = it.name.trim();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    topNames.push(n);
    if (topNames.length >= 5) break;
  }

  return { competitorsCount, avgRating, totalReviews, topNames };
}

/**
 * Сеточный анализ конкурентной среды: 2GIS Places по центру каждой ячейки (последовательно).
 */
export async function analyzeCityByGrid(
  input: CityGridAnalysisInput,
): Promise<CityGridAnalysisResult> {
  if (input.provider !== "2gis") {
    throw new AnalysisValidationError(
      "PROVIDER_UNSUPPORTED",
      "Сеточный анализ поддержан только для provider: \"2gis\".",
    );
  }

  const r = input.radiusMeters;
  if (r < GRID_LIMITS.MIN_RADIUS_METERS || r > GRID_LIMITS.MAX_RADIUS_METERS) {
    throw new AnalysisValidationError(
      "RADIUS_INVALID",
      `Радиус поиска: от ${GRID_LIMITS.MIN_RADIUS_METERS} до ${GRID_LIMITS.MAX_RADIUS_METERS} м.`,
    );
  }

  const bboxNorm = normalizeBoundingBox(input.bbox);
  const grid = generateGridFromBBox(bboxNorm, input.cellSizeMeters);

  const analyzed: AnalyzedGridCell[] = [];
  const globalSeenIds = new Set<string>();

  for (const cell of grid) {
    const items = await searchCompetitorsTwoGis({
      query: input.query.trim(),
      lat: cell.centerLat,
      lon: cell.centerLon,
      radius: r,
      limit: 50,
    });

    const firstSeen = collectFirstSeenCompetitors(items, globalSeenIds);
    const m = aggregateCellMetrics(firstSeen);
    analyzed.push(enrichAnalyzedCell({ ...cell, ...m }));
  }

  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `grid-${Date.now()}`;

  const city = input.city.trim();

  return {
    requestId,
    generatedAt: new Date().toISOString(),
    city,
    query: input.query.trim(),
    provider: input.provider,
    bbox: bboxNorm,
    cells: analyzed,
    totalCells: analyzed.length,
    totalCompetitorsFound: uniqueCompetitorTotal(globalSeenIds),
    topZones: rankTopOpportunityZones(analyzed, 5, city || "Город"),
  };
}
