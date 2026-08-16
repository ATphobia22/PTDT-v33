import * as THREE from 'three';

export interface ShadowMapConfig {
  shadowMapWidth: number;
  shadowMapHeight: number;
  pcfRadius: number;
  bias: number;
  contourIntervalFt: number;
}

export class HardwareShadowContourEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private directionalLight: THREE.DirectionalLight;
  private config: ShadowMapConfig;
  public terrainMesh: THREE.Mesh | null = null;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, light: THREE.DirectionalLight, customConfig?: Partial<ShadowMapConfig>) {
    this.renderer = renderer;
    this.scene = scene;
    this.directionalLight = light;
    this.config = {
      shadowMapWidth: 4096,
      shadowMapHeight: 4096,
      pcfRadius: 3.5,
      bias: -0.0005,
      contourIntervalFt: 2.0,
      ...customConfig
    };
    this.configureHardwareShadowPipeline();
  }

  private configureHardwareShadowPipeline(): void {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = this.config.shadowMapWidth;
    this.directionalLight.shadow.mapSize.height = this.config.shadowMapHeight;
    this.directionalLight.shadow.bias = this.config.bias;
    this.directionalLight.shadow.radius = this.config.pcfRadius;

    const frustumSize = 4000;
    this.directionalLight.shadow.camera.left = -frustumSize / 2;
    this.directionalLight.shadow.camera.right = frustumSize / 2;
    this.directionalLight.shadow.camera.top = frustumSize / 2;
    this.directionalLight.shadow.camera.bottom = -frustumSize / 2;
    this.directionalLight.shadow.camera.near = 10;
    this.directionalLight.shadow.camera.far = 10000;
    this.directionalLight.shadow.camera.updateProjectionMatrix();
  }

  public injectContourShaderMaterial(geometry: THREE.BufferGeometry): THREE.Mesh {
    const customTerrainShaderMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.1,
      transparent: false
    });

    customTerrainShaderMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.contourInterval = { value: this.config.contourIntervalFt };
      shader.uniforms.contourColor = { value: new THREE.Color(0x38bdf8) };
      shader.uniforms.contourWidth = { value: 0.15 };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vWorldPosition;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>\nvWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>\nuniform float contourInterval;\nuniform vec3 contourColor;\nuniform float contourWidth;\nvarying vec3 vWorldPosition;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec4 diffuseColor = vec4( diffuse, opacity );
         float elevationModulus = mod(vWorldPosition.y, contourInterval);
         if (elevationModulus < contourWidth || elevationModulus > (contourInterval - contourWidth)) {
            diffuseColor = vec4(contourColor, opacity);
         }`
      );
    };

    this.terrainMesh = new THREE.Mesh(geometry, customTerrainShaderMaterial);
    this.terrainMesh.castShadow = true;
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
    
    return this.terrainMesh;
  }
}
