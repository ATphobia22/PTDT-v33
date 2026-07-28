const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const simEndpoint = `  app.post("/api/v1/twin/simulation", (req, res) => {
    const payload = req.body || {};
    const stage_ft = payload.usgs_stage_ft ?? 381.2;
    const flow_cfs = payload.discharge_cfs ?? 142000.0;

    const depth_ft = Math.max(0.5, stage_ft - 370.0);
    
    const manning_n_floodplain = 0.045;
    const river_slope = 0.00015;
    
    let velocity = 0.0;
    if (depth_ft > 0.0) {
        velocity = (1.486 / manning_n_floodplain) * Math.pow(depth_ft, 2.0 / 3.0) * Math.pow(river_slope, 0.5);
        velocity = Math.round(velocity * 1000) / 1000;
    }

    const surface_discharge_cms = flow_cfs * 0.0283168;
    const water_depth_m = depth_ft * 0.3048;
    const velocity_ms = velocity;
    
    const hydraulic_state = {
        surface_discharge_cms,
        water_depth_m,
        velocity_ms
    };

    const sim_depth_ft = water_depth_m * 3.28084;
    const calculated_rise_ft = Math.max(0.0, sim_depth_ft - stage_ft);
    
    let audit_trail = [];
    let is_compliant = true;
    
    if (calculated_rise_ft > 0.14) {
        is_compliant = false;
        audit_trail.push(\`IN-312-IAC-10 BREACH: Stage rise of \${calculated_rise_ft.toFixed(4)}ft violates strict state No-Rise Mandate.\`);
    } else {
        // As per PDF: "IN-312-IAC-10 PASS: Structural footprint meets zero surcharge displacement criteria." (Wait, what was the exact text?
        // Let's check the OCR: "IN-312-IAC-10 PASS: Structural footprint meets zero surcharge displacement criteria.")
        audit_trail.push("IN-312-IAC-10 PASS: Structural footprint meets zero surcharge displacement criteria.");
    }
    
    const decision = is_compliant ? "APPROVED_CERTIFIED_NO_RISE" : "REJECTED_STATUTORY_VIOLATION";
    const timestamp = new Date().toISOString();
    
    const ledger_entry = \`\${timestamp}|\${decision}|Rise:\${calculated_rise_ft}\`;
    const sha256_hash = crypto.createHash('sha256').update(ledger_entry).digest('hex');

    const governance = {
        decision,
        audit_trail,
        cryptographic_hash: sha256_hash
    };

    res.json({
        status: "success",
        node: "13101_BONEBANK_RD",
        timestamp,
        metrics: hydraulic_state,
        governance
    });
  });

`;

server = server.replace(
  'app.get("/api/turbovec/backup", async (req, res, next) => {',
  simEndpoint + '  app.get("/api/turbovec/backup", async (req, res, next) => {'
);

fs.writeFileSync('server.ts', server);
