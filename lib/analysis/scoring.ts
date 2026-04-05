import type { AnalyzedGridCell, CellRecommendation, GridCell, TopZone } from "@/types/analysis";

type Metrics = Pick<AnalyzedGridCell, "competitorsCount" | "avgRating" | "totalReviews">;

/**
 * Индекс привлекательности ячейки для точки входа (0–100), без «чёрного ящика».
 *
 * Идея: спрос проксируем суммой отзывов, насыщение — числом уникальных конкурентов в зоне
 * первичного охвата (после дедупликации), качество среды — средним рейтингом.
 *
 * Шаги:
 * 1) demand = 42 * log1p(totalReviews) / log1p(500) — растёт с отзывами, потолок 42.
 * 2) crowding = min(48, competitorsCount * 3.2) — штраф за плотность, потолок 48.
 * 3) ratingAdj: при известном avgRating — (avgRating - 4) * 7, ограничено [-10, 14];
 *    если рейтинга нет — небольшой нейтральный бонус +2 (не наказываем отсутствие данных).
 * 4) raw = 44 + demand - crowding + ratingAdj, затем clamp в [0, 100].
 *
 * Интерпретация: больше отзывов и ниже пересечение с конкурентами → выше score;
 * слишком пустая зона без отзывов тоже получает низкий demand и обычно низкий итог.
 */
export function computeCellScore(p: Metrics): number {
  const demandRaw = (Math.log1p(Math.max(0, p.totalReviews)) / Math.log1p(500)) * 42;
  const demand = Math.min(42, demandRaw);
  const crowding = Math.min(48, Math.max(0, p.competitorsCount) * 3.2);
  let ratingAdj: number;
  if (p.avgRating != null && Number.isFinite(p.avgRating)) {
    ratingAdj = Math.max(-10, Math.min(14, (p.avgRating - 4) * 7));
  } else {
    ratingAdj = 2;
  }
  const raw = 44 + demand - crowding + ratingAdj;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Правила-эвристики по порогам (подбираются под типичный demo-ответ 2GIS).
 * Порядок важен: сначала экстремальная плотность, затем «горячий» рынок, затем слабый спрос и т.д.
 */
export function recommendCell(p: Metrics): CellRecommendation {
  const c = p.competitorsCount;
  const r = p.totalReviews;

  if (c >= 15) {
    return {
      kind: "dense_compact_format",
      shortRecommendation: "Плотный рынок — лучше компактный формат и сильное УТП",
    };
  }
  if (c >= 8 && r >= 45) {
    return {
      kind: "high_competition_proven_demand",
      shortRecommendation: "Высокая конкуренция, подтверждённый спрос",
    };
  }
  if (c <= 3 && r < 35) {
    return {
      kind: "low_activity_demand_risk",
      shortRecommendation: "Низкая активность — риск слабого спроса",
    };
  }
  if (c >= 4 && c <= 12 && r >= 18) {
    return {
      kind: "moderate_test_zone",
      shortRecommendation: "Умеренная конкуренция — хорошая тестовая зона",
    };
  }
  return {
    kind: "mixed_signal",
    shortRecommendation: "Смешанный сигнал: уточните нишу и локальные факторы",
  };
}

export function enrichAnalyzedCell(
  base: GridCell & Metrics & { topNames: string[] },
): AnalyzedGridCell {
  const score = computeCellScore(base);
  const recommendation = recommendCell(base);
  return { ...base, score, recommendation };
}

function buildTopZoneSummary(args: {
  cityLabel: string;
  cell: AnalyzedGridCell;
}): string {
  const { cityLabel, cell: c } = args;
  const ratingPart =
    c.avgRating != null
      ? `Средний рейтинг конкурентов — ${c.avgRating.toFixed(2)}.`
      : "Рейтинг по выборке не оценён.";
  return [
    `${cityLabel}, ячейка ${c.id}: уникальных конкурентов (первичный охват) — ${c.competitorsCount}, сумма отзывов — ${c.totalReviews}.`,
    ratingPart,
    `Индекс привлекательности (score) — ${c.score}/100.`,
    `Вывод: ${c.recommendation.shortRecommendation}`,
  ].join(" ");
}

/**
 * Топ зон: сортируем по score по убыванию (выше — привлекательнее для входа при текущей модели).
 */
export function rankTopOpportunityZones(
  cells: AnalyzedGridCell[],
  topN: number,
  cityLabel: string,
): TopZone[] {
  const sorted = [...cells].sort((a, b) => b.score - a.score);
  const slice = sorted.slice(0, Math.max(0, topN));

  return slice.map((c, i) => ({
    rank: i + 1,
    cellId: c.id,
    score: c.score,
    label: `${cityLabel}: ячейка ${c.id} — конкурентов: ${c.competitorsCount}`,
    centerLat: c.centerLat,
    centerLon: c.centerLon,
    shortRecommendation: c.recommendation.shortRecommendation,
    summaryText: buildTopZoneSummary({ cityLabel, cell: c }),
  }));
}
