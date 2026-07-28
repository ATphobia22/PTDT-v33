import re

with open("src/components/DigitalTwinView.tsx", "r") as f:
    content = f.read()

content = "import { useTheme } from '../context/ThemeContext';\n" + content

with open("src/components/DigitalTwinView.tsx", "w") as f:
    f.write(content)
