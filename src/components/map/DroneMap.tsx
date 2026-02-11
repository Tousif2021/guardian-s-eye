import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Rectangle, Popup, useMap, useMapEvents } from "react-leaflet";
import type { GridCell, Bounds } from "@/lib/api/openMeteo";
import { classifyZone, classifyAllDrones, DRONE_LABELS, type DroneType, type ZoneLevel } from "@/core/droneZones";
import "leaflet/dist/leaflet.css";

// Inverted: GREEN drone zone = dangerous for people (red), RED drone zone = safe for people (green)
const ZONE_COLORS: Record<ZoneLevel, string> = {
  GREEN: "#ef4444",   // Drones CAN fly → danger for people on ground
  YELLOW: "#eab308",  // Caution stays yellow
  RED: "#22c55e",     // Drones CAN'T fly → safe for people on ground
};

interface DroneMapProps {
  cells: GridCell[];
  droneType: DroneType;
  hourIndex: number;
  useHighAlt: boolean;
  step: number;
  onBoundsChange: (bounds: Bounds) => void;
}

function BoundsWatcher({ onBoundsChange }: { onBoundsChange: (b: Bounds) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  const map = useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const b = map.getBounds();
        onBoundsChangeRef.current({
          latMin: Math.floor(b.getSouth() * 4) / 4,
          latMax: Math.ceil(b.getNorth() * 4) / 4,
          lonMin: Math.floor(b.getWest() * 4) / 4,
          lonMax: Math.ceil(b.getEast() * 4) / 4,
        });
      }, 600);
    },
    zoomend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const b = map.getBounds();
        onBoundsChangeRef.current({
          latMin: Math.floor(b.getSouth() * 4) / 4,
          latMax: Math.ceil(b.getNorth() * 4) / 4,
          lonMin: Math.floor(b.getWest() * 4) / 4,
          lonMax: Math.ceil(b.getEast() * 4) / 4,
        });
      }, 600);
    },
  });

  // Fire once on mount
  useEffect(() => {
    const b = map.getBounds();
    onBoundsChangeRef.current({
      latMin: Math.floor(b.getSouth() * 4) / 4,
      latMax: Math.ceil(b.getNorth() * 4) / 4,
      lonMin: Math.floor(b.getWest() * 4) / 4,
      lonMax: Math.ceil(b.getEast() * 4) / 4,
    });
  }, [map]);

  return null;
}

function GridOverlay({ cells, droneType, hourIndex, useHighAlt, step }: Omit<DroneMapProps, "onBoundsChange">) {
  const half = step / 2;

  return (
    <>
      {cells.map((cell) => {
        const h = cell.hourly;
        const i = Math.min(hourIndex, h.time.length - 1);
        const wind = useHighAlt ? (h.wind_120m[i] ?? h.wind_10m[i]) : h.wind_10m[i];
        const gusts = h.gusts[i];
        const precip = h.precip[i];
        const snow = h.snow[i];

        const zone = classifyZone(wind, gusts, precip, snow, droneType);
        const allDrones = classifyAllDrones(wind, gusts, precip, snow);

        const bounds: [[number, number], [number, number]] = [
          [cell.lat - half, cell.lon - half],
          [cell.lat + half, cell.lon + half],
        ];

        const ts = h.time[i];
        const timeStr = ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

        return (
          <Rectangle
            key={`${cell.lat}-${cell.lon}`}
            bounds={bounds}
            pathOptions={{
              color: ZONE_COLORS[zone.level],
              fillColor: ZONE_COLORS[zone.level],
              fillOpacity: 0.25,
              weight: 1,
              opacity: 0.6,
            }}
            eventHandlers={{
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.45, weight: 2 });
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: 0.25, weight: 1 });
              },
            }}
          >
            <Popup>
              <div className="font-mono-tactical text-xs leading-relaxed" style={{ color: "#e0f2fe", background: "#0a1628", padding: "8px 10px", borderRadius: 6, minWidth: 220 }}>
                <div className="font-bold mb-1" style={{ color: "#22d3ee" }}>
                  GRID {cell.lat.toFixed(2)}°N, {cell.lon.toFixed(2)}°E
                </div>
                <div style={{ color: "#94a3b8" }} className="mb-1">{timeStr}</div>
                <div>Wind: {wind.toFixed(1)} m/s (gusts {gusts.toFixed(1)})</div>
                <div>Precip: {precip.toFixed(1)} mm/h</div>
                <div>Snow: {snow.toFixed(1)} cm/h</div>
                <div>Temp: {(h.temp[i] ?? 0).toFixed(0)}°C</div>
                <div>Vis: {((h.vis[i] ?? 0) / 1000).toFixed(0)} km</div>
                <hr style={{ borderColor: "#1e3a5f", margin: "6px 0" }} />
                {(["fpv", "orlan10", "geran2"] as DroneType[]).map((dt) => (
                  <div key={dt} style={{ color: ZONE_COLORS[allDrones[dt].level] }}>
                    {DRONE_LABELS[dt]}: {allDrones[dt].level} ({allDrones[dt].reason})
                  </div>
                ))}
              </div>
            </Popup>
          </Rectangle>
        );
      })}
    </>
  );
}

export default function DroneMap({ onBoundsChange, ...props }: DroneMapProps) {
  const center: [number, number] = [49.0, 36.0];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <BoundsWatcher onBoundsChange={onBoundsChange} />
      <GridOverlay {...props} />
    </MapContainer>
  );
}
