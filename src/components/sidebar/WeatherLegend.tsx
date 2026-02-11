import { PersonStanding } from "lucide-react";

const items = [
  {
    color: "#22c55e",
    title: "LOW UAS ACTIVITY PROBABILITY",
    lines: [
      "Environmental conditions likely reduce small UAV performance",
      "High wind / significant precipitation",
      "Reduced aerial exposure risk",
    ],
  },
  {
    color: "#eab308",
    title: "MODERATE UAS ACTIVITY PROBABILITY",
    lines: [
      "Environmental conditions may constrain some UAV classes",
      "Marginal winds / light precipitation",
      "Mixed operational feasibility",
    ],
  },
  {
    color: "#ef4444",
    title: "HIGH UAS ACTIVITY PROBABILITY",
    lines: [
      "Environmental conditions favorable for UAV operations",
      "Low wind / clear conditions",
      "Elevated aerial exposure risk",
    ],
  },
];

export default function WeatherLegend() {
  return (
    <div className="glass-panel p-3">
      <h3 className="font-mono-tactical text-xs font-bold text-cyan mb-3 tracking-wider">
        UAS THREAT ASSESSMENT
      </h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="flex gap-2">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: it.color }}
              />
            </div>
            <div>
              <div
                className="font-mono-tactical text-[11px] font-bold leading-tight"
                style={{ color: it.color }}
              >
                {it.title}
              </div>
              {it.lines.map((line) => (
                <div
                  key={line}
                  className="font-mono-tactical text-[10px] text-muted-foreground leading-snug"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
