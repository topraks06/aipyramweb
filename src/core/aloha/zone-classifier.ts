import { TRTEX_CORE_PAYLOAD, TRTEX_ZONE } from "./trtex-data-contract";

export function classifyZone(data: TRTEX_CORE_PAYLOAD): TRTEX_ZONE {
  const m = data.score.market_impact || 0;
  const c = data.score.commercial || 0;

  // LIVE DATA STREAM
  if (data.type === "MARKET") {
    return "LIVE_STREAM";
  }

  // BREAKING INTELLIGENCE
  if (data.type === "NEWS") {
    return "BREAKING";
  }

  // TRADE ENGINE (PARA)
  if (data.type === "OPPORTUNITY" || c >= 75) {
    return "TRADE";
  }

  // GLOBAL SIGNAL MAP
  if (data.type === "REGION") {
    return "RADAR";
  }

  // fallback
  return m > 70 ? "BREAKING" : "RADAR";
}
