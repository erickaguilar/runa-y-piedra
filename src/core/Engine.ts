import * as THREE from 'three';
import Stats from 'stats.js';

export class Engine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public stats: Stats;

  private onRenderCallbacks: Array<(deltaTime: number) => void> = [];
  private lastTime: number = performance.now();

  constructor(container: HTMLElement) {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1726);

    // 2. Camera setup (FOV 70, standard mobile optimal view)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 100);
    this.camera.position.set(16, 12, 28);
    this.camera.lookAt(16, 0, 16);

    // 3. WebGLRenderer with mobile budget constraints
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false, // Disabled on mobile to save rasterizer bandwidth
      stencil: false,
      depth: true
    });

    // CRITICAL: Clamp devicePixelRatio to max 1.25 to prevent mobile GPU melting
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // 4. Lightweight Lights (1 Hemisphere + 1 Directional, No heavy shadow maps)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x223344, 0.85);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    // 5. Performance Monitoring (Stats.js)
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '40px';
    this.stats.dom.style.left = '12px';
    this.stats.dom.style.zIndex = '100';
    document.body.appendChild(this.stats.dom);

    // 6. Window Resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // 7. Start Game Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  public registerRenderCallback(cb: (deltaTime: number) => void): void {
    this.onRenderCallbacks.push(cb);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(currentTime: number): void {
    requestAnimationFrame(this.animate);

    this.stats.begin();

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    for (let i = 0; i < this.onRenderCallbacks.length; i++) {
      this.onRenderCallbacks[i](deltaTime);
    }

    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  public getDrawCalls(): number {
    return this.renderer.info.render.calls;
  }

  public getTriangles(): number {
    return this.renderer.info.render.triangles;
  }
}
