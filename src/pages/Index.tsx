import { useState, useEffect, useCallback } from "react";
import DroneMap from "@/components/map/DroneMap";
import WeatherLegend from "@/components/sidebar/WeatherLegend";
import AltitudeSlider from "@/components/sidebar/AltitudeSlider";
import DroneTypeSelector from "@/components/sidebar/DroneTypeSelector";
import ForecastTimeline from "@/components/sidebar/ForecastTimeline";
import { fetchWeatherGrid, type GridResponse } from "@/lib/api/openMeteo";
import type { DroneType } from "@/core/droneZones";
import { RefreshCw, Crosshair } from "lucide-react";

const Index = () => {
  const [grid, setGrid] = useState<GridResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [droneType, setDroneType] = useState<DroneType>("fpv");
  const [useHighAlt, setUseHighAlt] = useState(false);
  const [hourIndex, setHourIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherGrid();
      setGrid(data);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxHours = grid?.cells[0]?.hourly.time.length ?? 72;
  const timestamps = grid?.cells[0]?.hourly.time ?? [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Top bar */}
      <header className="glass-panel-strong flex items-center gap-3 px-4 py-2 rounded-none border-x-0 border-t-0 z-10">
        <Crosshair className="h-5 w-5 text-cyan" />
        <h1 className="font-mono-tactical text-sm font-bold tracking-wider text-cyan">
          DRONE WEATHER MAP
        </h1>
        <span className="text-[10px] text-muted-foreground font-mono-tactical hidden sm:inline">
          Ukraine Theatre • Fly / No-Fly Zones
        </span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono-tactical text-muted-foreground hidden md:inline">
          {new Date().toLocaleString()}
        </span>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title="Refresh weather data"
        >
          <RefreshCw className={`h-4 w-4 text-cyan ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {error && (
            <div className="absolute top-4 left-4 z-[1000] glass-panel p-3 text-destructive font-mono-tactical text-xs max-w-sm">
              {error}
            </div>
          )}
          {loading && !grid && (
            <div className="absolute inset-0 flex items-center justify-center z-[1000]">
              <div className="glass-panel p-6 text-center">
                <RefreshCw className="h-8 w-8 text-cyan mx-auto mb-2 animate-spin" />
                <div className="font-mono-tactical text-sm text-foreground">Loading weather grid…</div>
              </div>
            </div>
          )}
          {grid && (
            <DroneMap
              cells={grid.cells}
              droneType={droneType}
              hourIndex={hourIndex}
              useHighAlt={useHighAlt}
              step={0.5}
            />
          )}
        </div>

        {/* Right sidebar */}
        <aside className="w-64 flex flex-col gap-2 p-2 overflow-y-auto border-l border-border bg-background/50">
          <WeatherLegend />
          <DroneTypeSelector selected={droneType} onChange={setDroneType} />
          <AltitudeSlider useHighAlt={useHighAlt} onChange={setUseHighAlt} />
          <ForecastTimeline
            hourIndex={hourIndex}
            maxHours={maxHours}
            timestamps={timestamps}
            onChange={setHourIndex}
          />
        </aside>
      </div>
    </div>
  );
};

export default Index;
