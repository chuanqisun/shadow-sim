import type GUI from "lil-gui";
import * as THREE from "three";
import { CROSS_FADE_DURATION_MS } from "./animation";
import type { Params } from "./parameters";

interface AnimationProps {
  baseActions: Record<string, { weight: number; action?: THREE.AnimationAction }>;
  allActions: THREE.AnimationAction[];
  currentBaseAction: { value: string };
  prepareCrossFade: (startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number) => void;
  crossFadeControls: any[];
  walkIn?: () => void;
  walkOut?: () => void;
  resetCameraToCenter?: (cam: THREE.PerspectiveCamera) => void;
}

interface MountGUIProps {
  gui: GUI;
  scene: THREE.Scene;
  model: THREE.Group;
  directionalLight: THREE.DirectionalLight;
  params: Params;
  updateLight: () => void;
  shadowHelper: THREE.CameraHelper | undefined;
  originalRotationY: number;
  topDownCamera?: THREE.PerspectiveCamera;
  animation?: AnimationProps;
}

export function mountGUI(props: MountGUIProps) {
  const { gui, scene, model, directionalLight, params, updateLight, originalRotationY, topDownCamera, animation } = props;
  let shadowHelper = props.shadowHelper;
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

  // Add shadow map size control
  gui.add(params, "shadowMapSize", 512, 8192, 256).onChange((value: number) => {
    directionalLight.shadow.mapSize.width = value;
    directionalLight.shadow.mapSize.height = value;
    if (directionalLight.shadow.map) {
      directionalLight.shadow.map.dispose();
      directionalLight.shadow.map = null;
    }
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

  // Add animation controls if provided
  if (animation) {
    const { baseActions, currentBaseAction, prepareCrossFade, crossFadeControls, walkIn, walkOut, resetCameraToCenter } = animation;
    const folder = gui.addFolder("Base Actions");

    const baseNames = ["None", ...Object.keys(baseActions)];

    for (let i = 0, l = baseNames.length; i !== l; ++i) {
      const name = baseNames[i];
      const settings = baseActions[name];
      const control = folder.add(
        {
          [name]: () => {
            if (resetCameraToCenter && topDownCamera) resetCameraToCenter(topDownCamera);
            const currentSettings = baseActions[currentBaseAction.value];
            const currentAction = currentSettings?.action ?? null;
            const action = settings?.action ?? null;

            if (currentAction !== action) {
              prepareCrossFade(currentAction, action, CROSS_FADE_DURATION_MS / 1000);
            }
          },
        },
        name
      );

      crossFadeControls.push(control);
    }

    if (walkIn) {
      folder.add({ "Walk In": walkIn }, "Walk In");
    }

    if (walkOut) {
      folder.add({ "Walk Out": walkOut }, "Walk Out");
    }

    folder.open();
  }
}
