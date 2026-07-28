const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace the full-screen backdrop with a floating panel
code = code.replace(
  '<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">',
  '<div className="fixed top-20 right-6 z-[150] w-[350px] flex flex-col shadow-2xl">'
);

// We also need to fix the rounded-lg class and remove max-w-md
code = code.replace(
  'className="bg-white dark:bg-[#001428]/95 border border-slate-200 dark:border-indigo-500/30 p-6 rounded-lg w-full max-w-md shadow-2xl font-sans relative max-h-[85vh] overflow-y-auto scrollbar-hide dark:text-slate-100 text-slate-900 transition-colors duration-300"',
  'className="bg-white dark:bg-[#001428]/95 border border-slate-200 dark:border-indigo-500/30 p-5 rounded-lg w-full font-sans relative max-h-[80vh] overflow-y-auto scrollbar-hide dark:text-slate-100 text-slate-900 transition-colors duration-300 backdrop-blur-md shadow-2xl"'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
