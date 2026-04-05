import { NextResponse } from "next/server";
import { z } from "zod";

import { TwoGisClientError } from "@/lib/providers/2gis/errors";
import { searchCompetitorsTwoGis } from "@/lib/providers/2gis/search";

const bodySchema = z.object({
  query: z.string().trim().min(1, "Укажите query").max(500),
  lon: z.number().finite().gte(-180).lte(180),
  lat: z.number().finite().gte(-90).lte(90),
  radius: z
    .number()
    .finite()
    .positive()
    .max(40_000, "Радиус не больше 40 000 м (ограничение Places API при текстовом запросе)")
    .refine((n) => Number.isInteger(n), "Радиус должен быть целым числом метров"),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Некорректное тело запроса: ожидался JSON",
        code: "INVALID_BODY",
      },
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

  try {
    const items = await searchCompetitorsTwoGis({
      query: parsed.data.query,
      lon: parsed.data.lon,
      lat: parsed.data.lat,
      radius: parsed.data.radius,
    });

    const count = items.length;
    if (count === 0) {
      return NextResponse.json({
        items: [],
        count: 0,
        empty: true,
        message: "По заданным параметрам объекты не найдены (пустой результат).",
      });
    }

    return NextResponse.json({
      items: [...items],
      count,
      empty: false,
    });
  } catch (e) {
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
