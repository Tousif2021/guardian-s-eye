import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { TacticalMap } from "@/components/hud/TacticalMap";
import { CerGauge } from "@/components/hud/CerGauge";
import { WasteTicker } from "@/components/hud/WasteTicker";
import { EventLog } from "@/components/hud/EventLog";
import { AssetInventory } from "@/components/hud/AssetInventory";
import { ThreatTimeline } from "@/components/hud/ThreatTimeline";
import { SimControls } from "@/components/hud/SimControls";
import { EnvironmentPanel } from "@/components/hud/EnvironmentPanel";
import { OsintPanel } from "@/components/hud/OsintPanel";
import { registry } from "@/core/registry";
import { createInitialState, stepSimulation } from "@/core/simulation";
import { calculateCER } from "@/core/costModel";
import { computeEnvironmentModifiers } from "@/core/detection";
import { fetchWeather, fetchOsint } from "@/lib/api/liveData";
import type { SimulationState, CERResult } from "@/core/types";
import type { WeatherData, OsintReport } from "@/lib/api/liveData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";

// Default asset placements for Vovchansk scenario
const DEFAULT_PLACEMENTS = [
  { type: "gepard", lat: 50.285, lon: 36.92 },
  { type: "gepard", lat: 50.295, lon: 36.96 },
  { type: "nasams", lat: 50.28, lon: 36.90 },
  { type: "patriot_battery", lat: 50.27, lon: 36.93 },
  { type: "laser_cuas", lat: 50.29, lon: 36.945 },
  { type: "cellular_detector", lat: 50.30, lon: 36.95 },
  { type: "thermal_sensor", lat: 50.295, lon: 36.93 },
];

const Index = () => {
  const scenarios = registry.getAllScenarios();
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0]?.scenario_id ?? "");
  const scenario = registry.getScenario(selectedScenarioId) ?? scenarios[0];

  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live data state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [osintReports, setOsintReports] = useState<OsintReport[]>([]);
  const [osintLoading, setOsintLoading] = useState(false);

  const envMods = useMemo(() => computeEnvironmentModifiers(weather), [weather]);

  const cerResult = useMemo<CERResult | null>(() => {
    if (!simState) return null;
    const destroyed = simState.threats.filter((t) => t.status === "destroyed");
    const assetsDestroyed = simState.assets.filter((a) => a.status === "destroyed");
    const infraDamage = simState.hvaStatus.reduce((s, h) => s + h.damageValue, 0);
    return calculateCER(simState.assets, destroyed, assetsDestroyed, infraDamage);
  }, [simState]);

  const initSim = useCallback(() => {
    if (!scenario) return;
    const state = createInitialState(scenario, DEFAULT_PLACEMENTS);
    setSimState(state);
    setIsRunning(false);
  }, [scenario]);

  useEffect(() => { initSim(); }, [initSim]);

  // Fetch weather when scenario changes
  const handleFetchWeather = useCallback(async () => {
    if (!scenario) return;
    setWeatherLoading(true);
    const data = await fetchWeather(
      scenario.sides.blue.base_location.lat,
      scenario.sides.blue.base_location.lon
    );
    setWeather(data);
    setWeatherLoading(false);
  }, [scenario]);

  // Auto-fetch weather on mount
  useEffect(() => { handleFetchWeather(); }, [handleFetchWeather]);

  // OSINT search
  const handleOsintSearch = useCallback(async (query: string) => {
    setOsintLoading(true);
    const reports = await fetchOsint(query);
    setOsintReports(reports);
    setOsintLoading(false);
  }, []);

  // Simulation loop — now passes envMods
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isRunning || !simState || !scenario) return;

    intervalRef.current = setInterval(() => {
      setSimState((prev) => {
        if (!prev || prev.status !== "running") {
          setIsRunning(false);
          return prev;
        }
        let next = prev;
        for (let i = 0; i < speed; i++) {
          if (next.status !== "running") break;
          next = stepSimulation(next, scenario, envMods);
        }
        return next;
      });
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, speed, scenario, envMods]);

  const handleStep = useCallback(() => {
    if (!simState || !scenario) return;
    setSimState(stepSimulation(simState, scenario, envMods));
  }, [simState, scenario, envMods]);

  const handleToggle = () => setIsRunning((r) => !r);
  const handleReset = () => { setIsRunning(false); initSim(); };

  const center: [number, number] = scenario
    ? [scenario.sides.blue.base_location.lat, scenario.sides.blue.base_location.lon]
    : [50.29, 36.94];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Top bar */}
      <header className="glass-panel-strong flex items-center gap-3 px-4 py-2 rounded-none border-x-0 border-t-0 z-10">
        <Shield className="h-5 w-5 text-cyan" />
        <h1 className="font-mono-tactical text-sm font-bold tracking-wider text-cyan">
          CODA
        </h1>
        <span className="text-xs text-muted-foreground font-mono-tactical hidden sm:inline">
          Cost-Optimized Defense Allocator
        </span>
        <div className="flex-1" />
        {weather && (
          <span className="text-[10px] font-mono-tactical text-muted-foreground hidden md:flex items-center gap-1">
            🌡 {weather.temperature_c.toFixed(0)}°C | 💨 {weather.wind_speed_ms.toFixed(0)}m/s | 👁 {(weather.visibility_m/1000).toFixed(0)}km
          </span>
        )}
        <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
          <SelectTrigger className="w-56 h-8 text-xs font-mono-tactical bg-muted/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.scenario_id} value={s.scenario_id} className="text-xs font-mono-tactical">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — OSINT */}
        <aside className="w-72 flex flex-col gap-2 p-2 overflow-y-auto border-r border-border bg-background/50 hidden lg:flex">
          <EnvironmentPanel
            weather={weather}
            loading={weatherLoading}
            onRefresh={handleFetchWeather}
          />
          <OsintPanel
            reports={osintReports}
            loading={osintLoading}
            onSearch={handleOsintSearch}
          />
        </aside>

        {/* Map area */}
        <div className="flex-1 relative">
          <TacticalMap state={simState} center={center} zoom={11} />
          <div className="absolute inset-0 pointer-events-none scanline opacity-30" />
        </div>

        {/* Right sidebar */}
        <aside className="w-80 flex flex-col gap-2 p-2 overflow-y-auto border-l border-border bg-background/50">
          <CerGauge cer={cerResult} />
          <WasteTicker cer={cerResult} />
          <div className="flex-shrink-0">
            <SimControls
              isRunning={isRunning}
              speed={speed}
              time={simState?.time ?? 0}
              status={simState?.status ?? "running"}
              onToggle={handleToggle}
              onStep={handleStep}
              onReset={handleReset}
              onSpeedChange={setSpeed}
              onOptimize={() => {}}
            />
          </div>
          <AssetInventory assets={simState?.assets ?? []} />
          <ThreatTimeline
            scenario={scenario!}
            currentTime={simState?.time ?? 0}
            state={simState}
          />
          <div className="flex-1 min-h-[200px]">
            <EventLog events={simState?.events ?? []} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
