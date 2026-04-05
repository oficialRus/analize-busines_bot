import { OSM_USER_AGENT } from "@/lib/geo/constants";

export type NominatimCityHit = {
  displayName: string;
  lat: number;
  lon: number;
  osmType: "relation" | "way" | "node";
  osmId: number;
  /** south, west, north, east */
  bbox: [number, number, number, number];
};

type NominatimRaw = {
  display_name: string;
  lat: string;
  lon: string;
  osm_id: number;
  osm_type: string;
  boundingbox?: string[];
  class?: string;
  type?: string;
  importance?: number;
};

function parseBbox(raw: NominatimRaw): [number, number, number, number] | null {
  const b = raw.boundingbox;
  if (!b || b.length < 4) return null;
  const south = Number(b[0]);
  const north = Number(b[1]);
  const west = Number(b[2]);
  const east = Number(b[3]);
  if (![south, north, west, east].every(Number.isFinite)) return null;
  return [south, west, north, east];
}

function isCityLike(raw: NominatimRaw): boolean {
  const t = raw.type ?? "";
  const c = raw.class ?? "";
  if (c === "place" && ["city", "town", "municipality"].includes(t)) return true;
  if (c === "boundary" && t === "administrative") {
    const addr = (raw as { address?: Record<string, string> }).address;
    if (addr?.city || addr?.town || addr?.municipality) return true;
  }
  return false;
}

export async function searchCities(query: string): Promise<NominatimCityHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "12");
  url.searchParams.set("accept-language", "ru,en");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": OSM_USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Nominatim: HTTP ${res.status}`);
  }

  const data = (await res.json()) as NominatimRaw[];
  if (!Array.isArray(data)) return [];

  const out: NominatimCityHit[] = [];
  for (const raw of data) {
    if (!isCityLike(raw)) continue;
    const ot = raw.osm_type;
    if (ot !== "relation" && ot !== "way" && ot !== "node") continue;
    const bbox = parseBbox(raw);
    if (!bbox) continue;
    out.push({
      displayName: raw.display_name,
      lat: Number(raw.lat),
      lon: Number(raw.lon),
      osmType: ot,
      osmId: raw.osm_id,
      bbox,
    });
  }

  return out;
}
