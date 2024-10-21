// BufferGeometries store information (such as vertex positions, face indices, normals, colors, UVs, and any custom attributes) in buffers - that is, typed arrays. This makes them generally faster than standard Geometries, at the cost of being somewhat harder to work with.

// With regards to updating BufferGeometries, the most important thing to understand is that you cannot resize buffers (this is very costly, basically the equivalent to creating a new geometry). You can however update the content of buffers.

import * as THREE from "three";
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );

const MAX_POINTS = 500;

// geometry
const geometry = new THREE.BufferGeometry();

// attributes
const positions = new Float32Array( MAX_POINTS * 3 ); // 3 floats (x, y and z) per point
geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

// draw range
const drawCount = 2; // draw the first 2 points, only
geometry.setDrawRange( 0, drawCount );

// material
const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

// line
const line = new THREE.Line( geometry, material );

renderer.setAnimationLoop(animate);

scene.add( line );
function animate() {
  renderer.render(scene, camera);
}


const positionAttribute = line.geometry.getAttribute( 'position' );

let x = 0, y = 0, z = 0;

for ( let i = 0; i < positionAttribute.count; i ++ ) {

	positionAttribute.setXYZ( i, x, y, z );

    x += ( Math.random() - 0.5 ) * 30;
    y += ( Math.random() - 0.5 ) * 30;
    z += ( Math.random() - 0.5 ) * 30;

}
positionAttribute.needsUpdate = true;