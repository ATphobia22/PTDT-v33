const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The original block has a grid with 2 columns:
/*
<div className="grid grid-cols-2 gap-2 dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2">
  <button onClick={() => { if (theme === 'dark') toggleTheme(); }} ... Day Mode </button>
  <button onClick={() => { if (theme === 'light') toggleTheme(); }} ... Night Mode </button>
</div>
*/

// We'll replace it with a 3-column grid including Blueprint
// But `toggleTheme` toggles everything. Wait, we should import `setTheme` in Dashboard.tsx
// if not already there, we can extract it from `useTheme()`.
if (!code.includes('const { theme, toggleTheme } = useTheme();') && code.includes('const { theme, toggleTheme, setTheme } = useTheme();')) {
  // already updated?
} else {
  code = code.replace(
    'const { theme, toggleTheme } = useTheme();',
    'const { theme, setTheme } = useTheme();'
  );
}

const originalGrid = `<div className="grid grid-cols-2 gap-2 dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2">
                <button
                  onClick={() => { if (theme === 'dark') toggleTheme(); }}
                  className={\`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 \${
                    theme === 'light'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-600 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }\`}
                >
                  <Sun size={11} /> Day Mode
                </button>
                <button
                  onClick={() => { if (theme === 'light') toggleTheme(); }}
                  className={\`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 \${
                    theme === 'dark'
                      ? 'dark:bg-indigo-500/20 dark:border-indigo-500/40 text-[#00D4FF] font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                  }\`}
                >
                  <Moon size={11} /> Night Mode
                </button>
              </div>`;

const newGrid = `<div className="grid grid-cols-3 gap-2 dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2">
                <button
                  onClick={() => setTheme('light')}
                  className={\`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 \${
                    theme === 'light'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-600 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }\`}
                >
                  <Sun size={11} /> Day
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={\`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 \${
                    theme === 'dark'
                      ? 'dark:bg-indigo-500/20 dark:border-indigo-500/40 text-[#00D4FF] font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                  }\`}
                >
                  <Moon size={11} /> Night
                </button>
                <button
                  onClick={() => setTheme('blueprint')}
                  className={\`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 \${
                    theme === 'blueprint'
                      ? 'bg-blue-900/30 border-blue-400/50 text-blue-300 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                  }\`}
                >
                  <Map size={11} /> Blueprint
                </button>
              </div>`;

code = code.replace(originalGrid, newGrid);

// Ensure Map is imported from lucide-react if not already
if (!code.includes('Map,') && !code.includes('Map ')) {
  code = code.replace('Sun, Moon,', 'Sun, Moon, Map,');
}

fs.writeFileSync('src/components/Dashboard.tsx', code);
