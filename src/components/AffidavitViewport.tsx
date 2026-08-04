import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';

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

export function AffidavitViewport({ stage, flow, fos }: TelemetryProps) {
  return (
    <div className="h-full w-full bg-slate-900 relative">
      <div className="absolute top-4 left-4 z-50 p-4 bg-black/80 text-cyan-400 border-l-4 border-cyan-500 font-mono text-xs">
        <h3 className="text-sm font-bold mb-2">SOVEREIGN PROOF CHAIN</h3>
        <p>GAUGE: USGS 03378500 [Wabash]</p>
        <p>STAGE: {stage.toFixed(2)} ft (NAVD88)</p>
        <p>FLOW: {flow.toLocaleString()} cfs</p>
        <p className={fos < 1.3 ? "text-red-500 font-bold" : "text-green-500"}>
          FoS: {fos.toFixed(2)} {fos < 1.3 ? "[CRITICAL]" : "[STABLE]"}
        </p>
      </div>
      
      <Canvas camera={{ position: [0, 50, 100], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Html><div className="text-white font-mono text-xs">Simulating HEC-RAS...</div></Html>}>
           <TerrainMesh depthGrid={{ elevation: stage }} />
        </Suspense>
      </Canvas>
    </div>
  );
}
