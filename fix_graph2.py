with open("src/components/ExecutionGraph.tsx", "r") as f:
    content = f.read()

old_start = '<div className="flex-1 w-full h-full min-h-[450px] relative mt-20">'
new_start = '<div className="absolute inset-0 pt-28 pb-4 px-4 flex flex-col">\n        <div className="flex-1 w-full relative border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">'

content = content.replace(old_start, new_start)

old_end = '''        </ReactFlow>
      </div>'''
new_end = '''        </ReactFlow>
        </div>
      </div>'''

content = content.replace(old_end, new_end)

with open("src/components/ExecutionGraph.tsx", "w") as f:
    f.write(content)
