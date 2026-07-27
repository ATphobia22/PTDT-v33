const fs = require('fs');

let citadel = fs.readFileSync('src/components/SovereignCitadelView.tsx', 'utf8');

const oldTrigger = `  const triggerSimulation = () => {
    if (systemStatus !== 'ONLINE') return;
    
    setSystemStatus('COMPUTING');
    addLog('Executing Tucker Cognitive OS OpenMI 2.0 DAG Orchestration...', 'info');
    addLog('Multi-solver cluster locked at 120 Hz fixed timestep.', 'info');
    
    // Simulate Backend processing time
    setTimeout(() => {
      // Mock Response from FastAPI backend
      const result = {
        scenario_id: 'ARCHIMEDES_BERM_TEST_01',
        metrics: {
          hydraulics: { surface_discharge_cms: 450.2, water_depth_m: 116.19 }, // ~381.2 ft
          geotechnics: { factor_of_safety: 1.65 }
        },
        governance: {
          decision: 'APPROVED_CERTIFIED_NO_RISE',
          audit_trail: [
            "IN-312-IAC-10 PASS: Structural footprint meets zero surcharge displacement criteria."
          ],
          cryptographic_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
        }
      };
      
      setSimulationResult(result);
      setSystemStatus('EVIDENCE_SEALED');
      addLog('Simulation verified. Daubert Evidence Seal Generated.', 'success');
      addLog(\`Cryptographic Hash: \${result.governance.cryptographic_hash.substring(0, 24)}...\`, 'system');
    }, 2500);
  };`;

const newTrigger = `  const triggerSimulation = async () => {
    if (systemStatus !== 'ONLINE') return;
    
    setSystemStatus('COMPUTING');
    addLog('Executing Tucker Cognitive OS OpenMI 2.0 DAG Orchestration...', 'info');
    addLog('Multi-solver cluster locked at 120 Hz fixed timestep.', 'info');
    
    try {
      const response = await fetch('/api/v1/twin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usgs_stage_ft: telemetry?.usgs_stage_ft ?? 381.2,
          discharge_cfs: telemetry?.discharge_cfs ?? 142000.0
        })
      });
      
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      const result = await response.json();
      
      setSimulationResult(result);
      setSystemStatus('EVIDENCE_SEALED');
      addLog('Simulation verified. Daubert Evidence Seal Generated.', 'success');
      addLog(\`Cryptographic Hash: \${result.governance.cryptographic_hash.substring(0, 24)}...\`, 'system');
    } catch (e: any) {
      addLog(\`Simulation failed: \${e.message}\`, 'error');
      setSystemStatus('ONLINE');
    }
  };`;

citadel = citadel.replace(oldTrigger, newTrigger);
fs.writeFileSync('src/components/SovereignCitadelView.tsx', citadel);
