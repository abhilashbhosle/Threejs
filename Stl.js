import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
const stlFiles = [
  "/models/Nuclei00001.stl", // Add more STL file paths as needed
  "/models/Nuclei00002.stl",
  "/models/Nuclei00003.stl",
  "/models/Nuclei00004.stl",
  "/models/Nuclei00005.stl",
  "/models/Nuclei00006.stl",
  "/models/Nuclei00007.stl",
  "/models/Nuclei00008.stl",
  "/models/Nuclei00009.stl",
  "/models/Nuclei00010.stl",
  "/models/Nuclei00011.stl",
  "/models/Nuclei00012.stl",
  "/models/Nuclei00013.stl",
  "/models/Nuclei00014.stl",
  "/models/Nuclei00015.stl",
  "/models/Nuclei00016.stl",
  "/models/Nuclei00017.stl",
  "/models/Nuclei00018.stl",
  "/models/Nuclei00019.stl",
  "/models/Nuclei00020.stl",
  "/models/Nuclei00021.stl",
  "/models/Nuclei00022.stl",
  "/models/Nuclei00024.stl",
  "/models/Brain_stem00001.stl",
  "/models/Brain_stem00002.stl",
  "/models/Brain_stem00003.stl",
  "/models/Brain_stem00004.stl",
  "/models/Brain_stem00005.stl",
  "/models/Brain_stem00006.stl",
  "/models/Brain_stem00007.stl",
  "/models/Brain_stem00008.stl",
  "/models/Brain_stem00009.stl",
  "/models/Brain_stem00010.stl",
  "/models/Brain_stem00011.stl",
  "/models/Brain_stem00012.stl",
  "/models/Brain_stem00013.stl",
  "/models/Brain_stem00014.stl",
  "/models/Brain_stem00015.stl",
  "/models/Brain_stem00016.stl",
  "/models/Brain_stem00017.stl",
  "/models/Brain_stem00018.stl",
];

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
