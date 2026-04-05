import { z } from "zod";

/** Код meta / total в ответах 2GIS иногда приходит строкой. */
const metaCodeSchema = z.union([z.number(), z.string()]).transform((v) => {
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : -1;
});

/** Сырой объект в `result.items` ответа GET /3.0/items (минимально нужные поля + passthrough). */
export const twoGisItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string().optional(),
    type: z.string().optional(),
    point: z.preprocess((val) => {
      if (val == null || val === "") return undefined;
      if (typeof val === "string") return val;
      if (typeof val === "object" && val !== null && "lat" in val && "lon" in val) {
        const o = val as { lat: unknown; lon: unknown };
        const lat = typeof o.lat === "number" ? o.lat : Number(String(o.lat).replace(",", "."));
        const lon = typeof o.lon === "number" ? o.lon : Number(String(o.lon).replace(",", "."));
        if (Number.isFinite(lat) && Number.isFinite(lon)) return `${lon},${lat}`;
      }
      return undefined;
    }, z.string().optional()),
    address_name: z.string().optional(),
    full_address_name: z.string().optional(),
    address: z
      .object({
        building_name: z.string().optional(),
      })
      .passthrough()
      .optional(),
    reviews: z
      .object({
        rating: z.union([z.string(), z.number()]).optional(),
        review_count: z.union([z.string(), z.number()]).optional(),
        general_review_count: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type TwoGisRawItem = z.infer<typeof twoGisItemSchema>;

export const twoGisMetaSchema = z
  .object({
    code: metaCodeSchema,
    api_version: z.string().optional(),
    error: z
      .object({
        message: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type TwoGisMeta = z.infer<typeof twoGisMetaSchema>;

export const twoGisItemsResponseSchema = z.object({
  meta: twoGisMetaSchema,
  result: z
    .object({
      total: z
        .union([z.number(), z.string()])
        .optional()
        .transform((v) => {
          if (v === undefined || v === null) return 0;
          const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, ""));
          return Number.isFinite(n) ? n : 0;
        }),
      items: z
        .union([z.array(twoGisItemSchema), z.null(), z.undefined()])
        .transform((v) => v ?? []),
    })
    .passthrough()
    .optional()
    .transform((r) => r ?? { total: 0 as number, items: [] as z.infer<typeof twoGisItemSchema>[] }),
});

export type TwoGisItemsResponse = z.infer<typeof twoGisItemsResponseSchema>;
