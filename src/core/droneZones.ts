export type DroneType = "fpv" | "geran2" | "orlan10";
export type ZoneLevel = "GREEN" | "YELLOW" | "RED";

export interface ZoneClassification {
  level: ZoneLevel;
  reason: string;
}

interface Thresholds {
  windGreen: number;
  windYellow: number;
  gustGreen: number;
  gustYellow: number;
  precipGreen: number;
  precipYellow: number;
  snowGreen: number;
  snowYellow: number;
}

const THRESHOLDS: Record<DroneType, Thresholds> = {
  fpv: {
    windGreen: 8,
    windYellow: 12,
    gustGreen: 10,
    gustYellow: 15,
    precipGreen: 0.3,
    precipYellow: 0.8,
    snowGreen: 0.1,
    snowYellow: 0.5,
  },
  orlan10: {
    windGreen: 10,
    windYellow: 15,
    gustGreen: 14,
    gustYellow: 20,
    precipGreen: 0.5,
    precipYellow: 1.5,
    snowGreen: 0.3,
    snowYellow: 1.0,
  },
  geran2: {
    windGreen: 14,
    windYellow: 20,
    gustGreen: 18,
    gustYellow: 25,
    precipGreen: 1.0,
    precipYellow: 2.0,
    snowGreen: 0.5,
    snowYellow: 1.5,
  },
};

export const DRONE_LABELS: Record<DroneType, string> = {
  fpv: "FPV",
  geran2: "Geran-2 / Shahed",
  orlan10: "Orlan-10",
};

export function classifyZone(
  wind: number,
  gusts: number,
  precip: number,
  snow: number,
  droneType: DroneType
): ZoneClassification {
  const t = THRESHOLDS[droneType];
  const reasons: string[] = [];
  let level: ZoneLevel = "GREEN";

  const promote = (to: ZoneLevel, reason: string) => {
    reasons.push(reason);
    if (to === "RED" || (to === "YELLOW" && level === "GREEN")) level = to;
  };

  // Wind
  if (wind >= t.windYellow) promote("RED", `wind ${wind.toFixed(1)} m/s`);
  else if (wind >= t.windGreen) promote("YELLOW", `wind ${wind.toFixed(1)} m/s`);

  // Gusts
  if (gusts >= t.gustYellow) promote("RED", `gusts ${gusts.toFixed(1)} m/s`);
  else if (gusts >= t.gustGreen) promote("YELLOW", `gusts near limit`);

  // Precip
  if (precip >= t.precipYellow) promote("RED", `precip ${precip.toFixed(1)} mm/h`);
  else if (precip >= t.precipGreen) promote("YELLOW", `light precip`);

  // Snow
  if (snow >= t.snowYellow) promote("RED", `snow ${snow.toFixed(1)} cm/h`);
  else if (snow >= t.snowGreen) promote("YELLOW", `light snow`);

  return {
    level,
    reason: reasons.length ? reasons.join(", ") : "conditions clear",
  };
}

export function classifyAllDrones(
  wind: number,
  gusts: number,
  precip: number,
  snow: number
): Record<DroneType, ZoneClassification> {
  return {
    fpv: classifyZone(wind, gusts, precip, snow, "fpv"),
    orlan10: classifyZone(wind, gusts, precip, snow, "orlan10"),
    geran2: classifyZone(wind, gusts, precip, snow, "geran2"),
  };
}
