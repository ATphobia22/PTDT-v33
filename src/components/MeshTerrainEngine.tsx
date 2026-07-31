import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';

// 3D Procedural Terrain Generation
function Terrain({ size = 100, resolution = 64 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
    geo.rotateX(-Math.PI / 2);
    
    // Displace vertices to create procedural hills/terrain
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Create a simple procedural noise pattern for elevation
      const y = Math.sin(x * 0.05) * 3 + Math.cos(z * 0.05) * 3 + Math.sin((x+z) * 0.1) * 1.5;
      pos.setY(i, y);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [size, resolution]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial 
        color="#3a5a40" 
        wireframe={false} 
        roughness={0.8}
        flatShading
      />
    </mesh>
  );
}

// Flood Simulation Mesh Overlay
function FloodSimulation({ size = 100, active = true, waterLevel = 1.5 }) {
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (waterRef.current && active) {
      // Simulate water surface undulation
      waterRef.current.position.y = waterLevel + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={waterRef} position={[0, waterLevel, 0]} receiveShadow>
      <planeGeometry args={[size, size, 32, 32]} />
      <meshPhysicalMaterial 
        color="#0077b6" 
        transparent 
        opacity={0.6}
        roughness={0.1}
        transmission={0.9}
        thickness={2}
      />
    </mesh>
  );
}

// Structural Twin Prototype (e.g. 13101 Bonebank Rd representation)
function StructuralTwin() {
  return (
    <group position={[0, 4, 0]}>
      {/* Foundation/Main body */}
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <boxGeometry args={[12, 4, 16]} />
        <meshStandardMaterial color="#bc4749" />
      </mesh>
      {/* Roof */}
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <coneGeometry args={[10, 4, 4]} />
        <meshStandardMaterial color="#2b2d42" />
      </mesh>
      {/* Attached Garage */}
      <mesh castShadow receiveShadow position={[-8, 1.5, 2]}>
        <boxGeometry args={[6, 3, 8]} />
        <meshStandardMaterial color="#bc4749" />
      </mesh>
    </group>
  );
}

export function MeshTerrainEngine({ floodActive = true, floodLevel = 2 }) {
  return (
    <div className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden shadow-inner border border-slate-700/50">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur text-white px-3 py-2 rounded font-mono text-xs border border-indigo-500/30">
        <div className="text-indigo-400 font-bold mb-1">D3 ENGINE [WEBGL2]</div>
        <div>SIM_STATUS: <span className="text-emerald-400">ACTIVE</span></div>
        <div>MESH_RES: 64x64</div>
        <div>FLOOD_STAGE: {floodLevel.toFixed(1)}m</div>
      </div>
      
      <Canvas shadows camera={{ position: [40, 30, 40], fov: 45 }}>
        <color attach="background" args={['#1a1b26']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[50, 50, 30]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <Sky sunPosition={[50, 20, 30]} turbidity={0.1} rayleigh={0.5} />
        <Environment preset="city" />

        <Terrain size={120} resolution={128} />
        <FloodSimulation size={120} active={floodActive} waterLevel={floodLevel} />
        <StructuralTwin />
        
        {/* Helper Grid */}
        <gridHelper args={[120, 120, '#ffffff', '#4f4f4f']} position={[0, 0.1, 0]} />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={100}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
        />
        
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ff3333', '#2ebd59', '#00D4FF']} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
