const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

dash = dash.replace(
  '{/* Side Panels - HUD */}',
  '{!zenMode && (<>\n        {/* Side Panels - HUD */}'
);

fs.writeFileSync('src/components/Dashboard.tsx', dash);
