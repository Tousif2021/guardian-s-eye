export default function WeatherLegend() {
  const items = [
    { color: "#22c55e", emoji: "🚶", label: "Safe to move", desc: "Drones grounded: strong wind/precip" },
    { color: "#eab308", emoji: "⚠️", label: "Caution", desc: "Some drones may still operate" },
    { color: "#ef4444", emoji: "💀", label: "Danger", desc: "Clear skies, drones active" },
  ];

  return (
    <div className="glass-panel p-3">
      <h3 className="font-mono-tactical text-xs font-bold text-cyan mb-2 tracking-wider">ZONE LEGEND</h3>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="shrink-0">{it.emoji}</span>
            <div>
              <span className="font-mono-tactical text-[11px] font-semibold text-foreground">{it.label}</span>
              <span className="font-mono-tactical text-[10px] text-muted-foreground ml-1">{it.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
