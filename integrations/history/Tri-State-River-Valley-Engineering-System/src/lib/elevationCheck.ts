/** Shared photoreal rendering/elevation contract. Values are engineering inputs, not a regulatory certification. */
export const SITE = Object.freeze({
  id: '13101_BONEBANK_RD',
  bfe_ft: 375.0,
  lag_ft: 377.2,
  clearance_ft: 2.2,
  default_height_scale_ft: 180,
  default_height_offset_ft: 250,
  vertical_datum: 'NAVD88',
} as const);

export function validateElevation(ft: number): boolean {
  return Number.isFinite(ft) && ft > -1000 && ft < 10000;
}

export function classifyRelativeToBFE(elevationFt: number): 'below-bfe' | 'near-bfe' | 'above-bfe' {
  if (elevationFt < SITE.bfe_ft - 0.25) return 'below-bfe';
  if (elevationFt <= SITE.bfe_ft + 0.25) return 'near-bfe';
  return 'above-bfe';
}
