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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0.8);
document.body.appendChild(renderer.domElement);

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objects = [];

// Sidebar container for file list
const sidebar = document.createElement("div");
sidebar.style.position = "fixed";
sidebar.style.top = "0";
sidebar.style.left = "20";
sidebar.style.width = "200px";
sidebar.style.height = "98%";
sidebar.style.overflowY = "auto";
// sidebar.style.backgroundColor = "rgba(0,0,0,0.8)";
sidebar.style.color = "#fff";
sidebar.style.padding = "10px";
sidebar.style.scrollbarColor="#000"
// sidebar.style.boxShadow = "2px 0px 5px rgba(0,0,0,0.5)";
document.body.appendChild(sidebar);


// DOM element to show the file name at the bottom
const fileNameDisplay = document.createElement("div");
fileNameDisplay.style.position = "fixed";
fileNameDisplay.style.top = "40px";
fileNameDisplay.style.left = "50%";
fileNameDisplay.style.transform = "translateX(-50%)";
fileNameDisplay.style.fontSize = "18px";
fileNameDisplay.style.color = "white";
fileNameDisplay.style.padding = "10px";
fileNameDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
fileNameDisplay.innerHTML = "Click on a model to see its name";
document.body.appendChild(fileNameDisplay);

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

// Helper function to add file entries to sidebar
function addFileToSidebar(fileName, modelMesh) {
  const fileEntry = document.createElement("div");
  fileEntry.style.display = "flex";
  fileEntry.style.justifyContent = "space-between";
  fileEntry.style.alignItems = "center";
  fileEntry.style.marginBottom = "8px";

  const fileLabel = document.createElement("span");
  fileLabel.innerText = fileName;
  fileEntry.appendChild(fileLabel);

  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = "👁️"; // eye icon
  toggleButton.style.background = "transparent";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.color = "white";

  // Event listener for toggling visibility
  toggleButton.addEventListener("click", () => {
    modelMesh.visible = !modelMesh.visible;
    toggleButton.innerHTML = modelMesh.visible ? "👁️" : "🚫"; // Switch icon based on visibility
  });

  fileEntry.appendChild(toggleButton);
  sidebar.appendChild(fileEntry);
}

// Load each STL file
(async function () {
  const colorSchemes = await loadColorSchemes(
    "/models/BrainStemNuclei_colormap.txt"
  );
  const stlFiles = stlFilePaths
  const loader = new STLLoader();
  stlFiles.forEach((filePath) => {
    const modelName = extractNameFromPath(filePath);

    loader.load(
      filePath,
      function (geometry) {
        const color =
          colorSchemes[modelName]?.color || new THREE.Color(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);

        geometry.center();
        mesh.scale.set(0.2, 0.2, 0.2);
        mesh.name = modelName;
        objects.push(mesh);
        scene.add(mesh);

        // Add model to the sidebar with visibility toggle
        addFileToSidebar(modelName, mesh);
      },
      undefined,
      function (error) {
        console.error(`Error loading ${filePath}:`, error);
      }
    );
  });
})();

// Mouse click event listener
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    fileNameDisplay.innerHTML = `Clicked on: ${clickedObject.name}`;
  }
}

window.addEventListener("click", onMouseClick, false);

// Animation loop to render the scene
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
