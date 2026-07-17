import sys

with open("src/components/EvidenceView.tsx", "r") as f:
    content = f.read()

# Replace single backslash with double backslash in the generated code
new_content = content.replace("`\\documentclass", "`\\\\documentclass")
new_content = new_content.replace("\\usepackage", "\\\\usepackage")
new_content = new_content.replace("\\pgfplotsset", "\\\\pgfplotsset")
new_content = new_content.replace("\\geometry", "\\\\geometry")
new_content = new_content.replace("\\title", "\\\\title")
new_content = new_content.replace("\\large", "\\\\large")
new_content = new_content.replace("\\author", "\\\\author")
new_content = new_content.replace("\\date", "\\\\date")
new_content = new_content.replace("\\begin", "\\\\begin")
new_content = new_content.replace("\\maketitle", "\\\\maketitle")
new_content = new_content.replace("\\section", "\\\\section")
new_content = new_content.replace("\\texttt", "\\\\texttt")
new_content = new_content.replace("\\textbf", "\\\\textbf")
new_content = new_content.replace("\\item", "\\\\item")
new_content = new_content.replace("\\figure", "\\\\figure")
new_content = new_content.replace("\\centering", "\\\\centering")
new_content = new_content.replace("\\addplot", "\\\\addplot")
new_content = new_content.replace("\\addlegendentry", "\\\\addlegendentry")
new_content = new_content.replace("\\caption", "\\\\caption")
new_content = new_content.replace("\\end{", "\\\\end{")

with open("src/components/EvidenceView.tsx", "w") as f:
    f.write(new_content)
