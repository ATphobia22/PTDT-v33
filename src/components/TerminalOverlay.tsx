import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Command } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommandEntry {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

export function TerminalOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([
    { type: 'system', content: 'Tucker Sovereign Citadel Terminal v32.1', timestamp: new Date() },
    { type: 'system', content: 'Type "help" for a list of available commands.', timestamp: new Date() }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, isExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) setTimeout(() => inputRef.current?.focus(), 100);
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const processCommand = async (cmd: string) => {
    const args = cmd.trim().split(/\s+/);
    const mainCommand = args[0].toLowerCase();

    switch (mainCommand) {
      case 'help':
        return [
          'Available commands:',
          '  search [query]    - Search the Sovereign GIS datastore',
          '  analyze [target]  - Run deep analysis on target metric',
          '  status            - System operational status',
          '  clear             - Clear terminal output',
          '  exit              - Close terminal'
        ].join('\n');
      case 'clear':
        setHistory([]);
        return null;
      case 'exit':
        setIsOpen(false);
        return null;
      case 'status':
        return 'System Status: ONLINE\nActive Modules: WebGPU Twin, DAG Execution, Data Assimilation\nTelemetry: SYNCED (USGS, FEMA)';
      case 'search':
        if (args.length < 2) return 'Error: Missing search query. Usage: search [query]';
        return `Searching for "${args.slice(1).join(' ')}"...\nFound 0 matching records in Sovereign database.`;
      case 'analyze':
        if (args.length < 2) return 'Error: Missing analysis target. Usage: analyze [target]';
        return `Initiating deep analysis on "${args.slice(1).join(' ')}"...\n[████████████] 100%\nAnalysis complete. No structural anomalies detected.`;
      case '':
        return null;
      default:
        return `Command not found: ${mainCommand}. Type "help" for a list of commands.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newCmd = inputValue;
    setInputValue('');
    
    setHistory(prev => [...prev, { type: 'input', content: newCmd, timestamp: new Date() }]);

    const output = await processCommand(newCmd);
    if (output !== null) {
      setTimeout(() => {
        setHistory(prev => [...prev, { type: 'output', content: output, timestamp: new Date() }]);
      }, 300);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="fixed bottom-4 right-4 z-[100] bg-slate-900/90 text-slate-300 hover:text-white p-3 rounded-full shadow-lg border border-slate-700/50 flex items-center gap-2 hover:bg-slate-800 transition-all backdrop-blur-sm group"
      >
        <TerminalIcon size={18} />
        <span className="text-xs font-mono max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1 transition-all duration-300">
          Open Terminal (⌘J)
        </span>
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/95 backdrop-blur-md border-t border-indigo-500/30 shadow-2xl transition-all duration-300 flex flex-col font-mono text-sm text-slate-300",
        isExpanded ? "h-[60vh]" : "h-[300px]"
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2 text-indigo-400">
          <TerminalIcon size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Sovereign Command Line</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <button onClick={() => setIsExpanded(!isExpanded)} className="hover:text-slate-300 p-1">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-slate-300 p-1">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2" onClick={() => inputRef.current?.focus()}>
        {history.map((entry, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {entry.type === 'input' && (
              <div className="text-indigo-300 flex gap-2">
                <span className="text-emerald-500">tucker@citadel:~$</span>
                {entry.content}
              </div>
            )}
            {entry.type === 'output' && <div className="text-slate-300">{entry.content}</div>}
            {entry.type === 'error' && <div className="text-red-400">{entry.content}</div>}
            {entry.type === 'system' && <div className="text-indigo-400/80 italic">{entry.content}</div>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-slate-800/80 bg-slate-950 flex items-center gap-2">
        <span className="text-emerald-500 font-bold whitespace-nowrap">tucker@citadel:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-slate-200 focus:ring-0 placeholder-slate-700 font-mono"
          placeholder="Enter command..."
          autoComplete="off"
          spellCheck="false"
        />
        <Command size={14} className="text-slate-600" />
      </form>
    </div>
  );
}
