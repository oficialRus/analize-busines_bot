import type { CompetitorItem } from "@/types/analysis";

/**
 * Дедупликация между ячейками: один и тот же объект 2GIS может попадать в пересекающиеся круги поиска.
 * При обходе ячеек в фиксированном порядке оставляем только первое вхождение id.
 * Тогда:
 * - сумма `competitorsCount` по ячейкам = число уникальных конкурентов на всей сетке;
 * - `totalCompetitorsFound` = размер множества уникальных id (совпадает с суммой после дедупа).
 */
export function collectFirstSeenCompetitors(
  items: readonly CompetitorItem[],
  globalSeenIds: Set<string>,
): CompetitorItem[] {
  const out: CompetitorItem[] = [];
  for (const it of items) {
    if (globalSeenIds.has(it.id)) continue;
    globalSeenIds.add(it.id);
    out.push(it);
  }
  return out;
}

export function uniqueCompetitorTotal(globalSeenIds: ReadonlySet<string>): number {
  return globalSeenIds.size;
}
