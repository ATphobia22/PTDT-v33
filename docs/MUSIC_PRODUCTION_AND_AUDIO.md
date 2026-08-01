# Music production & audio system

## Layers

| Layer | Implementation | Control |
|-------|----------------|---------|
| **Bonebank Radio** (MP3 playlist) | `BackgroundMusicPlayer` + `playlist.ts` | Play/skip/volume; shares **global mute** |
| **Hydraulic / family drones** | Web Audio in `AudioContext.tsx` | Soundscape select + **global mute** |

## Mute / unmute

- **Dashboard settings** and **Bonebank Radio** both call `toggleMute()` from `useAudioSystem()`.
- Radio shows **MUTED** / **LIVE** badge.
- Keyboard: **`M`** toggles mute; **Shift+Space** toggles radio play/pause.

Muted state zeros Web Audio master gain **and** HTMLAudio volume.

## Optimizations applied

- Single `<audio>` element (no parallel decode of whole library)
- Next-track **metadata preload** only
- `playsInline` for mobile
- Progress via `timeupdate` (no rAF spam)
- Prev button restarts track if >3s in (standard UX)
- Effective music gain = `musicVol * systemVolume` when unmuted

## Production notes (source masters)

For future exports into `public/audio/`:

1. **Loudness** — target about **−14 to −16 LUFS** integrated so HUD speech/telemetry stays clear under 0.35 default music gain.
2. **True peak** ≤ **∑1 dBTP**.
3. **Format** — stereo MP3 192–320 kbps or Opus/AAC if you migrate; keep filenames stable.
4. **Structure** — soft intros help loop boundaries; avoid 0 dBFS brickwall on every chorus.
5. **Ducking** — optional future: lower `musicVol` when TerminalOverlay opens.
6. **Rights** — only ship tracks you own or license for the twin UI.

## Session order rationale

Place/faith → resilience/work → mud-machine energy → identity → long/mood/focus cuts — matches Point Township / Bonebank narrative without opening on the hardest drop.

## Assets

Copy MP3s into `public/audio/` per `public/audio/README.md`.
