import { CARS, type CarProfile } from "@/lib/cars";

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

export type DecodedVin = {
  vin: string;
  make?: string;
  model?: string;
  modelYear?: string;
  bodyClass?: string;
  engineModel?: string;
  fuelType?: string;
  manufacturer?: string;
  plantCountry?: string;
  plant?: string;
  raw: Record<string, string>;
  matchedCar?: CarProfile;
};

export function isValidVin(vin: string): boolean {
  return VIN_REGEX.test(vin.trim());
}

function findMatch(make?: string, model?: string): CarProfile | undefined {
  if (!make) return undefined;
  const m = (make + " " + (model || "")).toLowerCase();
  return CARS.find((c) => {
    const target = c.model.toLowerCase();
    return target.includes((make || "").toLowerCase()) ||
      m.includes(target.split(" ")[0]);
  });
}

/**
 * Decode a VIN using NHTSA vPIC API. The endpoint is public (no key) and HTTPS.
 * Returns null when the response carries no useful info.
 */
export async function decodeVin(vin: string, signal?: AbortSignal): Promise<DecodedVin> {
  const v = vin.trim().toUpperCase();
  if (!isValidVin(v)) {
    throw new Error("Invalid VIN format");
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(v)}?format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as { Results?: Record<string, string>[] };
  const row = json.Results && json.Results[0];
  if (!row) {
    throw new Error("Empty response");
  }

  const make = (row.Make || "").trim() || undefined;
  const model = (row.Model || "").trim() || undefined;
  const matched = findMatch(make, model);

  return {
    vin: v,
    make,
    model,
    modelYear: (row.ModelYear || "").trim() || undefined,
    bodyClass: (row.BodyClass || "").trim() || undefined,
    engineModel:
      [row.EngineModel, row.DisplacementL ? `${row.DisplacementL} L` : "", row.EngineCylinders ? `${row.EngineCylinders} цил.` : ""]
        .filter(Boolean)
        .join(" · ")
        .trim() || undefined,
    fuelType: (row.FuelTypePrimary || "").trim() || undefined,
    manufacturer: (row.Manufacturer || "").trim() || undefined,
    plantCountry: (row.PlantCountry || "").trim() || undefined,
    plant: [row.PlantCity, row.PlantCompanyName].filter(Boolean).join(" · ").trim() || undefined,
    raw: row,
    matchedCar: matched,
  };
}
