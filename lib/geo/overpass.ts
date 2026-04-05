import { OSM_USER_AGENT } from "@/lib/geo/constants";

export type OsmEntityType = "relation" | "way" | "node";

type OverpassElement = {
  type: string;
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

function areaIdForCity(osmType: OsmEntityType, osmId: number): number | null {
  if (osmType === "relation") return 3_600_000_000 + osmId;
  if (osmType === "way") return 2_400_000_000 + osmId;
  return null;
}

function adminDistrictsInArea(areaId: number): string {
  return `
[out:json][timeout:55];
area(${areaId})->.city;
(
  relation(area.city)["boundary"="administrative"]["admin_level"~"^(7|8|9|10)$"]["name"];
);
out tags;
`.trim();
}

function adminDistrictsInBbox(
  south: number,
  west: number,
  north: number,
  east: number,
): string {
  return `
[out:json][timeout:55];
(
  relation["boundary"="administrative"]["admin_level"~"^(7|8|9|10)$"]["name"](${south},${west},${north},${east});
);
out tags;
`.trim();
}

function suburbNodesInArea(areaId: number): string {
  return `
[out:json][timeout:55];
area(${areaId})->.city;
(
  node(area.city)["place"~"^(suburb|quarter|neighbourhood)$"]["name"];
);
out tags;
`.trim();
}

function pickName(tags: Record<string, string>): string | null {
  const ru = tags["name:ru"]?.trim();
  if (ru) return ru;
  const n = tags.name?.trim();
  return n || null;
}

async function runOverpass(ql: string): Promise<OverpassElement[]> {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": OSM_USER_AGENT,
    },
    body: `data=${encodeURIComponent(ql)}`,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Overpass: HTTP ${res.status}`);
  }

  const json = (await res.json()) as OverpassResponse;
  return json.elements ?? [];
}

function collectNames(elements: OverpassElement[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const el of elements) {
    const tags = el.tags;
    if (!tags) continue;
    const name = pickName(tags);
    if (!name) continue;
    const key = name.toLocaleLowerCase("ru");
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  names.sort((a, b) => a.localeCompare(b, "ru"));
  return names;
}

export async function fetchDistrictNames(input: {
  osmType: OsmEntityType;
  osmId: number;
  bbox: [number, number, number, number];
}): Promise<string[]> {
  const [south, west, north, east] = input.bbox;
  const areaId = areaIdForCity(input.osmType, input.osmId);

  if (areaId !== null) {
    const byArea = await runOverpass(adminDistrictsInArea(areaId));
    const fromArea = collectNames(byArea);
    if (fromArea.length > 0) return fromArea;

    const suburbs = await runOverpass(suburbNodesInArea(areaId));
    const fromSub = collectNames(suburbs);
    if (fromSub.length > 0) return fromSub;
  }

  const byBbox = await runOverpass(adminDistrictsInBbox(south, west, north, east));
  return collectNames(byBbox);
}
