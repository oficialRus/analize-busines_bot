export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region?: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisResult {
  id: string;
  locationId: string;
  score: number;
  summary: string;
  generatedAt: string;
}

export interface HistoryEntry {
  id: string;
  query: string;
  createdAt: string;
  status: AnalysisStatus;
}
