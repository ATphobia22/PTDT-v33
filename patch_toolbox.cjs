const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Add activeTool state
if (!dash.includes('const [activeTool, setActiveTool]')) {
  dash = dash.replace(
    "const [zenMode, setZenMode] = useState(false);",
    "const [zenMode, setZenMode] = useState(false);\n  const [activeTool, setActiveTool] = useState<string | null>(null);"
  );
  
  // Replace the tool button rendering with active state logic
  const originalToolbox = `      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        {[
          { icon: MousePointer2, label: "Select Feature" },
          { icon: Ruler, label: "Measure Distance/Area" },
          { icon: Download, label: "Export Spatial Data" }
        ].map((tool, idx) => (
          <button key={idx} title={tool.label} className="p-2 dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 border rounded shadow-xl dark:text-slate-300 text-slate-700 hover:dark:text-[#00D4FF] hover:text-indigo-600 hover:dark:bg-slate-800 transition-colors cursor-pointer">
            <tool.icon size={18} />
          </button>
        ))}
      </div>`;
      
  const newToolbox = `      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        {[
          { id: "select", icon: MousePointer2, label: "Select Feature" },
          { id: "measure", icon: Ruler, label: "Measure Distance/Area" },
          { id: "export", icon: Download, label: "Export Spatial Data" }
        ].map((tool) => (
          <button 
            key={tool.id} 
            title={tool.label} 
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={\`p-2 backdrop-blur-md border rounded shadow-xl transition-colors cursor-pointer \${
              activeTool === tool.id 
                ? "bg-indigo-600 border-indigo-500 text-white" 
                : "dark:bg-slate-900/80 bg-white/90 dark:border-slate-700 border-slate-200 dark:text-slate-300 text-slate-700 hover:dark:text-[#00D4FF] hover:text-indigo-600 hover:dark:bg-slate-800"
            }\`}>
            <tool.icon size={18} />
          </button>
        ))}
      </div>`;
      
  dash = dash.replace(originalToolbox, newToolbox);
  fs.writeFileSync('src/components/Dashboard.tsx', dash);
}
