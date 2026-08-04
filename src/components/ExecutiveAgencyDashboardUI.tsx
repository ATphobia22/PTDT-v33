import React, { useEffect, useState } from 'react';
import { TwinVersion1State, StructureProfile } from '../lib/TriRiverValleyTwinV1';

interface TwinMonitorV1Props {
  state: TwinVersion1State;
  tickTrigger: number;
  onHistoricalToggle: (layerId: string) => void;
}

export const ExecutiveAgencyDashboardUI: React.FC<TwinMonitorV1Props> = ({ state, tickTrigger, onHistoricalToggle }) => {
  const [metrics, setMetrics] = useState({
    alertLevel: 'NOMINAL',
    totalStructures: 0,
    floodedCount: 0,
    breachCount: 0,
    activeHistorical: 'NONE'
  });

  useEffect(() => {
    let fCount = 0;
    let bCount = 0;
    state.structures.forEach((s) => {
      if (s.flooded) fCount++;
      if (s.subsurfaceBreach) bCount++;
    });

    setMetrics({
      alertLevel: state.systemAlertLevel,
      totalStructures: state.structures.size,
      floodedCount: fCount,
      breachCount: bCount,
      activeHistorical: state.activeHistoricalLayerId || 'NONE'
    });
  }, [tickTrigger, state]);

  return (
    <div className="agency-hud aaa-interface-panel">
      <div className="hud-header interface-header-block">
        <span className="hud-title brand-sub-tag">TRI-RIVER VALLEY ENGINE v1.0</span>
        <div className={`hud-chip status-display-chip ${metrics.alertLevel === 'NOMINAL' ? 'status-ok status-alert-nominal' : 'alert status-alert-critical'}`}>
          {metrics.alertLevel}
        </div>
      </div>

      <div className="hud-metrics-grid telemetry-layout-grid">
        <div className="metric-box telemetry-card"><label className="card-lbl">ENGINE STATE CRS</label><div className="metric-value code-font card-val code-font-rendering">EPSG:2966</div></div>
        <div className="metric-box telemetry-card"><label className="card-lbl">MONITORED HOUSES</label><div className="metric-value card-val">{metrics.totalStructures}</div></div>
        <div className="metric-box telemetry-card"><label className="card-lbl">INUNDATIONS</label><div className={`metric-value card-val ${metrics.floodedCount > 0 ? 'text-red color-error' : ''}`}>{metrics.floodedCount}</div></div>
        <div className="metric-box telemetry-card"><label className="card-lbl">WELL AMBIENT BREACH</label><div className={`metric-value card-val ${metrics.breachCount > 0 ? 'text-orange color-warn' : ''}`}>{metrics.breachCount}</div></div>
      </div>

      <div className="hud-controls-section interactive-controls-row border-top-divider">
        <label className="section-title row-annotation-lbl">HISTORICAL LAYOUT CONFIGURATION MATRIX</label>
        <div className="button-group action-button-matrix">
          <button className={`hud-btn ui-action-btn ${metrics.activeHistorical === 'harmony_1814_1825' ? 'active state-active' : ''}`} onClick={() => onHistoricalToggle('harmony_1814_1825')}>1824 Harmonie Plat</button>
          <button className={`hud-btn ui-action-btn ${metrics.activeHistorical === 'posey_1909' ? 'active state-active' : ''}`} onClick={() => onHistoricalToggle('posey_1909')}>1909 County Map</button>
        </div>
      </div>

      <div className="hud-system-logs telemetry-terminal-container">
        <label className="terminal-lbl">ACTIVE LIVE ENGINE SYSTEM TELEMETRY TELETYPES</label>
        <div className="log-output terminal-viewport-box">
          {state.telemetryLogs.slice(-2).map((log, index) => (
            <div key={index} className="log-line terminal-output-line"><span className="terminal-prompt-caret">$&gt;</span> {log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
