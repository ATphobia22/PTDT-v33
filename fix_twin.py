import re

with open("src/components/DigitalTwinView.tsx", "r") as f:
    content = f.read()

if "useTheme" not in content:
    content = content.replace("import React,", "import { useTheme } from '../context/ThemeContext';\nimport React,")
    content = content.replace("export function DigitalTwinView() {", "export function DigitalTwinView() {\n  const { theme } = useTheme();")

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
    "border-slate-700": "border-slate-300 dark:border-slate-700",
    "text-indigo-200": "text-indigo-800 dark:text-indigo-200",
}

for old, new_val in replacements.items():
    content = content.replace(f'"{old}"', f'"{new_val}"')
    content = content.replace(f'{old}', new_val)

with open("src/components/DigitalTwinView.tsx", "w") as f:
    f.write(content)
