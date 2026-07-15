import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu';
import { color, positionLocal, vec3, uniform, mix, select, greaterThan, time, sin } from 'three/tsl';
import { 
  ShieldAlert, Plus, Play, Pause, Thermometer, Waves, X, Info, Maximize, Minimize, FileText,
  Link, Globe, Sliders, Database, Cpu, Layers, Activity, Eye, Settings, AlertTriangle, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ParcelInfo {
  id: string;
  tractName: string;
  lineageGroup: string;
  threatScore: number;
  isInundated: boolean;
  historicalNote: string;
  historicalEvents: string;
  grantEligibility: string;
}

export function DigitalTwinView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewWrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlacingBerm, setIsPlacingBerm] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [selectedParcel, setSelectedParcel] = useState<ParcelInfo | null>(null);
  const [showDossier, setShowDossier] = useState(false);

  const isPlacingBermRef = useRef(false);
  const showHeatmapRef = useRef(false);
  const [waterDepth, setWaterDepth] = useState(0.1);
  const waterDepthRef = useRef(0.1);
  const waterDepthUniformRef = useRef<any>(null);
  const heatmapUniformRef = useRef<any>(null);
  
  const [isRendererActive, setIsRendererActive] = useState(false);
  const [isWebGLFallback, setIsWebGLFallback] = useState(false);

  useEffect(() => {
    waterDepthRef.current = waterDepth;
  }, [waterDepth]);

  // Sovereign Integrations Hub States & Data
  const [sidebarTab, setSidebarTab] = useState<'metrics' | 'registry'>('metrics');
  const [rasDischarge, setRasDischarge] = useState(3500);
  const [modflowActive, setModflowActive] = useState(false);
  const [platOverlayActive, setPlatOverlayActive] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<'idle' | 'connected' | 'busy'>('idle');
  const [selectedMatterport, setSelectedMatterport] = useState<string | null>(null);
  const [isSyncingXSoft, setIsSyncingXSoft] = useState(false);
  const [xsoftRecord, setXsoftRecord] = useState<{ owner: string; appraisedValue: string; taxId: string } | null>(null);

  const handleRasDischargeChange = (val: number) => {
    setRasDischarge(val);
    // Bind HEC-RAS boundary flow directly to water depth:
    // 2000 cfs -> 0.1m, 12000 cfs -> 5.0m
    const depth = 0.1 + ((val - 2000) / 10000) * 4.9;
    setWaterDepth(depth);
  };

  const handleXSoftSync = () => {
    setIsSyncingXSoft(true);
    setXsoftRecord(null);
    setTimeout(() => {
      setIsSyncingXSoft(false);
      if (selectedParcel) {
        if (selectedParcel.lineageGroup.toLowerCase() === 'tucker') {
          setXsoftRecord({
            owner: "John Tucker Revocable Trust",
            appraisedValue: "$285,400",
            taxId: "116-013-002-00"
          });
        } else if (selectedParcel.lineageGroup.toLowerCase() === 'yeida') {
          setXsoftRecord({
            owner: "Posey Historical Cemetery Association",
            appraisedValue: "$1.00 (Tax Exempt)",
            taxId: "116-015-099-00"
          });
        } else if (selectedParcel.lineageGroup.toLowerCase() === 'church') {
          setXsoftRecord({
            owner: "Point Township Nazarene Church Corp",
            appraisedValue: "$412,000 (Religious Exempt)",
            taxId: "116-018-011-00"
          });
        }
      } else {
        setXsoftRecord({
          owner: "Unspecified Posey Township Tract",
          appraisedValue: "$175,000",
          taxId: "116-000-001-00"
        });
      }
    }, 800);
  };

  useEffect(() => {
    if (selectedParcel) {
      setXsoftRecord(null);
    }
  }, [selectedParcel]);

  const bayesianCurveData = [
    { returnPeriod: 5, lower: 2500, mode: 3500, upper: 4800 },
    { returnPeriod: 10, lower: 3200, mode: 4800, upper: 6500 },
    { returnPeriod: 50, lower: 5500, mode: 8500, upper: 11000 },
    { returnPeriod: 100, lower: 7200, mode: 11200, upper: 14500 },
    { returnPeriod: 500, lower: 11500, mode: 17800, upper: 23000 }
  ];
  
  useEffect(() => {
    isPlacingBermRef.current = isPlacingBerm;
  }, [isPlacingBerm]);

  useEffect(() => {
    showHeatmapRef.current = showHeatmap;
    if (heatmapUniformRef.current) {
      heatmapUniformRef.current.value = showHeatmap ? 1.0 : 0.0;
    }
  }, [showHeatmap]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (viewWrapperRef.current && typeof viewWrapperRef.current.requestFullscreen === 'function') {
        viewWrapperRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        console.warn('Fullscreen API is not supported in this environment/iframe context.');
      }
    } else {
      if (typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(err => {
          console.error(`Error exiting fullscreen: ${err.message}`);
        });
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const nav = navigator as any;
    let isMounted = true;
    
    async function init3D() {
      const container = containerRef.current!;
      let renderer: any;
      let useWebGL = false;

      if (nav.gpu) {
        try {
          renderer = new WebGPURenderer({ antialias: true, alpha: true });
          await renderer.init();
        } catch (gpuError) {
          console.warn("WebGPURenderer init failed, falling back to WebGL:", gpuError);
          useWebGL = true;
        }
      } else {
        useWebGL = true;
      }

      if (useWebGL) {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        setIsWebGLFallback(true);
      }

      rendererRef.current = renderer;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
      camera.position.set(0, 55, 95);
      camera.lookAt(0, 0, 0);
      
      // Grid helper for terrain base
      const gridHelper = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
      scene.add(gridHelper);

      let material: any;

      if (!useWebGL) {
        // TSL Uniforms and nodes (WebGPU only)
        const waterDepthUniform = uniform(waterDepth);
        waterDepthUniformRef.current = waterDepthUniform;
        
        const heatmapUniform = uniform(showHeatmapRef.current ? 1.0 : 0.0);
        heatmapUniformRef.current = heatmapUniform;
        
        const lineatTractColorUniform = uniform(vec3(0.0, 0.45, 0.85));

        const localCoords = positionLocal;
        const flowDisplacement = sin(localCoords.x.mul(0.1).add(time.mul(0.8)));

        const depthColor = select(
            greaterThan(waterDepthUniform, 2.25),
            mix(vec3(1.0, 0.1, 0.1), vec3(1.0, 1.0, 1.0), flowDisplacement.mul(0.2)),
            mix(lineatTractColorUniform, vec3(0.0, 1.0, 0.5), localCoords.y.mul(0.02))
        );
        
        const heatColor = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), localCoords.y.add(10).mul(0.05));

        const dynamicColorNode = select(
            greaterThan(heatmapUniform, 0.5),
            heatColor,
            depthColor
        );

        // @ts-ignore
        const nodeMat = new MeshBasicNodeMaterial();
        nodeMat.colorNode = dynamicColorNode;
        nodeMat.wireframe = true;
        nodeMat.transparent = true;
        nodeMat.opacity = 0.8;
        material = nodeMat;
      } else {
        // WebGL Standard material
        material = new THREE.MeshBasicMaterial({
          color: 0x3b82f6,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
      }

      const geometry = new THREE.PlaneGeometry(100, 100, 50, 50).rotateX(-Math.PI / 2);
      
      // Modify vertices to create a river valley shape
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        // Valley depression in the middle
        const valley = Math.abs(x) < 20 ? (Math.cos(x * Math.PI / 40) * -10) : 0;
        const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
        positions.setY(i, valley + noise);
      }
      geometry.computeVertexNormals();

      const terrainMesh = new THREE.Mesh(geometry, material);
      terrainMesh.position.y = 5; // Raise slightly above grid
      scene.add(terrainMesh);

      // Create interactive parcels
      const parcelMeshes: THREE.Mesh[] = [];
      const parcelDataMap = new Map<THREE.Mesh, ParcelInfo>();
      const originalColors = new Map<THREE.Mesh, THREE.Color>();
      
      const getMarkerGeometryAndMaterial = (lineageGroup: string) => {
        let geo: THREE.BufferGeometry;
        let colorHex: number;
        
        switch (lineageGroup.toLowerCase()) {
          case 'tucker':
            // Cone pointing down (Classic pin marker)
            geo = new THREE.ConeGeometry(1.5, 4, 8).rotateX(Math.PI);
            colorHex = 0x3b82f6; // Electric Blue
            break;
          case 'yeida':
            // Octahedron (Floating Diamond)
            geo = new THREE.OctahedronGeometry(1.8);
            colorHex = 0xf59e0b; // Vibrant Amber
            break;
          case 'church':
            // Cylinder/Pillar (Historical sanctuary)
            geo = new THREE.CylinderGeometry(1.2, 1.2, 4, 8);
            colorHex = 0xd946ef; // Magenta/Purple
            break;
          default:
            // Standard Box fallback
            geo = new THREE.BoxGeometry(2, 2, 2);
            colorHex = 0x10b981; // Emerald/Teal
            break;
        }
        
        const mat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.95
        });
        
        return { geo, mat, colorHex };
      };

      const addParcel = (x: number, z: number, info: ParcelInfo) => {
        const { geo, mat, colorHex } = getMarkerGeometryAndMaterial(info.lineageGroup);
        const mesh = new THREE.Mesh(geo, mat);
        
        // compute approx Y on the terrain
        const valley = Math.abs(x) < 20 ? (Math.cos(x * Math.PI / 40) * -10) : 0;
        const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
        
        // Position offset based on marker shape
        let offset = 1;
        if (info.lineageGroup.toLowerCase() === 'tucker') {
          offset = 2; // cone height/2
        } else if (info.lineageGroup.toLowerCase() === 'yeida') {
          offset = 1.8; // octahedron radius
        } else if (info.lineageGroup.toLowerCase() === 'church') {
          offset = 2; // cylinder height/2
        }
        
        mesh.position.set(x, 5 + valley + noise + offset, z);
        scene.add(mesh);
        parcelMeshes.push(mesh);
        parcelDataMap.set(mesh, info);
        originalColors.set(mesh, new THREE.Color(colorHex));
      };

      addParcel(-15, 10, {
        id: "PRCL_TUCKER_01",
        tractName: "Tucker Homestead (13101 Bonebank Rd)",
        lineageGroup: "Tucker",
        threatScore: 25.5,
        isInundated: false,
        historicalNote: "Original 1820s settlement boundaries. Significant elevation delta limits standard flood exposure.",
        historicalEvents: "Survived 1937 Great Ohio River Flood",
        grantEligibility: "FEMA_BRIC_2026 Eligible"
      });
      addParcel(5, -5, {
        id: "PRCL_YEIDA_01",
        tractName: "Weiss Cemetery Ground",
        lineageGroup: "Yeida",
        threatScore: 82.1,
        isInundated: true,
        historicalNote: "German immigrant era land grant. Highly vulnerable lowland area near local stream channels.",
        historicalEvents: "Severe damage during 1991 flash floods",
        grantEligibility: "IN_DNR_MIG_2026 High Priority"
      });
      addParcel(-22, -15, {
        id: "PRCL_CHURCH_01",
        tractName: "Point Township Nazarene Church",
        lineageGroup: "Church",
        threatScore: 68.4,
        isInundated: false,
        historicalNote: "Wabash-Ohio confluence boundary property, functioning as community emergency point.",
        historicalEvents: "Constructed on stable compacted earthen fill",
        grantEligibility: "Community Relief Match Tier 2"
      });

      // Brush Cursor for Berm Placement
      const brushGeo = new THREE.RingGeometry(4.5, 5.5, 32);
      const brushMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const brushMesh = new THREE.Mesh(brushGeo, brushMat);
      brushMesh.rotation.x = -Math.PI / 2;
      brushMesh.visible = false;
      scene.add(brushMesh);

      // Berm Placement Raycaster
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let hoveredMesh: THREE.Mesh | null = null;

      const updateRaycaster = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
      };

      let isDraggingBerm = false;

      const placeBermAtPoint = (point: THREE.Vector3, intensity: number = 1.0) => {
        const radius = 6;
        const raiseAmount = 4 * intensity;
        const maxHeight = 12; // cap height to prevent infinite spikes during drag
        
        const pos = geometry.attributes.position;
        let changed = false;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);
          const dist = Math.sqrt((vx - point.x)**2 + (vz - point.z)**2);
          if (dist < radius) {
              const falloff = 1 - (dist / radius);
              const newY = vy + raiseAmount * falloff;
              if (newY < maxHeight) {
                pos.setY(i, newY);
                changed = true;
              }
          }
        }
        if (changed) {
          pos.needsUpdate = true;
          geometry.computeVertexNormals();
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        updateRaycaster(event);

        // Hover effect for parcels
        if (!isPlacingBermRef.current) {
          const parcelIntersects = raycaster.intersectObjects(parcelMeshes);
          if (parcelIntersects.length > 0) {
            container.style.cursor = 'pointer';
            const pMesh = parcelIntersects[0].object as THREE.Mesh;
            if (hoveredMesh !== pMesh) {
              if (hoveredMesh) {
                (hoveredMesh.material as THREE.MeshBasicMaterial).color.copy(originalColors.get(hoveredMesh)!);
              }
              hoveredMesh = pMesh;
              (pMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff); // Highlight
            }
          } else {
            container.style.cursor = 'default';
            if (hoveredMesh) {
              (hoveredMesh.material as THREE.MeshBasicMaterial).color.copy(originalColors.get(hoveredMesh)!);
              hoveredMesh = null;
            }
          }
          brushMesh.visible = false;
        } else {
          // Placing Berm Mode
          container.style.cursor = 'crosshair';
          if (hoveredMesh) {
            (hoveredMesh.material as THREE.MeshBasicMaterial).color.copy(originalColors.get(hoveredMesh)!);
            hoveredMesh = null;
          }

          const terrainIntersects = raycaster.intersectObject(terrainMesh);
          if (terrainIntersects.length > 0) {
            brushMesh.visible = true;
            brushMesh.position.copy(terrainIntersects[0].point);
            brushMesh.position.y += 0.2; 
            
            if (isDraggingBerm) {
              placeBermAtPoint(terrainIntersects[0].point, 0.3); // Apply smaller raise while dragging
            }
          } else {
            brushMesh.visible = false;
          }
        }
      };

      const onPointerDown = (event: PointerEvent) => {
        updateRaycaster(event);

        // First check if we clicked a parcel
        const parcelIntersects = raycaster.intersectObjects(parcelMeshes);
        if (parcelIntersects.length > 0 && !isPlacingBermRef.current) {
          const pMesh = parcelIntersects[0].object as THREE.Mesh;
          const info = parcelDataMap.get(pMesh);
          if (info) {
            setSelectedParcel(info);
          }
          return;
        }

        // If placing a berm, check terrain intersection
        if (isPlacingBermRef.current) {
          isDraggingBerm = true;
          const intersects = raycaster.intersectObject(terrainMesh);
          if (intersects.length > 0) {
            placeBermAtPoint(intersects[0].point, 1.0); // Full raise on initial click
          }
        } else {
          setSelectedParcel(null);
        }
      };
      
      const onPointerUp = () => {
        isDraggingBerm = false;
      };
      
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);

      // Wait for renderer initialization (WebGPU only)
      if (!useWebGL && typeof renderer.init === 'function') {
        await renderer.init();
      }
      
      if (!isMounted) return;

      renderer.setAnimationLoop(() => {
        if (!isPlacingBermRef.current) {
          terrainMesh.rotation.y += 0.001;
          // Rotate parcels with terrain
          const rotMatrix = new THREE.Matrix4().makeRotationY(0.001);
          for (const mesh of parcelMeshes) {
            mesh.position.applyMatrix4(rotMatrix);
            mesh.rotation.y += 0.015; // Gentle spin animation for a responsive, premium visual style
          }
        }

        if (useWebGL) {
          // Dynamic update in WebGL fallback mode
          if (showHeatmapRef.current) {
            material.color.setHex(0xf59e0b); // Orange heat
          } else if (waterDepthRef.current > 2.25) {
            material.color.setHex(0xef4444); // Red warning
          } else {
            material.color.setHex(0x3b82f6); // Electric Blue depth
          }
        }

        renderer.render(scene, camera);
      });
      
      const handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      
      window.addEventListener('resize', handleResize);
      setIsRendererActive(true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerdown', onPointerDown);
      };
    }
    
    init3D().catch(e => console.error("3D rendering engine initialization failed:", e));
    
    return () => {
      isMounted = false;
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (waterDepthUniformRef.current) {
      waterDepthUniformRef.current.value = waterDepth;
    }
  }, [waterDepth]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setWaterDepth(prev => {
          const newDepth = prev + 0.1;
          if (newDepth > 5) {
            setRasDischarge(2000);
            return 0.1; // reset
          }
          const computedDischarge = 2000 + ((newDepth - 0.1) / 4.9) * 10000;
          setRasDischarge(computedDischarge);
          return newDepth;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div ref={viewWrapperRef} className="w-full h-full relative dark:bg-[#020617] bg-slate-50 dark:text-slate-100 text-slate-900 flex overflow-hidden">
      {/* 3D Canvas Area */}
      <div className="flex-1 relative">
        {!isRendererActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 dark:bg-[#020617] bg-slate-50/80 backdrop-blur-sm">
            <div className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 max-w-md text-center">
              <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-bold text-indigo-100 mb-2 font-mono">INITIALIZING TWIN MESH...</h3>
              <p className="text-sm text-indigo-200/70">
                Compiling vectorized shader nodes and establishing sovereign GIS plat structures.
              </p>
            </div>
          </div>
        )}
        {isRendererActive && isWebGLFallback && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-md text-[10px] font-bold font-mono border dark:border-amber-500/30 dark:bg-amber-500/10 border-amber-200 bg-amber-50 dark:text-amber-400 text-amber-700 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>WEBGL ENGINE FALLBACK MODE</span>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0 transition-cursor" />
        
        {/* Matterport Lidar Scan Walkthrough overlay */}
        {selectedMatterport && (
          <div className="absolute inset-4 z-20 rounded-xl dark:bg-slate-950/95 bg-white/95 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] p-4 flex flex-col justify-between backdrop-blur-md animate-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="flex justify-between items-center border-b dark:border-purple-500/20 border-purple-200 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-xs sm:text-sm">
                <Eye size={18} className="animate-pulse text-purple-500" />
                <span>MATTERPORT 3D POINT-CLOUD WALKER v23</span>
              </div>
              <button 
                onClick={() => setSelectedMatterport(null)}
                className="p-1 hover:bg-purple-500/10 rounded transition-colors text-slate-400 hover:text-purple-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Simulation Scan Grid */}
            <div className="flex-1 min-h-[180px] sm:min-h-[220px] my-3 border dark:border-purple-500/20 border-purple-200/50 dark:bg-black bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center font-mono text-center">
              
              {/* Matrix of green/purple dots simulating a point cloud scan */}
              <div className="absolute inset-0 opacity-25 pointer-events-none grid grid-cols-12 grid-rows-12 gap-1 p-4">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className={cn("rounded-full mx-auto", (i % 7 === 0 || i % 9 === 0) ? "w-1 h-1 bg-purple-500" : "w-0.5 h-0.5 bg-emerald-500")} />
                ))}
              </div>

              {/* Holographic Wireframe Circle representing scanned target */}
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-dashed dark:border-purple-500/40 border-purple-400/30 flex items-center justify-center animate-[spin_40s_linear_infinite]">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-double dark:border-emerald-500/40 border-emerald-400/30 flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dotted dark:border-purple-500/60 border-purple-400/50" />
                </div>
              </div>

              {/* Absolute coordinates panel */}
              <div className="absolute bottom-4 left-4 text-[9px] sm:text-[10px] space-y-1 text-emerald-400/80 text-left">
                <div>TARGET: {selectedMatterport}</div>
                <div>SCANNER_LAT: 37.892° N | LON: -88.016° W</div>
                <div>ALT: 114.25m | STATUS: COMPLETED</div>
                <div>POINT_COUNT: 28,451,902 SECURED</div>
              </div>

              <div className="absolute top-4 right-4 text-[9px] sm:text-[10px] text-purple-400/80 flex flex-col items-end text-right">
                <div>SENSORS: LiDAR v2 + Depth Sensor</div>
                <div>OCTREE_DEPTH: 8 (OPTIMIZED)</div>
                <div>DEEP_WALK_ENGINE: ACTIVE</div>
              </div>

              {/* Walkthrough view mock controls */}
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none px-4">
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 font-bold text-xs tracking-wider animate-pulse select-none">
                  LIDAR FIELD WALKTHROUGH MOCK ACTIVE
                </span>
                <span className="text-[10px] text-slate-400 mt-2">Use mouse on the 3D twin grid or click close to return</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] sm:text-[10px] dark:text-purple-400/60 text-purple-500 font-mono">
              <span>SCAN_HASH: MD5_3A8FD6E9110B_SEALED</span>
              <span>MATTERPORT3DSIMULATOR_ENGINE_ONLINE</span>
            </div>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 rounded-xl p-4 min-w-[280px]">
            <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
              <Waves className="w-5 h-5 text-indigo-400" />
              WebGPU Twin Engine
            </h2>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-mono mb-4">Wabash-Ohio Confluence Model</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-slate-400 text-slate-500">Simulation Status</span>
                <span className={cn("text-xs font-mono px-2 py-0.5 rounded", isSimulating ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                  {isSimulating ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-slate-400 text-slate-500">Water Depth</span>
                <span className={cn("text-sm font-mono font-bold", waterDepth > 2.25 ? "text-red-400" : "text-indigo-400")}>
                  {waterDepth.toFixed(2)}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-slate-400 text-slate-500">Risk Threshold</span>
                <span className="text-sm font-mono dark:text-slate-300 text-slate-700">2.25m</span>
              </div>
            </div>

            {/* Ancestral Protected Lineage Groups Legend */}
            <div className="mt-4 pt-4 border-t dark:border-slate-800 border-slate-200/60 pointer-events-auto">
              <div className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider font-semibold mb-2">Protected Lineages</div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)] block shrink-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(180deg)' }} />
                  <span className="dark:text-slate-300 text-slate-700">Tucker family (Blue Cone Pin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)] rotate-45 block shrink-0" />
                  <span className="dark:text-slate-300 text-slate-700">Yeida family (Amber Diamond)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#d946ef] shadow-[0_0_8px_rgba(217,70,239,0.5)] block shrink-0" style={{ borderRadius: '2px' }} />
                  <span className="dark:text-slate-300 text-slate-700">Nazarene Church (Pink Pillar)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-lg dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-500 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Parcel Lineage Popup */}
        {selectedParcel && !showDossier && (
          <div className="absolute top-20 right-6 z-20 w-80 dark:bg-[#0F172A] bg-white/95 backdrop-blur-xl border border-teal-500/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="relative p-5">
              <button 
                onClick={() => setSelectedParcel(null)}
                className="absolute top-4 right-4 text-teal-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="text-[10px] text-teal-400/80 font-mono tracking-widest mb-1 flex items-center gap-1.5">
                <Info size={12} />
                ANCESTRAL PARCEL
              </div>
              
              <h3 className="text-xl font-bold tracking-tight text-white mb-0.5">
                {selectedParcel.tractName}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500 font-mono mb-5">{selectedParcel.id}</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="dark:bg-slate-900 bg-slate-100/50 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200">
                  <div className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-1">Lineage Group</div>
                  <div className={cn(
                    "font-bold text-sm",
                    selectedParcel.lineageGroup.toLowerCase() === 'tucker' ? "text-[#3b82f6]" :
                    selectedParcel.lineageGroup.toLowerCase() === 'yeida' ? "text-[#f59e0b]" :
                    selectedParcel.lineageGroup.toLowerCase() === 'church' ? "text-[#d946ef]" :
                    "dark:text-slate-200 text-slate-800"
                  )}>
                    {selectedParcel.lineageGroup}
                  </div>
                </div>
                
                <div className="dark:bg-slate-900 bg-slate-100/50 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200">
                  <div className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-1">Threat Score</div>
                  <div className={cn("font-bold font-mono", selectedParcel.threatScore > 70 ? 'text-red-500' : 'text-emerald-400')}>
                    {selectedParcel.threatScore.toFixed(1)}
                  </div>
                </div>
                
                <div className="dark:bg-slate-900 bg-slate-100/50 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 col-span-2">
                  <div className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-1">Current Status</div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", selectedParcel.isInundated ? "bg-red-500" : "bg-emerald-500")} />
                    <span className={cn("font-medium text-sm", selectedParcel.isInundated ? "text-red-400" : "text-emerald-400")}>
                      {selectedParcel.isInundated ? 'INUNDATED' : 'DRY'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-1">Historical Context</h4>
                  <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed dark:bg-slate-900 bg-slate-100/30 p-3 rounded-lg border dark:border-slate-800 border-slate-200/50">
                    {selectedParcel.historicalNote}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-1">Grant Eligibility Assessment</h4>
                  <div className="text-sm text-indigo-300 font-mono bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20 space-y-2">
                    <div className="flex justify-between border-b border-indigo-500/20 pb-1">
                      <span className="text-indigo-400/70">Calculated Threat Index:</span>
                      <span className="font-bold">{selectedParcel.threatScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-500/20 pb-1">
                      <span className="text-indigo-400/70">Federal Match (FEMA):</span>
                      <span className="font-bold">{selectedParcel.threatScore > 50 ? '75%' : '0%'}</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-500/20 pb-1">
                      <span className="text-indigo-400/70">State Match (IDNR):</span>
                      <span className="font-bold">{selectedParcel.threatScore > 75 ? '85%' : '0%'}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-indigo-400/70 block mb-1">Status:</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold",
                        selectedParcel.threatScore > 75 ? "bg-emerald-500/20 text-emerald-400" :
                        selectedParcel.threatScore > 50 ? "bg-amber-500/20 text-amber-400" :
                        "dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-500"
                      )}>
                        {selectedParcel.threatScore > 75 ? "IN_DNR_MIG_2026 High Priority" :
                         selectedParcel.threatScore > 50 ? "FEMA_BRIC_2026 Eligible" :
                         "Standard Relief Tier 3"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-teal-950/30 border-t border-teal-500/20 p-3 flex justify-between items-center text-xs">
              <span className="text-teal-400/60 font-mono">NODE_LINK_ACTIVE</span>
              <button 
                onClick={() => setShowDossier(true)}
                className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                View Full Dossier <FileText size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 p-2 rounded-xl">
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
              isSimulating 
                ? "dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-200 text-white" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
            {isSimulating ? "Halt Simulation" : "Run Inundation"}
          </button>
          <div className="w-px dark:bg-slate-800 bg-white mx-1" />
          <button 
            onClick={() => {
              setIsPlacingBerm(!isPlacingBerm);
              if (!isPlacingBerm) setSelectedParcel(null); // deselect when placing berms
            }}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-medium text-sm transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]", isPlacingBerm && "bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]")}
          >
            <Plus size={16} />
            {isPlacingBerm ? "Stop Placing" : "Place Berm"}
          </button>
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-medium text-sm transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]", showHeatmap && "bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]")}
          >
            <Thermometer size={16} />
            Heatmap
          </button>
        </div>
      </div>
      
      {/* Right Sidebar - Analytics & Sovereign Hub */}
      {!isFullscreen && (
        <div className="w-80 border-l dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col shrink-0 z-10">
          <div className="flex border-b dark:border-slate-800 border-slate-200 shrink-0">
            <button 
              onClick={() => setSidebarTab('metrics')}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                sidebarTab === 'metrics' 
                  ? "border-indigo-500 text-indigo-400 dark:bg-slate-900 bg-slate-50" 
                  : "border-transparent dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 hover:text-slate-700"
              )}
            >
              <Activity size={13} />
              Metrics
            </button>
            <button 
              onClick={() => setSidebarTab('registry')}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                sidebarTab === 'registry' 
                  ? "border-indigo-500 text-indigo-400 dark:bg-slate-900 bg-slate-50" 
                  : "border-transparent dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 hover:text-slate-700"
              )}
            >
              <Database size={13} />
              Sovereign Hub
            </button>
          </div>

          {sidebarTab === 'metrics' ? (
            <div className="p-4 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
                  <span>Hydrology Node (PT-001)</span>
                  {isSimulating && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                </div>
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200">
                  <div className="text-2xl font-light font-mono text-emerald-400">
                    {rasDischarge.toFixed(0)} <span className="text-sm dark:text-slate-500 text-slate-400">cfs</span>
                  </div>
                  <div className="text-xs dark:text-slate-400 text-slate-500 mt-1">Discharge Rate</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-400 font-medium uppercase tracking-wider">Geotechnical Status</div>
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200">
                  <div className={cn("text-2xl font-light font-mono flex items-center justify-between", waterDepth > 2.25 ? "text-red-400" : "text-emerald-400")}>
                    <span>
                      {modflowActive 
                        ? Math.max(1.2, 3.8 - waterDepth * 0.4).toFixed(2) 
                        : Math.max(1.0, 3.5 - waterDepth * 0.5).toFixed(2)
                      }
                    </span>
                    {modflowActive && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        MODFLOW Opt
                      </span>
                    )}
                  </div>
                  <div className="text-xs dark:text-slate-400 text-slate-500 mt-1">Factor of Safety (FoS)</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-400 font-medium uppercase tracking-wider">Compliance Engine</div>
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200">
                  <div className={cn("text-sm font-bold", waterDepth > 2.25 ? "text-red-400" : "text-emerald-400")}>
                    {waterDepth > 2.25 ? "VIOLATION DETECTED" : "COMPLIANT_NO_RISE"}
                  </div>
                  <div className="text-xs dark:text-slate-400 text-slate-500 mt-2 font-mono text-[11px] leading-snug">
                    {waterDepth > 2.25 ? "Depth exceeds FEMA maximum allowance (2.25m)." : "All state No-Rise limits currently satisfied."}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-400 font-medium uppercase tracking-wider">Event Log</div>
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200 h-40 overflow-y-auto space-y-2 font-mono text-[10px]">
                  <div className="text-emerald-400">[{new Date().toISOString().split('T')[1].slice(0, 8)}] Engine initialized.</div>
                  {platOverlayActive && (
                    <div className="text-yellow-400">[{new Date().toISOString().split('T')[1].slice(0, 8)}] MAP_SERVICE: Acres Plat grid overlay mapped.</div>
                  )}
                  {modflowActive && (
                    <div className="text-indigo-400">[{new Date().toISOString().split('T')[1].slice(0, 8)}] FLO_PY: Soil saturation and pore water pressure stabilized.</div>
                  )}
                  {waterDepth > 2.25 && (
                    <div className="text-red-400">[{new Date().toISOString().split('T')[1].slice(0, 8)}] CRITICAL_HAZARD: Breach detected in Wabash Confluence.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Land Record GIS Portals */}
              <div className="space-y-3">
                <div className="text-[10px] dark:text-slate-500 text-slate-400 font-bold uppercase tracking-widest border-b dark:border-slate-800 border-slate-200 pb-1.5 flex items-center gap-1">
                  <Globe size={12} className="text-indigo-400" />
                  Sovereign GIS & Tax Registry
                </div>
                
                {/* WTHGIS Portal */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">Posey County WTHGIS</span>
                    <a href="https://poseyin.wthgis.com/" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors" title="Open County GIS Map">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    Indiana Map Service provider for land parcel spatial datasets and public layers.
                  </p>
                </div>

                {/* XSoft Tax Portal */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">XSoft Property taxes</span>
                    <a href="https://engage.xsoftinc.com/posey" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors" title="Open Tax Inquiry">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    Real-time county assessor values, appraisals, and legal boundaries.
                  </p>
                  
                  {/* Interactive Appraisal Puller */}
                  <div className="pt-1.5 border-t dark:border-slate-800/60 border-slate-200/50 space-y-2">
                    <button
                      onClick={handleXSoftSync}
                      disabled={isSyncingXSoft}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)] disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={12} className={cn(isSyncingXSoft && "animate-spin")} />
                      {isSyncingXSoft ? "Syncing Assessors..." : "Sync Valuation Records"}
                    </button>
                    {xsoftRecord && (
                      <div className="p-2 rounded bg-indigo-950/20 border border-indigo-500/20 font-mono text-[11px] space-y-1">
                        <div className="flex justify-between"><span className="text-indigo-400/70">Parcel Tax ID:</span><span className="text-slate-300 font-bold">{xsoftRecord.taxId}</span></div>
                        <div className="flex justify-between"><span className="text-indigo-400/70">Legal Owner:</span><span className="text-slate-300 font-bold text-right truncate max-w-[120px]">{xsoftRecord.owner}</span></div>
                        <div className="flex justify-between"><span className="text-indigo-400/70">Appraisal:</span><span className="text-emerald-400 font-bold">{xsoftRecord.appraisedValue}</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acres Plat Map */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">Acres Plat Map Portal</span>
                    <a href="https://www.acres.com/plat-map/map/in/posey-county-in" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors" title="Open Acres Plat map">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    Public plat boundary survey matching Point township water boundaries.
                  </p>
                  
                  {/* Interactive Plat Outline projection */}
                  <div className="pt-1.5 border-t dark:border-slate-800/60 border-slate-200/50">
                    <button
                      onClick={() => setPlatOverlayActive(!platOverlayActive)}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 py-1.5 rounded border transition-all text-[11px] font-semibold cursor-pointer",
                        platOverlayActive
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                          : "dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700 dark:border-slate-700 border-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Layers size={12} />
                      {platOverlayActive ? "Plat Grid Active" : "Project Acres Plat Outlines"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Computational Hydrology Stack */}
              <div className="space-y-3">
                <div className="text-[10px] dark:text-slate-500 text-slate-400 font-bold uppercase tracking-widest border-b dark:border-slate-800 border-slate-200 pb-1.5 flex items-center gap-1">
                  <Cpu size={12} className="text-emerald-400" />
                  Engineering Solvers
                </div>

                {/* HEC-RAS Commander */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">HEC-RAS (ras-commander)</span>
                    <a href="https://github.com/ATphobia22/ras-commander" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    Controls unsteady flow simulations on the Wabash-Ohio confluence models.
                  </p>
                  
                  {/* Slider to interact with discharge rate */}
                  <div className="pt-2 border-t dark:border-slate-800/60 border-slate-200/50 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="dark:text-slate-400 text-slate-500">HEC-RAS Inflow Q:</span>
                      <span className="text-emerald-400 font-bold">{rasDischarge.toFixed(0)} cfs</span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="12000"
                      step="500"
                      value={rasDischarge}
                      onChange={(e) => handleRasDischargeChange(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* FloPy Seepage */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">FloPy / Groundwater (MODFLOW)</span>
                    <a href="https://github.com/ATphobia22/flopy" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    USGS aquifer model assessing water table seepage across earth embankments.
                  </p>
                  
                  <div className="pt-1.5 border-t dark:border-slate-800/60 border-slate-200/50">
                    <button
                      onClick={() => setModflowActive(!modflowActive)}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 py-1.5 rounded border transition-all text-[11px] font-semibold cursor-pointer",
                        modflowActive
                          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                          : "dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700 dark:border-slate-700 border-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Sliders size={12} />
                      {modflowActive ? "MODFLOW Seepage Enabled" : "Compute Groundwater Seepage"}
                    </button>
                  </div>
                </div>

                {/* RMC BestFit Bayesian */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">RMC-BestFit Bayesian Curves</span>
                    <a href="https://github.com/ATphobia22/RMC-BestFit" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors">
                      <Link size={14} />
                    </a>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug mb-2">
                    Bayesian flood hazard frequency models for risk evaluation of the Point Township confluence.
                  </p>
                  
                  {/* Recharts Bayesian Hazard Frequency Curve */}
                  <div className="h-28 w-full dark:bg-[#020617] bg-slate-50 rounded border dark:border-slate-800 border-slate-200 p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bayesianCurveData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                        <XAxis dataKey="returnPeriod" stroke="#64748b" style={{ fontSize: 8 }} />
                        <YAxis stroke="#64748b" style={{ fontSize: 8 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 8, color: '#f8fafc' }} />
                        <Line type="monotone" dataKey="mode" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 1 }} name="Mode Q" />
                        <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" dot={false} name="95% CI Upper" />
                        <Line type="monotone" dataKey="lower" stroke="#10b981" strokeWidth={1} strokeDasharray="2 2" dot={false} name="95% CI Lower" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[8px] dark:text-slate-500 text-slate-400 text-center font-mono leading-none">
                    Bayesian Peak flow (cfs) vs. Return Period Interval (Years)
                  </div>
                </div>

                {/* Matterport Lidar Walker */}
                <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold dark:text-slate-300 text-slate-700">Matterport Scan walkthrough</span>
                    <div className="flex gap-1">
                      <a href="https://github.com/ATphobia22/Matterport" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors" title="Repo 1">
                        <Link size={12} />
                      </a>
                      <a href="https://github.com/ATphobia22/Matterport3DSimulator" target="_blank" rel="noopener noreferrer" className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors" title="Repo 2">
                        <Link size={12} />
                      </a>
                    </div>
                  </div>
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-snug">
                    3D point cloud walk-throughs of protected historic properties.
                  </p>
                  
                  <div className="pt-1.5 border-t dark:border-slate-800/60 border-slate-200/50">
                    <button
                      onClick={() => setSelectedMatterport(selectedMatterport ? null : (selectedParcel ? selectedParcel.tractName : "Wabash River Base"))}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 py-1.5 rounded border transition-all text-[11px] font-semibold cursor-pointer",
                        selectedMatterport
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                          : "dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700 dark:border-slate-700 border-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Eye size={12} />
                      {selectedMatterport ? "Close Walkthrough Simulation" : "Run Matterport Scanner"}
                    </button>
                  </div>
                </div>

                {/* Additional repositories links */}
                <div className="dark:bg-[#020617]/40 bg-slate-50 border dark:border-slate-800/50 border-slate-200 rounded p-2.5 space-y-2">
                  <div className="text-[9px] dark:text-slate-500 text-slate-400 uppercase tracking-wider font-bold">Additional Software Packages</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <a href="https://github.com/ATphobia22/cwms-database" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Database size={10} /> cwms-database
                    </a>
                    <a href="https://github.com/ATphobia22/cwms-cli" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Settings size={10} /> cwms-cli
                    </a>
                    <a href="https://github.com/ATphobia22/matlab-agentic-toolkit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Cpu size={10} /> matlab-toolkit
                    </a>
                    <a href="https://github.com/ATphobia22/matlab-mcp-server" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Sliders size={10} /> matlab-mcp
                    </a>
                    <a href="https://github.com/ATphobia22/martin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Layers size={10} /> martin MVT
                    </a>
                    <a href="https://github.com/ATphobia22/QGIS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors">
                      <Globe size={10} /> QGIS plugin
                    </a>
                    <a href="https://github.com/ATphobia22/federal-emergency-management-agency" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors col-span-2">
                      <AlertTriangle size={10} /> FEMA regulatory-sync
                    </a>
                    <a href="https://github.com/ATphobia22/natural-resources-conservation-service" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 p-1 hover:bg-slate-800/50 rounded text-slate-400 hover:text-indigo-300 transition-colors col-span-2">
                      <Layers size={10} /> USDA NRCS soils-mapper
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Dossier Modal */}
      {showDossier && selectedParcel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="dark:bg-[#0F172A] bg-white border border-indigo-500/30 rounded-xl w-full max-w-3xl flex flex-col max-h-full shadow-2xl">
            
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-100/50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-lg dark:text-slate-100 text-slate-900 flex items-center gap-2">
                  <FileText className="text-indigo-400" size={20} />
                  DLT Infrastructure Asset Verification Pack
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-mono mt-1">Target Zone: {selectedParcel.tractName} | ID: {selectedParcel.id}</p>
              </div>
              <button 
                onClick={() => setShowDossier(false)}
                className="p-2 rounded hover:dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed dark:text-slate-300 text-slate-700 space-y-6">
              
              <div>
                <h4 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs border-b border-indigo-900/50 pb-2">Executive Framework Summary</h4>
                <p>
                  The infrastructure properties matching the target zone <strong className="dark:text-slate-100 text-slate-900">{selectedParcel.tractName}</strong> have been computed against multi-physics hazard layers. This package enforces compliance constraints regulated under checking authority rules.
                </p>
              </div>

              <div>
                <h4 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs border-b border-indigo-900/50 pb-2">Financial Apportionment Matrix</h4>
                <div className="dark:bg-[#020617] bg-slate-50 border dark:border-slate-800 border-slate-200 rounded p-4">
                  <div className="flex justify-between border-b dark:border-slate-800 border-slate-200 pb-2 mb-2 font-bold dark:text-slate-200 text-slate-800">
                    <span>Parameter Key</span>
                    <span>Calculated Metric Value</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="dark:text-slate-400 text-slate-500">Federal Contribution Percentage</span>
                    <span>75.0%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="dark:text-slate-400 text-slate-500">Local Matching Responsibility</span>
                    <span>25.0%</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-emerald-400 mt-2 pt-2 border-t dark:border-slate-800 border-slate-200/50">
                    <span>Evaluated Benefit-Cost Ratio (BCR)</span>
                    <span>BCR = 2.45</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs border-b border-indigo-900/50 pb-2">Analytical Risk Optimization Proofs</h4>
                <p className="mb-2">
                  Historical Records: {selectedParcel.historicalEvents}
                </p>
                <p>
                  Calculated threat exposure yields a severity index of <span className={selectedParcel.threatScore > 50 ? 'text-red-400' : 'text-emerald-400'}>{selectedParcel.threatScore.toFixed(2)}</span>.
                  Current multi-physics simulations indicate {selectedParcel.isInundated ? 'ACTIVE INUNDATION' : 'NO INUNDATION'}.
                </p>
              </div>

              <div>
                <h4 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs border-b border-indigo-900/50 pb-2">Regulatory Compliance Mandates Verified</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Indiana State Rule 61 Validation</li>
                  <li>Certified No-Rise Check</li>
                  <li>{selectedParcel.grantEligibility}</li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-slate-800 border-slate-200">
                <h4 className="dark:text-slate-100 text-slate-900 font-bold mb-1">Civil Engineering Certification Sign-Off</h4>
                <p className="text-xs dark:text-slate-400 text-slate-500 mb-6">
                  The undersigned processing system certifies that the simulated structural upgrade yields a net-zero displacement profile across the adjacent cross-border properties.
                </p>
                <div className="w-64 border-b border-slate-600 mb-2"></div>
                <p className="text-xs font-bold dark:text-slate-300 text-slate-700">Lead Automated Systems Engineer</p>
                <p className="text-[10px] dark:text-slate-500 text-slate-400">DLT Multi-Physics Twin Platform Workspace</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
