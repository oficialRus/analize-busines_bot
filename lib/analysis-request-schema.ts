import { z } from "zod";

export type GeoProvider = "2gis" | "yandex";

export type GeoOperation =
  | "text_search"
  | "geocode"
  | "reverse_geocode"
  | "organizations_nearby";

export type AnalysisFormValues = {
  provider: GeoProvider;
  operation: GeoOperation;
  query: string;
  latitude: string;
  longitude: string;
  radius: string;
  limit: string;
};

export type AnalysisPayload =
  | {
      provider: GeoProvider;
      operation: "text_search";
      query: string;
      limit: number;
    }
  | {
      provider: GeoProvider;
      operation: "geocode";
      query: string;
      limit: number;
    }
  | {
      provider: GeoProvider;
      operation: "reverse_geocode";
      latitude: number;
      longitude: number;
      limit: number;
    }
  | {
      provider: GeoProvider;
      operation: "organizations_nearby";
      latitude: number;
      longitude: number;
      radius: number;
      limit: number;
    };

export const defaultAnalysisFormValues: AnalysisFormValues = {
  provider: "2gis",
  operation: "text_search",
  query: "",
  latitude: "55.7558",
  longitude: "37.6173",
  radius: "500",
  limit: "10",
};

export const analysisFormPresets: { id: string; label: string; values: AnalysisFormValues }[] =
  [
    {
      id: "preset-text",
      label: "Поиск: кафе",
      values: {
        provider: "yandex",
        operation: "text_search",
        query: "кафе Тверская Москва",
        latitude: "55.7558",
        longitude: "37.6173",
        radius: "500",
        limit: "15",
      },
    },
    {
      id: "preset-reverse",
      label: "Обратное гео: СПб",
      values: {
        provider: "2gis",
        operation: "reverse_geocode",
        query: "",
        latitude: "59.93428",
        longitude: "30.3351",
        radius: "500",
        limit: "5",
      },
    },
    {
      id: "preset-orgs",
      label: "Организации рядом",
      values: {
        provider: "2gis",
        operation: "organizations_nearby",
        query: "",
        latitude: "55.751244",
        longitude: "37.618423",
        radius: "350",
        limit: "20",
      },
    },
  ];

const baseFields = z.object({
  provider: z.enum(["2gis", "yandex"]),
  operation: z.enum([
    "text_search",
    "geocode",
    "reverse_geocode",
    "organizations_nearby",
  ]),
  query: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  radius: z.string(),
  limit: z.string(),
});

export const analysisFormSchema = baseFields
  .superRefine((data, ctx) => {
    const limitStr = data.limit.trim();
    const limitNum = Number(limitStr);
    if (limitStr === "" || !Number.isFinite(limitNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["limit"],
        message: "Введите целое число",
      });
    } else if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["limit"],
        message: "Лимит от 1 до 100",
      });
    }

    if (data.operation === "text_search" || data.operation === "geocode") {
      if (!data.query.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["query"],
          message: "Обязательное поле",
        });
      }
    }

    if (
      data.operation === "reverse_geocode" ||
      data.operation === "organizations_nearby"
    ) {
      const latStr = data.latitude.trim();
      if (latStr === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["latitude"],
          message: "Укажите широту",
        });
      } else {
        const lat = Number(latStr);
        if (!Number.isFinite(lat)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["latitude"],
            message: "Некорректное число",
          });
        } else if (lat < -90 || lat > 90) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["latitude"],
            message: "Широта в диапазоне −90…90",
          });
        }
      }

      const lngStr = data.longitude.trim();
      if (lngStr === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["longitude"],
          message: "Укажите долготу",
        });
      } else {
        const lng = Number(lngStr);
        if (!Number.isFinite(lng)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["longitude"],
            message: "Некорректное число",
          });
        } else if (lng < -180 || lng > 180) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["longitude"],
            message: "Долгота в диапазоне −180…180",
          });
        }
      }
    }

    if (data.operation === "organizations_nearby") {
      const rStr = data.radius.trim();
      if (rStr === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["radius"],
          message: "Укажите радиус (метры)",
        });
      } else {
        const r = Number(rStr);
        if (!Number.isFinite(r) || r <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["radius"],
            message: "Радиус должен быть больше 0",
          });
        } else if (r > 50_000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["radius"],
            message: "Максимум 50 000 м",
          });
        }
      }
    }
  })
  .transform((data): AnalysisPayload => {
    const limit = Number(data.limit.trim());
    switch (data.operation) {
      case "text_search":
        return {
          provider: data.provider,
          operation: "text_search",
          query: data.query.trim(),
          limit,
        };
      case "geocode":
        return {
          provider: data.provider,
          operation: "geocode",
          query: data.query.trim(),
          limit,
        };
      case "reverse_geocode":
        return {
          provider: data.provider,
          operation: "reverse_geocode",
          latitude: Number(data.latitude.trim()),
          longitude: Number(data.longitude.trim()),
          limit,
        };
      case "organizations_nearby":
        return {
          provider: data.provider,
          operation: "organizations_nearby",
          latitude: Number(data.latitude.trim()),
          longitude: Number(data.longitude.trim()),
          radius: Number(data.radius.trim()),
          limit,
        };
    }
  });
