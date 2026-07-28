const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!dash.includes('const [layerOpacities, setLayerOpacities]')) {
  dash = dash.replace(
    'const [layers, setLayers] = useState({',
    'const [layerOpacities, setLayerOpacities] = useState({\n    geospatial: 100,\n    hydrodynamic: 100,\n    structural: 100\n  });\n\n  const handleOpacityChange = (layerKey: string, value: number) => {\n    setLayerOpacities(prev => ({ ...prev, [layerKey]: value }));\n  };\n\n  const [layers, setLayers] = useState({'
  );

  dash = dash.replace(
    '<MultiphysicsControls layers={layers} setLayers={setLayers} />',
    '<MultiphysicsControls layers={layers} setLayers={setLayers} layerOpacities={layerOpacities} setLayerOpacity={handleOpacityChange} />'
  );

  dash = dash.replace(
    '<MapComponent layers={layers} />',
    '<MapComponent layers={layers} layerOpacities={layerOpacities} />'
  );

  fs.writeFileSync('src/components/Dashboard.tsx', dash);
}
