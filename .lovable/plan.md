

# CODA — Cost-Optimized Defense Allocator
### Tactical Digital Twin & Operations Research Tool

---

## Overview
A browser-based military-grade simulation and optimization platform for counter-drone defense planning. All computation runs client-side in TypeScript — no backend, no API keys, fully offline-capable.

---

## Phase 1: Core Data Architecture — JSON Registry System

**Dynamic Entity Registry**
- Build a plugin-style registry system where all threats, assets, command chains, missions, and scenarios are defined as typed JSON objects
- Registry loader that auto-discovers and validates entities at runtime using Zod schemas
- Users can modify entity definitions through the UI without touching code

**Entity Types (pre-loaded):**
- **9 Threat types**: Geran-2, Geran-5, Shahed-238, FPV Kamikaze, Geran-2 MANPADS, Molniya Minelayer, Strike UGV, USV Magura, Equine Relay Node
- **6 Defense assets**: Patriot, NASAMS, Gepard, Laser CUAS, Cellular Detector, Thermal Sensor
- **2 Command chains**: NATO IADS, Russian BTG
- **2 Missions**: Point Defense, Counter-Swarm
- **2 Scenarios**: Vovchansk Pocket 2026, Custom Mission

---

## Phase 2: Physics & Detection Engine

**Geospatial Math (TypeScript)**
- Haversine distance calculations for real-world coordinates
- Great Circle interpolation for threat movement at 1-second time steps
- Line-of-sight checks factoring altitude and range

**Multi-Signature Detection Model**
- Radar detection based on RCS (radar cross-section)
- Thermal detection based on altitude/temperature
- Cellular/IMEI detection for LTE-controlled drones
- Each sensor type has different detection probabilities per threat signature

---

## Phase 3: Monte Carlo Simulation Engine

**Time-Stepped Simulation**
- 1-second granularity with early termination on victory/defeat
- Stochastic spawn jitter, hit probabilities, and countermeasure effects
- Multi-domain: air, ground, and maritime threats with different physics
- Phase-based scenario progression (time triggers and condition triggers)

**Hierarchical Command & Control**
- Tree-based command structure with Rules of Engagement flowing downward
- Communication degradation under jamming (nodes revert to local ROE)
- Automatic escalation when threat count exceeds thresholds
- Fratricide prevention via minimum safe distance calculations

---

## Phase 4: CER Optimization Engine

**Cost-Exchange Ratio Calculator**
- Defense cost = system cost + ammo expended + destroyed asset replacement
- Threat value = destroyed threat costs + infrastructure damage penalty
- CER = defense cost / threat value (lower is better)

**Optimization via Client-Side Search**
- Multi-objective optimization: minimize CER, maximize HVA survival, conserve ammunition
- Variables: lat/lon placement of each asset group + asset type selection
- Constraints: budget cap, minimum 2km separation, coverage overlap penalties
- Results cached in IndexedDB for instant replay

---

## Phase 5: "Dark Radar" HUD — The Frontend

**Visual Design**
- Deep navy (#0a0e1a) base with cyan (#00f0ff) accents and danger red (#ef4444)
- Glassmorphism panels with backdrop blur
- Monospace font for telemetry data, clean sans-serif for UI labels

**Main Tactical Map**
- Plotly or Leaflet map with OpenStreetMap dark tiles (no API tokens)
- Threats shown as color-coded triangles (Red=cruise missile, Orange=FPV, Purple=UGV)
- Assets shown as pulsing green markers with dashed range rings
- Active engagements shown as animated yellow lines connecting shooter to target
- Threat trail fading and scanning grid overlay

**Dashboard Panels**
- **CER Gauge**: 0–100% efficiency dial with red-to-green gradient
- **Live Waste Ticker**: Real-time counter showing "$12M WASTED" (naive) vs "$450K EFFICIENT" (optimized)
- **Explainability Log**: Natural language event descriptions ("T+142s: Cellular Detector identified IMEI → FPV neutralized by Gepard at $50/round")
- **Command Status Tree**: Visual hierarchy showing jammed/degraded C2 nodes
- **Asset Inventory**: Ammo counts, reload status, engagement history
- **Threat Wave Timeline**: Upcoming spawn phases with countdown

**Interactive Controls**
- Scenario selector dropdown (pre-built + custom)
- Drag-and-drop asset placement on map
- Budget slider with real-time CER recalculation
- Play/pause/step simulation controls with speed adjustment
- "Optimize" button that runs placement search with progress indicator

---

## Phase 6: Registry Editor UI

- In-app JSON editor for creating/modifying threats, assets, and scenarios
- Form-based UI with validation feedback for non-technical users
- Import/export registry files as JSON
- Scenario composer that assembles threats, assets, and command chains into battle compositions

---

## Key Technical Decisions
- **No backend required** — all simulation, optimization, and data runs in the browser
- **No API keys** — OpenStreetMap tiles are free and token-free
- **IndexedDB** for caching optimization results (replaces SQLite)
- **Web Workers** can be added later if simulation performance needs improvement
- **Zod** replaces Pydantic for runtime schema validation

