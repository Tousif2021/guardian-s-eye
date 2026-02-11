

# Drone Weather Map: Remove OSINT Panel + Add Map Interactivity

## Overview
This builds on the approved pivot plan with two adjustments:
1. Remove the OSINT/Firecrawl panel entirely from the sidebar
2. Add click/tap interaction on the weather hex grid so users can inspect detailed weather conditions at any point on the map

## Changes from the Previous Plan

### Removed
- OsintPanel component will not be included in the new layout
- No OSINT-related state, imports, or API calls in Index.tsx
- The `live-osint` edge function stays deployed but is simply unused

### Added: Map Click Interaction
When a user clicks on a hex grid cell on the map, a popup or floating panel appears showing:
- Wind speed and gust values at the selected altitude
- Precipitation rate (rain/snow)
- Temperature
- Visibility
- The fly/no-fly classification for each drone type (FPV, Geran-2, Orlan-10)
- Forecast trend (next few hours) for that cell

This is implemented as a Leaflet popup bound to each grid polygon, so it feels native to the map interaction.

## Build Order

### 1. Edge Function: `open-meteo-grid`
- Fetches wind (10m, 100m), gusts, precipitation, snowfall, temperature, cloud cover, visibility from Open-Meteo ECMWF API
- Accepts bounding box + resolution, returns array of grid cells with weather data
- No API key needed

### 2. Classification Engine: `src/core/droneZones.ts`
- Takes weather data for a cell + drone type + altitude selection
- Returns GREEN / YELLOW / RED with reasoning text
- Drone-specific thresholds (FPV most sensitive, Geran-2 most tolerant)

### 3. Map Component: `src/components/map/DroneMap.tsx`
- Leaflet map with dark CartoDB tiles centered on eastern Ukraine front-line area
- Renders colored rectangle/hex grid overlay from weather data
- Each cell is clickable -- opens a Leaflet popup with detailed weather breakdown and per-drone-type classification
- Hovering highlights the cell

### 4. Sidebar Components (right side only)
- **WeatherLegend**: Green/Yellow/Red color key with threshold descriptions
- **AltitudeSlider**: 0.5km to 3km, re-classifies zones on change
- **DroneTypeSelector**: Toggle between FPV / Geran-2 / Orlan-10 (changes thresholds)
- **ForecastTimeline**: Scrub through forecast hours (current to +72h)

### 5. Rewrite `src/pages/Index.tsx`
- Full-width map as the primary view
- Compact right sidebar with legend, altitude slider, drone selector, forecast timeline
- No left sidebar
- Top bar: app title ("DRONE WEATHER MAP"), refresh button, current time
- No OSINT panel, no simulation controls, no old CODA components

### 6. Cell Popup Detail (the interactive part)
When clicking a grid cell, a popup shows:
```
GRID CELL 49.5N, 36.0E
-----------------------
Wind:    8.2 m/s (gusts 14.1)
Precip:  0.0 mm/h
Snow:    0.0 mm/h
Temp:    -3C
Vis:     12 km

FPV:     YELLOW (gusts near limit)
Geran-2: GREEN
Orlan-10: GREEN
```

## Technical Notes

### New Files
- `supabase/functions/open-meteo-grid/index.ts`
- `src/core/droneZones.ts`
- `src/components/map/DroneMap.tsx`
- `src/components/sidebar/WeatherLegend.tsx`
- `src/components/sidebar/AltitudeSlider.tsx`
- `src/components/sidebar/DroneTypeSelector.tsx`
- `src/components/sidebar/ForecastTimeline.tsx`
- `src/lib/api/openMeteo.ts`

### Modified Files
- `src/pages/Index.tsx` -- complete rewrite

### No Longer Imported
- All `src/components/hud/*` components (including OsintPanel)
- All `src/core/simulation.ts`, `costModel.ts`, `registry.ts`, etc.
- `src/lib/api/liveData.ts` (fetchOsint, fetchWeather)

