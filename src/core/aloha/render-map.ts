import { TRTEX_ZONE } from "./trtex-data-contract";

export function renderZone(zone: TRTEX_ZONE) {
  switch (zone) {
    case "LIVE_STREAM":
      return {
        ui: "ticker_bar",
        visual: "NO_IMAGE",
        density: "high_frequency_data"
      };

    case "BREAKING":
      return {
        ui: "editorial_card",
        visual: "hero_image_allowed",
        style: "bloomberg_style"
      };

    case "TRADE":
      return {
        ui: "action_card",
        visual: "minimal_or_texture_only",
        style: "amazon_b2b_dashboard"
      };

    case "RADAR":
      return {
        ui: "geo_grid_map",
        visual: "icon_based_only",
        style: "strategic_intelligence_map"
      };
    
    default:
      return {
        ui: "editorial_card",
        visual: "NO_IMAGE",
        style: "fallback"
      };
  }
}
