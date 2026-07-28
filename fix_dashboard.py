import re

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("import { CesiumTwinView } from './CesiumTwinView';", "import { OvertureTwinView } from './OvertureTwinView';")
content = content.replace("<CesiumTwinView />", "<OvertureTwinView />")

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
