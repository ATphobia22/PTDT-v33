import re

with open("src/components/ExecutionGraph.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '<div className="absolute inset-0 pt-28 pb-4 px-4 flex flex-col"><div className="flex-1 w-full relative border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">',
    '<div className="flex-1 w-full h-full min-h-[450px] relative mt-20">'
)
with open("src/components/ExecutionGraph.tsx", "w") as f:
    f.write(content)
