const fs = require('fs');
let code = fs.readFileSync('src/components/MultiphysicsControls.tsx', 'utf8');

code = code.replace(
  '  layers, \n  setLayers \n}: { ',
  '  layers, \n  setLayers, \n  layerOpacities, \n  setLayerOpacity \n}: { '
);

fs.writeFileSync('src/components/MultiphysicsControls.tsx', code);
