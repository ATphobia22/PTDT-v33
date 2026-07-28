const fs = require('fs');

// Patch DebugConsole to span only the right half, or be a floating window
let dc = fs.readFileSync('src/components/DebugConsole.tsx', 'utf8');
dc = dc.replace(
  'fixed bottom-0 left-0 right-0',
  'fixed bottom-0 right-0 w-full md:w-[50vw]'
);
fs.writeFileSync('src/components/DebugConsole.tsx', dc);

// Patch TerminalOverlay to span only the left half
let to = fs.readFileSync('src/components/TerminalOverlay.tsx', 'utf8');
to = to.replace(
  'fixed bottom-0 left-0 right-0',
  'fixed bottom-0 left-0 w-full md:w-[50vw]'
);
fs.writeFileSync('src/components/TerminalOverlay.tsx', to);
