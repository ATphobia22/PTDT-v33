const fs = require('fs');

let code = fs.readFileSync('src/components/EvidenceView.tsx', 'utf8');

// The block starts around line 80 and goes until `\end{document}`;`
// Let's replace the whole `handleExport` function to be safe.
// Actually, it's easier to just do text replacement of `// 4. Generate LaTeX Report` to `saveAs(content, ...)`
const startSearch = "// 4. Generate LaTeX Report";
const endSearch = "folder.file(\"report.tex\", latexData);";

const startIndex = code.indexOf(startSearch);
const endIndex = code.indexOf(endSearch) + endSearch.length;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) +
           '// 4. Generate LaTeX Report\n      const latexData = getLatexReport(manifest);\n      folder.file("report.tex", latexData);' +
           code.substring(endIndex);
}

fs.writeFileSync('src/components/EvidenceView.tsx', code);
console.log("Done");
