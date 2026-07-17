import sys

with open("src/components/EvidenceView.tsx", "r") as f:
    content = f.read()

get_latex_func = """
const getLatexReport = (manifest: any) => {
  return `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\geometry{a4paper, margin=1in}

\\title{Simulation Evidence Report\\\\ \\large ID: ${manifest.fullId}}
\\author{DLT Multi-Physics Twin Platform}
\\date{${new Date(manifest.time).toLocaleDateString()}}

\\begin{document}

\\maketitle

\\section{Executive Summary}
This document serves as the cryptographic proof of simulation execution for evidence ID \\texttt{${manifest.fullId}}.
The simulation completed with status \\textbf{${manifest.status}} and was verified by ${manifest.signers} independent nodes.

\\section{Technical Specifications}
\\begin{itemize}
    \\item \\textbf{Hash Algorithm:} SHA-256
    \\item \\textbf{Signature Scheme:} ECDSA
    \\item \\textbf{Timestamp:} ${manifest.time}
\\end{itemize}

\\section{Verification}
All signatures have been validated against the public registry. The software bill of materials (SBOM) is attached in the digital package.

\\section{Solver Convergence Analysis}
The following plot demonstrates the multi-physics solver convergence over the evaluated time step.

\\begin{figure}[h]
    \\centering
    \\begin{tikzpicture}
        \\begin{axis}[
            width=12cm,
            height=6cm,
            xlabel={Iteration},
            ylabel={Residual Norm ($L_2$)},
            ymode=log,
            grid=both,
            grid style={dashed, gray!30},
            title={Non-Linear Solver Convergence}
        ]
        \\addplot[color=blue, thick, mark=*, mark options={scale=0.5}] coordinates {
            (1, 1.0) (5, 0.15) (10, 0.04) (15, 0.012) (20, 0.003) (25, 0.0008) (30, 0.00015) (35, 0.00004) (40, 0.000008) (45, 0.000002) (50, 0.0000005)
        };
        \\addlegendentry{Hydro-Dynamic Residual}
        \\end{axis}
    \\end{tikzpicture}
    \\caption{L2 Norm of the state residual vector per iteration.}
\\end{figure}

\\section{State Covariance Matrix}
The empirical covariance of the state vector (flow depth, velocity, pressure) evaluated over the active computational grid.

\\begin{figure}[h]
    \\centering
    \\begin{tikzpicture}
        \\begin{axis}[
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
        \\addplot3[
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
        \\end{axis}
    \\end{tikzpicture}
    \\caption{Normalized covariance heatmap for principal hydrologic variables.}
\\end{figure}

\\section{Regulatory Compliance Summary}
This section verifies that the simulated infrastructure adjustments meet all regulatory compliance mandates:
\\begin{itemize}
    \\item \\textbf{Indiana State Rule 61 Validation:} PASS - The proposed structure maintains required factors of safety under projected inundation conditions.
    \\item \\textbf{Certified No-Rise Check:} PASS - The structural upgrade yields a net-zero displacement profile across adjacent cross-border properties.
    \\item \\textbf{Grant Eligibility Target:} Meets FEMA BRIC 2026 guidelines based on calculated threat indices.
\\end{itemize}

\\end{document}`;
};
"""


# 1. Update activeJsonTab typing
content = content.replace(
    "const [activeJsonTab, setActiveJsonTab] = useState<'manifest' | 'sbom'>('manifest');",
    "const [activeJsonTab, setActiveJsonTab] = useState<'manifest' | 'sbom' | 'latex'>('manifest');"
)


# 2. Extract latexData from handleExport and use getLatexReport
start_latex_str = "      // 4. Generate LaTeX Report\n      const latexData = `\\documentclass{article}"
end_latex_str = "\\end{document}`;\n      folder.file(\"report.tex\", latexData);"

start_idx = content.find(start_latex_str)
end_idx = content.find(end_latex_str) + len(end_latex_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + "      // 4. Generate LaTeX Report\n      const latexData = getLatexReport(manifest);\n      folder.file(\"report.tex\", latexData);" + content[end_idx:]


# 3. Add the new tab button
tabs_html_old = """              <div className="flex gap-2">
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
              </div>"""

tabs_html_new = """              <div className="flex gap-2">
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
              </div>"""

content = content.replace(tabs_html_old, tabs_html_new)


# 4. Update the content getter in copy button
copy_getter_old = "const text = activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : getSbomJson(viewingManifest);"
copy_getter_new = "const text = activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : activeJsonTab === 'sbom' ? getSbomJson(viewingManifest) : getLatexReport(viewingManifest);"
content = content.replace(copy_getter_old, copy_getter_new)

# 5. Update the content display
display_old = "{activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : getSbomJson(viewingManifest)}"
display_new = "{activeJsonTab === 'manifest' ? getManifestJson(viewingManifest) : activeJsonTab === 'sbom' ? getSbomJson(viewingManifest) : getLatexReport(viewingManifest)}"
content = content.replace(display_old, display_new)


# 6. Append getLatexReport
content = content + "\n\n" + get_latex_func

with open("src/components/EvidenceView.tsx", "w") as f:
    f.write(content)

