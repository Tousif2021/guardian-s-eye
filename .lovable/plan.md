

## Changes

### 1. Update map center to Dnipropetrovsk region
Change the default map center in `DroneMap.tsx` from `[49.0, 36.0]` to approximately `[48.46, 35.04]` (Dnipro city coordinates).

### 2. Redesign the Weather Legend
Replace the current compact legend in `WeatherLegend.tsx` with the detailed three-tier UAS activity format:

- **Title**: "UAS THREAT ASSESSMENT" (or similar tactical heading)
- **Green block**: "LOW UAS ACTIVITY PROBABILITY" with sub-lines about high wind/precipitation reducing UAV performance
- **Yellow block**: "MODERATE UAS ACTIVITY PROBABILITY" with sub-lines about marginal conditions
- **Red block**: "HIGH UAS ACTIVITY PROBABILITY" with sub-lines about favorable UAV conditions

Each entry will use a colored circle indicator (green/yellow/red) alongside the PersonStanding icon, with the title in bold and 2-3 descriptive sub-lines in muted text beneath.

---

### Technical Details

**Files to modify:**

1. **`src/components/map/DroneMap.tsx`** (line ~142): Change `center` from `[49.0, 36.0]` to `[48.46, 35.04]`

2. **`src/components/sidebar/WeatherLegend.tsx`**: Rewrite the legend with expanded descriptions:
   - Each item gets a `title`, `lines[]` array (2-3 bullet descriptions), and `color`
   - Title rendered as the heading, rename from "ZONE LEGEND" to "UAS THREAT ASSESSMENT"
   - Layout: colored dot + bold title, then indented muted description lines beneath

