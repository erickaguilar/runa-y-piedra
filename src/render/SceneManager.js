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
    this.scene.background = new THREE.Color(0x0f172a); // Fondo de cripta nocturna (slate-900)
    this.scene.fog = new THREE.Fog(0x0f172a, 26, 62);  // Niebla atmosférica suave y profunda

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.05,
      200
    );

    // Iluminación ambiental y de relleno cálida
    this.scene.add(new THREE.AmbientLight(0xe2e8f0, 0.78));
    const mainLight = new THREE.DirectionalLight(0xffedd5, 0.85);
    mainLight.position.set(12, 10, 18);
    this.scene.add(mainLight);
    const hemi = new THREE.HemisphereLight(0xffedd5, 0x334155, 0.45);
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
