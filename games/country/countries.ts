import "server-only";
import worldCountries from "world-countries";
import type { Lang } from "@/shared/game";

// Country facts from the world-countries dataset (github.com/mledoze/countries, ODbL 1.0).
// Used for guess names/aliases, distance feedback and automatic fact checks.

export type Tier = "common" | "medium" | "rare" | "excluded";

export interface Country {
  id: string; // ISO alpha-3
  name: Record<Lang, string>;
  aliases: string[]; // both languages, plus abbreviations
  capital: string[];
  demonyms: string[];
  latlng: [number, number];
  borders: string[];
  area: number;
  areaRank: number;
  landlocked: boolean;
  region: string;
  subregion: string;
  tier: Tier;
}

export const REPEAT_DAYS: Record<Exclude<Tier, "excluded">, number> = { common: 60, medium: 120, rare: 365 };
export const TIER_WEIGHTS: Record<Exclude<Tier, "excluded">, number> = { common: 0.4, medium: 0.45, rare: 0.15 };

const COMMON = new Set(
  "USA CAN GBR AUS FRA DEU ITA ESP PRT MEX BRA ARG CHL PER COL JPN CHN IND RUS EGY ZAF NGA KEN MAR TUR GRC NLD BEL CHE SWE NOR FIN DNK IRL NZL KOR THA VNM IDN PHL SAU ISR POL UKR CUB JAM ISL".split(" "),
);

// Known but hard to place, or small: only when the clues make it fair.
const RARE = new Set(
  "AFG ALB ARM AZE BHR BTN BRN BDI CPV CAF TCD COG COD DJI GNQ ERI SWZ GAB GMB GIN GNB GUY KGZ LAO LSO LBR MWI MLI MRT MDA MNG MNE NER PRK MKD OMN PNG PRY RWA SLE SLB SOM SSD SUR TJK TLS TGO TKM TUV VUT YEM ZMB BLR BIH BFA BEN BWA CMR KAZ UZB QAT KWT LBN SYR JOR NPL LKA BGD MMR KHM MDG MOZ AGO NAM ZWE UGA TZA ETH SDN LBY TUN DZA SEN CIV GHA HTI DOM HND NIC SLV GTM BLZ CRI PAN BOL ECU VEN URY FJI".split(" "),
);
// Some of those are better known; keep them medium.
for (const id of "KAZ UZB QAT KWT LBN SYR JOR NPL LKA BGD MMR KHM MDG MOZ AGO NAM ZWE UGA TZA ETH SDN LBY TUN DZA SEN CIV GHA HTI DOM HND NIC SLV GTM CRI PAN BOL ECU VEN URY FJI".split(" "))
  RARE.delete(id);

// Microstates and near-unguessable places are never picked (still valid guesses).
const EXCLUDED_AREA_KM2 = 1000;

const EXTRA_ALIASES: Record<string, string[]> = {
  USA: ["USA", "US", "America", "United States of America", "Etats-Unis", "Amerique"],
  GBR: ["UK", "Britain", "Great Britain", "England", "Scotland", "Wales", "Royaume-Uni", "Angleterre", "Grande-Bretagne"],
  KOR: ["South Korea", "Korea", "Coree du Sud", "Coree"],
  PRK: ["North Korea", "Coree du Nord"],
  COD: ["DRC", "DR Congo", "Congo-Kinshasa", "RDC"],
  COG: ["Congo-Brazzaville", "Republic of the Congo"],
  CIV: ["Ivory Coast", "Cote d'Ivoire"],
  CZE: ["Czech Republic", "Czechia", "Tchequie", "Republique tcheque"],
  NLD: ["Holland", "Netherlands", "Pays-Bas", "Hollande"],
  ARE: ["UAE", "Emirates", "EAU", "Emirats arabes unis"],
  MMR: ["Burma", "Birmanie"],
  SWZ: ["Swaziland", "Eswatini"],
  TLS: ["East Timor", "Timor oriental"],
  MKD: ["Macedonia", "Macedoine"],
  VAT: ["Vatican", "Holy See"],
  RUS: ["Russia", "Russie"],
};

const MAJOR = (worldCountries as unknown as RawCountry[]).filter(
  (c) => c.unMember || ["TWN", "XKX", "PSE", "VAT"].includes(c.cca3),
);

interface RawCountry {
  cca3: string;
  name: { common: string; official: string };
  translations: Record<string, { common: string; official: string }>;
  altSpellings: string[];
  capital?: string[];
  demonyms?: Record<string, { m: string; f: string }>;
  latlng: [number, number];
  borders?: string[];
  area: number;
  landlocked: boolean;
  region: string;
  subregion?: string;
  unMember: boolean;
}

const byArea = MAJOR.slice().sort((a, b) => b.area - a.area);

export const COUNTRIES: Country[] = MAJOR.map((c) => {
  const fr = c.translations.fra?.common ?? c.name.common;
  const tier: Tier =
    c.area < EXCLUDED_AREA_KM2 && !COMMON.has(c.cca3)
      ? "excluded"
      : COMMON.has(c.cca3)
        ? "common"
        : RARE.has(c.cca3)
          ? "rare"
          : "medium";
  const aliases = Array.from(
    new Set([
      c.name.common,
      c.name.official,
      fr,
      c.translations.fra?.official ?? "",
      ...c.altSpellings,
      ...(EXTRA_ALIASES[c.cca3] ?? []),
    ]),
  ).filter(Boolean);
  return {
    id: c.cca3,
    name: { en: c.name.common, fr },
    aliases,
    capital: c.capital ?? [],
    demonyms: Object.values(c.demonyms ?? {}).flatMap((d) => [d.m, d.f]),
    latlng: c.latlng,
    borders: (c.borders ?? []).filter((b) => MAJOR.some((m) => m.cca3 === b)),
    area: c.area,
    areaRank: byArea.findIndex((x) => x.cca3 === c.cca3) + 1,
    landlocked: c.landlocked,
    region: c.region,
    subregion: c.subregion ?? "",
    tier,
  };
});

export const COUNTRY_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]));

/** Great-circle distance in km. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Compass bearing from a to b, in degrees (0 = north). */
export function bearing(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return (Math.atan2(y, x) * 180) / Math.PI + 360;
}
