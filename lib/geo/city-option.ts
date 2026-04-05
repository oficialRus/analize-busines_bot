import type { BoundingBox, CityOption } from "@/types/geo";

export function cityOptionToBoundingBox(city: CityOption): BoundingBox {
  const [south, west, north, east] = city.bbox;
  return { south, west, north, east };
}

export function cityOptionShortLabel(city: CityOption): string {
  const short = city.displayName.split(",").slice(0, 2).join(",").trim();
  return short || city.displayName;
}
