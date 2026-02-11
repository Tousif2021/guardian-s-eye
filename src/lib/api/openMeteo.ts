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
  lats: number[];
  lons: number[];
}

let cache: { data: GridResponse; ts: number } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

export async function fetchWeatherGrid(
  latMin = 47.0,
  latMax = 52.0,
  lonMin = 31.0,
  lonMax = 40.0,
  step = 0.5
): Promise<GridResponse> {
  if (cache && Date.now() - cache.ts < CACHE_MS) return cache.data;

  const { data, error } = await supabase.functions.invoke("open-meteo-grid", {
    body: { latMin, latMax, lonMin, lonMax, step, forecastDays: 3 },
  });

  if (error) throw error;
  cache = { data: data as GridResponse, ts: Date.now() };
  return data as GridResponse;
}
