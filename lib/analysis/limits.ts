/** Ограничения сеточного анализа (защита от перегруза 2GIS и долгих запросов). */

const DEFAULT_MAX_GRID_CELLS = 36;
/** Потолок даже при GRID_MAX_CELLS (защита от случайного «тысячи ячеек»). */
const ABSOLUTE_MAX_GRID_CELLS = 400;

/**
 * Сколько ячеек максимум за один `POST /api/analysis/run`.
 * Для крупного города (весь Краснодар) увеличьте `GRID_MAX_CELLS` в `.env.local` и шаг сетки — см. README.
 */
export function getMaxGridCells(): number {
  const raw = process.env.GRID_MAX_CELLS?.trim();
  if (raw === undefined || raw === "") return DEFAULT_MAX_GRID_CELLS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_GRID_CELLS;
  return Math.min(ABSOLUTE_MAX_GRID_CELLS, n);
}

/**
 * Подсказка в форме (клиент): задайте `NEXT_PUBLIC_GRID_MAX_CELLS` тем же числом, что и `GRID_MAX_CELLS`.
 */
export function getMaxGridCellsClientHint(): number {
  const raw = process.env.NEXT_PUBLIC_GRID_MAX_CELLS?.trim();
  if (raw === undefined || raw === "") return DEFAULT_MAX_GRID_CELLS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_GRID_CELLS;
  return Math.min(ABSOLUTE_MAX_GRID_CELLS, n);
}

export const GRID_LIMITS = {
  /** Минимальный шаг сетки, м. */
  MIN_CELL_METERS: 400,
  /** Максимальный шаг сетки, м. */
  MAX_CELL_METERS: 8000,
  /** Радиус поиска конкурентов в каждой ячейке. */
  MIN_RADIUS_METERS: 150,
  MAX_RADIUS_METERS: 2500,
} as const;
