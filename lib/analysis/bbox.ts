import type { BoundingBox } from "@/types/geo";

import { AnalysisValidationError } from "./errors";

/**
 * Приводит bbox к виду south ≤ north, west ≤ east и проверяет допустимый размер.
 * Совместимо с данными Nominatim (south, west, north, east в градусах WGS84).
 */
export function normalizeBoundingBox(bbox: BoundingBox): BoundingBox {
  const { south: s0, west: w0, north: n0, east: e0 } = bbox;
  if (![s0, w0, n0, e0].every((x) => Number.isFinite(x))) {
    throw new AnalysisValidationError("BBOX_INVALID", "BBox: все границы должны быть конечными числами.");
  }

  let south = s0;
  let north = n0;
  let west = w0;
  let east = e0;

  if (south > north) {
    south = n0;
    north = s0;
  }
  if (west > east) {
    west = e0;
    east = w0;
  }

  const latSpan = north - south;
  const lonSpan = east - west;

  if (latSpan < 1e-5 || lonSpan < 1e-5) {
    throw new AnalysisValidationError(
      "BBOX_TOO_SMALL",
      "Область слишком мала: увеличьте bbox города (минимальный охват ~0,00001°).",
    );
  }

  if (latSpan > 5 || lonSpan > 5) {
    throw new AnalysisValidationError(
      "BBOX_TOO_LARGE",
      "Область слишком велика для сеточного анализа (макс. ~5° по широте и долготе). Уточните границы города.",
    );
  }

  return { south, west, north, east };
}
