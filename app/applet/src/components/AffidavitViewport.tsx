import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RealityStream } from './World/RealityStream';
import { HoudiniFluid } from './Simulation/HoudiniFluid';
import { CinematicPost } from './Visuals/CinematicPost';
import { UnrealStream } from './Integrations/UnrealStream';

// Live Telemetry Interface
interface TelemetryProps {
  stage: number; // USGS 03378500
  flow: number;  // 11,200 cfs
  fos: number;   // Factor of Safety
}

export function AffidavitViewport({ stage, flow, fos }: TelemetryProps) {
  const [pixelStreaming, setPixelStreaming] = useState(false);

  return (
    <div className="h-full w-full bg-slate-900 relative">
      <div className="absolute top-4 left-4 z-50 p-4 bg-black/80 text-cyan-400 border-l-4 border-cyan-500 font-mono text-xs shadow-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold mb-2 tracking-widest uppercase">SOVEREIGN PROOF CHAIN</h3>
        <p>GAUGE: USGS 03378500 [Wabash]</p>
        <p>STAGE: {stage.toFixed(2)} ft (NAVD88)</p>
        <p>FLOW: {flow.toLocaleString()} cfs</p>
        <p className={fos < 1.3 ? "text-red-500 font-bold" : "text-green-500"}>
          FoS: {fos.toFixed(2)} {fos < 1.3 ? "[CRITICAL]" : "[STABLE]"}
        </p>
        <div className="mt-4 pt-4 border-t border-cyan-500/30">
          <p className="text-[10px] text-slate-400 mb-2">AAA CINEMATIC FIDELITY</p>
          <button
            onClick={() => setPixelStreaming(!pixelStreaming)}
            className={`w-full py-2 px-3 border transition-colors cursor-pointer font-bold ${
              pixelStreaming 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30'
            }`}
          >
            {pixelStreaming ? 'DISCONNECT UNREAL ENGINE' : 'ACTIVATE UE5 PIXEL STREAM'}
          </button>
        </div>
      </div>
      
      {pixelStreaming ? (
        <UnrealStream />
      ) : (
        <Canvas camera={{ position: [0, 50, 100], fov: 45 }} gl={{ antialias: false }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={<Html center><div className="text-cyan-400 font-mono text-xs bg-black/80 p-2 rounded border border-cyan-500/50 whitespace-nowrap">HYDRATING MOONRAY PROXY...</div></Html>}>
             {/* Phase 1: Google Photorealistic 3D Tiles */}
             <RealityStream />
             
             {/* Phase 2: Houdini Vertex Animation Texture (Fluid Sim) */}
             <HoudiniFluid url="/assets/houdini" />
             
             {/* Phase 3: Screen Space Post Processing */}
             <CinematicPost />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
