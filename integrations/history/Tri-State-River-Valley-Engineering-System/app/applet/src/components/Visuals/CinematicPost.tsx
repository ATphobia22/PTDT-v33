import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function CinematicPost() {
  return (
    <EffectComposer multisampling={0}>
      {/* 1. Antialiasing (Crisp Edges) */}
      <SMAA />

      {/* 3. Cinematic Bloom (Simulates High Dynamic Range) */}
      <Bloom 
        luminanceThreshold={1.1} // Only very bright hits glow
        intensity={0.5} 
        levels={9} 
        mipmapBlur 
      />
    </EffectComposer>
  );
}
