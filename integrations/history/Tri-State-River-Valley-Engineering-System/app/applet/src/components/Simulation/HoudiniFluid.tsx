import { useTexture, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

// Custom VAT Shader (The "Engine" logic)
const VATMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uPosMap: { value: null },
    uRotMap: { value: null },
    uFrameCount: { value: 240 }, // Total Frames from Houdini
    uBoundsMin: { value: new THREE.Vector3(-1000, 0, -1000) },
    uBoundsMax: { value: new THREE.Vector3(1000, 50, 1000) }
  },
  vertexShader: `
    uniform float uTime;
    uniform sampler2D uPosMap;
    uniform float uFrameCount;
    
    void main() {
      // Calculate current frame in texture
      float frame = mod(uTime * 24.0, uFrameCount);
      float v = frame / uFrameCount;
      
      // Sample position offset from Houdini Texture
      vec3 posOffset = texture2D(uPosMap, vec2(uv.x, v)).rgb;
      
      vec3 newPos = position + posOffset;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(0.0, 0.4, 0.8, 0.6); // Water color
    }
  `
};

export function HoudiniFluid({ url }: { url: string }) {
  // Graceful fallback if files don't exist
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      // @ts-ignore
      if (meshRef.current.material.uniforms) {
        // @ts-ignore
        meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    }
  });

  try {
    const { nodes } = useGLTF(`${url}/geo.glb`) as any;
    const posMap = useTexture(`${url}/pos.exr`);
    
    // Configure High-Precision Floats for Physics
    useMemo(() => {
      posMap.type = THREE.FloatType;
      posMap.minFilter = THREE.NearestFilter;
      posMap.magFilter = THREE.NearestFilter;
    }, [posMap]);

    return (
      <mesh ref={meshRef} geometry={nodes.FluidSurface.geometry}>
        <shaderMaterial 
          args={[VATMaterial]} 
          uniforms-uPosMap-value={posMap} 
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  } catch (e) {
    // Fallback if missing GLB or EXR
    return (
      <mesh ref={meshRef} position={[0, 14.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <planeGeometry args={[1000, 1000, 64, 64]} />
         <meshStandardMaterial color="#0066cc" transparent opacity={0.6} roughness={0.1} />
      </mesh>
    );
  }
}
