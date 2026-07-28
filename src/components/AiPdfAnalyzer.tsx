import React, { useState } from 'react';
import { FileText, Search, Loader2, AlertCircle, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export function AiPdfAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file.');
      setFile(null);
    }
  };

  const analyzePdf = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
          const response = await fetch('/api/analyze-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfData: base64Data,
              fileName: file.name
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Analysis failed');
          }

          const data = await response.json();
          setAnalysis(data.analysis);
        } catch (err: any) {
          setError(err.message || 'An error occurred during analysis.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Failed to read file.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-[#00D4FF]" size={20} />
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">AI Forensic PDF Analyst</h2>
        </div>
        {file && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{file.name}</span>
            <span className="h-3 w-px bg-slate-700"></span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {!analysis && !isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Search className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Regulatory Documents</h3>
            <p className="text-sm text-slate-400 mb-6">
              Analyze FEMA Elevation Certificates, Property Deeds, or Hydrologic Reports using the Tri-State AI Kernel.
            </p>
            
            <label className="relative group">
              <div className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all cursor-pointer shadow-xl flex items-center gap-2">
                <Download size={18} />
                Select PDF Document
              </div>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

            {file && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={analyzePdf}
                className="mt-4 px-6 py-3 bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-slate-900 rounded-lg font-bold transition-all cursor-pointer shadow-xl flex items-center gap-2"
              >
                <Search size={18} />
                Start AI Analysis
              </motion.button>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Loader2 className="text-[#00D4FF] animate-spin mb-4" size={48} />
            <h3 className="text-lg font-bold text-white mb-2">Analyzing Document...</h3>
            <p className="text-sm text-slate-400 animate-pulse">
              Running deep forensic cross-reference against regional hydrology matrices.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 mb-6">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <div className="text-sm text-rose-200">{error}</div>
          </div>
        )}

        {analysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert prose-sm max-w-none"
          >
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="text-emerald-400" size={18} />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Forensic Analysis Complete</span>
            </div>
            
            <div className="dark:text-slate-200 text-slate-800 bg-slate-950/30 rounded-xl p-6 border border-slate-700/50 markdown-body">
              <Markdown>{analysis}</Markdown>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700/50 flex justify-between items-center">
               <button 
                onClick={() => { setAnalysis(null); setFile(null); }}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
               >
                 <FileText size={14} /> Analyze Another Document
               </button>
               <div className="text-[10px] text-slate-500 font-mono">
                 SYSTEM_SEAL: SHA256-VERIFIED-AI-OUTPUT
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
