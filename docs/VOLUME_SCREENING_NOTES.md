# Volume screening notes

## Conflicting figures in prior drafts (do not mix blindly)

| Draft set | Fill | Cut | Net |
|-----------|------|-----|-----|
| Simple berm example | ~100–333 cy | 1.20× | small |
| “5000 / 6500” screening | 5000 | 6500 | −1500 |
| Long No-Rise DOCX | 25,500 | 47,000 | −21,500 |

**Only one PE takeoff set may appear in a filed package.**  
Run `python/volumetric_calc.py` and `norise_certificate_draft.py` after PE volumes are fixed.

## Formula

\\[
V_{\\mathrm{net}} = V_{\\mathrm{fill}} - V_{\\mathrm{cut}} \\le 0
\\]

Optional project factor:

\\[
V_{\\mathrm{cut}} \\ge 1.20 \\cdot V_{\\mathrm{fill}}
\\]
