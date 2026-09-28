import * as THREE from 'three';

export class AvatarRenderer {
  public group: THREE.Group;
  public targetX = 12;
  public targetY = 2;
  public targetZ = 12;
  public targetYaw = 0;

  constructor(scene: THREE.Scene, colorHex: number = 0xf43f5e) {
    this.group = new THREE.Group();

    // Torso (0.6 x 1.0 x 0.4)
    const bodyGeo = new THREE.BoxGeometry(0.6, 1.0, 0.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    this.group.add(body);

    // Cabeza (0.4 x 0.4 x 0.4)
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffedd5, flatShading: true });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.25;
    this.group.add(head);

    // Ojos/Visor direccional
    const eyesGeo = new THREE.BoxGeometry(0.3, 0.1, 0.08);
    const eyesMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const eyes = new THREE.Mesh(eyesGeo, eyesMat);
    eyes.position.set(0, 1.25, -0.21);
    this.group.add(eyes);

    this.group.position.set(12, 2, 12);
    scene.add(this.group);
  }

  public setTarget(x: number, y: number, z: number, yaw: number): void {
    this.targetX = x;
    this.targetY = y;
    this.targetZ = z;
    this.targetYaw = yaw;
  }

  // Interpolación suave a 60 FPS (Lerp)
  public update(deltaTime: number): void {
    const factor = Math.min(1.0, deltaTime * 16.0);

    this.group.position.x += (this.targetX - this.group.position.x) * factor;
    this.group.position.y += (this.targetY - this.group.position.y) * factor;
    this.group.position.z += (this.targetZ - this.group.position.z) * factor;

    let diff = (this.targetYaw - this.group.rotation.y) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * factor;
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }
}
