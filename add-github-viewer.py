with open('src/components/SovereignAINode.tsx', 'r') as f:
    content = f.read()

github_viewer = """
function GithubRepoViewer() {
  const [repos, setRepos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('https://api.github.com/users/ATphobia22/repos?sort=updated&per_page=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          setRepos([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Terminal className="h-5 w-5 text-blue-500" />
        <p className="text-xs font-mono">
          ATphobia22 Open Source Protocol Active.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {loading ? (
          <div className="text-xs text-slate-500 animate-pulse font-mono">Connecting to GitHub / ATphobia22...</div>
        ) : repos.length > 0 ? (
          repos.map(repo => (
            <div key={repo.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 dark:text-[#00D4FF] hover:underline flex items-center gap-1">
                  <Code size={14} />
                  {repo.name}
                </a>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {repo.language || 'Mixed'}
                </span>
              </div>
              {repo.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{repo.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400"></span> {repo.stargazers_count} stars</span>
                <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 font-mono p-4 text-center border border-dashed border-slate-700 rounded">
            No public repositories found or API rate limited.
            <br/><br/>
            <a href="https://github.com/ATphobia22" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">
              View Profile Directly
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

"""

if "function GithubRepoViewer()" not in content:
    content = content.replace("export function SovereignAINode() {", github_viewer + "export function SovereignAINode() {")
    with open('src/components/SovereignAINode.tsx', 'w') as f:
        f.write(content)
