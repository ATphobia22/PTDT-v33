const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.match(/import\s*{[^}]*Map[^}]*}\s*from\s*['"]lucide-react['"]/)) {
  code = code.replace(
    "import { \n  Shield, \n  Activity, \n  Database, \n  Settings, ",
    "import { \n  Shield, \n  Activity, \n  Database, \n  Settings, \n  Map,"
  );
  // Let's just do a simple replace
  code = code.replace(
    "import { Shield, Activity",
    "import { Map, Shield, Activity"
  );
  code = code.replace(
    "import { Play, Pause, Square",
    "import { Map, Play, Pause, Square"
  );
  // It might be imported as something else. Let's look for Sun, Moon
  code = code.replace(
    "Sun, Moon",
    "Sun, Moon, Map"
  );
}
fs.writeFileSync('src/components/Dashboard.tsx', code);
