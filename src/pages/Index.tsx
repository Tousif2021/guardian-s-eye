import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { TacticalMap } from "@/components/hud/TacticalMap";
import { CerGauge } from "@/components/hud/CerGauge";
import { WasteTicker } from "@/components/hud/WasteTicker";
import { EventLog } from "@/components/hud/EventLog";
import { AssetInventory } from "@/components/hud/AssetInventory";
import { ThreatTimeline } from "@/components/hud/ThreatTimeline";
import { SimControls } from "@/components/hud/SimControls";
import { registry } from "@/core/registry";
import { createInitialState, stepSimulation } from "@/core/simulation";
import { calculateCER, formatCurrency } from "@/core/costModel";
import type { SimulationState, CERResult, Scenario } from "@/core/types";
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

  // Init on mount and scenario change
  useEffect(() => { initSim(); }, [initSim]);

  // Simulation loop
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
          next = stepSimulation(next, scenario);
        }
        return next;
      });
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, speed, scenario]);

  const handleStep = useCallback(() => {
    if (!simState || !scenario) return;
    setSimState(stepSimulation(simState, scenario));
  }, [simState, scenario]);

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
        {/* Map area */}
        <div className="flex-1 relative">
          <TacticalMap state={simState} center={center} zoom={11} />
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none scanline opacity-30" />

          {/* Floating sim controls */}
          <div className="absolute bottom-4 left-4 right-4 z-10 max-w-xl">
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
        </div>

        {/* Right sidebar */}
        <aside className="w-80 flex flex-col gap-2 p-2 overflow-y-auto border-l border-border">
          <CerGauge cer={cerResult} />
          <WasteTicker cer={cerResult} />
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
