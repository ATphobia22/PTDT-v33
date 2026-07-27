const fs = require('fs');

let mapc = fs.readFileSync('src/components/MapComponent.tsx', 'utf8');

if (!mapc.includes('layerOpacities?:')) {
  mapc = mapc.replace(
    'layers: { geospatial: boolean; hydrodynamic: boolean; structural: boolean }',
    'layers: { geospatial: boolean; hydrodynamic: boolean; structural: boolean }, layerOpacities?: { geospatial: number; hydrodynamic: number; structural: number }'
  );

  mapc = mapc.replace(
    'export function MapComponent({ layers }: { layers: { geospatial: boolean; hydrodynamic: boolean; structural: boolean } }) {',
    'export function MapComponent({ layers, layerOpacities }: { layers: { geospatial: boolean; hydrodynamic: boolean; structural: boolean }, layerOpacities?: { geospatial: number; hydrodynamic: number; structural: number } }) {'
  );

  // Map layer opacity usage inside MapComponent
  // The original has: map.setPaintProperty(layer.id, 'fill-opacity', 0.85); and 1
  // I will replace it so that if it's geospatial layer, use layerOpacities.geospatial / 100 etc.

  // To be safe, I'll just add a generic useEffect that updates opacity when layerOpacities change
  const useEffectOpacity = `
  useEffect(() => {
    if (!mapLoaded || !map.current || !layerOpacities) return;
    
    // We assume Mapbox is loaded
    const externalLayers = [
      { id: 'geo-mesh-data', key: 'geospatial' },
      { id: 'hydro-live-data', key: 'hydrodynamic' },
      { id: 'structural-live-data', key: 'structural' }
    ];
    
    externalLayers.forEach(layer => {
      if (map.current!.getLayer(layer.id)) {
        const op = (layerOpacities as any)[layer.key] / 100;
        map.current!.setPaintProperty(layer.id, 'fill-opacity', op);
        if (map.current!.getLayer(layer.id + '-line')) {
           map.current!.setPaintProperty(layer.id + '-line', 'line-opacity', op);
        }
      }
    });
  }, [layerOpacities, mapLoaded]);
`;

  mapc = mapc.replace(
    '// Main Map Re-initialization when theme, source type, or intersection changes',
    `${useEffectOpacity}\n  // Main Map Re-initialization when theme, source type, or intersection changes`
  );

  fs.writeFileSync('src/components/MapComponent.tsx', mapc);
}
