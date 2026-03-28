import type { AnalysisPayload } from "@/lib/analysis-request-schema";
import type { GeoQueryResponse } from "@/lib/mock-geo-response";

export function formatResultsDebugJson(
  request: AnalysisPayload,
  response: GeoQueryResponse,
): string {
  return JSON.stringify({ request, response }, null, 2);
}

export function formatErrorDebugJson(
  request: AnalysisPayload,
  error: { message: string },
): string {
  return JSON.stringify({ request, error }, null, 2);
}
