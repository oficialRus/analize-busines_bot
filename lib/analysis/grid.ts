import type { GridCell } from "@/types/analysis";
import type { BoundingBox } from "@/types/geo";

import { normalizeBoundingBox } from "./bbox";
import { AnalysisValidationError } from "./errors";
import { GRID_LIMITS } from "./limits";

const METERS_PER_DEG_LAT = 111_320;

/**
 * Шаг в градусах по долготе с учётом широты (приближение для средних широт).
 */
function metersPerDegreeLon(latitudeDeg: number): number {
  const cos = Math.cos((latitudeDeg * Math.PI) / 180);
  return METERS_PER_DEG_LAT * Math.max(0.08, cos);
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
  if (estimated > GRID_LIMITS.MAX_CELLS) {
    throw new AnalysisValidationError(
      "GRID_TOO_HEAVY",
      `Сетка слишком плотная: вышло бы ${estimated} ячеек (лимит ${GRID_LIMITS.MAX_CELLS}). Увеличьте cellSizeMeters или сузьте bbox.`,
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
