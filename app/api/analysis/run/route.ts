import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeCityByGrid } from "@/lib/analysis/analyze-city";
import { AnalysisValidationError } from "@/lib/analysis/errors";
import { saveGridAnalysis } from "@/lib/analysis/history-store";
import { TwoGisClientError } from "@/lib/providers/2gis/errors";
import type { CityGridAnalysisInput } from "@/types/analysis";

export const runtime = "nodejs";

const bboxSchema = z.object({
  west: z.number().finite().gte(-180).lte(180),
  south: z.number().finite().gte(-90).lte(90),
  east: z.number().finite().gte(-180).lte(180),
  north: z.number().finite().gte(-90).lte(90),
});

const bodySchema = z.object({
  provider: z.enum(["2gis", "yandex"]),
  city: z.string().trim().min(1, "Укажите город").max(256),
  query: z.string().trim().min(1, "Укажите запрос").max(256),
  bbox: bboxSchema,
  cellSizeMeters: z
    .number()
    .finite()
    .int()
    .positive()
    .max(50_000, "cellSizeMeters слишком велик"),
  radiusMeters: z
    .number()
    .finite()
    .int()
    .positive()
    .max(50_000, "radiusMeters слишком велик"),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Ожидался JSON", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Проверьте поля запроса";
    return NextResponse.json(
      {
        error: first,
        code: "INVALID_BODY",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const p = parsed.data;
  const input: CityGridAnalysisInput = {
    provider: p.provider,
    city: p.city,
    query: p.query,
    bbox: {
      south: p.bbox.south,
      west: p.bbox.west,
      north: p.bbox.north,
      east: p.bbox.east,
    },
    cellSizeMeters: p.cellSizeMeters,
    radiusMeters: p.radiusMeters,
  };

  try {
    const result = await analyzeCityByGrid(input);
    try {
      saveGridAnalysis(input, result);
    } catch (persistErr) {
      console.error("[analysis/run] history save failed:", persistErr);
    }
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AnalysisValidationError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    }
    if (e instanceof TwoGisClientError) {
      if (e.code === "MISSING_API_KEY") {
        return NextResponse.json({ error: e.message, code: e.code }, { status: 503 });
      }
      if (e.code === "TIMEOUT") {
        return NextResponse.json({ error: e.message, code: e.code }, { status: 504 });
      }
      if (e.code === "INVALID_RESPONSE") {
        return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
      }
      if (e.code === "NETWORK") {
        return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
      }
      return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
    }
    throw e;
  }
}
