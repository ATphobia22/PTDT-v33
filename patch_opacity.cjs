const fs = require('fs');

let controls = fs.readFileSync('src/components/MultiphysicsControls.tsx', 'utf8');

if (!controls.includes('layerOpacities')) {
  // Update the props interface
  controls = controls.replace(
    'layers: { geospatial: boolean, hydrodynamic: boolean, structural: boolean },',
    'layers: { geospatial: boolean, hydrodynamic: boolean, structural: boolean },\n   layerOpacities?: { geospatial: number, hydrodynamic: number, structural: number },\n   setLayerOpacity?: (layerKey: string, value: number) => void,'
  );

  controls = controls.replace(
    'setLayers: (layers: any) => void',
    'setLayers: (layers: any) => void\n'
  );

  // Define default values inside the component for backwards compatibility
  controls = controls.replace(
    'const toggleLayer = (layerKey: string) => {',
    `const getOpacity = (layerKey: string) => layerOpacities ? (layerOpacities as any)[layerKey] : 100;\n  const toggleLayer = (layerKey: string) => {`
  );

  // Add the slider to Layer 1
  const l1search = `<input \n             type="checkbox" \n             checked={layers.geospatial} \n             onChange={() => toggleLayer("geospatial")}\n            className="accent-sky-400 cursor-pointer h-3 w-3"\n          />\n        </div>`;
  const l1replace = `<div className="flex flex-col items-end gap-1">\n          <input \n             type="checkbox" \n             checked={layers.geospatial} \n             onChange={() => toggleLayer("geospatial")}\n            className="accent-sky-400 cursor-pointer h-3 w-3"\n          />\n          {setLayerOpacity && <input type="range" min="0" max="100" value={getOpacity("geospatial")} onChange={(e) => setLayerOpacity("geospatial", parseInt(e.target.value))} className="w-16 h-1 accent-sky-400" />}\n          </div>\n        </div>`;
  
  controls = controls.replace(l1search, l1replace);

  // Add the slider to Layer 2
  const l2search = `<input \n             type="checkbox" \n             checked={layers.hydrodynamic} \n             onChange={() => toggleLayer("hydrodynamic")}\n            className="accent-emerald-400 cursor-pointer h-3 w-3"\n          />\n        </div>`;
  const l2replace = `<div className="flex flex-col items-end gap-1">\n          <input \n             type="checkbox" \n             checked={layers.hydrodynamic} \n             onChange={() => toggleLayer("hydrodynamic")}\n            className="accent-emerald-400 cursor-pointer h-3 w-3"\n          />\n          {setLayerOpacity && <input type="range" min="0" max="100" value={getOpacity("hydrodynamic")} onChange={(e) => setLayerOpacity("hydrodynamic", parseInt(e.target.value))} className="w-16 h-1 accent-emerald-400" />}\n          </div>\n        </div>`;
  
  controls = controls.replace(l2search, l2replace);

  // Add the slider to Layer 3
  const l3search = `<input \n             type="checkbox" \n             checked={layers.structural} \n             onChange={() => toggleLayer("structural")}\n            className="accent-rose-400 cursor-pointer h-3 w-3"\n          />\n        </div>`;
  const l3replace = `<div className="flex flex-col items-end gap-1">\n          <input \n             type="checkbox" \n             checked={layers.structural} \n             onChange={() => toggleLayer("structural")}\n            className="accent-rose-400 cursor-pointer h-3 w-3"\n          />\n          {setLayerOpacity && <input type="range" min="0" max="100" value={getOpacity("structural")} onChange={(e) => setLayerOpacity("structural", parseInt(e.target.value))} className="w-16 h-1 accent-rose-400" />}\n          </div>\n        </div>`;
  
  controls = controls.replace(l3search, l3replace);

  fs.writeFileSync('src/components/MultiphysicsControls.tsx', controls);
}
