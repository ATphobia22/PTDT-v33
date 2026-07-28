import re

with open("src/components/NextGenDigitalTwin.tsx", "r") as f:
    content = f.read()

# Add states for panel visibility
if "const [leftPanelOpen, setLeftPanelOpen] = useState(true);" not in content:
    content = content.replace("const [openMenus, setOpenMenus]", "const [leftPanelOpen, setLeftPanelOpen] = useState(true);\n  const [rightPanelOpen, setRightPanelOpen] = useState(true);\n  const [openMenus, setOpenMenus]")

# Replace left panel classes to add hide/show
left_panel_regex = r'(<div className="w-full md:w-80 bg-slate-100 dark:bg-slate-950 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-\[500px\] md:max-h-none z-10">)'
replacement = r"""{/* Left Panel Toggle */}
      {!leftPanelOpen && (
        <button 
          onClick={() => setLeftPanelOpen(true)}
          className="absolute top-5 right-5 z-20 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Open Settings"
        >
          <Settings2 size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* Settings Panel (Now Right Aligned for consistency, wait, it was originally on the right because it has border-l. Wait, the code says "flex-col md:flex-row". Let's wrap it.) */}
      <div className={`w-full md:w-80 bg-slate-100 dark:bg-slate-950 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px] md:max-h-none z-10 transition-all duration-300 ease-in-out ${leftPanelOpen ? 'translate-x-0' : 'translate-x-full hidden md:flex md:translate-x-full md:w-0 md:p-0 md:opacity-0 md:border-none'}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 font-mono">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <span className={!leftPanelOpen ? 'hidden' : ''}>Simulation Matrix</span>
          </h2>
          <button onClick={() => setLeftPanelOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white md:block">
            <ChevronRight size={18} />
          </button>
        </div>"""

content = re.sub(r'<div className="w-full md:w-80 bg-slate-100 dark:bg-slate-950 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-\[500px\] md:max-h-none z-10">.*?<h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase flex items-center gap-1\.5 font-mono">.*?<Settings2 className="w-4 h-4 text-indigo-400" />.*?Simulation Matrix.*?</h2>', replacement, content, flags=re.DOTALL)

with open("src/components/NextGenDigitalTwin.tsx", "w") as f:
    f.write(content)
