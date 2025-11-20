import type GUI from "lil-gui";
import * as THREE from "three";
import type { Params } from "./main";

export function mountGUI(
  gui: GUI,
  scene: THREE.Scene,
  model: THREE.Group,
  directionalLight: THREE.DirectionalLight,
  params: Params,
  updateLight: () => void,
  shadowHelper: THREE.CameraHelper | undefined,
  originalRotationY: number
) {
  // Add rotation controller
  gui.add(params, "rotation", 0, 360).onChange((value: number) => {
    if (model) model.rotation.y = originalRotationY + (value * Math.PI) / 180;
  });

  // Add azimuth controller for sun
  gui.add(params, "azimuth", 0, 360).onChange(updateLight);

  // Add altitude controller for sun
  gui.add(params, "altitude", 0, 180).onChange(updateLight);

  // Add shadow camera controls
  gui.add(params, "shadowNear", -100, 0).onChange((value: number) => {
    directionalLight.shadow.camera.near = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });
  gui.add(params, "shadowFar", 0, 100).onChange((value: number) => {
    directionalLight.shadow.camera.far = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });
  gui.add(params, "shadowLeft", -100, 0).onChange((value: number) => {
    directionalLight.shadow.camera.left = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });
  gui.add(params, "shadowRight", 0, 100).onChange((value: number) => {
    directionalLight.shadow.camera.right = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });
  gui.add(params, "shadowTop", 0, 100).onChange((value: number) => {
    directionalLight.shadow.camera.top = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });
  gui.add(params, "shadowBottom", -100, 0).onChange((value: number) => {
    directionalLight.shadow.camera.bottom = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
    if (shadowHelper) shadowHelper.update();
  });

  // Add shadow helper toggle
  gui.add(params, "showShadowHelper").onChange((value: boolean) => {
    if (value) {
      shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      scene.add(shadowHelper);
    } else {
      if (shadowHelper) {
        scene.remove(shadowHelper);
        shadowHelper.dispose();
        shadowHelper = undefined;
      }
    }
  });

  // Add model visibility toggle
  gui.add(params, "showModel").onChange((value: boolean) => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat && typeof mat === "object") {
              mat.opacity = value ? 1 : 0;
            }
          });
        } else if (typeof child.material === "object") {
          child.material.opacity = value ? 1 : 0;
        }
      }
    });
  });
}
