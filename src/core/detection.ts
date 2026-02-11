import type { Asset, ThreatInstance } from "./types";
import { haversineDistance } from "./physics";

/** Calculate detection probability based on sensor type and threat signature */
export function detectThreat(
  asset: Asset,
  threat: ThreatInstance,
  assetLat: number,
  assetLon: number
): { detected: boolean; method: string; probability: number } {
  const dist = haversineDistance(assetLat, assetLon, threat.lat, threat.lon);
  if (dist > asset.range_km) return { detected: false, method: "none", probability: 0 };

  let bestProb = 0;
  let bestMethod = "none";
  const rangeFactor = 1 - (dist / asset.range_km) * 0.5; // closer = better

  for (const cap of asset.detection_capabilities) {
    let prob = 0;

    switch (cap) {
      case "radar":
        prob = Math.min(0.95, threat.definition.signature.rcs * 2 * rangeFactor);
        // Low altitude reduces radar effectiveness (terrain masking)
        if (threat.altitude < 100) prob *= 0.4;
        break;

      case "thermal":
        prob = getThermalProbability(threat.definition.signature.thermal, rangeFactor);
        if (threat.definition.signature.thermal === "high_confusion") prob *= 0.3;
        break;

      case "cellular_imei":
        if (threat.definition.navigation.includes("LTE_4G")) {
          prob = 0.9 * rangeFactor;
        } else {
          prob = 0; // Can't detect non-cellular threats
        }
        break;

      case "visual":
        prob = getVisualProbability(threat.definition.signature.visual, rangeFactor);
        if (threat.altitude > 2000) prob *= 0.3; // Hard to see at altitude
        break;
    }

    if (prob > bestProb) {
      bestProb = prob;
      bestMethod = cap;
    }
  }

  const detected = Math.random() < bestProb;
  return { detected, method: bestMethod, probability: bestProb };
}

function getThermalProbability(thermal: string, rangeFactor: number): number {
  switch (thermal) {
    case "high": return 0.9 * rangeFactor;
    case "medium": return 0.6 * rangeFactor;
    case "low": return 0.3 * rangeFactor;
    default: return 0;
  }
}

function getVisualProbability(visual: string, rangeFactor: number): number {
  switch (visual) {
    case "high": return 0.8 * rangeFactor;
    case "medium": return 0.5 * rangeFactor;
    case "low": return 0.2 * rangeFactor;
    default: return 0;
  }
}
