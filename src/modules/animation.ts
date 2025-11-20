import * as THREE from "three";

export const crossFadeControls: any[] = [];

export const currentBaseAction = { value: "idle" };

export const allActions: THREE.AnimationAction[] = [];

export const baseActions: Record<string, { weight: number; action?: THREE.AnimationAction }> = {
  idle: { weight: 1 },
  walk: { weight: 0 },
};

export function activateAction(action: THREE.AnimationAction) {
  const clip = action.getClip();
  const settings = baseActions[clip.name] || { weight: 0 };
  setWeight(action, settings.weight);
  action.play();
}

export function modifyTimeScale(mixer: THREE.AnimationMixer, speed: number) {
  mixer.timeScale = speed;
}

export function prepareCrossFade(
  mixer: THREE.AnimationMixer,
  startAction: THREE.AnimationAction | null,
  endAction: THREE.AnimationAction | null,
  duration: number
) {
  // If the current action is 'idle', execute the crossfade immediately;
  // else wait until the current action has finished its current loop

  if (currentBaseAction.value === "idle" || !startAction || !endAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(mixer, startAction, endAction, duration);
  }

  // Update control colors

  if (endAction) {
    const clip = endAction.getClip();
    currentBaseAction.value = clip.name;
  } else {
    currentBaseAction.value = "None";
  }
}

export function synchronizeCrossFade(mixer: THREE.AnimationMixer, startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
  mixer.addEventListener("loop", onLoopFinished);

  function onLoopFinished(event: any) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);

      executeCrossFade(startAction, endAction, duration);
    }
  }
}

export function executeCrossFade(startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)

  if (endAction) {
    setWeight(endAction, 1);
    endAction.time = 0;

    if (startAction) {
      // Crossfade with warping

      startAction.crossFadeTo(endAction, duration, true);
    } else {
      // Fade in

      endAction.fadeIn(duration);
    }
  } else {
    // Fade out

    if (startAction) startAction.fadeOut(duration);
  }
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

export function setWeight(action: THREE.AnimationAction, weight: number) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

export function setupAnimations(gltf: any, mixer: THREE.AnimationMixer) {
  const animations = gltf.animations;
  for (let i = 0; i < animations.length; ++i) {
    const clip = animations[i];
    const name = clip.name;

    if (baseActions[name]) {
      const action = mixer.clipAction(clip);
      activateAction(action);
      baseActions[name].action = action;
      allActions.push(action);
    }
  }
}

export function updateAnimationWeights() {
  for (let i = 0; i < allActions.length; ++i) {
    const action = allActions[i];
    const clip = action.getClip();
    const settings = baseActions[clip.name];
    if (settings) {
      settings.weight = action.getEffectiveWeight();
    }
  }
}
