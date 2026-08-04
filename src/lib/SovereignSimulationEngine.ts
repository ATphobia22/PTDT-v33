import * as THREE from 'three';

export interface SpatialRegistryConfig {
  engineeringEpsg: number;
  verticalDatum: string;
  baseFloodElevationNavd88: number;
  lowestAdjacentGradeNavd88: number;
  originLon: number;
  originLat: number;
  scaleFactorLon: number;
  scaleFactorLat: number;
}

export interface SimulationState {
  activeWaterStageNavd88: number;
  isStormVfxActive: boolean;
  isBfeBreached: boolean;
  cachedStructuresCount: number;
  cachedCemeteryRecordsCount: number;
  telemetryLogs: string[];
}

export class SovereignSimulationEngine {
  public container: HTMLDivElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public clock: THREE.Clock;

  public primarySunSystem!: THREE.DirectionalLight;
  public ambientSkyBounce!: THREE.AmbientLight;
  public environmentalFog!: THREE.FogExp2;
  public backgroundHorizonPlate!: THREE.Mesh;
  public rainParticleSystem!: THREE.Points;
  public activeWaterSurfaceMesh!: THREE.Mesh;
  public dynamicWarningBeacons: Map<string, THREE.Mesh> = new Map();

  public spatialConfig: SpatialRegistryConfig;
  public simState: SimulationState;

  constructor(containerElement: HTMLDivElement, customConfig?: Partial<SpatialRegistryConfig>) {
    this.container = containerElement;
    this.clock = new THREE.Clock();

    this.spatialConfig = {
      engineeringEpsg: 2966,
      verticalDatum: "NAVD88",
      baseFloodElevationNavd88: 375.0,
      lowestAdjacentGradeNavd88: 377.2,
      originLon: -87.9354,
      originLat: 38.1294,
      scaleFactorLon: 286745.4,
      scaleFactorLat: 364173.2,
      ...customConfig
    };

    this.simState = {
      activeWaterStageNavd88: 14.2,
      isStormVfxActive: true,
      isBfeBreached: false,
      cachedStructuresCount: 0,
      cachedCemeteryRecordsCount: 0,
      telemetryLogs: [
        "Sovereign Core V3.0.0 Hardware Graphic Suite Activated.",
        "Geospatial Projection Pipeline locked to EPSG:2966 Grid Matrix."
      ]
    };

    this.initializeGraphicsPipeline();
    this.assembleCinematicEnvironment();
    this.instantiateHydrodynamicsMesh();
  }

  private initializeGraphicsPipeline(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Displacement mapping setup if any is applied via material later
    
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1.0, 20000);
    this.camera.position.set(1200, 800, 1200);
    this.camera.lookAt(0, 0, 0);

    this.ambientSkyBounce = new THREE.AmbientLight(0x0ea5e9, 0.35);
    this.scene.add(this.ambientSkyBounce);

    this.primarySunSystem = new THREE.DirectionalLight(0xfef08a, 0.85);
    this.primarySunSystem.position.set(3500, 2500, 1500);
    this.primarySunSystem.castShadow = true;
    this.primarySunSystem.shadow.mapSize.width = 4096;
    this.primarySunSystem.shadow.mapSize.height = 4096;
    this.primarySunSystem.shadow.bias = -0.0004;
    
