import { buildSpatialContext, type BBox, type SpatialRecord } from './SpatialContextEngine';
import { toMappingContext, type NoaaFootprint } from './NoaaContextAdapter';
import type { EngineeringContextLink } from './EngineeringContextGraph';
import { ProvenanceRegistry } from './ProvenanceRegistry';

export interface RuntimeTwinContext {
  viewport: BBox;
  mapping: EngineeringContextLink[];
  evidence: ProvenanceRegistry;
}

export function buildRuntimeTwinContext(
  viewport: BBox,
  footprints: readonly NoaaFootprint[],
  spatialRecords: readonly SpatialRecord[],
  evidence = new ProvenanceRegistry(),
): RuntimeTwinContext {
  return {
    viewport,
    mapping: footprints.map(f => buildSpatialContext(toMappingContext(f), viewport, spatialRecords)),
    evidence,
  };
}
