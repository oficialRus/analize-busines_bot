import type { CityGridAnalysisResult } from "@/types/analysis";

function isAnalyzedGridCellLike(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  if (typeof c.id !== "string") return false;
  if (typeof c.competitorsCount !== "number") return false;
  if (typeof c.totalReviews !== "number") return false;
  if (!Array.isArray(c.topNames)) return false;
  if (typeof c.score !== "number") return false;
  if (typeof c.recommendation !== "object" || c.recommendation === null) return false;
  const r = c.recommendation as Record<string, unknown>;
  return typeof r.shortRecommendation === "string";
}

function isTopZoneLike(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const z = v as Record<string, unknown>;
  return typeof z.shortRecommendation === "string" && typeof z.summaryText === "string";
}

export function isCityGridAnalysisResult(value: unknown): value is CityGridAnalysisResult {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.requestId !== "string" || typeof o.generatedAt !== "string") return false;
  if (typeof o.city !== "string" || typeof o.query !== "string") return false;
  if (typeof o.totalCells !== "number" || typeof o.totalCompetitorsFound !== "number") return false;
  if (!Array.isArray(o.cells) || !Array.isArray(o.topZones)) return false;
  if (typeof o.bbox !== "object" || o.bbox === null) return false;
  const b = o.bbox as Record<string, unknown>;
  if (
    typeof b.south !== "number" ||
    typeof b.west !== "number" ||
    typeof b.north !== "number" ||
    typeof b.east !== "number"
  ) {
    return false;
  }
  if (o.cells.length > 0 && !isAnalyzedGridCellLike(o.cells[0])) return false;
  if (o.topZones.length > 0 && !isTopZoneLike(o.topZones[0])) return false;
  return true;
}
