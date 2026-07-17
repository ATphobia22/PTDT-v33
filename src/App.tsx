import { Dashboard } from './components/Dashboard';
import { useTheme } from './context/ThemeContext';

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Dashboard />
    </div>
  );
}

export default App;
