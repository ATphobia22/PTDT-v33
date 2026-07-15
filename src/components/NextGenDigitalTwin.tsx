import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Layers, Map, ShieldAlert, Navigation, Settings2, Waves, Building2, Trees, Ship } from "lucide-react";
import { fetchFemaFloodZones, fetchIndianaHistoricSites } from "../services/gisService";
import { parseGeoJSONToGroup } from "../services/geoJsonParser";

export default function NextGenDigitalTwin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState({
    terrain: true,
    waterLevels: true,
    femaNfhl: false,
    parcelsXSoft: true,
    infrastructure: true,
    historicSites: false,
    dnrWetlands: false,
    portOfIndiana: true
  });

  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f18);
    scene.fog = new THREE.FogExp2(0x0a0f18, 0.002);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 150, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 200;
    dirLight.shadow.camera.bottom = -200;
    dirLight.shadow.camera.left = -200;
    dirLight.shadow.camera.right = 200;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Grid helper for scale reference
    const gridHelper = new THREE.GridHelper(1000, 100, 0x1e293b, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Group for dynamic layers
    const layerGroup = new THREE.Group();
    scene.add(layerGroup);

    // Terrain Base (Indiana GIS LiDAR mock)
    const terrainGeo = new THREE.PlaneGeometry(1000, 1000, 128, 128);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttribute = terrainGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const z = posAttribute.getZ(i);
      // Generate some rolling hills
      const y = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 15 + Math.sin(x * 0.05) * 2;
      posAttribute.setY(i, y);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x2c3e2c, 
      roughness: 0.8,
      metalness: 0.1,
      wireframe: false 
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    layerGroup.add(terrain);

    // Water System (Wabash / Ohio Rivers)
    const waterGeo = new THREE.PlaneGeometry(1000, 200, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -2, 0);
    layerGroup.add(water);

    // FEMA NFHL Zones Overlay
    const floodZone = new THREE.Group();
    floodZone.visible = activeLayers.femaNfhl;
    layerGroup.add(floodZone);
    
    // Fetch FEMA data for a specific bounding box
    fetchFemaFloodZones([-88.1, 37.8, -87.9, 38.0]).then(data => {
      const group = parseGeoJSONToGroup(data, (feature) => {
        // Red for AE zones, Orange for others
        const zone = feature.properties.FLD_ZONE || '';
        if (zone.includes('A')) return 0xef4444; // Red
        return 0xf97316; // Orange
      }, 1); // slightly above terrain
      floodZone.add(group);
    });

    // Historic Sites
    const historicSites = new THREE.Group();
    historicSites.visible = activeLayers.historicSites;
    layerGroup.add(historicSites);
    
    fetchIndianaHistoricSites([-88.1, 37.8, -87.9, 38.0]).then(data => {
       const group = parseGeoJSONToGroup(data, () => 0xeab308, 0); // Yellow
       historicSites.add(group);
    });


    // XSoft Parcels
    const parcelGroup = new THREE.Group();
    for(let i=0; i<50; i++) {
      const pGeo = new THREE.BoxGeometry(10 + Math.random()*10, 2, 10 + Math.random()*10);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.7,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 800,
        1,
        (Math.random() - 0.5) * 800
      );
      parcelGroup.add(pMesh);
    }
    parcelGroup.visible = activeLayers.parcelsXSoft;
    layerGroup.add(parcelGroup);

    // Port of Indiana - Mount Vernon Infrastructure
    const portGroup = new THREE.Group();
    const dockGeo = new THREE.BoxGeometry(120, 5, 40);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.set(200, 2.5, 50);
    portGroup.add(dock);
    portGroup.visible = activeLayers.portOfIndiana;
    layerGroup.add(portGroup);

    // Animation Loop
    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.016;

      controls.update();

      // Animate water
      if (waterMeshRef.current) {
        const positions = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          // Wave equation
          const y = Math.sin(x * 0.05 + time * 2) * 1.5 + Math.cos(z * 0.05 + time * 1.5) * 1.5;
          positions.setY(i, y - 2 + (simRunning ? Math.sin(time*0.5)*10 + 10 : 0)); // Rising water if sim running
        }
        waterMeshRef.current.geometry.attributes.position.needsUpdate = true;
        waterMeshRef.current.geometry.computeVertexNormals();
      }

      renderer.render(scene, camera);
    };

    // Storing refs for animation
    const waterMeshRef = { current: water };
    
    // Assigning visibility refs
    const layerRefs = {
      terrain,
      water,
      femaNfhl: floodZone,
      parcelsXSoft: parcelGroup,
      portOfIndiana: portGroup,
      historicSites: historicSites
    };
    (window as any).layerRefs = layerRefs;

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update layer visibility
  useEffect(() => {
    const refs = (window as any).layerRefs;
    if (refs) {
      if (refs.terrain) refs.terrain.visible = activeLayers.terrain;
      if (refs.water) refs.water.visible = activeLayers.waterLevels;
      if (refs.femaNfhl) refs.femaNfhl.visible = activeLayers.femaNfhl;
      if (refs.parcelsXSoft) refs.parcelsXSoft.visible = activeLayers.parcelsXSoft;
      if (refs.historicSites) refs.historicSites.visible = activeLayers.historicSites;
      if (refs.portOfIndiana) refs.portOfIndiana.visible = activeLayers.portOfIndiana;
    }
  }, [activeLayers]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black dark:text-slate-200 text-slate-800 font-sans relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="backdrop-blur-xl dark:bg-slate-900 bg-slate-100/60 border border-slate-700/50 p-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <Map className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                Tri-State Digital Twin <span className="text-cyan-400 text-sm align-top">v23</span>
              </h1>
              <p className="text-xs dark:text-slate-400 text-slate-500 font-mono tracking-widest">
                CIVIL ENGINEERING • MOUNT VERNON, IN
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setSimRunning(!simRunning)}
              className={`backdrop-blur-xl border p-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${
                simRunning 
                  ? "bg-red-500/20 border-red-500/50 text-red-300" 
                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              }`}
            >
              <Waves className={`w-5 h-5 ${simRunning ? "animate-pulse" : ""}`} />
              <span className="font-bold tracking-wider text-sm">
                {simRunning ? "HALT SIMULATION" : "RUN FLOOD SIMULATION"}
              </span>
            </button>
          </div>
        </header>

        {/* Sidebar Controls */}
        <aside className="w-80 flex flex-col gap-4 pointer-events-auto mt-auto self-start">
          <div className="backdrop-blur-xl dark:bg-slate-900 bg-slate-100/60 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-700/50 dark:bg-slate-800 bg-white/40 flex items-center gap-2">
              <Layers className="w-4 h-4 dark:text-slate-300 text-slate-700" />
              <h2 className="text-sm font-bold dark:text-slate-200 text-slate-800">Data Integration Layers</h2>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <LayerToggle 
                active={activeLayers.terrain} 
                onClick={() => toggleLayer('terrain')} 
                icon={<Map />} 
                label="LiDAR Terrain (Indiana GIS)" 
              />
              <LayerToggle 
                active={activeLayers.waterLevels} 
                onClick={() => toggleLayer('waterLevels')} 
                icon={<Waves />} 
                label="River Channels & Water" 
              />
              <LayerToggle 
                active={activeLayers.femaNfhl} 
                onClick={() => toggleLayer('femaNfhl')} 
                icon={<ShieldAlert />} 
                label="FEMA NFHL Zones" 
              />
              <LayerToggle 
                active={activeLayers.historicSites} 
                onClick={() => toggleLayer('historicSites')} 
                icon={<Building2 />} 
                label="Indiana Historic Sites" 
              />
              <LayerToggle 
                active={activeLayers.parcelsXSoft} 
                onClick={() => toggleLayer('parcelsXSoft')} 
                icon={<Building2 />} 
                label="XSoft Parcel Boundaries" 
              />
              <LayerToggle 
                active={activeLayers.portOfIndiana} 
                onClick={() => toggleLayer('portOfIndiana')} 
                icon={<Ship />} 
                label="Port of Indiana Assets" 
              />
              <LayerToggle 
                active={activeLayers.dnrWetlands} 
                onClick={() => toggleLayer('dnrWetlands')} 
                icon={<Trees />} 
                label="DNR Environmental (Wetlands)" 
              />
              <LayerToggle 
                active={activeLayers.infrastructure} 
                onClick={() => toggleLayer('infrastructure')} 
                icon={<Settings2 />} 
                label="Levees & Civil Infrastructure" 
              />
            </div>
          </div>
        </aside>

        {/* Bottom Bar / Status */}
        <div className="flex justify-between items-end pointer-events-none mt-auto">
          <div />
          <div className="backdrop-blur-md dark:bg-slate-900 bg-slate-100/40 border border-slate-700/30 px-4 py-2 rounded-lg text-xs font-mono dark:text-slate-400 text-slate-500 pointer-events-auto">
            System Operational • Rendering engine: WebGL 2.0 • Data sources: WTH GIS, FEMA, INDNR
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerToggle({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all ${
        active ? "bg-cyan-500/10 text-cyan-300" : "hover:dark:bg-slate-800 hover:bg-slate-200 dark:text-slate-400 text-slate-500"
      }`}
    >
      <div className={`w-4 h-4 ${active ? "text-cyan-400" : "dark:text-slate-500 text-slate-400"}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </div>
      <span className="text-xs font-medium tracking-wide flex-1">{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors relative ${active ? "bg-cyan-500" : "bg-slate-700"}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active ? "translate-x-4" : ""}`} />
      </div>
    </button>
  );
}
