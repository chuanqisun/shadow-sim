import * as THREE from "three";

export interface ShadowParams {
  shadowNear: number;
  shadowFar: number;
  shadowLeft: number;
  shadowRight: number;
  shadowTop: number;
  shadowBottom: number;
  shadowMapSize: number;
}

export function setupShadowCamera(light: THREE.DirectionalLight, params: ShadowParams) {
  light.shadow.camera.near = params.shadowNear;
  light.shadow.camera.far = params.shadowFar;
  light.shadow.camera.left = params.shadowLeft;
  light.shadow.camera.right = params.shadowRight;
  light.shadow.camera.top = params.shadowTop;
  light.shadow.camera.bottom = params.shadowBottom;
  light.shadow.mapSize.width = params.shadowMapSize;
  light.shadow.mapSize.height = params.shadowMapSize;
  light.shadow.camera.updateProjectionMatrix();
}
