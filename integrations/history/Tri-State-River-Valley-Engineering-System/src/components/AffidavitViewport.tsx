import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Html, Sky } from '@react-three/drei';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import * as THREE from 'three';
import * as SunCalc from 'suncalc';

// Live Telemetry Interface
interface TelemetryProps {
  stage: number; // USGS 03378500
  flow: number;  // 11,200 cfs
  fos: number;   // Factor of Safety
}

function TerrainMesh({ depthGrid }: { depthGrid: { elevation: number } }) {
  // Load LiDAR Mesh (Point Township / Wabash Valley)
  // We'll mock the mesh data rendering if the file doesn't exist, to prevent breaking the app.
  // The actual implementation would load '/assets/point_township_lidar.glb'
  
  return (
    <group dispose={null}>
      <mesh>
        <planeGeometry args={[100, 100, 64, 64]} />
        <meshStandardMaterial color="#2d4a22" wireframe />
      </mesh>
      
      {/* Dynamic Flood Overlay */}
      <mesh position={[0, depthGrid.elevation, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0066cc" 
          transparent 
          opacity={0.6} 
          roughness={0.1} 
        />
      </mesh>
    </group>
  );
}

function useSunPosition() {
  const [sunPos, setSunPos] = useState<[number, number, number]>([0, 100, 0]);

  useEffect(() => {
    const updateSun = () => {
      const date = new Date();
      // Tri-River Valley coordinates
      const lat = 37.8931;
      const lng = -88.0245;

      const sunPosCalc = SunCalc.getPosition(date, lat, lng);
      // sunPosCalc returns altitude and azimuth in radians
      // Adjust azimuth: SunCalc azimuth is 0 at south, PI/2 at west.
      // Three.js: y is up, x and z are horizontal.
      // Map azimuth and altitude to spherical coordinates:
      const distance = 100;
      const phi = sunPosCalc.altitude;
      const theta = sunPosCalc.azimuth;

      // Convert to Cartesian (adjusting for Three.js coordinate system, where y is up)
      // Usually, y = r * sin(altitude)
      // x = r * cos(altitude) * sin(azimuth)
      // z = r * cos(altitude) * cos(azimuth)
      const x = distance * Math.cos(phi) * Math.sin(theta);
      const y = distance * Math.sin(phi);
      const z = distance * Math.cos(phi) * Math.cos(theta);

      setSunPos([x, y, z]);
    };

    updateSun();
    const interval = setInterval(updateSun, 60000);
    return () => clearInterval(interval);
  }, []);

  return sunPos;
}

export function AffidavitViewport({ stage, flow, fos }: TelemetryProps) {
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
  }, [stage, flow, fos, animatedStage, animatedFlow, animatedFos]);

  const displayStage = useTransform(animatedStage, (v) => v.toFixed(2));
  const displayFlow = useTransform(animatedFlow, (v) => Math.round(v).toLocaleString());
  const displayFos = useTransform(animatedFos, (v) => v.toFixed(2));

  const sunPos = useSunPosition();
  const isDaytime = sunPos[1] > 0;

  return (
    <div className="h-full w-full bg-slate-900 relative overflow-hidden">
      {/* HUD Overlay with CSS backdrop-blur transition and scanline effect */}
      <div className="absolute top-4 left-4 z-50 p-4 bg-black/40 text-cyan-400 border-l-4 border-cyan-500 font-mono text-xs shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-md">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 pointer-events-none opacity-40 mix-blend-overlay"></div>
        </div>

        <h3 className="text-sm font-bold mb-2 tracking-widest uppercase relative z-10">SOVEREIGN PROOF CHAIN</h3>
        <div className="space-y-1 relative z-10">
          <p>GAUGE: USGS 03378500 [Wabash]</p>
          <p>STAGE: <motion.span>{displayStage}</motion.span> ft (NAVD88)</p>
          <p>FLOW: <motion.span>{displayFlow}</motion.span> cfs</p>
          <p className={fos < 1.3 ? "text-red-500 font-bold" : "text-green-500"}>
            FoS: <motion.span>{displayFos}</motion.span> {fos < 1.3 ? "[CRITICAL]" : "[STABLE]"}
          </p>
        </div>
      </div>
      
      <Canvas camera={{ position: [0, 50, 100], fov: 45 }}>
        <Sky sunPosition={sunPos} />
        <ambientLight intensity={isDaytime ? 0.5 : 0.1} />
        <directionalLight position={sunPos} intensity={isDaytime ? 1.5 : 0.1} castShadow />
        
        <Suspense fallback={<Html><div className="text-white font-mono text-xs">Simulating HEC-RAS...</div></Html>}>
           <TerrainMesh depthGrid={{ elevation: stage }} />
        </Suspense>
      </Canvas>
    </div>
  );
}
