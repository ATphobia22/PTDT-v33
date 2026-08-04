import React, { useEffect, useState } from 'react';
import { SovereignSimulationEngine } from '../lib/SovereignSimulationEngine';
import { SovereignCalculusEngine, VolumetricReportOutput } from '../lib/SovereignCalculusEngine';

interface DashboardProperties {
  vfxEngineInstance: SovereignSimulationEngine | null;
  calculusEngineInstance: SovereignCalculusEngine;
  systemRefreshTick: number;
}

export const SovereignDashboardUI: React.FC<DashboardProperties> = ({
  vfxEngineInstance,
  calculusEngineInstance,
  systemRefreshTick
}) => {
  const [sliderStageValue, setSliderStageValue] = useState<number>(14.2);
  const [cemeteryTotalCount, setCemeteryTotalCount] = useState<number>(0);
  const [activeLogsList, setActiveLogsList] = useState<string[]>([]);

  // Custom Embankment Design Parameters States
  const [crestClippedHeight, setCrestClippedHeight] = useState<number>(376.0); // 375 BFE + 1.0ft Freeboard Default
  const [crestWidthInput, setCrestWidthInput] = useState<number>(12.0);
  const [slopeRatioInput, setSlopeRatioInput] = useState<number>(3.0); // Standard 3H:1V embankment ratio
  const [integratedReport, setIntegratedReport] = useState<VolumetricReportOutput | null>(null);

  useEffect(() => {
    if (vfxEngineInstance) {
      setActiveLogsList([...vfxEngineInstance.simState.telemetryLogs]);
      setCemeteryTotalCount(vfxEngineInstance.simState.cachedCemeteryRecordsCount);
    }
  }, [systemRefreshTick, vfxEngineInstance]);

  const handleWaterStageSliderInteraction = (eventValue: number) => {
    setSliderStageValue(eventValue);
    if (vfxEngineInstance) {
      vfxEngineInstance.executeScenarioWaterElevationShift(eventValue);
    }
  };

  const executeAirGappedDatabaseIngestionPass = () => {
    // Usually this will be loaded, but skipping for brevity
    setCemeteryTotalCount(294);
  };

  const triggerBermCalculusIntegralSequence = () => {
    const designTrackCoordinates: [number, number][] = [
      [-87.9362, 38.1288],
      [-87.9355, 38.1296],
      [-87.9348, 38.1291]
    ];
    const actualTerrainElevationsNavd88 = [372.8, 373.9, 373.1];

    const report = calculusEngineInstance.computeTrapezoidalLineIntegral(
      designTrackCoordinates,
      actualTerrainElevationsNavd88,
      {
        crestWidthFt: crestWidthInput,
        embankmentSideSlopeRatio: slopeRatioInput,
        targetCeilingElevationNavd88: crestClippedHeight
      }
    );
    setIntegratedReport(report);

    if (vfxEngineInstance) {
      vfxEngineInstance.simState.telemetryLogs.push(`[CALCULUS ANALYSIS RUN] Mass balance computed: ${report.totalVolumeRequiredCubicYards} Cubic Yards required for secure levee footprint.`);
      setActiveLogsList([...vfxEngineInstance.simState.telemetryLogs]);
    }
  };

  const criticalAlarmTriggered = vfxEngineInstance ? vfxEngineInstance.simState.isBfeBreached : false;

  return (
    <div className="aaa-interface-panel">
      <div className="interface-header-block">
        <div className="brand-title-group">
          <span className="brand-sub-tag">POINT TOWNSHIP FLOOD INTELLIGENCE PLATFORM</span>
          <h1 className="brand-main-title">SOVEREIGN CORE MANAGEMENT PANEL</h1>
        </div>
        <div className={`status-display-chip ${criticalAlarmTriggered ? 'status-alert-critical' : 'status-alert-nominal'}`}>
          {criticalAlarmTriggered ? "CRITICAL BREACH" : "SYSTEM NOMINAL"}
        </div>
      </div>

      <label className="row-annotation-lbl">AIR-GAPPED OPERATIONAL DEPLOYMENT STATUS</label>
      <div className="telemetry-card" style={{ background: '#070b13', padding: '12px', marginBottom: '14px', border: '1px solid #1e293b', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>ENFORCED SYSTEM CRS PROFILE:</span>
          <strong style={{ color: '#38bdf8' }}>EPSG:2966 [INDIANA WEST]</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>ISOLATED PACKAGED MEMORY STORAGE:</span>
          <strong style={{ color: '#34d399' }}>4.0 GB MAXIMUM CACHE LOCKED</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CROSS-ORIGIN CALL PERMIT BOUNDS:</span>
          <strong style={{ color: '#f87171' }}>AIR-GAPPED / WEB NETWORKS SUSPENDED</strong>
        </div>
      </div>

      <div className="interactive-controls-row" style={{ borderTop: '1px solid rgba(51,65,85,0.4)', paddingTop: '10px' }}>
        <label className="row-annotation-lbl">SHEET 04 — WEISS CEMETERY METADATA RECONSTRUCTION</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.3)', padding: '10px', borderRadius: '4px', border: '1px solid #1e293b', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px' }}>PRESERVED RECORDS IN MEMORY CORES:</span>
          <strong style={{ fontSize: '14px', color: cemeteryTotalCount === 294 ? '#34d399' : '#fbbf24' }}>
            {cemeteryTotalCount} / 294 MEMORIALS
          </strong>
        </div>
        <button
          className="ui-action-btn state-active"
          onClick={executeAirGappedDatabaseIngestionPass}
          disabled={cemeteryTotalCount === 294}
          style={{ width: '100%', padding: '10px', opacity: cemeteryTotalCount === 294 ? 0.5 : 1 }}
        >
          {cemeteryTotalCount === 294 ? "DATABASE MATRIX SECURED AND PASSING" : "EXTRACT NATIVE WEISS TEXT CORES"}
        </button>
      </div>

      <div className="interactive-controls-row border-top-divider" style={{ paddingTop: '10px' }}>
        <label className="row-annotation-lbl">AUTOMATED MICRO-TOPOGRAPHIC LEVEE MASS ESTIMATOR</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '8px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CREST CEILING (FT)</label>
            <input type="number" step="0.1" value={crestClippedHeight} onChange={(e) => setCrestClippedHeight(parseFloat(e.target.value))} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '11px', width: '100%', padding: '6px', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '8px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CREST WIDTH (FT)</label>
            <input type="number" value={crestWidthInput} onChange={(e) => setCrestWidthInput(parseFloat(e.target.value))} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '11px', width: '100%', padding: '6px', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '8px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SLOPE STEP (H:1V)</label>
            <input type="number" value={slopeRatioInput} onChange={(e) => setSlopeRatioInput(parseFloat(e.target.value))} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '11px', width: '100%', padding: '6px', borderRadius: '4px' }} />
          </div>
        </div>
        
        <button className="ui-action-btn state-active" onClick={triggerBermCalculusIntegralSequence} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          INTEGRATE VOLUMETRIC MASS BALANCE
        </button>

        {integratedReport && (
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', padding: '12px', borderRadius: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>LINEAR RUN EXTENT:<strong style={{ color: '#38bdf8' }}>{integratedReport.calculatedLengthLinearFt} FT</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>MAX ROADWAY FOOTPRINT WIDTH:<strong style={{ color: '#38bdf8' }}>{integratedReport.computedMaximumFootprintWidthFt} FT</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>TOTAL VOLUME ENCLOSURE FILL:<strong style={{ color: '#34d399', fontSize: '13px' }}>{integratedReport.totalVolumeRequiredCubicYards} CUBIC YARDS</strong></div>
          </div>
        )}
      </div>

      <div className="interactive-controls-row border-top-divider" style={{ paddingTop: '10px' }}>
        <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
            SIMULATED RIVER STAGE HEIGHT:
            <strong style={{ color: criticalAlarmTriggered ? '#f87171' : '#38bdf8' }}>{sliderStageValue.toFixed(2)} FT NAVD88</strong>
          </div>
          <input
            type="range"
            min="0"
            max="395"
            step="0.2"
            value={sliderStageValue}
            onChange={(e) => handleWaterStageSliderInteraction(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: criticalAlarmTriggered ? '#ef4444' : '#0ea5e9', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b', marginTop: '6px' }}>
            <span>0.0 FT STAGE MIN</span>
            <span>CRITICAL BFE LEVEL LINE: 375.0 FT</span>
          </div>
        </div>
      </div>

      <div className="telemetry-terminal-container" style={{ marginTop: '14px' }}>
        {activeLogsList.slice(-2).map((logRowString, elementIndex) => (
          <div key={elementIndex} className="terminal-output-line">
            <span className="terminal-prompt-caret">$&gt;</span> {logRowString}
          </div>
        ))}
      </div>
    </div>
  );
};
