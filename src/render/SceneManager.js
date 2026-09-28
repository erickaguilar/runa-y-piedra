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
    this.scene.background = new THREE.Color(0x090d16); // Fondo de mazmorra oscura subterránea
    this.scene.fog = new THREE.Fog(0x090d16, 18, 50);  // Niebla atmosférica de mazmorra

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.05,
      200
    );

    // Iluminación atmosférica de mazmorra subterránea
    this.scene.add(new THREE.AmbientLight(0xcfd8dc, 0.65));
    const torch = new THREE.DirectionalLight(0xffedd5, 0.75);
    torch.position.set(12, 16, 18);
    this.scene.add(torch);
    const hemi = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.40);
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
