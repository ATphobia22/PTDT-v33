import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const CinematicGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    exposure: { value: 1.0 },
    vignette: { value: 0.22 },
    grain: { value: 0.035 },
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float exposure; uniform float vignette; uniform float grain;
    varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    vec3 aces(vec3 x){float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);}
    void main(){
      vec3 c=texture2D(tDiffuse,vUv).rgb*exposure;
      c=aces(c);
      float l=length(vUv-.5)*1.4142;
      c*=1.0-vignette*l*l;
      float n=(hash(vUv+time)-.5)*grain;
      c+=n;
      c=pow(max(c,0.0),vec3(1.0/2.2));
      gl_FragColor=vec4(c,1.0);
    }`,
};

export function createCinematicComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): { composer: EffectComposer; render: (timeSeconds: number) => void; dispose: () => void } {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(size, 0.28, 0.55, 0.92));
  const grade = new ShaderPass(CinematicGradeShader);
  composer.addPass(grade);

  return {
    composer,
    render: (timeSeconds) => {
      grade.uniforms.time.value = timeSeconds;
      composer.render();
    },
    dispose: () => composer.dispose(),
  };
}
