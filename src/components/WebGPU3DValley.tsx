import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Ruler, Shield, X, Check } from 'lucide-react';
import { ParcelInfo } from './DigitalTwinView';

export const PARCELS = [
  {
    x: -15, z: 10,
    info: {
      id: "PRCL_TUCKER_01",
      tractName: "Tucker Homestead (13101 Bonebank Rd)",
      lineageGroup: "Tucker",
      threatScore: 25.5,
      isInundated: false,
      historicalNote: "Original 1820s settlement boundaries. Significant elevation delta limits standard flood exposure.",
      historicalEvents: "Survived 1937 Great Ohio River Flood",
      grantEligibility: "FEMA_BRIC_2026 Eligible"
    }
  },
  {
    x: 5, z: -5,
    info: {
      id: "PRCL_YEIDA_01",
      tractName: "Weiss Cemetery Ground",
      lineageGroup: "Yeida",
      threatScore: 82.1,
      isInundated: true,
      historicalNote: "German immigrant era land grant. Highly vulnerable lowland area near local stream channels.",
      historicalEvents: "Severe damage during 1991 flash floods",
      grantEligibility: "IN_DNR_MIG_2026 High Priority"
    }
  },
  {
    x: -22, z: -15,
    info: {
      id: "PRCL_CHURCH_01",
      tractName: "Point Township Nazarene Church",
      lineageGroup: "Church",
      threatScore: 68.4,
      isInundated: false,
      historicalNote: "Wabash-Ohio confluence boundary property, functioning as community emergency point.",
      historicalEvents: "Constructed on stable compacted earthen fill",
      grantEligibility: "Community Relief Match Tier 2"
    }
  }
];

interface WebGPU3DValleyProps {
  waterLevel?: number;
  onParcelClick?: (parcel: ParcelInfo) => void;
}

const ParcelMarker = ({ x, z, info, onClick }: { x: number, z: number, info: ParcelInfo, onClick: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { geo, colorHex, offset } = useMemo(() => {
    let geo;
    let colorHex = '#ffffff';
    let offset = 1;
    if (info.lineageGroup.toLowerCase() === 'tucker') {
      geo = new THREE.ConeGeometry(2, 4, 16);
      colorHex = '#ef4444'; // red
      offset = 2;
    } else if (info.lineageGroup.toLowerCase() === 'yeida') {
      geo = new THREE.OctahedronGeometry(1.8);
      colorHex = '#eab308'; // yellow
      offset = 1.8;
    } else {
      geo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
      colorHex = '#3b82f6'; // blue
      offset = 2;
    }
    return { geo, colorHex, offset };
  }, [info]);

  const valley = Math.abs(x) < 20 ? (Math.cos(x * Math.PI / 40) * -10) : 0;
  const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
  const y = 5 + valley + noise + offset;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      if (hovered) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(clock.getElapsedTime() * 5) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[x, y, z]} 
      geometry={geo}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'auto'; }}
      castShadow
    >
      <meshStandardMaterial color={hovered ? '#ffffff' : colorHex} roughness={0.2} metalness={0.8} />
    </mesh>
  );
};

