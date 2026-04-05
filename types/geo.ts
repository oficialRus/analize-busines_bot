/** Общие геотипы домена (карты, сетка, API). */

export type Coordinates = {
  lat: number;
  lon: number;
};

/** Границы прямоугольника: юг, запад, север, восток (градусы WGS84). */
export type BoundingBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

/**
 * Город из поиска OSM/Nominatim (как в ответе GET /api/geo/cities).
 * `bbox`: south, west, north, east (градусы WGS84).
 */
export type CityOption = {
  displayName: string;
  lat: number;
  lon: number;
  osmType: "relation" | "way" | "node";
  osmId: number;
  bbox: [number, number, number, number];
};
