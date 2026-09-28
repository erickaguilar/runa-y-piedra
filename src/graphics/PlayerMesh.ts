import * as THREE from 'three';

export class PlayerMesh {
  public group: THREE.Group;
  public targetX = 16;
  public targetY = 2;
  public targetZ = 16;
  public targetYaw = 0;

  constructor(scene: THREE.Scene, colorHex: number = 0xf43f5e) {
    this.group = new THREE.Group();

    // 1. Cuerpo del jugador (Caja de 0.6 x 1.0 x 0.4)
    const bodyGeo = new THREE.BoxGeometry(0.6, 1.0, 0.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    this.group.add(body);

    // 2. Cabeza del jugador (Caja de 0.4 x 0.4 x 0.4)
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffedd5, flatShading: true });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.25;
    this.group.add(head);

    // 3. Visor/Ojos (para indicar dirección de mirada)
    const eyesGeo = new THREE.BoxGeometry(0.3, 0.1, 0.1);
    const eyesMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const eyes = new THREE.Mesh(eyesGeo, eyesMat);
    eyes.position.set(0, 1.25, -0.2);
    this.group.add(eyes);

    this.group.position.set(16, 2, 16);
    scene.add(this.group);
  }

  // Interpolación suave a 60 FPS (Lerp) para paquetes que llegan a 20-30 Hz
  public update(deltaTime: number): void {
    const lerpFactor = Math.min(1.0, deltaTime * 15.0);

    this.group.position.x += (this.targetX - this.group.position.x) * lerpFactor;
    this.group.position.y += (this.targetY - this.group.position.y) * lerpFactor;
    this.group.position.z += (this.targetZ - this.group.position.z) * lerpFactor;

    // Interpolación de ángulo Yaw
    let diff = (this.targetYaw - this.group.rotation.y) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * lerpFactor;
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }
}
