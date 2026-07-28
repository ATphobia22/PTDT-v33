const fs = require('fs');

let mapc = fs.readFileSync('src/components/MapComponent.tsx', 'utf8');

// Add layerOpacities to MapComponentProps
if (!mapc.includes('layerOpacities?: {')) {
  mapc = mapc.replace(
    '  layers?: {',
    '  layerOpacities?: {\n    geospatial: number;\n    hydrodynamic: number;\n    structural: number;\n  };\n  layers?: {'
  );
}

// Update the component signature
mapc = mapc.replace(
  'export function MapComponent({ layers: externalLayers }: MapComponentProps) {',
  'export function MapComponent({ layers: externalLayers, layerOpacities }: MapComponentProps) {'
);

// Fix map.current to mapRef.current in the useEffect we added
mapc = mapc.replace(/map\.current/g, 'mapRef.current');

fs.writeFileSync('src/components/MapComponent.tsx', mapc);

let multi = fs.readFileSync('src/components/MultiphysicsControls.tsx', 'utf8');

// Add layerOpacities to MultiphysicsControls props
if (!multi.includes('layerOpacities?: {')) {
  multi = multi.replace(
    'layers: { geospatial: boolean, hydrodynamic: boolean, structural: boolean },',
    'layers: { geospatial: boolean, hydrodynamic: boolean, structural: boolean },\n   layerOpacities?: { geospatial: number, hydrodynamic: number, structural: number },\n   setLayerOpacity?: (layerKey: string, value: number) => void,'
  );
}
fs.writeFileSync('src/components/MultiphysicsControls.tsx', multi);

