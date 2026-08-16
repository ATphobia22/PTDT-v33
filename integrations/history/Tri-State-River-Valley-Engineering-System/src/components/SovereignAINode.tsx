import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Image as ImageIcon, Video, Search, Map, Zap, Settings, Code, MessageSquare, Terminal } from 'lucide-react';


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

export function SovereignAINode() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'github'>('chat');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);

  // Chat Options
  const [model, setModel] = useState('gemini-3.5-flash');
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);

  // Image Options
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const handleChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, useSearch, useMaps })
      });
      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch (e) {
      setResponse("Error connecting to AI node.");
    }
    setLoading(false);
  };

  const handleImage = async () => {
    setLoading(true);
    setImageResult(null);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, model: 'gemini-3.1-flash-image-preview' })
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setImageResult(`data:image/jpeg;base64,${data.images[0]}`);
      } else {
        setResponse(data.error || "Image generation failed.");
      }
    } catch (e) {
      setResponse("Error connecting to Image Gen node.");
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-white">
            Sovereign AI Node
          </h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          {[
            { id: 'chat', icon: MessageSquare, label: 'Intelligence' },
            { id: 'image', icon: ImageIcon, label: 'Vision/Gen' },
            { id: 'video', icon: Video, label: 'Video Gen' },
            { id: 'github', icon: Code, label: 'Open Source' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        
        {/* Chat / Intelligence Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex gap-4">
              <select 
                value={model} 
                onChange={e => setModel(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="gemini-3.1-pro-preview">Pro (Complex Tasks)</option>
                <option value="gemini-3.5-flash">Flash (General/Grounding)</option>
                <option value="gemini-3.1-flash-lite">Lite (Low Latency)</option>
              </select>
              
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="rounded" />
                <Search className="h-3.5 w-3.5 text-blue-500" />
                Google Search
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="rounded" />
                <Map className="h-3.5 w-3.5 text-green-500" />
                Google Maps
              </label>
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-4 font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {loading ? "Processing..." : response || "Ready. Ask a question or request analysis."}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter prompt..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-sm text-slate-800 dark:text-white"
                onKeyDown={e => e.key === 'Enter' && handleChat()}
              />
              <button 
                onClick={handleChat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold uppercase"
              >
                Execute
              </button>
            </div>
          </div>
        )}

        {/* Image Generation Tab */}
        {activeTab === 'image' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex gap-4">
              <select 
                value={aspectRatio} 
                onChange={e => setAspectRatio(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Widescreen</option>
                <option value="9:16">9:16 Vertical</option>
                <option value="4:3">4:3 Standard</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-950 rounded border border-slate-300 dark:border-slate-800 flex items-center justify-center p-4">
              {loading ? (
                <div className="text-xs text-slate-500 animate-pulse font-mono">Generating Image Matrix...</div>
              ) : imageResult ? (
                <img src={imageResult} alt="Generated" className="max-w-full max-h-full object-contain rounded shadow-lg" />
              ) : (
                <div className="text-xs text-slate-500 font-mono">No image generated.</div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the image to generate..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-sm text-slate-800 dark:text-white"
                onKeyDown={e => e.key === 'Enter' && handleImage()}
              />
              <button 
                onClick={handleImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold uppercase"
              >
                Generate
              </button>
            </div>
          </div>
        )}

                {/* GitHub / Open Source Tab */}
        {activeTab === 'github' && (
          <GithubRepoViewer />
        )}

        {/* Video Tab Placeholder */}
        {activeTab === 'video' && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <Video className="h-12 w-12 text-slate-400 opacity-50" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Veo 3.1 Fast Generate Preview</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Video generation requires extended processing time. In a production environment, this triggers a background job to render text-to-video content.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
