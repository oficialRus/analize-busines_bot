import type { AnalysisPayload } from "@/lib/analysis-request-schema";

export function formatMapPreviewLine(payload: AnalysisPayload): string {
  switch (payload.operation) {
    case "text_search":
    case "geocode":
      return payload.query;
    case "reverse_geocode":
    case "organizations_nearby":
      return `${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`;
  }
}
