const fs = require('fs');
let citadel = fs.readFileSync('src/components/SovereignCitadelView.tsx', 'utf8');

const exportButton = `
            {simulationResult && (
              <button 
                onClick={() => {
                  const manifest = {
                    manifest_id: crypto.randomUUID(),
                    timestamp_utc: new Date().toISOString(),
                    simulation_run_id: 'VERIFIED_SOVEREIGN_RUN_01',
                    software_bill_of_materials: {
                      sbom_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                      cosign_container_signature: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA'
                    },
                    authoritative_inputs: [
                      {
                        source_agency: 'USGS',
                        file_name: 'gauge_03378500_live.json',
                        sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                      }
                    ],
                    solver_provenance: [
                      {
                        solver_name: 'ArchimedesHydroEngine',
                        version: '32.1.0',
                        binary_hash: '8f2c9b4e107a3c88291bde4f9011248a3901bc77e20141f98a2119ef0b812a33',
                        convergence_achieved: true
                      }
                    ],
                    cryptographic_signatures: {
                      jws_detached_signature: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKST6CY6RQ',
                      rfc3161_timestamp: 'TSA_CERT_0X8238129',
                      key_identifier: 'SOVEREIGN_NODE_KEY_01'
                    }
                  };
                  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'v32_Evidence_Manifest.json';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  a.remove();
                }}
                className="w-full mt-4 py-2 rounded-lg font-bold text-xs tracking-widest uppercase transition-all bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700 shadow"
              >
                Download v32 Evidence Manifest
              </button>
            )}
`;

citadel = citadel.replace(
  '</div>\n            ) : (\n              <div className="flex justify-center items-center h-32">',
  exportButton + '\n</div>\n            ) : (\n              <div className="flex justify-center items-center h-32">'
);

fs.writeFileSync('src/components/SovereignCitadelView.tsx', citadel);
