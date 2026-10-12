// SERVER-ONLY: imports ~350 KB of data. Do not import this file from client components; call it from an API route instead.

import rawDistricts from "@/data/geo/districts2011.json";
import rawPincodes from "@/data/geo/pincodes.json";
import rawAliases from "@/data/geo/districtAliases.json";

export interface District2011 {
  stateCode: string;
  stateName: string;
  districtCode: string;
  name: string;
  populationTotal: number;
  areaTotalSqKm: number;
  populationRural: number;
  areaRuralSqKm: number;
  densityPerSqKm: number;
  densityBasis: "rural" | "total";
}

export interface PincodeMapping {
  districtKey: string;
  postalDistrict: string;
  mappedVia: "direct" | "spelling" | "typo" | "postalDivision" | "newDistrict";
  ambiguous?: boolean;
}

export interface DistrictAlias {
  state: string;
  postal: string;
  census2011: string;
  kind: "spelling" | "typo" | "postalDivision" | "newDistrict";
  note: string;
}

export interface GeoInfo {
  pincode: string;
  districtKey: string;
  districtName: string;
  stateName: string;
  densityPerSqKm: number;
  densityBasis: "rural" | "total";
  populationTotal: number;
  mappedVia: "direct" | "spelling" | "typo" | "postalDivision" | "newDistrict";
  mappingNote?: string;
  ambiguous?: boolean;
  source: "Census 2011 (latest official count)";
}

const districts = rawDistricts as Record<string, District2011>;
const pincodes = rawPincodes as Record<string, PincodeMapping>;
const aliases = rawAliases as DistrictAlias[];

// Pre-index alias notes by uppercase postal name for fast note lookups
const aliasNotes = new Map<string, string>();
for (const a of aliases) {
  if (a.note && (a.kind === "newDistrict" || a.kind === "postalDivision")) {
    aliasNotes.set(a.postal.trim().toUpperCase(), a.note);
  }
}

/**
 * Looks up official 2011 demographic and district metrics for a given Indian pincode.
 * Covers pilot states: Maharashtra (27), Tamil Nadu (33), NCT of Delhi (07).
 * Pure lookup, zero network requests, zero side-effects.
 *
 * @param pincode 6-digit postal code string
 * @returns GeoInfo object if pincode maps to a known district in scope, else null.
 */
export function lookupPincode(pincode: string): GeoInfo | null {
  const cleanPin = pincode.trim();
  const mapping = pincodes[cleanPin];
  if (!mapping) return null;

  const district = districts[mapping.districtKey];
  if (!district) return null;

  let mappingNote: string | undefined;
  if (mapping.mappedVia === "newDistrict" || mapping.mappedVia === "postalDivision") {
    mappingNote = aliasNotes.get(mapping.postalDistrict.trim().toUpperCase());
  }

  const result: GeoInfo = {
    pincode: cleanPin,
    districtKey: mapping.districtKey,
    districtName: district.name,
    stateName: district.stateName,
    densityPerSqKm: district.densityPerSqKm,
    densityBasis: district.densityBasis,
    populationTotal: district.populationTotal,
    mappedVia: mapping.mappedVia,
    source: "Census 2011 (latest official count)",
  };

  if (mappingNote) {
    result.mappingNote = mappingNote;
  }
  if (mapping.ambiguous) {
    result.ambiguous = true;
  }

  return result;
}
