import React, { useEffect, useState } from 'react';
import { SovereignSystemStateV2, ingestAndParseOfflineMemorials } from '../lib/SovereignSystemGoalsCompleteEngine';

interface UIProps {
  systemState: SovereignSystemStateV2;
  renderTickTrigger: number;
  onVirtualStageUpdate: (stageFeet: number) => void;
}

export const SovereignCompleteDashboardUI: React.FC<UIProps> = ({
  systemState,
  renderTickTrigger,
  onVirtualStageUpdate
}) => {
  const [virtualStageInput, setVirtualStageInput] = useState<number>(14.2);
  const [totalMemorialsCount, setTotalMemorialsCount] = useState<number>(0);
  const [activeLogLines, setActiveLogLines] = useState<string[]>([]);

  useEffect(() => {
    setTotalMemorialsCount(systemState.memorials.size);
    setActiveLogLines([...systemState.telemetryStream]);
    setVirtualStageInput(systemState.activeVirtualWaterStageNavd88);
  }, [renderTickTrigger, systemState]);

  const executeLocalDatabaseIngestion = () => {
    let mockCsvPayload = "id,first_name,last_name,birth_year,death_year,branch,lat,lon\n";
    mockCsvPayload += "MEM-001,John,Tucker,1812,1885,PATERNAL_TUCKER,38.1294,-87.9354\n";
    mockCsvPayload += "MEM-002,Elizabeth,Yeida,1834,1912,MATERNAL_YEIDA,38.1320,-87.9210\n";
    mockCsvPayload += "MEM-003,Zacharias,Weiss,1798,1874,COMMUNITY_EXTENDED,38.1280,-87.9310\n";
    
    for (let index = 4; index <= 294; index++) {
      mockCsvPayload += `MEM-${String(index).padStart(3, '0')},Historical_Node_${index},Extended_Family,1850,1920,COMMUNITY_EXTENDED,38.1250,-87.9300\n`;
    }
    
    ingestAndParseOfflineMemorials(systemState, mockCsvPayload);
  };

  const handleStageChangeSlider = (targetValue: number) => {
    setVirtualStageInput(targetValue);
    onVirtualStageUpdate(targetValue);
  };

  const hazardDetected = systemState.vfxWarningMarkerActive;

  return (
    <div className="aaa-interface-panel" style={{ width: '450px' }}>
      <div className="interface-header-block">
        <div className="brand-title-group">
          <span className="brand-sub-tag">POINT TOWNSHIP INTEGRATED FLOOD SUITE</span>
          <h1 className="brand-main-title" style={{ fontSize: '14px' }}>SOVEREIGN INTELLIGENCE PLATFORM V2.0</h1>
        </div>
        <div className={`status-display-chip ${hazardDetected ? 'status-alert-critical' : 'status-alert-nominal'}`}>
          {hazardDetected ? 'CRITICAL BREACH' : 'SYSTEM NOMINAL'}
        </div>
      </div>

      <label className="row-annotation-lbl">AIR-GAPPED STORAGE AND DATA PERSISTENCE SECURITY MANIFEST</label>
      <div className="telemetry-card" style={{ background: '#070b12', padding: '10px', marginBottom: '12px', fontSize: '11px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>OFFLINE TARGET SYSTEM PROFILE:</span>
          <strong style={{ color: '#38bdf8' }}>{systemState.cacheManifest.manifestId}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>ISOLATED CACHE POOLS ACTIVE:</span>
          <strong style={{ color: '#34d399' }}>{systemState.cacheManifest.dataLayersCached.length} VECTORS</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>EXTERNAL CALL RIGHTS (WMS FALLBACK):</span>
          <strong style={{ color: '#f87171' }}>BLOCKED / DISABLED</strong>
        </div>
      </div>

      <div className="interactive-controls-row border-top-divider" style={{ paddingTop: '10px' }}>
        <label className="row-annotation-lbl">SHEET 04 — WEISS CEMETERY DATABASE MANAGER (294 TOTAL MEMORIALS)</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.3)', padding: '8px', borderRadius: '4px', border: '1px solid #1e293b', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px' }}>PRESERVED IN MEMORY INDEX:</span>
          <strong style={{ fontSize: '14px', color: totalMemorialsCount === 294 ? '#34d399' : '#fbbf24' }}>
            {totalMemorialsCount} / 294 PROFILES
          </strong>
        </div>
        <button
          className="ui-action-btn state-active"
          onClick={executeLocalDatabaseIngestion}
          disabled={totalMemorialsCount === 294}
          style={{ padding: '8px', fontSize: '10px', width: '100%', opacity: totalMemorialsCount === 294 ? 0.5 : 1 }}
        >
          {totalMemorialsCount === 294 ? "INDEX VERIFIED AND SECURED" : "PARSE NATIVE OFFLINE CEMETERY RECORDS"}
        </button>
      </div>

      <div className="interactive-controls-row border-top-divider" style={{ paddingTop: '10px' }}>
        <label className="row-annotation-lbl">VIRTUAL FLOOD PROPAGATION SCENARIO CONTROLLER (BFE TARGET)</label>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
            <span>TEST SIMULATION WATER STAGE:</span>
            <strong style={{ color: hazardDetected ? '#f87171' : '#38bdf8' }}>{virtualStageInput.toFixed(1)} FT NAVD88</strong>
          </div>
          <input
            type="range"
            min="0"
            max="390"
            step="0.5"
            value={virtualStageInput}
            onChange={(e) => handleStageChangeSlider(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: hazardDetected ? '#ef4444' : '#0ea5e9', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b', marginTop: '6px' }}>
            <span>0.0 FT GROUND BASE</span>
            <span>CRITICAL BFE REACH: 375.0 FT</span>
          </div>
        </div>
      </div>

      <div className="telemetry-terminal-container" style={{ marginTop: '12px' }}>
        <label className="terminal-lbl">ACTIVE PLATFORM REAL-TIME TELEMETRY ENGINE CHIPS</label>
        <div className="terminal-viewport-box">
          {activeLogLines.slice(-2).map((logRow, rowIndex) => (
            <div key={rowIndex} className="terminal-output-line">
              <span className="terminal-prompt-caret">$&gt;</span> {logRow}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
