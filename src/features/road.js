import THREE from 'three'
import sliceGeometry from '../scripts/slice'
// const velvetMaterial = require('materials/velvet')

require( '../shaders/SkyShader' );

const PLANE_SIZE = 20000;
const PLANE_MOUNTAIN_SCALE = 50;

function createEarth( scene ) {
	var geometry = new THREE.PlaneGeometry( PLANE_SIZE, PLANE_SIZE, 60, 60 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	var material = new THREE.MeshBasicMaterial( { color: 0x407000, shading: THREE.FlatShading } );
	for ( var i = 0; i < geometry.vertices.length; i ++ ) {
		var vertex = geometry.vertices[ i ];
		vertex.x += Math.random() * PLANE_MOUNTAIN_SCALE - (PLANE_MOUNTAIN_SCALE/2);
		vertex.z += Math.random() * PLANE_MOUNTAIN_SCALE - (PLANE_MOUNTAIN_SCALE/2);
		var distance = ( vertex.distanceTo( scene.position ) / 5 ) - 250;
		vertex.y = Math.random() * Math.max( 0, distance );
	}
	geometry.computeFaceNormals();
	var mesh = new THREE.Mesh( geometry, material );
	mesh.receiveShadow = true;
	scene.add( mesh );
	return mesh;
}

function createTrees( earthMesh ) {
	var geometry = new TreesGeometry( earthMesh );
	var material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.VertexColors } );
	var trees = new THREE.Mesh( geometry, material );
	// trees.castShadow = true;
	// trees.receiveShadow = true;
	return trees;
}

function createRoad( earthMesh ) {
	// try to create a road which follows the earth
	var leftPlane = new THREE.Plane(new THREE.Vector3( 1, 0, 0 ), 10);
	var rightPlane = new THREE.Plane(new THREE.Vector3( -1, 0, 0 ), 10);
	
	var roadGeometry = sliceGeometry( earthMesh.geometry, leftPlane );
	roadGeometry = sliceGeometry( roadGeometry, rightPlane );

	// move the road a little above the grass
	roadGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 1, 0 ) );

	// var material = new THREE.MeshBasicMaterial({ wireframe: true });
	// var material = new THREE.MeshBasicMaterial( { color: 0x444444, shading: THREE.FlatShading } );

	
	texture
	var texloader = new THREE.TextureLoader();

    var texture = texloader.load( 'textures/road2.jpg', function( tex ) {
    	tex.wrapT = THREE.RepeatWrapping;
		tex.wrapS = THREE.RepeatWrapping;
		// tex.flipY = false;
		tex.repeat.set( 500, 500 );	
    } );
    var material = new THREE.MeshBasicMaterial( { map: texture } );


	// var material = velvetMaterial();

	var road = new THREE.Mesh( roadGeometry, material );
	// road.receiveShadow = true;
	return road;
}

function addSky( scene ) {
	var distance = 400000;
	var effectController  = {
		turbidity: 10,
		reileigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		inclination: 0.49, // elevation / inclination
		azimuth: 0.25, // Facing front,
		sun: !true
	}

	var sky = new THREE.Sky();
	scene.add( sky.mesh );
	// scene.add( sky.meshWireframe );

	// var sunSphere = new THREE.Mesh(
	// 	new THREE.SphereBufferGeometry( 20000, 16, 8 ),
	// 	new THREE.MeshBasicMaterial( { color: 0xffffbb } )
	// );
	// sunSphere.position.y = -1000;
	// sunSphere.visible = true;

	// set up params
	var uniforms = sky.uniforms;
	uniforms.turbidity.value = effectController.turbidity;
	uniforms.reileigh.value = effectController.reileigh;
	uniforms.luminance.value = effectController.luminance;
	uniforms.mieCoefficient.value = effectController.mieCoefficient;
	uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

	sky.calculateSunPosition( distance, effectController.inclination, effectController.azimuth );

	// sunSphere.visible = effectController.sun;

	

	// scene.add( sunSphere );

	// lights and shadows

/*
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.75 );
	directionalLight.position.set( sunSphere.position.x, sunSphere.position.y, sunSphere.position.z );
	// directionalLight.position.set( 1, 1, 0.5 );
	scene.add( directionalLight );
*/
	// directionalLight.castShadow = true;
	// directionalLight.shadowMapWidth = 2048;
	// directionalLight.shadowMapHeight = 2048;

	// var d = 5000;

	// directionalLight.shadowCameraLeft = -d;
	// directionalLight.shadowCameraRight = d;
	// directionalLight.shadowCameraTop = d;
	// directionalLight.shadowCameraBottom = -d;

	// directionalLight.shadowCameraFar = 3500;
	// directionalLight.shadowBias = -0.0001;
	// directionalLight.shadowDarkness = 0.5;
	// directionalLight.shadowCameraVisible = true;

	return sky;
}

