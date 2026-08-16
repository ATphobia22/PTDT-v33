import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export type CinematicWaypoint = { position: THREE.Vector3; lookAt: THREE.Vector3; duration: number; title: string };

export class TriCountyCinematicScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(52, 16/9, 0.1, 500000);
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;
  readonly composer: EffectComposer;
  readonly waypoints: CinematicWaypoint[] = [];
  private clock = new THREE.Clock();
  private elapsed = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.scene.background = new THREE.Color(0x06111a);
    this.scene.fog = new THREE.FogExp2(0x06111a, 0.000018);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera.position.set(1800, 1100, 2200);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xbad8e8, 0x182018, 1.4);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d2, 4.0);
    sun.position.set(-4000, 6000, 2500); sun.castShadow = true;
    sun.shadow.mapSize.set(4096,4096);
    this.scene.add(sun);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(50000, 6000), new THREE.MeshPhysicalMaterial({color:0x0a4355, roughness:0.12, metalness:0.05, transmission:0.05, transparent:true, opacity:0.92}));
    river.rotation.x = -Math.PI/2; river.position.y = -18;
    this.scene.add(river);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50000,50000), new THREE.MeshStandardMaterial({color:0x334332, roughness:0.92}));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; this.scene.add(ground);

    this.waypoints.push(
      {position:new THREE.Vector3(4200,1700,5200), lookAt:new THREE.Vector3(0,0,0), duration:10, title:'Regional Establishing Shot'},
      {position:new THREE.Vector3(2200,850,1800), lookAt:new THREE.Vector3(0,0,0), duration:9, title:'River Corridor Approach'},
      {position:new THREE.Vector3(900,430,700), lookAt:new THREE.Vector3(0,80,0), duration:12, title:'Infrastructure Reveal'},
      {position:new THREE.Vector3(-700,260,250), lookAt:new THREE.Vector3(0,40,0), duration:12, title:'Valley Flythrough'},
      {position:new THREE.Vector3(0,1800,0), lookAt:new THREE.Vector3(0,0,0), duration:8, title:'Digital Twin Top-Down'},
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.35, 0.65, 0.9));
  }

  addObject(object: THREE.Object3D) { object.castShadow = true; object.receiveShadow = true; this.scene.add(object); }

  playCinematic(onShot?: (shot: CinematicWaypoint) => void) {
    let index = 0;
    const animateShot = () => {
      if (index >= this.waypoints.length) return;
      const shot = this.waypoints[index++]; onShot?.(shot);
      this.camera.position.copy(shot.position);
      this.controls.target.copy(shot.lookAt);
      const start = performance.now();
      const from = this.camera.position.clone();
      const to = shot.position.clone();
      const tick = (now:number) => {
        const t = Math.min((now-start)/(shot.duration*1000),1);
        const eased = t*t*(3-2*t);
        this.camera.position.lerpVectors(from,to,eased);
        this.controls.target.lerp(shot.lookAt, 0.04);
        if(t<1) requestAnimationFrame(tick); else animateShot();
      };
      requestAnimationFrame(tick);
    };
    animateShot();
  }

  render() { this.elapsed += this.clock.getDelta(); this.controls.update(); this.composer.render(); }
}