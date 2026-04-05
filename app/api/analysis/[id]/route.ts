import { NextResponse } from "next/server";

import { getGridAnalysisById } from "@/lib/analysis/history-store";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Некорректный id", code: "INVALID_ID" }, { status: 400 });
  }

  try {
    const result = getGridAnalysisById(id.trim());
    if (!result) {
      return NextResponse.json({ error: "Анализ не найден", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Не удалось загрузить анализ";
    return NextResponse.json({ error: message, code: "HISTORY_READ_FAILED" }, { status: 500 });
  }
}
