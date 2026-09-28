import * as THREE from 'three';

export class CameraController {
  constructor(camera, eyeHeight = 1.6) {
    this.camera = camera;
    this.eyeHeight = eyeHeight;
    this.lookTarget = new THREE.Vector3();
  }

  update(player, yaw, pitch) {
    const cam = this.camera;
    const renderPos = player.visualPos || player.pos;
    cam.position.set(renderPos.x, renderPos.y + this.eyeHeight, renderPos.z);

    const cosPitch = Math.cos(pitch);
    this.lookTarget.set(
      cam.position.x - Math.sin(yaw) * cosPitch,
      cam.position.y + Math.sin(pitch),
      cam.position.z - Math.cos(yaw) * cosPitch
    );

    cam.lookAt(this.lookTarget);
  }
}
