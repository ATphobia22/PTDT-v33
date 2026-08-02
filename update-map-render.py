import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

replacement = """      <div className="absolute inset-0 z-0 bg-slate-900">
        {viewMode === '2d' ? (
          <MapComponent layers={layers} layerOpacities={layerOpacities} />
        ) : (
          <MeshTerrainEngine floodActive={layers['Hydrodynamic Analysis']} floodLevel={surgeStage > 375 ? (surgeStage - 375) * 0.5 : 0} />
        )}
      </div>"""

content = re.sub(
    r'<div className="absolute inset-0 z-0">\s*<MapComponent[^>]*/>\s*</div>',
    replacement,
    content
)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
