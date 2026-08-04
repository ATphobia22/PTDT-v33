import { TilesRenderer } from '3d-tiles-renderer/r3f';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GOOGLE_API_KEY = "YOUR_API_KEY";
const POSEY_COUNTY_TILES = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_API_KEY}`;

export function RealityStream() {
  const tilesRef = useRef<any>(null);
  const { gl } = useThree();

  // "Moonray" Alignment: Sync camera for LOD calculation
  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.update();
      // Auto-exposure adjustment for photorealism
      gl.toneMappingExposure = 1.2; 
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}> {/* Align ECEF to Y-Up */}
      <TilesRenderer
        ref={tilesRef}
        url={POSEY_COUNTY_TILES}
        onLoad={(tileset: any) => {
          // Center the world on New Harmony / Point Township
          const box = new THREE.Box3();
          tileset.root.getBoundingBox(box);
          tileset.group.position.copy(box.getCenter(new THREE.Vector3()).multiplyScalar(-1));
          
          // Hybrid Shader Injection (Wetness Overlay for Floods)
          tileset.model.traverse((child: any) => {
            if (child.isMesh) {
              child.material.onBeforeCompile = (shader: any) => {
                shader.uniforms.uFloodStage = { value: 14.2 };
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <common>',
                  `#include <common>\nvarying vec3 vWorldPosition;`
                );
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <worldpos_vertex>',
                  `#include <worldpos_vertex>\nvWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <common>',
                  `#include <common>\nvarying vec3 vWorldPosition;\nuniform float uFloodStage;`
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <roughnessmap_fragment>',
                  `#include <roughnessmap_fragment>
                   if (vWorldPosition.y < uFloodStage) {
                     diffuseColor.rgb *= 0.6; // Darken for wetness
                     roughnessFactor = 0.05;  // Make it shiny
                   }
                  `
                );
              };
            }
          });
        }}
      />
    </group>
  );
}
