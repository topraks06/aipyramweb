import { SYSTEM_LAW } from '../aloha/system_law';

export interface CampaignImage {
  role: string;
  scene_id: string;      // e.g. "luxury_hotel_dubai", "modern_minimalist_tokyo"
  color_palette: string; // e.g. "dark_navy", "beige_earth"
  style: string;         // e.g. "cinematic_wide", "macro_detail", "lifestyle"
  prompt: string;
}

export function validateCampaign(images: CampaignImage[] | any): { valid: boolean; score: number; reason?: string } {
  if (!images || !Array.isArray(images) || images.length < SYSTEM_LAW.IMAGE_POLICY.min_images) {
    return { valid: false, score: 0, reason: "Insufficient images generated." };
  }

  let score = 0;

  const sceneVariety = new Set(images.map(i => i.scene_id?.toLowerCase().trim())).size;
  const paletteVariety = new Set(images.map(i => i.color_palette?.toLowerCase().trim())).size;
  const styleVariety = new Set(images.map(i => i.style?.toLowerCase().trim())).size;

  // Akıllı Skorlama (Campaign Diversity Score)
  score += sceneVariety * 0.4;
  score += paletteVariety * 0.3;
  score += styleVariety * 0.3;

  const minScore = SYSTEM_LAW.CAMPAIGN_POLICY.diversity_score_min;

  if (score < minScore) {
    console.warn(`[VALIDATOR] Kampanya Dongusu Reddedildi! Cesitlilik Skoru: ${score.toFixed(2)} (Min beklenen: ${minScore})`);
    console.warn(`[VALIDATOR] Bulunan Cesitlilik -> Mekan: ${sceneVariety}, Renk: ${paletteVariety}, Stil: ${styleVariety}`);
    return { valid: false, score, reason: "Dusuk cesitlilik skoru. Gorseller birbirini tekrar ediyor." };
  }

  return { valid: true, score };
}
