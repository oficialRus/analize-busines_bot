import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchDistrictNames } from "@/lib/geo/overpass";

const bodySchema = z.object({
  osmType: z.enum(["relation", "way", "node"]),
  osmId: z.number().int().positive(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ожидался JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  try {
    const districts = await fetchDistrictNames(parsed.data);
    return NextResponse.json({ districts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Overpass";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
