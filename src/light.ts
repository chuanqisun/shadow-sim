import * as THREE from "three";
import { setupShadowCamera, type ShadowParams } from "./shadow";

export function createDirectionalLight(params: ShadowParams): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffc700, 5);
  light.position.set(10, 5, -10);
  light.castShadow = true;
  setupShadowCamera(light, params);
  return light;
}
