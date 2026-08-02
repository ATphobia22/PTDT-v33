/**
 * Reference engineering thresholds often cited in USACE levee/slope guidance discussions.
 * NOT a site-specific certification that Bonebank or Archimedes works meet these values.
 * PE must compute and seal project FoS from actual geometry and materials.
 */

export const USACE_REFERENCE_THRESHOLDS = {
  /** Typical minimum static factor of safety cited for levee/slope stability discussions */
  levee_static_fos_min: 1.4,
  /** Typical seismic FoS cited in parallel discussions */
  levee_seismic_fos_min: 1.1,
  /** Indiana floodway culture / project compensatory storage factor (IDNR context) */
  compensatory_storage_factor: 1.2,
  /** FEMA floodway no-rise target (ft) */
  fema_floodway_max_rise_ft: 0.0,
  /** IDNR cumulative surcharge culture (ft) — not a substitute for FEMA 0.00 */
  idnr_cumulative_surcharge_ft: 0.14,
} as const;

export type UsaceReferenceThresholds = typeof USACE_REFERENCE_THRESHOLDS;
