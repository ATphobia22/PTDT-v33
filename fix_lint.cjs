const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

dash = dash.replace(
  'const { theme, setTheme } = useTheme();',
  'const { theme, setTheme, toggleTheme } = useTheme();'
);

dash = dash.replace(
  `title={(theme === 'dark' || theme === 'blueprint') ? 'Switch to Day Mode' : theme === 'blueprint' ? 'Switch to Night Mode' : 'Switch to Blueprint Mode'}`,
  `title={theme === 'dark' ? 'Switch to Day Mode' : theme === 'blueprint' ? 'Switch to Night Mode' : 'Switch to Blueprint Mode'}`
);

dash = dash.replace(
  `{(theme === 'dark' || theme === 'blueprint') ? <Sun size={18} className="text-[#00D4FF]" /> : theme === 'blueprint' ? <Moon size={18} className="text-[#00D4FF]" /> : <Moon size={18} className="text-indigo-600" />}`,
  `{theme === 'dark' ? <Sun size={18} className="text-[#00D4FF]" /> : theme === 'blueprint' ? <Moon size={18} className="text-[#00D4FF]" /> : <Moon size={18} className="text-indigo-600" />}`
);

fs.writeFileSync('src/components/Dashboard.tsx', dash);
