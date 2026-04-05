import { z } from "zod";

/** Сырой объект в `result.items` ответа GET /3.0/items (минимально нужные поля + passthrough). */
export const twoGisItemSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    point: z.string().optional(),
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
    code: z.number(),
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
  result: z.object({
    total: z.number(),
    items: z
      .union([z.array(twoGisItemSchema), z.null(), z.undefined()])
      .transform((v) => v ?? []),
  }),
});

export type TwoGisItemsResponse = z.infer<typeof twoGisItemsResponseSchema>;
