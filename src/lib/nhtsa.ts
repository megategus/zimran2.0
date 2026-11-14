import { db } from "./db";
import { toCar } from "./guest";
import type { Car, Recall } from "./types";

export type DecodedCar = Pick<Car, "year" | "make" | "model" | "trim" | "engine" | "specs">;

const VIN = /^[A-HJ-NPR-Z0-9]{17}$/;
export const isValidVin = (vin: string) => VIN.test(vin);

// vPIC field -> label kept in car.specs (empty values dropped).
const SPEC_FIELDS: Record<string, string> = {
  BodyClass: "Body",
  DriveType: "Drive",
  TransmissionStyle: "Transmission",
  FuelTypePrimary: "Fuel",
  ElectrificationLevel: "Electrification",
  BrakeSystemType: "Brakes",
  EngineCylinders: "Cylinders",
  DisplacementL: "Displacement (L)",
  EngineHP: "Horsepower",
  Doors: "Doors",
  PlantCountry: "Built in",
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function engineLine(r: Record<string, unknown>): string | null {
  const l = Number(str(r.DisplacementL));
  const cyl = str(r.EngineCylinders);
  const layout = str(r.EngineConfiguration).startsWith("V") ? "V" : "I";
  const parts = [l ? `${l.toFixed(1)}L` : "", cyl ? `${layout}${cyl}` : ""].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

// vPIC ErrorCode is a comma list; "0" (alone or first) means a clean decode.
export function parseVpic(json: unknown): DecodedCar | null {
  const r = (json as { Results?: Record<string, unknown>[] })?.Results?.[0];
  if (!r) return null;
  const code = str(r.ErrorCode).split(",")[0];
  const make = str(r.Make);
  const year = Number(str(r.ModelYear));
  if (code !== "0" || !make || !year) return null;
  const specs: Record<string, string> = {};
  for (const [field, label] of Object.entries(SPEC_FIELDS)) {
    const v = str(r[field]);
    if (v && v !== "Not Applicable") specs[label] = v;
  }
  if (specs["Displacement (L)"]) specs["Displacement (L)"] = Number(specs["Displacement (L)"]).toFixed(1);
  return { year, make, model: str(r.Model), trim: str(r.Trim) || null, engine: engineLine(r), specs };
}

export function parseRecalls(json: unknown): Recall[] {
  const rows = (json as { results?: Record<string, unknown>[] })?.results;
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    campaign: str(r.NHTSACampaignNumber),
    component: str(r.Component),
    summary: str(r.Summary),
    remedy: str(r.Remedy),
  }));
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!res.ok) throw new Error(`NHTSA ${res.status}`);
  return res.json();
}

export async function decodeVin(vin: string): Promise<DecodedCar | null> {
  return parseVpic(await getJson(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`));
}

// Recalls are nice to have: a network failure gives [] instead of blocking onboarding.
export async function fetchRecalls(make: string, model: string, year: number): Promise<Recall[]> {
  const q = new URLSearchParams({ make, model, modelYear: String(year) });
  try {
    return parseRecalls(await getJson(`https://api.nhtsa.gov/recalls/recallsByVehicle?${q}`));
  } catch {
    return [];
  }
}

async function insertCar(guestId: string, vin: string | null, car: DecodedCar): Promise<Car> {
  const recalls = await fetchRecalls(car.make, car.model, car.year);
  const { data, error } = await db()
    .from("cars")
    .insert({ guest_id: guestId, vin, ...car, recalls })
    .select()
    .single();
  if (error) throw error;
  return toCar(data);
}

export async function createCarFromVin(guestId: string, vin: string): Promise<Car | null> {
  const decoded = await decodeVin(vin);
  return decoded ? insertCar(guestId, vin, decoded) : null;
}

// `extra` lets callers that know more (the demo seed) set trim, engine and specs; recalls are always fetched live.
export async function createCarFromYmm(
  guestId: string, year: number, make: string, model: string,
  extra: Partial<Pick<Car, "trim" | "engine" | "specs">> = {},
): Promise<Car> {
  return insertCar(guestId, null, { year, make: make.toUpperCase(), model, trim: extra.trim ?? null, engine: extra.engine ?? null, specs: extra.specs ?? {} });
}
