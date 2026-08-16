import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapLibreDeckHybrid } from './viz/MapLibreDeckHybrid';
import type { TwinStateName } from './core/TwinStateManager';
import './styles.css';

function App(): React.JSX.Element {
  const [stageFt, setStageFt] = useState(54.93);
  const [twinState, setTwinState] = useState<TwinStateName>('LIVE_TELEMETRY');
  const layerVisibility = useMemo(() => ({ extrudedBuildings: true, flood100Yr: true }), []);

  return (
    <main className="ptdt-app">
      <MapLibreDeckHybrid
        stageFt={stageFt}
        twinState={twinState}
        layerVisibility={layerVisibility}
      />
      <section className="ptdt-hud" aria-label="PTDT system status">
        <div>
          <strong>PTDT v35</strong>
          <span>Tri-State River Valley</span>
        </div>
        <div className="ptdt-controls">
          <label>
            Stage (ft)
            <input
              type="number"
              min="0"
              step="0.01"
              value={stageFt}
              onChange={(event) => setStageFt(Number(event.target.value))}
            />
          </label>
          <label>
            Twin state
            <select value={twinState} onChange={(event) => setTwinState(event.target.value as TwinStateName)}>
              <option value="LIVE_TELEMETRY">LIVE TELEMETRY</option>
              <option value="HYDROLOGIC_SIMULATION">SIMULATION RUNNING</option>
              <option value="DEGRADED_STALE">DEGRADED / STALE</option>
              <option value="CRITICAL_INUNDATION">CRITICAL INUNDATION</option>
              <option value="FAIL_CLOSED">FAIL CLOSED</option>
            </select>
          </label>
        </div>
        <small>Presentation-only map • authoritative SceneState remains server-side • NAVD88</small>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
