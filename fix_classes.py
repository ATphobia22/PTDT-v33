import re

with open("src/components/NextGenDigitalTwin.tsx", "r") as f:
    content = f.read()

# Fix duplicates
content = content.replace("dark:bg-slate-50/80 ", "")
content = content.replace("dark:bg-slate-50/90 ", "")
content = content.replace("dark:text-slate-600 ", "")
content = content.replace("text-slate-500 dark:text-slate-500", "text-slate-500")

with open("src/components/NextGenDigitalTwin.tsx", "w") as f:
    f.write(content)
