import React, { useEffect, useState } from 'react';
import { MasterSovereignState, querySovereignContextBridge, updateHardwareTelemetryStream } from '../lib/SovereignMasterEngine';

interface DashboardProps {
  sovereignState: MasterSovereignState;
  frameUpdateTick: number;
  onExecuteMcpQuery: (queryString: string) => void;
  onModifyTelemetryValue: (sensorId: string, val: number) => void;
}

export const SovereignIntelligenceDashboard: React.FC<DashboardProps> = ({
  sovereignState,
  frameUpdateTick,
  onExecuteMcpQuery,
  onModifyTelemetryValue
}) => {
  const [activeTab, setActiveTab] = useState<string>("00");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  useEffect(() => {
    setSystemLogs([...sovereignState.liveTelemetryBuffer]);
  }, [frameUpdateTick, sovereignState]);

  const handleMcpEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const evaluationOutput = querySovereignContextBridge(sovereignState, searchQuery);
    setMcpResult(evaluationOutput);
    onExecuteMcpQuery(searchQuery);
  };

  return (
    <div className="aaa-interface-panel" style={{ width: '440px' }}>
      <div className="interface-header-block">
        <div className="brand-title-group">
          <span className="brand-sub-tag">POINT TOWNSHIP FLOOD INTELLIGENCE PLATFORM</span>
          <h1 className="brand-main-title" style={{ fontSize: '15px' }}>SOVEREIGN MISSION CORE FRAMEWORK</h1>
        </div>
        <div className="status-display-chip status-alert-nominal" style={{ fontSize: '8px' }}>
          SOVEREIGN V1.0
        </div>
      </div>

      <label className="row-annotation-lbl">WORKBOOK NAVIGATION & DATA SCOPE MATRICES</label>
      <div className="workbook-tabs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
        {Array.from(sovereignState.workbookNavigation.values()).map((section: any) => (
          <button
            key={section.tabIndex}
            onClick={() => setActiveTab(section.tabIndex)}
            className="ui-action-btn"
            style={{
              padding: '6px 2px',
              fontSize: '9px',
              background: activeTab === section.tabIndex ? 'rgba(14, 165, 233, 0.15)' : '#1e293b',
              borderColor: activeTab === section.tabIndex ? '#0ea5e9' : '#334155',
              color: activeTab === section.tabIndex ? '#38bdf8' : '#cbd5e1'
            }}
          >
            TAB {section.tabIndex}
          </button>
        ))}
      </div>

      {sovereignState.workbookNavigation.has(activeTab) && (
        <div className="telemetry-card" style={{ padding: '10px', marginBottom: '14px', background: '#090d16' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fbbf24', display: 'block', marginBottom: '4px' }}>
            {sovereignState.workbookNavigation.get(activeTab)?.title.toUpperCase()} TARGET SCOPE
          </span>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 6px 0', lineHeight: '1.4' }}>
            {sovereignState.workbookNavigation.get(activeTab)?.primaryUse}
          </p>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold' }}>
            RECORD MATRIX COUNT: <span style={{ color: '#34d399' }}>{sovereignState.workbookNavigation.get(activeTab)?.recordScopeCount}</span>
          </span>
        </div>
      )}

      <div className="interactive-controls-row border-top-divider">
        <label className="row-annotation-lbl">MODEL CONTEXT PROTOCOL (MCP) INTEGRATION BRIDGE</label>
        <form onSubmit={handleMcpEvaluation} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Query genealogy tree or engineering schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: '#020617', border: '1px solid #334155', color: '#fff', fontSize: '11px', flex: 1, padding: '6px', borderRadius: '4px' }}
          />
          <button type="submit" className="ui-action-btn state-active" style={{ flex: '0 0 80px', padding: '0' }}>BRIDGE</button>
        </form>
        {mcpResult && (
          <div className="calculator-output-overlay" style={{ background: 'rgba(2,6,23,0.8)', border: '1px solid #1e293b', padding: '8px', borderRadius: '4px', fontSize: '10px', marginBottom: '8px' }}>
            <div style={{ color: '#fbbf24', marginBottom: '2px', fontWeight: 'bold' }}>ROUTED TARGET: {mcpResult.matchedSection}</div>
            <div style={{ color: '#94a3b8', lineHeight: '1.3' }}>{mcpResult.associatedTelemetry || mcpResult.monitoredScope || mcpResult.systemResponse}</div>
          </div>
        )}
      </div>

      <div className="interactive-controls-row border-top-divider">
        <label className="row-annotation-lbl">HARDWARE TELEMETRY LOGGERS (PT-001 ACTION TRIGGER)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', width: '50px' }}>PT-001:</span>
          <input
            type="range"
            min="0"
            max="30"
            defaultValue="12"
            onChange={(e) => onModifyTelemetryValue("PT-001", parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#0ea5e9' }}
          />
        </div>
      </div>

      <div className="telemetry-terminal-container" style={{ marginTop: '10px' }}>
        <label className="terminal-lbl">SOVEREIGN WORKBOOK BACKBONE LIVE ENGINE TICKERS</label>
        <div className="terminal-viewport-box">
          {systemLogs.slice(-3).map((logLine, index) => (
            <div key={index} className="terminal-output-line">
              <span className="terminal-prompt-caret">$&gt;</span> {logLine}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