const Terrain = ({ onPointerDown, onPointerMove }: { 
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void,
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128);
    geo.rotateX(-Math.PI / 2);
    
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      
      const valley = Math.pow(x / 30, 2) * 10;
      const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.5 + Math.sin(x * 0.8 + z * 0.5) * 0.5;
      
      pos.setY(i, valley + noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      receiveShadow
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <meshStandardMaterial 
        color="#1f2937" 
        wireframe={true} 
        transparent 
        opacity={0.3} 
      />
      <meshStandardMaterial 
        color="#374151" 
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

const Water = ({ level = 5, blockedPoints = [] }: { level: number, blockedPoints: THREE.Vector3[] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = level + Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, level, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#2c82c9" 
        transparent 
        opacity={0.8}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

const BermVisual = ({ points, draftPoint }: { points: THREE.Vector3[], draftPoint: THREE.Vector3 | null }) => {
  const allPoints = draftPoint ? [...points, draftPoint] : points;
  
  if (allPoints.length === 0) return null;

  const renderPoints = allPoints.map(p => new THREE.Vector3(p.x, p.y + 0.5, p.z));

  return (
    <group>
      {renderPoints.length > 1 && (
        <Line
          points={renderPoints}
          color="#f59e0b"
          lineWidth={15}
          dashed={false}
        />
      )}
      {renderPoints.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={i === renderPoints.length - 1 && draftPoint ? "#fbbf24" : "#d97706"} />
        </mesh>
      ))}
    </group>
  );
}

export const WebGPU3DValley: React.FC<WebGPU3DValleyProps> = ({ waterLevel = 2, onParcelClick }) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [bermPoints, setBermPoints] = useState<THREE.Vector3[]>([]);
  const [draftPoint, setDraftPoint] = useState<THREE.Vector3 | null>(null);
  const [savedBerms, setSavedBerms] = useState<THREE.Vector3[][]>([]);
  const [inundationReduction, setInundationReduction] = useState(0);

  useEffect(() => {
    let totalLength = 0;
    savedBerms.forEach(berm => {
      for (let i = 0; i < berm.length - 1; i++) {
        totalLength += berm[i].distanceTo(berm[i+1]);
      }
    });
    
    const reduction = Math.min(100, (totalLength * 15) / 100); 
    setInundationReduction(reduction);
  }, [savedBerms]);

  const handleTerrainPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    setBermPoints([...bermPoints, e.point.clone()]);
  };

  const handleTerrainPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    setDraftPoint(e.point.clone());
  };

  const cancelDrawing = () => {
    setIsDrawingMode(false);
    setBermPoints([]);
    setDraftPoint(null);
  };

  const finishDrawing = () => {
    if (bermPoints.length > 1) {
      setSavedBerms([...savedBerms, bermPoints]);
    }
    setIsDrawingMode(false);
    setBermPoints([]);
    setDraftPoint(null);
  };

  const clearBerms = () => {
    setSavedBerms([]);
  };

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <Canvas shadows camera={{ position: [0, 20, 40], fov: 45 }}>
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <Environment preset="city" />
        
        <Terrain 
          onPointerDown={handleTerrainPointerDown} 
          onPointerMove={handleTerrainPointerMove}
        />
        <Water level={waterLevel} blockedPoints={[]} />
        
        <BermVisual points={bermPoints} draftPoint={draftPoint} />
        {savedBerms.map((berm, i) => (
          <BermVisual key={i} points={berm} draftPoint={null} />
        ))}
        
        {PARCELS.map((p, i) => (
          <ParcelMarker 
            key={i} 
            x={p.x} 
            z={p.z} 
            info={p.info} 
            onClick={() => onParcelClick?.(p.info)} 
          />
        ))}
        
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={5}
          maxDistance={80}
          enabled={!isDrawingMode}
        />
      </Canvas>

      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-md border border-slate-700 text-xs font-mono shadow-lg flex items-center gap-2 z-10 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Water Level: {waterLevel.toFixed(2)}m
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
        {!isDrawingMode ? (
          <>
            <button 
              onClick={() => setIsDrawingMode(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-700 text-sm flex items-center gap-2 shadow-lg transition-colors pointer-events-auto"
            >
              <Ruler size={16} /> Draw Berm
            </button>
            {savedBerms.length > 0 && (
              <button 
                onClick={clearBerms}
                className="bg-red-900/50 hover:bg-red-800/80 text-red-100 px-3 py-1.5 rounded-md border border-red-700/50 text-xs flex items-center gap-1.5 shadow-lg transition-colors pointer-events-auto"
              >
                Clear All
              </button>
            )}
          </>
        ) : (
          <div className="bg-slate-800 border border-amber-500/50 rounded-lg p-3 shadow-xl flex flex-col gap-2 w-[220px] pointer-events-auto">
            <h4 className="text-amber-400 font-bold text-sm flex items-center gap-1.5 border-b border-amber-500/30 pb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              BERM DRAFTING ACTIVE
            </h4>
            <p className="text-[10px] text-slate-300 leading-tight">
              Click on the terrain to place berm nodes. Dragging is disabled.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={cancelDrawing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded border border-slate-700 text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <X size={12} /> Cancel
              </button>
              <button 
                onClick={finishDrawing}
                disabled={bermPoints.length < 2}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white py-1.5 rounded border border-amber-500 text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Check size={12} /> Complete
              </button>
            </div>
          </div>
        )}

        {savedBerms.length > 0 && !isDrawingMode && (
          <div className="bg-emerald-950/80 backdrop-blur border border-emerald-500/50 rounded-lg p-3 shadow-xl flex flex-col gap-2 mt-2 w-[240px] animate-in fade-in slide-in-from-right-4 pointer-events-auto">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-emerald-500/30 pb-2">
              <Shield size={16} />
              Inundation Mitigation
            </div>
            <div className="space-y-1.5 mt-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Active Berms:</span>
                <span className="font-mono text-white">{savedBerms.length}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Projected Reduction:</span>
                <span className="font-mono text-emerald-400 font-bold">{inundationReduction.toFixed(1)}%</span>
              </div>
                
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, inundationReduction)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
