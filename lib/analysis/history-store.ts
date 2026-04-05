import "server-only";

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import type {
  AnalysisHistoryListItem,
  CityGridAnalysisInput,
  CityGridAnalysisResult,
} from "@/types/analysis";

function resolveDbFilePath(): string {
  const override = process.env.ANALYSIS_DB_PATH?.trim();
  if (override) return override;
  return path.join(process.cwd(), "data", "analysis-history.db");
}

let dbSingleton: Database.Database | null = null;

function openDb(): Database.Database {
  if (dbSingleton) return dbSingleton;
  const filePath = resolveDbFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      city TEXT NOT NULL,
      query TEXT NOT NULL,
      provider TEXT NOT NULL,
      cell_size_meters INTEGER NOT NULL,
      radius_meters INTEGER NOT NULL,
      bbox_json TEXT NOT NULL,
      result_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
  `);
  dbSingleton = db;
  return db;
}

export function saveGridAnalysis(input: CityGridAnalysisInput, result: CityGridAnalysisResult): void {
  const db = openDb();
  db.prepare(
    `INSERT OR REPLACE INTO analyses (
      id, created_at, city, query, provider, cell_size_meters, radius_meters, bbox_json, result_json
    ) VALUES (
      @id, @created_at, @city, @query, @provider, @cell_size_meters, @radius_meters, @bbox_json, @result_json
    )`,
  ).run({
    id: result.requestId,
    created_at: result.generatedAt,
    city: result.city,
    query: result.query,
    provider: result.provider,
    cell_size_meters: input.cellSizeMeters,
    radius_meters: input.radiusMeters,
    bbox_json: JSON.stringify(result.bbox),
    result_json: JSON.stringify(result),
  });
}

export function listGridAnalysisHistory(limit = 50): AnalysisHistoryListItem[] {
  const db = openDb();
  const rows = db
    .prepare(
      `SELECT id, created_at, city, query, result_json
       FROM analyses
       ORDER BY datetime(created_at) DESC
       LIMIT @limit`,
    )
    .all({ limit: Math.min(200, Math.max(1, limit)) }) as {
    id: string;
    created_at: string;
    city: string;
    query: string;
    result_json: string;
  }[];

  return rows.map((r) => {
    const parsed = JSON.parse(r.result_json) as CityGridAnalysisResult;
    return {
      id: r.id,
      createdAt: r.created_at,
      city: r.city,
      query: r.query,
      totalCells: parsed.totalCells,
      totalCompetitorsFound: parsed.totalCompetitorsFound,
    };
  });
}

export function getGridAnalysisById(id: string): CityGridAnalysisResult | null {
  const db = openDb();
  const row = db
    .prepare(`SELECT result_json FROM analyses WHERE id = ?`)
    .get(id) as { result_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.result_json) as CityGridAnalysisResult;
}
