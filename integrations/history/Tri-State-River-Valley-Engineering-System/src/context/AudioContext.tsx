import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
  isSystemOn: boolean;
  setSystemOn: (on: boolean) => void;
  currentSoundscape: 'hydraulic' | 'family' | 'off';
  setSoundscape: (s: 'hydraulic' | 'family' | 'off') => void;
}

const AudioSystemContext = createContext<AudioContextType | undefined>(undefined);

export function AudioSystemProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(true); // default muted to satisfy browser autoplay policies
  const [volume, setVolumeState] = useState<number>(0.3);
  const [isSystemOn, setSystemOn] = useState<boolean>(true);
  const [currentSoundscape, setSoundscapeState] = useState<'hydraulic' | 'family' | 'off'>('hydraulic');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoIntervalRef = useRef<any>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);

  // Initialize Audio Context lazily
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      // Apply initial mute or volume
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Filter for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);
      filter.connect(masterGain);
      filterRef.current = filter;

      startSoundscape();
    } catch (err) {
      console.error('Failed to initialize synthesized audio engine:', err);
    }
  };

  const startSoundscape = () => {
    const ctx = audioCtxRef.current;
    const filter = filterRef.current;
    if (!ctx || !filter) return;

    // Clear previous sound sources
    stopSoundSources();

    if (currentSoundscape === 'off') return;

    // Set up notes based on soundscape
    const freqs = currentSoundscape === 'hydraulic'
      ? [65.41, 130.81, 196.00, 261.63] // C2, C3, G3, C4 - Deep hydraulic drone
      : [110.00, 164.81, 220.00, 293.66, 329.63]; // A2, E3, A3, D4, E4 - Warm family engineering harmony

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = currentSoundscape === 'hydraulic' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Detune slightly for spatial chorus effect
      osc.detune.setValueAtTime((idx - 2) * 5, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(filter);
      osc.start();

      oscillatorsRef.current.push({ osc, gain });
    });

    // Synthesize real water flow using Web Audio noise generator for real hydraulic experience
    try {
      // ScriptProcessor is deprecated but universally supported across sandboxed browser frames
      const bufferSize = 4096;
      const scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      
      scriptNode.onaudioprocess = (e) => {
        const outputBuffer = e.outputBuffer;
        const channelData = outputBuffer.getChannelData(0);
        for (let sample = 0; sample < bufferSize; sample++) {
          // White noise
          channelData[sample] = Math.random() * 2.0 - 1.0;
        }
      };

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(250, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      const noiseGain = ctx.createGain();
      // Keep water rumble soft
      noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);

      scriptNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(filter);

      noiseNodeRef.current = scriptNode;

      // Modulate the water frequency to simulate river waves/flow dynamics
      let theta = 0;
      const modulationInterval = setInterval(() => {
        if (!ctx) return;
        theta += 0.05;
        // Water filter sweeps slowly between 180Hz and 320Hz
        const noiseFreq = 250 + Math.sin(theta) * 70;
        noiseFilter.frequency.setTargetAtTime(noiseFreq, ctx.currentTime, 0.2);
        
        // Also modulate primary lowpass filter frequency slightly
        const primaryFilterFreq = 350 + Math.cos(theta * 0.4) * 80;
        filter.frequency.setTargetAtTime(primaryFilterFreq, ctx.currentTime, 0.4);
      }, 100);

      lfoIntervalRef.current = modulationInterval;
    } catch (e) {
      console.warn('Procedural water audio generation skipped or not supported:', e);
    }
  };

  const stopSoundSources = () => {
    if (lfoIntervalRef.current) {
      clearInterval(lfoIntervalRef.current);
      lfoIntervalRef.current = null;
    }

    oscillatorsRef.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch (err) {}
    });
    oscillatorsRef.current = [];

    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.disconnect();
      } catch (err) {}
      noiseNodeRef.current = null;
    }
  };

  const toggleMute = () => {
    initAudio();
    setIsMuted(prev => {
      const nextMuted = !prev;
      if (audioCtxRef.current && masterGainRef.current) {
        // Resume AudioContext if suspended
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        masterGainRef.current.gain.setTargetAtTime(
          nextMuted ? 0 : volume * 0.25,
          audioCtxRef.current.currentTime,
          0.1
        );
      }
      return nextMuted;
    });
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioCtxRef.current && masterGainRef.current && !isMuted) {
      masterGainRef.current.gain.setTargetAtTime(
        val * 0.25,
        audioCtxRef.current.currentTime,
        0.1
      );
    }
  };

  const setSoundscape = (s: 'hydraulic' | 'family' | 'off') => {
    initAudio();
    setSoundscapeState(s);
  };

  // Trigger soundscape changes
  useEffect(() => {
    if (audioCtxRef.current) {
      startSoundscape();
    }
  }, [currentSoundscape]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSoundSources();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <AudioSystemContext.Provider
      value={{
        isMuted,
        toggleMute,
        volume,
        setVolume,
        isSystemOn,
        setSystemOn,
        currentSoundscape,
        setSoundscape,
      }}
    >
      {children}
    </AudioSystemContext.Provider>
  );
}

export function useAudioSystem() {
  const context = useContext(AudioSystemContext);
  if (context === undefined) {
    throw new Error('useAudioSystem must be used within an AudioSystemProvider');
  }
  return context;
}
