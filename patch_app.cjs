const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// add import DebugConsole
if (!code.includes('DebugConsole')) {
  code = code.replace(
    "import { SovereignCitadelView } from './components/SovereignCitadelView';",
    "import { SovereignCitadelView } from './components/SovereignCitadelView';\nimport { DebugConsole } from './components/DebugConsole';"
  );
}

// add DebugConsole right before last closing div
if (!code.includes('<DebugConsole />')) {
  code = code.replace(
    "      </div>\n    </div>\n  );\n}",
    "      </div>\n      <DebugConsole />\n    </div>\n  );\n}"
  );
}

fs.writeFileSync('src/App.tsx', code);
