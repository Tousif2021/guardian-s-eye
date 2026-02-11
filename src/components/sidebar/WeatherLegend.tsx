export default function WeatherLegend() {
  const items = [
    { color: "#22c55e", label: "GREEN — Fly", desc: "Wind < threshold, dry" },
    { color: "#eab308", label: "YELLOW — Caution", desc: "Moderate wind or light precip" },
    { color: "#ef4444", label: "RED — No-Fly", desc: "Strong gusts, heavy precip/snow" },
  ];

  return (
    <div className="glass-panel p-3">
      <h3 className="font-mono-tactical text-xs font-bold text-cyan mb-2 tracking-wider">ZONE LEGEND</h3>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: it.color, opacity: 0.8 }} />
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
