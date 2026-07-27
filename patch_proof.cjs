const fs = require('fs');
let code = fs.readFileSync('src/components/ScientificProofOverlay.tsx', 'utf8');

if (!code.includes('isExpanded')) {
  // Add isExpanded state
  code = code.replace(
    "const [isMinimized, setIsMinimized] = useState<boolean>(false);",
    "const [isMinimized, setIsMinimized] = useState<boolean>(false);\n  const [isExpanded, setIsExpanded] = useState<boolean>(false);"
  );

  // Add the maximize/minimize button to the header
  const headerSearch = `<button \n            onClick={onClose}\n            title="Close Panel"`;
  const headerReplace = `<button 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse height" : "Expand height"}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button 
            onClick={onClose}
            title="Close Panel"`;

  code = code.replace(headerSearch, headerReplace);

  code = code.replace(
    `className="absolute top-20 left-6 z-30 w-[420px] bg-slate-900/95 border border-indigo-500/40 rounded-xl shadow-2xl backdrop-blur-md text-slate-100 font-mono text-xs max-h-[80vh] flex flex-col overflow-hidden"`,
    `className={\`absolute top-20 left-6 z-30 w-[420px] bg-slate-900/95 border border-indigo-500/40 rounded-xl shadow-2xl backdrop-blur-md text-slate-100 font-mono text-xs \${isExpanded ? 'h-[80vh]' : 'max-h-[80vh]'} flex flex-col overflow-hidden\`}`
  );
  
  fs.writeFileSync('src/components/ScientificProofOverlay.tsx', code);
}
