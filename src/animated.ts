import GUI from "lil-gui";
import Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  allActions,
  baseActions,
  crossFadeControls,
  currentBaseAction,
  prepareCrossFade,
  resetCameraToCenter,
  setupAnimations,
  updateAnimationWeights,
  WALK_DURATION_MS,
  walkIn,
  walkOut,
} from "./modules/animation";
import { mountGUI } from "./modules/gui";
import { createDirectionalLight } from "./modules/light";
import { params } from "./modules/parameters";
import "./style.css";
import { computeAnglesFromPosition, updateSunPosition } from "./sun";

const basicModelUrl = `${import.meta.env.BASE_URL}models/xbot-default.glb`;

const loader = new GLTFLoader();

const scene = new THREE.Scene();

const gui = new GUI();

let model: THREE.Group; // Declare model globally
let originalRotationY = 0;
let shadowHelper: THREE.CameraHelper | undefined;
let topDownCamera: THREE.PerspectiveCamera;
let mixer: THREE.AnimationMixer;
let clock: THREE.Clock;
let isWalkingIn = { value: false };
const walkInSpeed = 10 / (WALK_DURATION_MS / 1000);
let isWalkingOut = { value: false };
const walkOutSpeed = 10 / (WALK_DURATION_MS / 1000);

const directionalLight = createDirectionalLight(params);

scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const stats = new Stats();
stats.dom.style.position = "absolute";
stats.dom.style.top = "0";
stats.dom.style.left = "0";
document.body.appendChild(stats.dom);

// 4. Create Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

loader.load(
  basicModelUrl,
  (gltf) => {
    model = gltf.scene;

    console.log("GLTF animations:", gltf.animations);
    console.log("GLTF has animations:", gltf.animations.length > 0);

    let hasSkeleton = false;
    model.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        hasSkeleton = true;
        console.log("Found SkinnedMesh:", child.name);
      }
    });
    console.log("Model contains skeleton:", hasSkeleton);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat && typeof mat === "object") {
                mat.transparent = true;
                mat.opacity = params.showModel ? 1 : 0;
              }
            });
          } else if (typeof child.material === "object") {
            child.material.transparent = true;
            child.material.opacity = params.showModel ? 1 : 0;
          }
        }
      }
    });
    scene.add(model);

    model.scale.set(4, 4, 4);

    // Position the model so its bottom touches the ground
    const box = new THREE.Box3().setFromObject(model);
    model.position.y -= box.min.y;

    originalRotationY = model.rotation.y;

    // Set up animation mixer and clock
    mixer = new THREE.AnimationMixer(model);
    clock = new THREE.Clock();

    // Set up animations
    setupAnimations(gltf, mixer);

    // Create top-down camera
    topDownCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    topDownCamera.position.set(0, 20, 10);
    topDownCamera.lookAt(0, 0, 0);

    // Compute initial sun angles
    const { azimuth, altitude } = computeAnglesFromPosition(directionalLight.position);
    params.altitude = altitude;
    params.azimuth = azimuth;

    const distance = directionalLight.position.length();

    const updateLight = () => {
      directionalLight.position.copy(updateSunPosition(params.azimuth, params.altitude, distance));
    };

    mountGUI({
      gui,
      scene,
      model,
      directionalLight,
      params,
      updateLight,
      shadowHelper,
      originalRotationY,
      topDownCamera,
      animation: {
        baseActions,
        allActions,
        currentBaseAction,
        prepareCrossFade: (start, end, dur) => prepareCrossFade(mixer, start, end, dur),
        crossFadeControls,
        walkIn: () => walkIn(mixer, topDownCamera, isWalkingIn),
        walkOut: () => walkOut(mixer, topDownCamera, isWalkingOut),
        resetCameraToCenter,
      },
    });
  },
  undefined,
  (error) => {
    console.error("An error happened", error);
  }
);

// Move the camera back so we can see the cube
camera.position.set(0, 10, 5);

// 5. Animation Loop
function animate() {
  requestAnimationFrame(animate);

  stats.update();

  controls.update();

  // Update animation mixer
  if (mixer && clock) {
    const mixerUpdateDelta = clock.getDelta();
    mixer.update(mixerUpdateDelta);

    if (isWalkingIn.value && topDownCamera) {
      topDownCamera.position.z -= walkInSpeed * mixerUpdateDelta;
    }

    if (isWalkingOut.value && topDownCamera) {
      topDownCamera.position.z -= walkOutSpeed * mixerUpdateDelta;
    }

    // Update weights
    updateAnimationWeights();
  }

  // Render left view (3D)
  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 1);
  camera.aspect = window.innerWidth / 2 / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  // Render right view (top-down)
  renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 1);
  if (topDownCamera) {
    topDownCamera.aspect = window.innerWidth / 2 / window.innerHeight;
    topDownCamera.updateProjectionMatrix();
    topDownCamera.lookAt(topDownCamera.position.x, 0, topDownCamera.position.z);
    renderer.render(scene, topDownCamera);
  }
}

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / 2 / window.innerHeight;
  camera.updateProjectionMatrix();
  if (topDownCamera) {
    topDownCamera.aspect = window.innerWidth / 2 / window.innerHeight;
    topDownCamera.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the loop
animate();
