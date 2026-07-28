const fs = require('fs');

let overture = fs.readFileSync('src/components/OvertureTwinView.tsx', 'utf8');
overture = overture.replace(/theme === 'dark'/g, "(theme === 'dark' || theme === 'blueprint')");
fs.writeFileSync('src/components/OvertureTwinView.tsx', overture);

let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
// Fix tooltip text and icons
dashboard = dashboard.replace(
  "title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}",
  "title={theme === 'dark' ? 'Switch to Day Mode' : theme === 'blueprint' ? 'Switch to Night Mode' : 'Switch to Blueprint Mode'}"
);
dashboard = dashboard.replace(
  "{theme === 'dark' ? <Sun size={18} className=\"text-[#00D4FF]\" /> : <Moon size={18} className=\"text-indigo-600\" />}",
  "{theme === 'dark' ? <Sun size={18} className=\"text-[#00D4FF]\" /> : theme === 'blueprint' ? <Moon size={18} className=\"text-[#00D4FF]\" /> : <Moon size={18} className=\"text-indigo-600\" />}"
);
// Fix the background color logic
dashboard = dashboard.replace(/theme === 'dark'/g, "(theme === 'dark' || theme === 'blueprint')");
fs.writeFileSync('src/components/Dashboard.tsx', dashboard);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  "className={`${theme === 'dark' ? 'dark' : ''} w-screen h-screen overflow-hidden relative`}",
  "className={`${theme === 'dark' ? 'dark' : theme === 'blueprint' ? 'dark blueprint' : ''} w-screen h-screen overflow-hidden relative`}"
);
fs.writeFileSync('src/App.tsx', app);
