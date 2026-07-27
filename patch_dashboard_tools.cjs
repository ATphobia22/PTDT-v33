const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!dash.includes('const [zenMode, setZenMode] = useState(false);')) {
  dash = dash.replace(
    "const [showSettingsModal, setShowSettingsModal] = useState(false);",
    "const [showSettingsModal, setShowSettingsModal] = useState(false);\n  const [zenMode, setZenMode] = useState(false);"
  );

  dash = dash.replace(
    "import { Activity, Database, MonitorPlay, Network, Shield, AlertTriangle, Cpu, Globe, Sun, Moon, Map, Maximize2, Server, Zap, Settings, X, Music, Volume2, VolumeX, Power } from 'lucide-react';",
    "import { Activity, Database, MonitorPlay, Network, Shield, AlertTriangle, Cpu, Globe, Sun, Moon, Map, Maximize2, Minimize2, Server, Zap, Settings, X, Music, Volume2, VolumeX, Power, Eye, EyeOff, Ruler, Download, MousePointer2 } from 'lucide-react';"
  );

  // Zen Mode toggle button in the header
  dash = dash.replace(
    '<Settings size={18} />',
    '<Settings size={18} />'
  );

  dash = dash.replace(
    '<button \n              onClick={() => setShowSettingsModal(true)}',
    '<button \n              onClick={() => setZenMode(!zenMode)} \n              className={`p-2 border rounded transition-colors shadow-xl cursor-pointer mr-2 ${zenMode ? "bg-indigo-600 border-indigo-500 text-white" : "dark:bg-[#001428]/85 bg-white dark:border-slate-700/50 border-slate-200 hover:dark:bg-[#003366] hover:bg-slate-50 dark:text-[#00D4FF] text-indigo-600"}`} \n              title="Toggle Zen Mode (Hide Panels)"> \n              {zenMode ? <EyeOff size={18} /> : <Eye size={18} />} \n            </button>\n            <button \n              onClick={() => setShowSettingsModal(true)}'
  );

  // Wrap the left/right/bottom panels in a conditional block `!zenMode &&`
  // Left Sidebar
  dash = dash.replace(
    '{/* Left Sidebar - Vertical Navigation */}',
    '{!zenMode && (\n        <>\n          {/* Left Sidebar - Vertical Navigation */}'
  );

  // Bottom Hub
  dash = dash.replace(
    '          {/* Left Section: Dynamic D3 Cross-Section Graph */}',
    '          {/* Left Section: Dynamic D3 Cross-Section Graph */}'
  );

  // After the bottom hub container, close the fragment for zenMode
  dash = dash.replace(
    '          <div style={{ width: "260px", flexShrink: 0 }}>\n            <DepthLegend />\n          </div>\n        </div>',
    '          <div style={{ width: "260px", flexShrink: 0 }}>\n            <DepthLegend />\n          </div>\n        </div>\n        </>\n      )}'
  );

  // Map Tools Toolbar (vertical floating on the right)
  dash = dash.replace(
    '{/* Background Map - Full Screen */}',
    `{/* Background Map - Full Screen */}\n      
      {/* Floating Map Toolbox */}\n      
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
        {[
          { icon: MousePointer2, label: "Select Feature" },
          { icon: Ruler, label: "Measure Distance/Area" },
          { icon: Download, label: "Export Spatial Data" }
        ].map((tool, idx) => (
          <button key={idx} title={tool.label} className="p-2 dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 border rounded shadow-xl dark:text-slate-300 text-slate-700 hover:dark:text-[#00D4FF] hover:text-indigo-600 hover:dark:bg-slate-800 transition-colors cursor-pointer">
            <tool.icon size={18} />
          </button>
        ))}
      </div>\n`
  );

  fs.writeFileSync('src/components/Dashboard.tsx', dash);
}
