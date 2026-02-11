import { supabase } from "@/integrations/supabase/client";

export interface GridCell {
  lat: number;
  lon: number;
  hourly: {
    time: number[];
    wind_10m: number[];
    wind_120m: number[];
    gusts: number[];
    precip: number[];
    snow: number[];
    temp: number[];
    cloud: number[];
    vis: number[];
  };
}

export interface GridResponse {
  cells: GridCell[];
  step: number;
}

export interface Bounds {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

let cache: { data: GridResponse; key: string; ts: number } | null = null;
const CACHE_MS = 10 * 60 * 1000; // 10 min

function boundsKey(b: Bounds, step: number) {
  return `${b.latMin.toFixed(2)}_${b.latMax.toFixed(2)}_${b.lonMin.toFixed(2)}_${b.lonMax.toFixed(2)}_${step}`;
}

export async function fetchWeatherGrid(
  bounds: Bounds,
  step = 0.25
): Promise<GridResponse> {
  const key = boundsKey(bounds, step);
  if (cache && cache.key === key && Date.now() - cache.ts < CACHE_MS) return cache.data;

  // Clamp to max ~400 points to avoid overloading Open-Meteo
  const latSpan = bounds.latMax - bounds.latMin;
  const lonSpan = bounds.lonMax - bounds.lonMin;
  const totalPoints = Math.ceil(latSpan / step) * Math.ceil(lonSpan / step);
  const effectiveStep = totalPoints > 400 ? Math.max(step, Math.sqrt((latSpan * lonSpan) / 400)) : step;
  const roundedStep = Math.round(effectiveStep * 100) / 100;

  const { data, error } = await supabase.functions.invoke("open-meteo-grid", {
    body: {
      latMin: bounds.latMin,
      latMax: bounds.latMax,
      lonMin: bounds.lonMin,
      lonMax: bounds.lonMax,
      step: roundedStep,
      forecastDays: 7,
    },
  });

  if (error) throw error;
  const result: GridResponse = { cells: (data as any).cells, step: roundedStep };
  cache = { data: result, key, ts: Date.now() };
  return result;
}
