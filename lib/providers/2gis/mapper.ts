import type { CompetitorItem, CompetitorSourceProvider } from "@/types/analysis";

import type { TwoGisRawItem } from "./types";

const SOURCE: CompetitorSourceProvider = "2gis";

function parsePoint(point: string | undefined): { lat: number; lon: number } | null {
  if (!point || !point.trim()) return null;
  const parts = point.split(",").map((p) => p.trim());
  if (parts.length < 2) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  /** Документация 2GIS: WGS84, порядок в строке point — долгота, широта. */
  const lon = a;
  const lat = b;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function pickAddress(raw: TwoGisRawItem): string {
  if (raw.full_address_name?.trim()) return raw.full_address_name.trim();
  if (raw.address_name?.trim()) return raw.address_name.trim();
  const b = raw.address?.building_name;
  if (typeof b === "string" && b.trim()) return b.trim();
  return "";
}

function pickRating(raw: TwoGisRawItem): number | undefined {
  const r = raw.reviews?.rating;
  if (r === undefined || r === null) return undefined;
  const n = typeof r === "number" ? r : Number(String(r).replace(",", "."));
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function pickReviewsCount(raw: TwoGisRawItem): number | undefined {
  const rc = raw.reviews?.review_count;
  if (rc !== undefined && rc !== null) {
    const n = typeof rc === "number" ? rc : Number(String(rc).replace(/\s/g, ""));
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  const g = raw.reviews?.general_review_count;
  if (typeof g === "number" && Number.isFinite(g) && g >= 0) return Math.round(g);
  return undefined;
}

/**
 * Преобразует элемент каталога 2GIS в доменный {@link CompetitorItem}.
 */
export function mapTwoGisItemToCompetitor(raw: TwoGisRawItem): CompetitorItem | null {
  const coords = parsePoint(raw.point);
  if (!coords) return null;

  const name = raw.name?.trim() || "Без названия";
  const address = pickAddress(raw);

  return {
    id: raw.id,
    name,
    lat: coords.lat,
    lon: coords.lon,
    coordinates: { lat: coords.lat, lon: coords.lon },
    address,
    rating: pickRating(raw),
    reviewsCount: pickReviewsCount(raw),
    sourceProvider: SOURCE,
  };
}

export function mapTwoGisItemsToCompetitors(items: TwoGisRawItem[]): CompetitorItem[] {
  const out: CompetitorItem[] = [];
  for (const item of items) {
    const mapped = mapTwoGisItemToCompetitor(item);
    if (mapped) out.push(mapped);
  }
  return out;
}
