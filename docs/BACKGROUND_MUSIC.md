# Background music

Component: `src/components/BackgroundMusicPlayer.tsx`  
Playlist: `src/lib/playlist.ts`  
Assets: `public/audio/*.mp3`

- Starts **stopped** (browser autoplay rules); user presses Play.
- Default volume 35%.
- Advances to next track on end; loops playlist.

Mount near root layout / Dashboard:

```tsx
import { BackgroundMusicPlayer } from "./components/BackgroundMusicPlayer";
// ...
<BackgroundMusicPlayer />
```
