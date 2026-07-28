import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AudioSystemProvider } from './context/AudioContext';

// Clean up console noise from third-party library deprecation warnings beyond our control
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.Clock') ||
     args[0].includes('THREE.WebGLShadowMap') ||
     args[0].includes('PCFSoftShadowMap'))
  ) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AudioSystemProvider>
        <App />
      </AudioSystemProvider>
    </ThemeProvider>
  </StrictMode>,
);