function createSkyOld() {
	var geometry = new SkyGeometry();
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	return new THREE.Mesh( geometry, material );
}

function createLight() {
	var light = new THREE.HemisphereLight( 0xfff0f0, 0x606066 );
	light.position.set( 1, 1, 1 );
	return light;
}

var SkyGeometry = function () {

	THREE.BufferGeometry.call( this );

	var vertices = [];

	for ( var i = 0; i < 100; i ++ ) {

		var x = Math.random() * 8000 - 4000;
		var y = Math.random() * 500 + 500;
		var z = Math.random() * 8000 - 4000;

		var size = Math.random() * 400 + 200;

		vertices.push( x - size, y, z - size );
		vertices.push( x + size, y, z - size );
		vertices.push( x - size, y, z + size );

		vertices.push( x + size, y, z - size );
		vertices.push( x + size, y, z + size );
		vertices.push( x - size, y, z + size );

	}


	this.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );

};

SkyGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

var TreesGeometry = function ( landscape ) {

	THREE.BufferGeometry.call( this );

	var vertices = [];
	var colors = [];

	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, -1, 0 );

	for ( var i = 0; i < 2000; i ++ ) {

		var x = Math.random() * 5000 - 2500;
		var z = Math.random() * 5000 - 2500;

		// note if trees are two close to X=0, we push them out to +/- 30
		// this keeps them off the road :)

		if ( 0 < x && x < 30 ) {
			x = 30;
		}

		if ( -30 < x && x < 0 ) {
			x = -30;
		}

		raycaster.ray.origin.set( x, 500, z );

		var intersections = raycaster.intersectObject( landscape );

		if ( intersections.length === 0 ) continue;

		var y = intersections[ 0 ].point.y;

		var height = Math.random() * 40 + 20;

		var angle = Math.random() * Math.PI * 2;

		vertices.push( x + Math.sin( angle ) * 10, y, z + Math.cos( angle ) * 10 );
		vertices.push( x, y + height, z );
		vertices.push( x + Math.sin( angle + Math.PI ) * 10, y, z + Math.cos( angle + Math.PI ) * 10 );

		angle += Math.PI / 2;

		vertices.push( x + Math.sin( angle ) * 10, y, z + Math.cos( angle ) * 10 );
		vertices.push( x, y + height, z );
		vertices.push( x + Math.sin( angle + Math.PI ) * 10, y, z + Math.cos( angle + Math.PI ) * 10 );

		var random = Math.random() * 0.1;

		for ( var j = 0; j < 6; j ++ ) {

			colors.push( 0.2 + random, 0.4 + random, 0 );

		}

	}

	this.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );
	this.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );

};

TreesGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

class Road {
	constructor( scene, renderer ) {
		scene.fog = new THREE.FogExp2( 0x333340, 0.005 );

		this.earthMesh = createEarth( scene );
		scene.add( this.earthMesh );

		var treesMesh = createTrees( this.earthMesh );
		scene.add( treesMesh );

		var roadMesh = createRoad( this.earthMesh );
		scene.add( roadMesh );

		// scene.add( createSky() );
		this.skyMesh = addSky( scene );
	}

	getTerrain() {
		return this.earthMesh;
	}

	getSky() {
		return this.skyMesh;
	}
}

// function Road( scene, renderer ) {
// 	// console.log("run");
// 	// blue sky 
// 	// renderer.setClearColor( 0xf0f0ff );
// 	// scene.add( createLight() );

// 	// var helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
// 	// scene.add( helper );

// 	scene.fog = new THREE.FogExp2( 0x333340, 0.005 );

// 	var earthMesh = createEarth( scene );
// 	scene.add( earthMesh );

// 	var treesMesh = createTrees( earthMesh );
// 	scene.add( treesMesh );

// 	var roadMesh = createRoad( earthMesh );
// 	scene.add( roadMesh );

// 	// scene.add( createSky() );
// 	addSky( scene );

// 	return earthMesh;
// }

export default Road;