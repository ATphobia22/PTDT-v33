import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Sky } from '@react-three/drei';
import { RealityStream } from './World/RealityStream';
import { HoudiniFluid } from './Simulation/HoudiniFluid';
import { CinematicPost } from './Visuals/CinematicPost';
import { UnrealStream } from './Integrations/UnrealStream';
import { motion, useMotionValue, animate, useTransform } from 'motion/react';

// Live Telemetry Interface
interface TelemetryProps {
  stage: number; // USGS 03378500
  flow: number;  // 11,200 cfs
  fos: number;   // Factor of Safety
}

function useSunPosition() {
  const [sunPos, setSunPos] = useState<[number, number, number]>([0, 100, 0]);

  useEffect(() => {
    const updateSun = () => {
      const date = new Date();
      // Calculate Central Daylight Time (UTC-5) roughly
      const hours = date.getUTCHours() - 5;
      const minutes = date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      const decimalHours = (hours + 24) % 24 + minutes / 60 + seconds / 3600;
      
      const phi = ((decimalHours - 6) / 24) * Math.PI * 2;
      const distance = 100;
      const x = Math.cos(phi) * distance;
      const y = Math.sin(phi) * distance;
      const z = distance * Math.sin((38 / 180) * Math.PI);
      
      setSunPos([x, y, z]);
    };

    updateSun();
    const interval = setInterval(updateSun, 60000);
    return () => clearInterval(interval);
  }, []);

  return sunPos;
}

export function AffidavitViewport({ stage, flow, fos }: TelemetryProps) {
  const [pixelStreaming, setPixelStreaming] = useState(false);

  const animatedStage = useMotionValue(0);
  const animatedFlow = useMotionValue(0);
  const animatedFos = useMotionValue(0);

  useEffect(() => {
    const controlsStage = animate(animatedStage, stage, { duration: 1.5, ease: "easeOut" });
    const controlsFlow = animate(animatedFlow, flow, { duration: 1.5, ease: "easeOut" });
    const controlsFos = animate(animatedFos, fos, { duration: 1.5, ease: "easeOut" });

    return () => {
      controlsStage.stop();
      controlsFlow.stop();
      controlsFos.stop();
    };
  }, [stage, flow, fos]);

  const displayStage = useTransform(animatedStage, (v) => v.toFixed(2));
  const displayFlow = useTransform(animatedFlow, (v) => Math.round(v).toLocaleString());
  const displayFos = useTransform(animatedFos, (v) => v.toFixed(2));

  const sunPos = useSunPosition();

  return (
    <div className="h-full w-full bg-slate-900 relative">
      <div className="absolute top-4 left-4 z-50 p-4 bg-black/80 text-cyan-400 border-l-4 border-cyan-500 font-mono text-xs shadow-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold mb-2 tracking-widest uppercase">SOVEREIGN PROOF CHAIN</h3>
        <p>GAUGE: USGS 03378500 [Wabash]</p>
        <p>STAGE: <motion.span>{displayStage}</motion.span> ft (NAVD88)</p>
        <p>FLOW: <motion.span>{displayFlow}</motion.span> cfs</p>
        <p className={fos < 1.3 ? "text-red-500 font-bold" : "text-green-500"}>
          FoS: <motion.span>{displayFos}</motion.span> {fos < 1.3 ? "[CRITICAL]" : "[STABLE]"}
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
          <Sky sunPosition={sunPos} />
          <ambientLight intensity={sunPos[1] > 0 ? 0.5 : 0.1} />
          <directionalLight position={sunPos} intensity={sunPos[1] > 0 ? 1.5 : 0.1} castShadow />
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
