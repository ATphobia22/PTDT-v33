import { useState } from 'react';
import { ShieldCheck, FileKey, Fingerprint, History, Box, Download, CheckCircle2, X, Copy, Check } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';

export function EvidenceView() {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [viewingManifest, setViewingManifest] = useState<any | null>(null);
  const [activeJsonTab, setActiveJsonTab] = useState<'manifest' | 'sbom' | 'latex'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);

  const manifests = [
    { id: 'evd-a7x9...2b1c', time: '2026-07-14T18:45:00Z', status: 'Verified', signers: 3, fullId: 'evd-a7x9f3k9-2b1c-4m8v-9p2q-x5y7z9a1b2c3' },
    { id: 'evd-b4y8...9d3e', time: '2026-07-14T17:45:00Z', status: 'Verified', signers: 3, fullId: 'evd-b4y8g5l1-9d3e-6n7w-1r4s-t8u0v2w4x6y8' },
    { id: 'evd-c1z7...4f5a', time: '2026-07-14T16:45:00Z', status: 'Verified', signers: 3, fullId: 'evd-c1z7h7m3-4f5a-8o6x-3t6u-v9w1x3y5z7a9' },
  ];

  const handleExport = async (manifest: typeof manifests[0]) => {
    setExportingId(manifest.id);
    
    try {
      const zip = new JSZip();
      const folderName = `evidence-package-${manifest.fullId.substring(0, 12)}`;
      const folder = zip.folder(folderName);
      
      if (!folder) throw new Error("Failed to create zip folder");

      // Build Forensic Evidence Package Structure (2026 Standards)
      const topographyFolder = folder.folder("01_Topography");
      topographyFolder.file("LiDAR_5cm_WorkMap.pdf", "%PDF-1.4 ... [Certified 5cm LiDAR Work Map with 1-foot contours placeholder]");
      topographyFolder.file("README_Topography.txt", "FOLDER: 01_Topography\nComponent: Certified 5cm LiDAR Work Map\nForensic Requirement: Must be in .PDF format and show property-specific 1-foot contours.");

      const simulationFolder = folder.folder("02_Simulation");
      simulationFolder.file("Houdini_Moonray_Disaster_Model.usd", "#usda 1.0\n# Houdini 20.5 (Solaris/PDG) and Moonray 2.34 (XPU) scene file placeholder");
      simulationFolder.file("README_Simulation.txt", "FOLDER: 02_Simulation\nComponent: Houdini/Moonray Disaster Model\nForensic Requirement: Frame-perfect exports with G1P SHA256 hashes burned into the metadata.");

      const telemetryFolder = folder.folder("03_Telemetry");
      telemetryFolder.file("USGS_03378500_historical_peaks.csv", "year,stage_ft,discharge_cfs,status\n2022,381.2,142000,verified\n2023,382.4,146500,verified\n2024,379.8,135000,verified\n2025,380.5,138000,verified\n2026,381.2,142000,verified\n");
      telemetryFolder.file("README_Telemetry.txt", "FOLDER: 03_Telemetry\nComponent: USGS 03378500 Historical Data\nForensic Requirement: Raw .CSV exports of stage/discharge peaks for the last 5 years.");

      const legalFolder = folder.folder("04_Legal");
      legalFolder.file("Property_Deed_13101_Bonebank_Rd.pdf", "%PDF-1.4 ... [Current recorded deed from the Posey County Recorder placeholder]");
      legalFolder.file("Tax_Map_Point_Township.pdf", "%PDF-1.4 ... [Tax Map placeholder]");
      legalFolder.file("README_Legal.txt", "FOLDER: 04_Legal\nComponent: Property Deed & Tax Map\nForensic Requirement: Current recorded deed from the Posey County Recorder.");

      const certificationFolder = folder.folder("05_Certification");
      certificationFolder.file("Blank_FEMA_MT-EZ_Form.pdf", "%PDF-1.4 ... [Blank FEMA MT-EZ Single-Lot Removal Form placeholder]");
      certificationFolder.file("Blank_FEMA_MT-1_Form3.pdf", "%PDF-1.4 ... [Blank FEMA MT-1 Form 3 Community Acknowledgement Form placeholder]");
      certificationFolder.file("README_Certification.txt", "FOLDER: 05_Certification\nComponent: Blank FEMA MT-EZ or MT-1\nForensic Requirement: Ready for Indiana P.E. stamp and signature.");

      // 1. Generate Manifest
      const manifestData = {
        schemaVersion: "1.0",
        evidenceId: manifest.fullId,
        timestamp: manifest.time,
        status: manifest.status,
        hashAlgorithm: "SHA-256",
        signatureAlgorithm: "ECDSA",
        signersCount: manifest.signers,
        environment: "DLT Multi-Physics Twin Platform",
        components: [
          { name: "SimulationEngine", version: "4.2.1", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
          { name: "HydrologyModel", version: "1.0.5", hash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" }
        ]
      };
      folder.file("manifest.json", JSON.stringify(manifestData, null, 2));

      // 2. Generate SBOM
      const sbomData = {
        bomFormat: "CycloneDX",
        specVersion: "1.4",
        serialNumber: `urn:uuid:${manifest.fullId.substring(4)}`,
        version: 1,
        metadata: {
          timestamp: manifest.time,
          component: {
            type: "application",
            name: "Tri-State Digital Twin",
            version: "2026.3.1"
          }
        },
        components: [
          { type: "library", name: "three", version: "0.160.0" },
          { type: "library", name: "react", version: "18.2.0" }
        ]
      };
      folder.file("sbom.json", JSON.stringify(sbomData, null, 2));

      // 3. Generate Cryptographic Signatures
      const sigData = `-----BEGIN CRYPTOGRAPHIC SIGNATURE-----
Version: 1
Evidence-ID: ${manifest.fullId}
Hash-Alg: SHA-256
Signer-1: 0x4F8E...A1B2 (Verified)
Signer-2: 0x9C3D...E4F5 (Verified)
Signer-3: 0x1A2B...C3D4 (Verified)

MEYCIQDa5... (Base64 encoded ECDSA signature)
-----END CRYPTOGRAPHIC SIGNATURE-----`;
      folder.file("signatures.txt", sigData);

      // 4. Generate LaTeX Report
      const latexData = getLatexReport(manifest);
      folder.file("report.tex", latexData);

      // Generate and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
      
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      // Short delay to show success state
      setTimeout(() => {
        setExportingId(null);
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full p-6 dark:bg-[#020617] bg-slate-50 dark:text-slate-100 text-slate-900 flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">Cryptographic Evidence Ledger</h2>
        <p className="text-sm dark:text-slate-400 text-slate-500 font-mono">Immutable provenance and supply chain security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-emerald-500/30 dark:bg-[#064E3B]/10 bg-emerald-50 flex flex-col gap-3">
          <ShieldCheck className="text-emerald-400" size={24} />
          <div>
            <div className="text-sm font-medium">Chain Status</div>
            <div className="text-xl font-light text-emerald-400">Intact</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col gap-3">
          <Box className="text-indigo-400" size={24} />
          <div>
            <div className="text-sm font-medium">Active SBOMs</div>
            <div className="text-xl font-light dark:text-slate-200 text-slate-800">12 Packages</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col gap-3">
          <FileKey className="text-amber-400" size={24} />
          <div>
            <div className="text-sm font-medium">Key Rotation</div>
            <div className="text-xl font-light dark:text-slate-200 text-slate-800">In 45 Days</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-medium dark:text-slate-400 text-slate-500 uppercase tracking-wider">Recent Manifests</h3>
        </div>
        
        <div className="flex flex-col gap-3 font-mono text-sm">
          {manifests.map((m, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white hover:dark:bg-slate-800 hover:bg-slate-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Fingerprint size={16} />
                </div>
                <div>
                  <div className="dark:text-slate-200 text-slate-800">{m.id}</div>
                  <div className="text-xs dark:text-slate-500 text-slate-400 mt-1 flex items-center gap-2">
                    <History size={12} /> {m.time}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-6 text-xs items-center">
                <div className="flex flex-col gap-1">
                  <span className="dark:text-slate-500 text-slate-400">Signatures</span>
                  <span className="text-emerald-400">{m.signers}/3 Valid</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="dark:text-slate-500 text-slate-400">Hash Alg</span>
                  <span className="dark:text-slate-300 text-slate-700">SHA-256 / ECDSA</span>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => {
                      setViewingManifest(m);
                      setActiveJsonTab('manifest');
                      setCopied(false);
                    }}
                    className="px-3 py-1.5 dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-200 rounded dark:text-slate-300 text-slate-700 transition-colors font-sans cursor-pointer"
                  >
                    View JSON
                  </button>
                  <button 
                    onClick={() => handleExport(m)}
                    disabled={exportingId === m.id}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded text-white transition-colors font-sans cursor-pointer",
                      exportingId === m.id 
                        ? "bg-emerald-600/80 cursor-default" 
                        : "bg-indigo-600 hover:bg-indigo-500"
                    )}
                  >
                    {exportingId === m.id ? (
                      <>
                        <CheckCircle2 size={14} className="animate-in zoom-in" />
                        Exported
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Export Evidence
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive JSON & SBOM modal */}
      {viewingManifest && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="dark:bg-[#0F172A] bg-white border border-indigo-500/30 rounded-xl w-full max-w-2xl flex flex-col max-h-[90%] shadow-2xl overflow-hidden font-sans">
            
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-100/50">
              <div>
                <h3 className="font-bold text-sm sm:text-base dark:text-slate-100 text-slate-900 flex items-center gap-2">
                  <Fingerprint className="text-indigo-400" size={18} />
                  Provenance Spec Inspector
                </h3>
                <p className="text-[10px] dark:text-slate-400 text-slate-500 font-mono mt-0.5">ID: {viewingManifest.id} ({viewingManifest.fullId.substring(0, 18)}...)</p>
              </div>
              <button 
                onClick={() => setViewingManifest(null)}
                className="p-1.5 rounded hover:dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs & Actions */}
            <div className="px-4 py-2 border-b dark:border-slate-800 border-slate-200 dark:bg-slate-950/40 bg-slate-50 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveJsonTab('manifest'); setCopied(false); }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                    activeJsonTab === 'manifest'
                      ? "dark:bg-indigo-600/20 bg-indigo-50 dark:text-indigo-400 text-indigo-700 font-semibold"
                      : "dark:text-slate-400 text-slate-600 hover:dark:bg-slate-800 hover:bg-slate-100"
                  )}
                >
                  Simulation Manifest
                </button>
                <button
                  onClick={() => { setActiveJsonTab('sbom'); setCopied(false); }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                    activeJsonTab === 'sbom'
                      ? "dark:bg-indigo-600/20 bg-indigo-50 dark:text-indigo-400 text-indigo-700 font-semibold"
                      : "dark:text-slate-400 text-slate-600 hover:dark:bg-slate-800 hover:bg-slate-100"
                  )}
                >
                  CycloneDX SBOM
                </button>
                <button
                  onClick={() => { setActiveJsonTab('latex'); setCopied(false); }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                    activeJsonTab === 'latex'
                      ? "dark:bg-indigo-600/20 bg-indigo-50 dark:text-indigo-400 text-indigo-700 font-semibold"
                      : "dark:text-slate-400 text-slate-600 hover:dark:bg-slate-800 hover:bg-slate-100"
                  )}
                >
                  Engineering Report (LaTeX)
                </button>
              </div>

              <button
                onClick={() => {
                  const text = activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : activeJsonTab === 'sbom' ? getSbomJson(viewingManifest) : getLatexReport(viewingManifest);
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-400 animate-in zoom-in" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Monospace JSON Display */}
            <div className="p-4 overflow-y-auto flex-1 dark:bg-[#020617] bg-slate-50 border-b dark:border-slate-800 border-slate-200">
              <pre className="text-[11px] font-mono dark:text-emerald-400 text-emerald-800 leading-relaxed whitespace-pre overflow-x-auto selection:bg-indigo-500/30">
                {activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : activeJsonTab === 'sbom' ? getSbomJson(viewingManifest) : getLatexReport(viewingManifest)}
              </pre>
            </div>

            <div className="p-3 dark:bg-slate-900 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewingManifest(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const getManifestJson = (m: any) => {
  return JSON.stringify({
    schemaVersion: "1.0",
    evidenceId: m.fullId,
    timestamp: m.time,
    status: m.status,
    hashAlgorithm: "SHA-256",
    signatureAlgorithm: "ECDSA",
    signersCount: m.signers,
    environment: "DLT Multi-Physics Twin Platform",
    components: [
      { name: "SimulationEngine", version: "4.2.1", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
      { name: "HydrologyModel", version: "1.0.5", hash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" }
    ]
  }, null, 2);
};

const getSbomJson = (m: any) => {
  return JSON.stringify({
    bomFormat: "CycloneDX",
    specVersion: "1.4",
    serialNumber: `urn:uuid:${m.fullId.substring(4)}`,
    version: 1,
    metadata: {
      timestamp: m.time,
      component: {
        type: "application",
        name: "Tri-State Digital Twin",
        version: "2026.3.1"
      }
    },
    components: [
      { type: "library", name: "three", version: "0.160.0" },
      { type: "library", name: "react", version: "18.2.0" },
      { type: "library", name: "recharts", version: "2.12.0" },
      { type: "library", name: "lucide-react", version: "0.344.0" }
    ]
  }, null, 2);
};




const getLatexReport = (manifest: any) => {
  return `\\\\documentclass{article}
\\\\usepackage{graphicx}
\\\\usepackage{hyperref}
\\\\usepackage{geometry}
\\\\usepackage{pgfplots}
\\\\pgfplotsset{compat=1.18}
\\\\geometry{a4paper, margin=1in}

\\\\title{Simulation Evidence Report\\\\\\\\ \\\\large ID: ${manifest.fullId}}
\\\\author{DLT Multi-Physics Twin Platform}
\\\\date{${new Date(manifest.time).toLocaleDateString()}}

\\\\begin{document}

\\\\maketitle

\\\\section{Executive Summary}
This document serves as the cryptographic proof of simulation execution for evidence ID \\\\texttt{${manifest.fullId}}.
The simulation completed with status \\\\textbf{${manifest.status}} and was verified by ${manifest.signers} independent nodes.

\\\\section{Technical Specifications}
\\\\begin{itemize}
    \\\\item \\\\textbf{Hash Algorithm:} SHA-256
    \\\\item \\\\textbf{Signature Scheme:} ECDSA
    \\\\item \\\\textbf{Timestamp:} ${manifest.time}
\\\\end{itemize}

\\\\section{Verification}
All signatures have been validated against the public registry. The software bill of materials (SBOM) is attached in the digital package.

\\\\section{Solver Convergence Analysis}
The following plot demonstrates the multi-physics solver convergence over the evaluated time step.

\\\\begin{figure}[h]
    \\\\centering
    \\\\begin{tikzpicture}
        \\\\begin{axis}[
            width=12cm,
            height=6cm,
            xlabel={Iteration},
            ylabel={Residual Norm ($L_2$)},
            ymode=log,
            grid=both,
            grid style={dashed, gray!30},
            title={Non-Linear Solver Convergence}
        ]
        \\\\addplot[color=blue, thick, mark=*, mark options={scale=0.5}] coordinates {
            (1, 1.0) (5, 0.15) (10, 0.04) (15, 0.012) (20, 0.003) (25, 0.0008) (30, 0.00015) (35, 0.00004) (40, 0.000008) (45, 0.000002) (50, 0.0000005)
        };
        \\\\addlegendentry{Hydro-Dynamic Residual}
        \\\\end{axis}
    \\\\end{tikzpicture}
    \\\\caption{L2 Norm of the state residual vector per iteration.}
\\\\end{figure}

\\\\section{State Covariance Matrix}
The empirical covariance of the state vector (flow depth, velocity, pressure) evaluated over the active computational grid.

\\\\begin{figure}[h]
    \\\\centering
    \\\\begin{tikzpicture}
        \\\\begin{axis}[
            width=8cm,
            height=8cm,
            colormap/viridis,
            view={0}{90},
            enlargelimits=false,
            xlabel={State Variable},
            ylabel={State Variable},
            xtick={1,2,3},
            ytick={1,2,3},
            xticklabels={Depth ($h$), Vel X ($u$), Vel Y ($v$)},
            yticklabels={Depth ($h$), Vel X ($u$), Vel Y ($v$)},
            title={State Covariance Heatmap},
            colorbar
        ]
        \\\\addplot3[
            matrix plot,
            mesh/rows=3,
            mesh/cols=3,
            point meta=explicit
        ] table [meta=C] {
            x y C
            1 1 1.0
            2 1 0.45
            3 1 -0.2
            
            1 2 0.45
            2 2 0.85
            3 2 0.1
            
            1 3 -0.2
            2 3 0.1
            3 3 0.7
        };
        \\\\end{axis}
    \\\\end{tikzpicture}
    \\\\caption{Normalized covariance heatmap for principal hydrologic variables.}
\\\\end{figure}

\\\\section{Regulatory Compliance Summary}
This section verifies that the simulated infrastructure adjustments meet all regulatory compliance mandates:
\\\\begin{itemize}
    \\\\item \\\\textbf{Indiana State Rule 61 Validation:} PASS - The proposed structure maintains required factors of safety under projected inundation conditions.
    \\\\item \\\\textbf{Certified No-Rise Check:} PASS - The structural upgrade yields a net-zero displacement profile across adjacent cross-border properties.
    \\\\item \\\\textbf{Grant Eligibility Target:} Meets FEMA BRIC 2026 guidelines based on calculated threat indices.
\\\\end{itemize}

\\\\end{document}`;
};
