import re

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

# Add a full screen button to the header
header_btn = """<Button variant="outline" size="icon" onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
              });
            } else {
              document.exitFullscreen();
            }
          }} className="ml-2 hidden sm:flex">
            <Maximize2 size={18} />
          </Button>"""

if "Maximize2" not in content:
    content = content.replace("import { Activity,", "import { Activity, Maximize2,")
    content = content.replace("<Button variant=\"outline\" size=\"icon\" onClick={toggleTheme} className=\"ml-2\">", f"{header_btn}\n          <Button variant=\"outline\" size=\"icon\" onClick={{toggleTheme}} className=\"ml-2\">")

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
