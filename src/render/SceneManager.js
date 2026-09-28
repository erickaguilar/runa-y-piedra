import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,                // ← móvil: OFF
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e293b); // Fondo limpio y claro (slate-800)
    this.scene.fog = new THREE.Fog(0x1e293b, 35, 80);  // Niebla lejana muy suave para máxima claridad

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.05,
      200
    );

    // Iluminación ambiental limpia y luminosa para visibilidad perfecta
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.70);
    mainLight.position.set(12, 14, 18);
    this.scene.add(mainLight);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.45);
    this.scene.add(hemi);

    window.addEventListener('resize', () => this._onResize());
  }
  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  setQuality(dpr) {
    const clamped = Math.max(0.75, Math.min(window.devicePixelRatio, dpr));
    this.renderer.setPixelRatio(clamped);
    this._onResize();
  }
  render() { this.renderer.render(this.scene, this.camera); }
}
