import THREE from 'three';

/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/

const glslify = require('glslify');
const vertexShader = glslify('../shaders/sky.vert');
const fragmentShader = glslify('../shaders/sky.frag');
// const fragmentShader = require('../shaders/sky.frag');

THREE.ShaderLib[ 'sky' ] = {

	uniforms: {

		luminance: { type: 'f', value: 1 },
		turbidity: { type: 'f', value: 2 },
		reileigh: { type: 'f', value: 1 },
		mieCoefficient: { type: 'f', value: 0.005 },
		mieDirectionalG: { type: 'f', value: 0.8 },
		sunPosition: { type: 'v3', value: new THREE.Vector3( 1, 0.2, 0.2 ) }

	},

	vertexShader: vertexShader,
	fragmentShader: fragmentShader

};

function calculateSunPosition( distance, inclination, azimuth ) {
	var theta = Math.PI * (inclination - 0.5);
	var phi = 2 * Math.PI * (azimuth - 0.5);

	var sunPosition = new THREE.Vector3(0,0,0);

	sunPosition.x = distance * Math.cos(phi);
	sunPosition.y = distance * Math.sin(phi) * Math.sin(theta);
	sunPosition.z = distance * Math.sin(phi) * Math.cos(theta);
	this.uniforms.sunPosition.value.copy(sunPosition);
}

THREE.Sky = function () {

	var skyShader = THREE.ShaderLib[ "sky" ];
	var skyUniforms = THREE.UniformsUtils.clone( skyShader.uniforms );

	var skyMat = new THREE.ShaderMaterial( {
		fragmentShader: skyShader.fragmentShader,
		vertexShader: skyShader.vertexShader,
		uniforms: skyUniforms,
		side: THREE.BackSide
	} );

	var lineMat = new THREE.LineBasicMaterial();

	// var skyGeo = new THREE.SphereBufferGeometry( 450000, 32, 15 );
	// var skyMesh = new THREE.Mesh( skyGeo, lineMat );
	// var skyMesh = new THREE.Mesh( skyGeo, skyMat );

	// this.meshWireframe = new THREE.WireframeHelper( skyMesh, 0x00ff00 );


	var geometry = new THREE.SphereBufferGeometry( 5000, 32, 15 ); 
	// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
	var sphere = new THREE.Mesh( geometry, skyMat ); 

	this.mesh = sphere;

	this.calculateSunPosition = calculateSunPosition.bind( this );

	// Expose variables
	// this.mesh = skyMesh;
	this.uniforms = skyUniforms;

};

