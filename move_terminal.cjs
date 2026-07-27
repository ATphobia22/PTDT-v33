const fs = require('fs');

// Remove from Dashboard.tsx
let dashCode = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashCode = dashCode.replace("import { TerminalOverlay } from './TerminalOverlay';\n", "");
dashCode = dashCode.replace("<TerminalOverlay />", "");
fs.writeFileSync('src/components/Dashboard.tsx', dashCode);

// Add to App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('TerminalOverlay')) {
  appCode = appCode.replace(
    "import { DebugConsole } from './components/DebugConsole';",
    "import { DebugConsole } from './components/DebugConsole';\nimport { TerminalOverlay } from './components/TerminalOverlay';"
  );
  appCode = appCode.replace(
    "<DebugConsole />",
    "<DebugConsole />\n      <TerminalOverlay />"
  );
  fs.writeFileSync('src/App.tsx', appCode);
}
