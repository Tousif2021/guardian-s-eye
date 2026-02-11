import { threats } from "@/registry/threats";
import { assets } from "@/registry/assets";
import { commandChains } from "@/registry/commandChains";
import { missions } from "@/registry/missions";
import { scenarios } from "@/registry/scenarios";
import {
  ThreatSchema,
  AssetSchema,
  CommandChainSchema,
  MissionSchema,
  ScenarioSchema,
  type Threat,
  type Asset,
  type CommandChain,
  type Mission,
  type Scenario,
} from "./types";

class Registry {
  private threats = new Map<string, Threat>();
  private assets = new Map<string, Asset>();
  private commandChains = new Map<string, CommandChain>();
  private missions = new Map<string, Mission>();
  private scenarios = new Map<string, Scenario>();
  private initialized = false;

  init() {
    if (this.initialized) return;
    threats.forEach((t) => {
      const parsed = ThreatSchema.parse(t);
      this.threats.set(parsed.type, parsed);
    });
    assets.forEach((a) => {
      const parsed = AssetSchema.parse(a);
      this.assets.set(parsed.type, parsed);
    });
    commandChains.forEach((c) => {
      const parsed = CommandChainSchema.parse(c);
      this.commandChains.set(parsed.chain_id, parsed);
    });
    missions.forEach((m) => {
      const parsed = MissionSchema.parse(m);
      this.missions.set(parsed.mission_id, parsed);
    });
    scenarios.forEach((s) => {
      const parsed = ScenarioSchema.parse(s);
      this.scenarios.set(parsed.scenario_id, parsed);
    });
    this.initialized = true;
  }

  getThreat(type: string): Threat | undefined { return this.threats.get(type); }
  getAsset(type: string): Asset | undefined { return this.assets.get(type); }
  getCommandChain(id: string): CommandChain | undefined { return this.commandChains.get(id); }
  getMission(id: string): Mission | undefined { return this.missions.get(id); }
  getScenario(id: string): Scenario | undefined { return this.scenarios.get(id); }

  getAllThreats(): Threat[] { return Array.from(this.threats.values()); }
  getAllAssets(): Asset[] { return Array.from(this.assets.values()); }
  getAllCommandChains(): CommandChain[] { return Array.from(this.commandChains.values()); }
  getAllMissions(): Mission[] { return Array.from(this.missions.values()); }
  getAllScenarios(): Scenario[] { return Array.from(this.scenarios.values()); }
}

export const registry = new Registry();
registry.init();
