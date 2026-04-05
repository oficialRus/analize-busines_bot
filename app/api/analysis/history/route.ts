import { NextResponse } from "next/server";

import { listGridAnalysisHistory } from "@/lib/analysis/history-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;
  const safeLimit = Number.isFinite(limit) ? limit : 50;

  try {
    const items = listGridAnalysisHistory(safeLimit);
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Не удалось прочитать историю";
    return NextResponse.json({ error: message, code: "HISTORY_READ_FAILED" }, { status: 500 });
  }
}
