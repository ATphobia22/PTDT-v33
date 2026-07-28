const fs = require('fs');
let code = fs.readFileSync('src/components/MapComponent.tsx', 'utf8');

code = code.replace(
  /theme === 'dark'/g,
  "(theme === 'dark' || theme === 'blueprint')"
);

fs.writeFileSync('src/components/MapComponent.tsx', code);
