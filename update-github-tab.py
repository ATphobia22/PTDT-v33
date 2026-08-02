import re

with open('src/components/SovereignAINode.tsx', 'r') as f:
    content = f.read()

replacement = """        {/* GitHub / Open Source Tab */}
        {activeTab === 'github' && (
          <GithubRepoViewer />
        )}"""

content = re.sub(
    r'\{\/\*\s*GitHub \/ Open Source Tab\s*\*\/\}.*?\{\/\*\s*Video Tab Placeholder\s*\*\/\}',
    replacement + "\n\n        {/* Video Tab Placeholder */}",
    content,
    flags=re.DOTALL
)

with open('src/components/SovereignAINode.tsx', 'w') as f:
    f.write(content)
