import { Play, Pause, SkipForward, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimControlsProps {
  isRunning: boolean;
  speed: number;
  time: number;
  status: string;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onOptimize: () => void;
}

export function SimControls({
  isRunning, speed, time, status,
  onToggle, onStep, onReset, onSpeedChange, onOptimize,
}: SimControlsProps) {
  const speeds = [1, 5, 10, 50];

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xs text-muted-foreground font-mono-tactical uppercase tracking-wider flex-1">
          Simulation
        </div>
        <div className="font-mono-tactical text-sm text-cyan font-bold">
          T+{time}s
        </div>
        <div className={`text-xs font-mono-tactical px-2 py-0.5 rounded ${
          status === "running" ? "bg-primary/20 text-cyan"
          : status === "victory" ? "bg-green-500/20 text-success"
          : status === "defeat" ? "bg-red-500/20 text-danger"
          : "bg-muted text-muted-foreground"
        }`}>
          {status.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-border"
          onClick={onToggle}
          disabled={status !== "running"}
        >
          {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-border"
          onClick={onStep}
          disabled={isRunning || status !== "running"}
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-border"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <div className="flex-1" />

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-xs font-mono-tactical rounded transition-colors ${
                speed === s
                  ? "bg-primary/20 text-cyan border border-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <Button
          size="sm"
          className="ml-2 bg-primary/20 text-cyan border border-primary/40 hover:bg-primary/30 font-mono-tactical text-xs"
          onClick={onOptimize}
        >
          <Zap className="h-3 w-3 mr-1" /> OPTIMIZE
        </Button>
      </div>
    </div>
  );
}
