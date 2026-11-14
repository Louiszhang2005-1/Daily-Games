import "server-only";
import worldCountries from "world-countries";
import { feature } from "topojson-client";
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import atlas50 from "world-atlas/countries-50m.json";
import atlas110 from "world-atlas/countries-110m.json";

// Country outlines from Natural Earth (public domain) via world-atlas.
// Each outline is drawn with an equal-area projection centred on the country,
// so shapes keep their true proportions (and countries across the date line stay whole).

const SIZE = 300;
const PAD = 14;

// Prefer the lighter 1:110m atlas; fall back to 1:50m for countries it leaves out.
const byNumeric = new Map<string, Feature<Geometry>>();
for (const atlas of [atlas50, atlas110]) {
  const topo = atlas as unknown as Topology;
  const fc = feature(topo, topo.objects.countries as GeometryCollection) as unknown as FeatureCollection<Geometry>;
  for (const f of fc.features) if (f.id !== undefined) byNumeric.set(String(f.id).padStart(3, "0"), f);
}

const numericOf = new Map(
  (worldCountries as unknown as { cca3: string; ccn3?: string }[]).filter((c) => c.ccn3).map((c) => [c.cca3, c.ccn3!.padStart(3, "0")]),
);

const cache = new Map<string, string | null>();

/** SVG path data (300x300 box) for a country's outline, or null if the atlas has no shape. */
export function countryOutline(cca3: string): string | null {
  if (cache.has(cca3)) return cache.get(cca3)!;
  const num = numericOf.get(cca3);
  const f = num ? byNumeric.get(num) : undefined;
  let d: string | null = null;
  if (f) {
    const [lng, lat] = geoCentroid(f);
    const projection = geoAzimuthalEqualArea().rotate([-lng, -lat]).fitExtent(
      [
        [PAD, PAD],
        [SIZE - PAD, SIZE - PAD],
      ],
      f,
    );
    d = geoPath(projection)(f) ?? null;
    if (d) d = d.replace(/(\d+\.\d{1})\d+/g, "$1"); // trim precision to keep the payload small
  }
  cache.set(cca3, d);
  return d;
}

export const OUTLINE_SIZE = SIZE;
