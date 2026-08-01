import React, { useCallback, useEffect, useRef, useState } from "react";
import { BACKGROUND_PLAYLIST, type Track } from "../lib/playlist";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from "lucide-react";

/**
 * Soft background music control — defaults muted/off until user starts (browser autoplay policy).
 */
export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [open, setOpen] = useState(false);
  const track: Track = BACKGROUND_PLAYLIST[index] ?? BACKGROUND_PLAYLIST[0];

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    el.src = track.src;
    el.load();
    if (playing) {
      el.play().catch(() => setPlaying(false));
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => {
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
    setIndex((i) => (i - 1 + BACKGROUND_PLAYLIST.length) % BACKGROUND_PLAYLIST.length);
    setPlaying(true);
  }, []);

  const onEnded = () => next();

  return (
    <div className="fixed bottom-4 left-4 z-[80] pointer-events-auto">
      <audio ref={audioRef} preload="metadata" onEnded={onEnded} />
      <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 backdrop-blur-md shadow-2xl text-slate-200 min-w-[260px] max-w-[320px]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/80">
          <ListMusic className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Bonebank Radio</div>
            <div className="text-xs font-semibold truncate">{track?.title}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-[10px] font-mono text-slate-400 hover:text-emerald-400"
          >
            {open ? "Hide" : "List"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-1 px-3 py-2">
          <button type="button" onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-800" title="Previous">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={next} className="p-1.5 rounded-lg hover:bg-slate-800" title="Next">
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="p-1.5 rounded-lg hover:bg-slate-800"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 accent-emerald-500"
            title="Volume"
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
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-800/80 truncate ${
                    i === index ? "text-emerald-400 bg-slate-900/80" : "text-slate-300"
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