    const frustumEdgeRange = 5000;
    this.primarySunSystem.shadow.camera.left = -frustumEdgeRange / 2;
    this.primarySunSystem.shadow.camera.right = frustumEdgeRange / 2;
    this.primarySunSystem.shadow.camera.top = frustumEdgeRange / 2;
    this.primarySunSystem.shadow.camera.bottom = -frustumEdgeRange / 2;
    this.primarySunSystem.shadow.camera.near = 100;
    this.primarySunSystem.shadow.camera.far = 12000;
    this.scene.add(this.primarySunSystem);
  }

  private assembleCinematicEnvironment(): void {
    this.environmentalFog = new THREE.FogExp2(0x0f172a, 0.0016);
    this.scene.fog = this.environmentalFog;

    const backgroundPlateGeo = new THREE.CylinderGeometry(8000, 8000, 2000, 64, 1, true);
    const backgroundPlateMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    });
    this.backgroundHorizonPlate = new THREE.Mesh(backgroundPlateGeo, backgroundPlateMat);
    this.backgroundHorizonPlate.position.y = 400;
    this.scene.add(this.backgroundHorizonPlate);

    if (this.simState.isStormVfxActive) {
      const weatherParticlesCount = 35000;
      const particleBufferGeometry = new THREE.BufferGeometry();
      const rawPositionsArray = new Float32Array(weatherParticlesCount * 3);

      for (let offset = 0; offset < weatherParticlesCount * 3; offset += 3) {
        rawPositionsArray[offset] = (Math.random() - 0.5) * 6000;
        rawPositionsArray[offset + 1] = Math.random() * 1000;
        rawPositionsArray[offset + 2] = (Math.random() - 0.5) * 6000;
      }
      
      particleBufferGeometry.setAttribute('position', new THREE.BufferAttribute(rawPositionsArray, 3));
      
      const precisionVfxMaterial = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 1.6,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.rainParticleSystem = new THREE.Points(particleBufferGeometry, precisionVfxMaterial);
      this.scene.add(this.rainParticleSystem);
    }
  }

  private instantiateHydrodynamicsMesh(): void {
    const waterGeometry = new THREE.PlaneGeometry(6000, 6000, 128, 128);
    // Add displacement mapping to water material
    const PbrWaterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      displacementScale: 2.0 // Needs Displacement mapping setup
    });

    this.activeWaterSurfaceMesh = new THREE.Mesh(waterGeometry, PbrWaterMaterial);
    this.activeWaterSurfaceMesh.rotation.x = -Math.PI / 2;
    this.activeWaterSurfaceMesh.position.y = this.simState.activeWaterStageNavd88;
    this.activeWaterSurfaceMesh.receiveShadow = true;
    this.scene.add(this.activeWaterSurfaceMesh);
  }

  public executeScenarioWaterElevationShift(targetedElevationFeet: number): void {
    this.simState.activeWaterStageNavd88 = targetedElevationFeet;
    const bfeBreached = targetedElevationFeet >= this.spatialConfig.baseFloodElevationNavd88;

    if (bfeBreached && !this.simState.isBfeBreached) {
      this.simState.isBfeBreached = true;
      this.simState.telemetryLogs.push(`[CRITICAL THREAT TRIGGER] Elevation ${targetedElevationFeet.toFixed(2)} ft NAVD88 breaches BFE thresholds.`);
      this.triggerVolumetricWarningAssets(true);
    } else if (!bfeBreached && this.simState.isBfeBreached) {
      this.simState.isBfeBreached = false;
      this.simState.telemetryLogs.push(`[DATALINK NORMALIZED] Simulation water height dropped below risk parameters.`);
      this.triggerVolumetricWarningAssets(false);
    }
  }

  private triggerVolumetricWarningAssets(spawnActive: boolean): void {
    const beaconUid = "site_core_hazard_beacon";

    if (spawnActive) {
      const structuralConeGeo = new THREE.ConeGeometry(50, 200, 4);
      const hazardShaderMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const beaconMesh = new THREE.Mesh(structuralConeGeo, hazardShaderMat);
      beaconMesh.position.set(0, 500, 0);
      this.scene.add(beaconMesh);
      this.dynamicWarningBeacons.set(beaconUid, beaconMesh);
    } else {
      const activeBeacon = this.dynamicWarningBeacons.get(beaconUid);
      if (activeBeacon) {
        this.scene.remove(activeBeacon);
        this.dynamicWarningBeacons.delete(beaconUid);
      }
    }
  }

  public updateSimulationRenderCycle(): void {
    const frameDeltaTime = this.clock.getDelta();
    const elapsedRuntimeSeconds = this.clock.getElapsedTime();

    if (this.backgroundHorizonPlate) {
      this.backgroundHorizonPlate.rotation.y += 0.012 * frameDeltaTime;
    }

    if (this.simState.isStormVfxActive && this.rainParticleSystem) {
      const targetPositionsAttr = this.rainParticleSystem.geometry.getAttribute('position') as THREE.BufferAttribute;
      const internalPositionsArray = targetPositionsAttr.array as Float32Array;

      for (let index = 1; index < internalPositionsArray.length; index += 3) {
        internalPositionsArray[index] -= (140.0 + Math.random() * 60.0) * frameDeltaTime;
        if (internalPositionsArray[index] < -50) {
          internalPositionsArray[index] = 950;
        }
      }
      targetPositionsAttr.needsUpdate = true;
    }

    if (this.activeWaterSurfaceMesh) {
      this.activeWaterSurfaceMesh.position.y = this.simState.activeWaterStageNavd88 + (Math.sin(elapsedRuntimeSeconds * 2.5) * 0.16);
    }

    const hazardBeacon = this.dynamicWarningBeacons.get("site_core_hazard_beacon");
    if (hazardBeacon) {
      const waveScalar = 1.0 + (Math.sin(elapsedRuntimeSeconds * 5.0) * 0.15);
      hazardBeacon.scale.set(waveScalar, 1.0, waveScalar);
      hazardBeacon.rotation.y += 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public handleWindowResizeEvent(): void {
    const updatedWidth = this.container.clientWidth || window.innerWidth;
    const updatedHeight = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(updatedWidth, updatedHeight);
    this.camera.aspect = updatedWidth / updatedHeight;
    this.camera.updateProjectionMatrix();
  }

  public disposeSimulationResources(): void {
    this.renderer.dispose();
    this.scene.clear();
    this.container.innerHTML = "";
  }
}
