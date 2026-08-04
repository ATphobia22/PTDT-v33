import React, { useEffect, useState, useRef } from 'react';
import { SovereignCompleteDashboardUI } from './components/SovereignCompleteDashboardUI';
import { createSovereignSystemStateV2 } from './lib/SovereignSystemGoalsCompleteEngine';

export const SovereignIntegrationWrapper: React.FC = () => {
  const [systemState] = useState(() => createSovereignSystemStateV2());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVirtualStageUpdate = (stage: number) => {
    systemState.activeVirtualWaterStageNavd88 = stage;
    if (stage >= systemState.criticalFloodStageThresholdNavd88) {
      if (!systemState.vfxWarningMarkerActive) {
        systemState.vfxWarningMarkerActive = true;
        systemState.telemetryStream.push(`[CRITICAL] Flood Stage ${stage.toFixed(1)} breached BFE.`);
      }
    } else {
      if (systemState.vfxWarningMarkerActive) {
        systemState.vfxWarningMarkerActive = false;
        systemState.telemetryStream.push(`[NOMINAL] Water stage receded to ${stage.toFixed(1)} ft.`);
      }
    }
    setTick(prev => prev + 1);
  };

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 9999 }}>
      <SovereignCompleteDashboardUI 
        systemState={systemState}
        renderTickTrigger={tick}
        onVirtualStageUpdate={handleVirtualStageUpdate}
      />
    </div>
  );
};
