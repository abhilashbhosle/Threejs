import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; 

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
  );
  camera.position.z = 4;

  // Add OrbitControls to move the camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping (inertia)
controls.dampingFactor = 0.05; // The amount of damping
controls.screenSpacePanning = false; // Disable panning with right-click
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
  
  const loader = new GLTFLoader();
  
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1).normalize();
  scene.add(directionalLight);
  let mixer; 
  loader.load(
	"/models/ShaderBall.glb",
	function (gltf) {
	  scene.add(gltf.scene);
	  if (gltf.animations && gltf.animations.length) {
		// Create an AnimationMixer and associate it with the scene
		mixer = new THREE.AnimationMixer(gltf.scene);
  
		// Get the first animation and play it
		const action = mixer.clipAction(gltf.animations[0]);
		action.play();
	  }
	},
	undefined,
	function (error) {
	  console.error(error);
	}
  );
  const clock = new THREE.Clock();
  
  function animate() {
	requestAnimationFrame(animate);
	// Update the mixer on each frame if animations are loaded
	if (mixer) {
	  const delta = clock.getDelta(); // Get the time difference between frames
	  mixer.update(delta); // Update the mixer
	}
  
	renderer.render(scene, camera);
  }
  animate();