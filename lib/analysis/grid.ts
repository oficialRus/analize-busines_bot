import type { GridCell } from "@/types/analysis";
import type { BoundingBox } from "@/types/geo";

import { normalizeBoundingBox } from "./bbox";
import { AnalysisValidationError } from "./errors";
import { GRID_LIMITS, getMaxGridCells } from "./limits";

const METERS_PER_DEG_LAT = 111_320;

/**
 * Шаг в градусах по долготе с учётом широты (приближение для средних широт).
 */
function metersPerDegreeLon(latitudeDeg: number): number {
  const cos = Math.cos((latitudeDeg * Math.PI) / 180);
  return METERS_PER_DEG_LAT * Math.max(0.08, cos);
}

/** Сколько будет центров по одной оси (та же логика, что в generateGridFromBBox). */
function countAxisCenters(span: number, step: number, bboxMin: number, bboxMax: number): number {
  if (span <= step) return 1;
  let n = 0;
  for (let x = bboxMin + step / 2; x < bboxMax; x += step) n += 1;
  return n;
}

/**
 * Оценка числа ячеек без запроса к API (для подсказок в UI).
 * Не бросает — при невалидном шаге возвращает null.
 */
export function estimateGridCellCount(
  bboxInput: BoundingBox,
  cellSizeMeters: number,
): number | null {
  if (
    !Number.isFinite(cellSizeMeters) ||
    cellSizeMeters < GRID_LIMITS.MIN_CELL_METERS ||
    cellSizeMeters > GRID_LIMITS.MAX_CELL_METERS
  ) {
    return null;
  }

  const bbox = normalizeBoundingBox(bboxInput);
  const centerLat = (bbox.south + bbox.north) / 2;
  const dLat = cellSizeMeters / METERS_PER_DEG_LAT;
  const dLon = cellSizeMeters / metersPerDegreeLon(centerLat);
  const latSpan = bbox.north - bbox.south;
  const lonSpan = bbox.east - bbox.west;

  const nLat = countAxisCenters(latSpan, dLat, bbox.south, bbox.north);
  const nLon = countAxisCenters(lonSpan, dLon, bbox.west, bbox.east);
  return nLat * nLon;
}

/**
 * Минимальный шаг сетки (м), при котором ячеек не больше maxCells, в пределах лимитов.
 * Если даже MAX_CELL_METERS не хватает — null.
 */
export function suggestCellSizeMetersForMaxCells(
  bboxInput: BoundingBox,
  maxCells: number,
): number | null {
  const maxM = GRID_LIMITS.MAX_CELL_METERS;
  const cMax = estimateGridCellCount(bboxInput, maxM);
  if (cMax == null || cMax > maxCells) return null;

  let lo = GRID_LIMITS.MIN_CELL_METERS;
  let hi = maxM;
  let best: number = maxM;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const c = estimateGridCellCount(bboxInput, mid);
    if (c == null) {
      lo = mid + 1;
      continue;
    }
    if (c <= maxCells) {
      best = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return best;
}

/**
 * Центры ячеек регулярной сетки с шагом ~cellSizeMeters в проекции «метры на градус» у центра bbox.
 */
export function generateGridFromBBox(bboxInput: BoundingBox, cellSizeMeters: number): GridCell[] {
  if (
    cellSizeMeters < GRID_LIMITS.MIN_CELL_METERS ||
    cellSizeMeters > GRID_LIMITS.MAX_CELL_METERS
  ) {
    throw new AnalysisValidationError(
      "CELL_SIZE_INVALID",
      `Размер ячейки: от ${GRID_LIMITS.MIN_CELL_METERS} до ${GRID_LIMITS.MAX_CELL_METERS} м.`,
    );
  }

  const bbox = normalizeBoundingBox(bboxInput);
  const centerLat = (bbox.south + bbox.north) / 2;
  const dLat = cellSizeMeters / METERS_PER_DEG_LAT;
  const dLon = cellSizeMeters / metersPerDegreeLon(centerLat);

  const latSpan = bbox.north - bbox.south;
  const lonSpan = bbox.east - bbox.west;

  const latCenters: number[] = [];
  if (latSpan <= dLat) {
    latCenters.push((bbox.south + bbox.north) / 2);
  } else {
    for (let lat = bbox.south + dLat / 2; lat < bbox.north; lat += dLat) {
      latCenters.push(lat);
    }
  }

  const lonCenters: number[] = [];
  if (lonSpan <= dLon) {
    lonCenters.push((bbox.west + bbox.east) / 2);
  } else {
    for (let lon = bbox.west + dLon / 2; lon < bbox.east; lon += dLon) {
      lonCenters.push(lon);
    }
  }

  const estimated = latCenters.length * lonCenters.length;
  const maxCells = getMaxGridCells();
  if (estimated > maxCells) {
    throw new AnalysisValidationError(
      "GRID_TOO_HEAVY",
      `Сетка слишком плотная: вышло бы ${estimated} ячеек (лимит ${maxCells}). Увеличьте размер сетки (м), задайте GRID_MAX_CELLS в .env (макс. 400) или сузьте область; радиус поиска на число ячеек не влияет.`,
    );
  }

  const cells: GridCell[] = [];
  let idx = 0;
  for (const centerLat of latCenters) {
    for (const centerLon of lonCenters) {
      cells.push({
        id: `cell-${idx}`,
        centerLat,
        centerLon,
      });
      idx += 1;
    }
  }

  return cells;
}
