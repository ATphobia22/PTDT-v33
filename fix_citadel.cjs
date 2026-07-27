const fs = require('fs');

const file = 'src/components/SovereignCitadelView.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the line that has "const triggerSimulation = async () => {"
const startLine = lines.findIndex(l => l.includes('const triggerSimulation = async () => {'));
// Find the line with "};" at line 146
const endLine = lines.findIndex((l, i) => i > startLine && l.includes('};') && lines[i-1].includes('2500)'));

const newTrigger = `  const triggerSimulation = async () => {
    if (systemStatus !== 'ONLINE') return;
    
    setSystemStatus('COMPUTING');
    addLog('Executing Tucker Cognitive OS OpenMI 2.0 DAG Orchestration...', 'info');
    addLog('Multi-solver cluster locked at 120 Hz fixed timestep.', 'info');
    
    try {
      const response = await fetch('/api/v1/twin/simulate', {
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

// replace lines
if (startLine !== -1 && endLine !== -1) {
  lines.splice(startLine, endLine - startLine + 1, newTrigger);
  fs.writeFileSync(file, lines.join('\n'));
} else {
  console.log("Could not find bounds", startLine, endLine);
}
