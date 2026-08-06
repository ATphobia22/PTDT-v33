/** GIS service stub — resolves MapComponent import */
export async function fetchFloodDepth(_bbox?: number[]) {
  return { type: 'FeatureCollection', features: [] };
}
export async function getParcelEnvelope() {
  return { xmin: -88.02, ymin: 37.83, xmax: -87.99, ymax: 37.86 };
}
export async function queryLayers(_layers: string[]) {
  return [];
}
export default { fetchFloodDepth, getParcelEnvelope, queryLayers };
