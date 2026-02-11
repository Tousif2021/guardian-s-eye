import { Slider } from "@/components/ui/slider";

interface Props {
  hourIndex: number;
  maxHours: number;
  timestamps: number[];
  onChange: (idx: number) => void;
}

export default function ForecastTimeline({ hourIndex, maxHours, timestamps, onChange }: Props) {
  const ts = timestamps[hourIndex];
  const label = ts
    ? new Date(ts * 1000).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : `+${hourIndex}h`;

  return (
    <div className="glass-panel p-3">
      <h3 className="font-mono-tactical text-xs font-bold text-cyan mb-2 tracking-wider">FORECAST</h3>
      <Slider
        value={[hourIndex]}
        min={0}
        max={maxHours - 1}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="mb-1"
      />
      <div className="font-mono-tactical text-[11px] text-foreground text-center">{label}</div>
    </div>
  );
}
