import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { stlFilePaths } from "./StlPath";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({antialias:true}); // antialias is used to render smooth edges..
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping (inertia)
controls.dampingFactor = 0.05; // The amount of damping
controls.screenSpacePanning = false; // Disable panning with right-click
// controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
// Array of STL file paths
const stlFiles = stlFilePaths;
// Load each STL file
const loader = new STLLoader();
stlFiles.forEach((filePath) => {
  loader.load(filePath, function (geometry) {
    const material = new THREE.MeshStandardMaterial({
      // color: Math.random() * 0xffffff,
      color: 0xffffff,
    }); // Random color for each model
    const mesh = new THREE.Mesh(geometry, material);

    // Center the geometry
    geometry.center();
    mesh.scale.set(0.15, 0.15, 0.15); // Adjust the scale as necessary
    // mesh.scale.set(1, 1, 1); // Adjust the scale as necessary

    scene.add(mesh);

    // Render the scene after loading the model
    renderer.render(scene, camera);
  });
});

// Animation loop to render the scene
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();
