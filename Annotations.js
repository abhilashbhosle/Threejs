import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { stlFilePaths } from "./StlPath";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a CSS2DRenderer to render annotations
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;

// To detect intersections between the mouse position and 3D objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objects = [];

// Array of STL file paths
const stlFiles = stlFilePaths;

// Load and parse color schemes from the .txt file
async function loadColorSchemes(filePath) {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    const colorSchemes = {};

    text.split("\n").forEach((line) => {
      const [id, r, g, b, , , , name] = line.split(",");
      colorSchemes[name.trim()] = {
        color: new THREE.Color(parseFloat(r), parseFloat(g), parseFloat(b)),
      };
    });

    return colorSchemes;
  } catch (error) {
    console.error("Error loading color schemes:", error);
    return {};
  }
}

// Helper function to extract model name from path
function extractNameFromPath(path) {
  const parts = path.split("/");
  const filename = parts[parts.length - 1];
  return filename.trim();
}

// Function to create or update annotation
function createOrUpdateAnnotation(object, name) {
  let annotation = object.userData.annotation;

  // If an annotation already exists, update it
  if (annotation) {
    annotation.element.innerText = `Model: ${name}`;
  } else {
    // Create new annotation if not already present
    const annotationDiv = document.createElement("div");
    annotationDiv.className = "annotation";
    annotationDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    annotationDiv.style.color = "white";
    annotationDiv.style.padding = "5px";
    annotationDiv.style.borderRadius = "3px";
    annotationDiv.innerText = `Model: ${name}`;

    const label = new CSS2DObject(annotationDiv);
    label.position.set(0, 1, 0); // Initial position above the object (can be adjusted)

    // Attach annotation to the object for future reference
    object.add(label);
    object.userData.annotation = label; // Store reference to annotation for easy access
  }
}

// Position the annotation above or below based on the object's location
function positionAnnotationAboveOrBelow(object, annotation) {
  const position = object.position.clone();

  // Adjust the annotation position based on the object position
  if (position.y > 0) {
    annotation.position.set(position.x, position.y + 2, position.z); // Above
  } else {
    annotation.position.set(position.x, position.y - 2, position.z); // Below
  }
}

// Load each STL file
(async function () {
  const colorSchemes = await loadColorSchemes("/models/BrainStemNuclei_colormap.txt");

  const loader = new STLLoader();
  stlFiles.forEach((filePath) => {
    const modelName = extractNameFromPath(filePath);

    loader.load(
      filePath,
      function (geometry) {
        const color = colorSchemes[modelName]?.color || new THREE.Color(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);

        geometry.center();
        mesh.scale.set(0.2, 0.2, 0.2);
        mesh.name = modelName;
        objects.push(mesh);
        scene.add(mesh);
      },
      undefined,
      function (error) {
        console.error(`Error loading ${filePath}:`, error);
      }
    );
  });
})();

// Create a DOM element to show the file name at the bottom
const fileNameDisplay = document.createElement('div');
fileNameDisplay.style.position = 'fixed';
fileNameDisplay.style.top = '40px';
fileNameDisplay.style.left = '50%';
fileNameDisplay.style.transform = 'translateX(-50%)';
fileNameDisplay.style.fontSize = '18px';
fileNameDisplay.style.color = 'white';
fileNameDisplay.style.padding = '10px';
fileNameDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
fileNameDisplay.innerHTML = 'Click on a model to see its name';
document.body.appendChild(fileNameDisplay);

// Mouse click event listener
function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1 range)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster with mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with objects
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    fileNameDisplay.innerHTML = `Clicked on: ${clickedObject.name}`;

    // Create or update annotation on the clicked model
    createOrUpdateAnnotation(clickedObject, clickedObject.name);
    positionAnnotationAboveOrBelow(clickedObject, clickedObject.userData.annotation);
  }
}

// Attach the click event listener to the window
window.addEventListener("click", onMouseClick, false);

// Animation loop to render the scene
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera); // Render the annotations
}

// Start the animation loop
animate();
