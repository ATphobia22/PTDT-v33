import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUND_PLAYLIST, type Track } from "../lib/playlist";
import { useAudioSystem } from "../context/AudioContext";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
} from "lucide-react";

/**
 * Bonebank Radio — HTMLAudio playlist optimized for long sessions.
 * Mute is shared with Web Audio soundscape via AudioContext.toggleMute.
 */
export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [musicVol, setMusicVol] = useState(0.35);

  const { isMuted, toggleMute, volume: sysVolume } = useAudioSystem();

  const track: Track = BACKGROUND_PLAYLIST[index] ?? BACKGROUND_PLAYLIST[0];
  const nextIndex = useMemo(
    () => (index + 1) % BACKGROUND_PLAYLIST.length,
    [index]
  );

  // Effective gain: music slider * system volume * mute
  const effectiveVolume = isMuted ? 0 : musicVol * Math.max(0.05, sysVolume);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = effectiveVolume;
  }, [effectiveVolume]);

  // Load track; resume if was playing
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    const wasPlaying = playing;
    el.src = track.src;
    el.preload = "auto";
    el.load();
    if (wasPlaying) {
      el.play().catch(() => setPlaying(false));
    }
    // Preload next track metadata only
    if (!preloadRef.current) preloadRef.current = new Audio();
    const next = BACKGROUND_PLAYLIST[nextIndex];
    if (next) {
      preloadRef.current.preload = "metadata";
      preloadRef.current.src = next.src;
    }
  }, [index, nextIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progress bar (throttled via timeupdate)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      if (!el.duration || !Number.isFinite(el.duration)) return;
      setProgress(el.currentTime / el.duration);
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [index]);

  // Keyboard: M mute, Space play/pause (when not typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
      if (e.code === "Space" && e.shiftKey) {
        e.preventDefault();
        const el = audioRef.current;
        if (!el) return;
        if (playing) {
          el.pause();
          setPlaying(false);
        } else {
          el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, toggleMute]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [playing]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % BACKGROUND_PLAYLIST.length);
    setPlaying(true);
  }, []);

  const prev = useCallback(() => {
    const el = audioRef.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 + BACKGROUND_PLAYLIST.length) % BACKGROUND_PLAYLIST.length);
    setPlaying(true);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[80] pointer-events-auto select-none">
      <audio ref={audioRef} onEnded={next} playsInline />
      <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 backdrop-blur-md shadow-2xl text-slate-200 w-[300px]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/80">
          <ListMusic className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              Bonebank Radio
            </div>
            <div className="text-xs font-semibold truncate">{track?.title}</div>
          </div>
          {/* Primary global mute / unmute */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-colors ${
              isMuted
                ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            }`}
            title="Mute / unmute all audio (M)"
            aria-pressed={isMuted}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isMuted ? "MUTED" : "LIVE"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-[10px] font-mono text-slate-400 hover:text-emerald-400"
          >
            {open ? "Hide" : "List"}
          </button>
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-slate-800">
          <div
            className="h-full bg-emerald-500/80 transition-[width] duration-200"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-1 px-3 py-2">
          <button type="button" onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-800" title="Previous">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
            title={playing ? "Pause" : "Play (Shift+Space)"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={next} className="p-1.5 rounded-lg hover:bg-slate-800" title="Next">
            <SkipForward className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVol}
            onChange={(e) => setMusicVol(parseFloat(e.target.value))}
            className="w-16 accent-emerald-500"
            title="Music volume"
            aria-label="Music volume"
          />
        </div>

        {open && (
          <ul className="max-h-48 overflow-y-auto border-t border-slate-800/80 text-xs">
            {BACKGROUND_PLAYLIST.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setPlaying(true);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-800/80 truncate ${\n                    i === index ? "text-emerald-400 bg-slate-900/80" : "text-slate-300"
                  }`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BackgroundMusicPlayer;
