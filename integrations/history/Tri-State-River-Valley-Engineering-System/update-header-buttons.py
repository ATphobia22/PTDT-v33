import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

replacement = """          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')} 
              className={`p-2 border rounded transition-colors shadow-xl cursor-pointer mr-2 flex items-center gap-2 ${viewMode === '3d' ? "bg-indigo-600 border-indigo-500 text-white" : "dark:bg-[#001428]/85 bg-white dark:border-slate-700/50 border-slate-200 hover:dark:bg-[#003366] hover:bg-slate-50 dark:text-[#00D4FF] text-indigo-600"}`} 
              title="Toggle 2D/3D Engine">
              {viewMode === '3d' ? <Box size={18} /> : <Map size={18} />}
              <span className="text-xs font-bold">{viewMode === '3d' ? '3D ENGINE' : '2D MAP'}</span>
            </button>
            <button """

content = content.replace('          <div className="flex gap-2">\n            <button ', replacement)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
