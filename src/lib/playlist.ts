/** Background music playlist — files served from /audio/*.mp3 */

export interface Track {
  id: string;
  title: string;
  src: string;
  durationSec?: number;
  /** Production tags for mixing / ducking guidance */
  tags?: string[];
}

/**
 * Ordered for session flow: place / faith → work ethic → mud & machine → identity → deep cuts.
 * Keep peaks moderate; player default music gain is 0.35 under system volume.
 */
export const BACKGROUND_PLAYLIST: Track[] = [
  {
    id: "point-township-revival",
    title: "Point Township Revival",
    src: "/audio/point-township-revival.mp3",
    durationSec: 166,
    tags: ["place", "anthem"],
  },
  {
    id: "god-family-friends",
    title: "God Family Friends",
    src: "/audio/god-family-friends-2.mp3",
    durationSec: 173,
    tags: ["faith", "warm"],
  },
  {
    id: "gods-good-to-me",
    title: "God's Good to Me",
    src: "/audio/gods-good-to-me.mp3",
    durationSec: 177,
    tags: ["faith"],
  },
  {
    id: "still-standing",
    title: "Still Standing",
    src: "/audio/still-standing.mp3",
    durationSec: 157,
    tags: ["resilience"],
  },
  {
    id: "get-it-out-the-mud",
    title: "Get It Out the Mud",
    src: "/audio/get-it-out-the-mud.mp3",
    durationSec: 157,
    tags: ["work", "mud"],
  },
  {
    id: "pick-up-a-hammer",
    title: "Pick Up a Hammer",
    src: "/audio/pick-up-a-hammer.mp3",
    durationSec: 132,
    tags: ["work"],
  },
  {
    id: "mud-buggy-country",
    title: "Mud Buggy Country Rock",
    src: "/audio/mud-buggy-country-rock.mp3",
    durationSec: 175,
    tags: ["mud", "rock"],
  },
  {
    id: "mud-buggy-funk",
    title: "Mud Buggy Huntin Funk",
    src: "/audio/mud-buggy-huntin-funk2.mp3",
    durationSec: 210,
    tags: ["mud", "funk"],
  },
  {
    id: "do-you-know",
    title: "Do You Know Who I Am",
    src: "/audio/do-you-know-who-i-am.mp3",
    durationSec: 270,
    tags: ["identity"],
  },
  {
    id: "do-u-remember",
    title: "Do U Remember My Name",
    src: "/audio/do-u-remember-my-name.mp3",
    durationSec: 169,
    tags: ["identity"],
  },
  {
    id: "secret-untold",
    title: "Secret Untold",
    src: "/audio/secret-untold.mp3",
    durationSec: 158,
    tags: ["mood"],
  },
  {
    id: "deja-vu-drip",
    title: "Déjà Vu Drip",
    src: "/audio/deja-vu-drip.mp3",
    durationSec: 211,
    tags: ["mood", "drip"],
  },
  {
    id: "monster-down",
    title: "Monster Down",
    src: "/audio/monster-down.mp3",
    durationSec: 177,
    tags: ["hunt", "high-energy"],
  },
  {
    id: "mini-deni",
    title: "Mini Deni",
    src: "/audio/mini-deni.mp3",
    durationSec: 285,
    tags: ["long-form"],
  },
  {
    id: "sync-programming",
    title: "Synchronous Programming (Slim)",
    src: "/audio/synchronous-programming-2-slim.mp3",
    durationSec: 205,
    tags: ["focus", "code"],
  },
];
