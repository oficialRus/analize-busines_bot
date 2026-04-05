import { NextRequest, NextResponse } from "next/server";

import { searchCities } from "@/lib/geo/nominatim";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await searchCities(q);
    return NextResponse.json({ cities });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка поиска";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
