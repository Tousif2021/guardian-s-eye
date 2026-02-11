import { DRONE_LABELS, type DroneType } from "@/core/droneZones";

interface Props {
  selected: DroneType;
  onChange: (dt: DroneType) => void;
}

const TYPES: DroneType[] = ["fpv", "orlan10", "geran2"];

export default function DroneTypeSelector({ selected, onChange }: Props) {
  return (
    <div className="glass-panel p-3">
      <h3 className="font-mono-tactical text-xs font-bold text-cyan mb-2 tracking-wider">DRONE TYPE</h3>
      <div className="flex flex-col gap-1">
        {TYPES.map((dt) => (
          <button
            key={dt}
            onClick={() => onChange(dt)}
            className={`font-mono-tactical text-[11px] text-left px-2 py-1.5 rounded transition-colors ${
              selected === dt
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {DRONE_LABELS[dt]}
          </button>
        ))}
      </div>
    </div>
  );
}
