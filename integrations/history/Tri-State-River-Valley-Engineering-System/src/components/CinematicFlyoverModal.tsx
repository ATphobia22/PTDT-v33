import React, { useState } from 'react';
import { X, Play, Camera, Monitor, Video, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
  onPlay: () => void;
}

export function CinematicFlyoverModal({ onClose, onPlay }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#111] border border-slate-800 rounded-sm w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header Hero */}
        <div className="relative h-64 w-full bg-slate-900 border-b border-slate-800 overflow-hidden group cursor-pointer" onClick={onPlay}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
          
          <div className="absolute bottom-8 left-8 flex items-center gap-6">
            <button className="h-16 w-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group-hover:scale-105">
              <Play size={24} className="ml-1" fill="currentColor" />
            </button>
            <div>
              <h2 className="text-3xl font-light text-white tracking-wide uppercase">Cinematic Aerial Flyover</h2>
              <p className="text-slate-400 text-sm tracking-widest uppercase mt-1">Video Preview</p>
            </div>
          </div>
        </div>

        {/* Video Stats */}
        <div className="flex px-8 py-6 gap-16 border-b border-slate-800/50 bg-[#151515]">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Duration</div>
            <div className="text-white font-mono font-bold text-sm">01:15</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Resolution</div>
            <div className="text-white font-mono font-bold text-sm">4K (3840x2160)</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Frame Rate</div>
            <div className="text-white font-mono font-bold text-sm">30 FPS</div>
          </div>
          
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Grid of Shots */}
        <div className="grid grid-cols-3 gap-1 p-8 bg-[#111]">
          {[
            { time: '00:00 - 00:12', label: 'Opening Wide Shot', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600&auto=format&fit=crop' },
            { time: '00:12 - 00:28', label: 'Approach Over the River', img: 'https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?q=80&w=600&auto=format&fit=crop' },
            { time: '00:28 - 00:48', label: 'Reveal the Development', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
            { time: '00:48 - 01:05', label: 'Flyover Through the Property', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop' },
            { time: '01:05 - 01:15', label: 'Closing Top Down Shot', img: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?q=80&w=600&auto=format&fit=crop' },
            { time: '01:15', label: 'Fade Out', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?q=80&w=600&auto=format&fit=crop' },
          ].map((shot, i) => (
            <div key={i} className="group relative aspect-video bg-slate-900 overflow-hidden">
              <img src={shot.img} alt={shot.label} className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3">
                <div className="text-[10px] font-mono text-slate-400 mb-0.5">{shot.time}</div>
                <div className="text-xs text-white uppercase tracking-wider">{shot.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Features */}
        <div className="flex justify-between items-center px-12 py-8 bg-[#0a0a0a] border-t border-slate-800/50">
          <div className="flex items-center gap-3 text-slate-400">
            <Camera size={24} />
            <div className="text-xs uppercase tracking-widest">Cinematic Drone<br/>Movement</div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Monitor size={24} />
            <div className="text-xs uppercase tracking-widest">Ultra High<br/>Definition</div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Video size={24} />
            <div className="text-xs uppercase tracking-widest">Smooth<br/>Transitions</div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck size={24} />
            <div className="text-xs uppercase tracking-widest">Color Graded<br/>Cinematic Look</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
