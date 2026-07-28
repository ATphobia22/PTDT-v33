import re

with open("src/components/NextGenDigitalTwin.tsx", "r") as f:
    content = f.read()

# Add useTheme import if not there
if "useTheme" not in content:
    content = content.replace("import React,", "import { useTheme } from '../context/ThemeContext';\nimport React,")
    content = content.replace("export default function NextGenDigitalTwin() {", "export default function NextGenDigitalTwin() {\n  const { theme } = useTheme();")

# Replace dark hardcoded classes with light/dark adaptive classes
replacements = {
    "bg-slate-950": "bg-slate-100 dark:bg-slate-950",
    "bg-slate-900": "bg-slate-50 dark:bg-slate-900",
    "bg-slate-800": "bg-slate-200 dark:bg-slate-800",
    "bg-slate-900/80": "bg-slate-50/80 dark:bg-slate-900/80",
    "bg-slate-900/90": "bg-slate-50/90 dark:bg-slate-900/90",
    "text-white": "text-slate-900 dark:text-white",
    "text-slate-200": "text-slate-800 dark:text-slate-200",
    "text-slate-300": "text-slate-700 dark:text-slate-300",
    "text-slate-400": "text-slate-600 dark:text-slate-400",
    "text-slate-500": "text-slate-500 dark:text-slate-500",
    "border-slate-800": "border-slate-200 dark:border-slate-800",
    "border-slate-800/60": "border-slate-200/60 dark:border-slate-800/60",
    "border-slate-800/50": "border-slate-200/50 dark:border-slate-800/50",
    "text-indigo-200": "text-indigo-800 dark:text-indigo-200",
}

for old, new_val in replacements.items():
    content = content.replace(f'"{old}"', f'"{new_val}"')
    content = content.replace(f'{old}', new_val) # Some might be inside template literals

# We need to make sure we don't accidentally double-replace, but this is a quick string replacement.
# Let's fix the map style too based on theme.
style_replace_str = """style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" """
style_new_str = """style={theme === 'dark' ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"} """
content = content.replace(style_replace_str, style_new_str)

with open("src/components/NextGenDigitalTwin.tsx", "w") as f:
    f.write(content)
