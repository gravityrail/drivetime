import THREE from 'three'
import TWEEN from 'tween.js'
import AbstractVRApplication from 'scripts/views/AbstractVRApplication'

import Road from '../features/road';
import Stats from 'stats.js'

const glslify = require('glslify')
const shaderVert = glslify('./../shaders/custom.vert')
const shaderFrag = glslify('./../shaders/custom.frag')
const noiseMaterial = require('materials/noise')



class Main extends AbstractVRApplication {
    constructor(){

        super();

        // show stats
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom 
        document.body.appendChild( this.stats.dom );

        // position the camera
        this._camera.position.y = 25;

        var roadMesh = Road( this._scene, this._renderer );

        // we want the camera elevation to track the terrain height
        this.terrain = roadMesh;

        this.fixCameraHeight();

        // console.log(this._camera);

        // let's drive along the road
        var newCamera = this._camera.clone();
        newCamera.position.z -= 4000;
        // console.log(newCamera);

        // var onUpdateTween = function( timestamp ) {
        //     // console.log("updating tween"+timestamp);
        //     this.animate();
        // }.bind( this );

        this.isDriving = true;

        var camTween = new TWEEN.Tween( this._camera.position )
            .to( newCamera.position, 100000 )
            // .easing( TWEEN.Easing.Elastic.InOut )
            // .onUpdate( onUpdateTween )
            .onComplete( this.stopDriving )
            .start();

        this.animate();

        // var texloader = new THREE.TextureLoader();

        // texloader.load( 'textures/crate.gif', function( texture ) {
        //     console.log("texture loaded");
        //     console.log(texture);

        //     var geometry = new THREE.BoxGeometry( 200, 200, 200 );
        //     var material = new THREE.MeshBasicMaterial( { map: texture } );

        //     var material2 = new THREE.ShaderMaterial({
        //         vertexShader: shaderVert,
        //         fragmentShader: shaderFrag
        //     });
        //     this._mesh = new THREE.Mesh( geometry, material);//noiseMaterial );

        //     //const mat1 = noiseMaterial();
        //     //this._mesh = new THREE.Mesh( geometry, mat1 );

        //     this._scene.add( this._mesh );
        //     this.animate();

        // }.bind( this ),
        //     // Function called when download progresses
        //     function ( xhr ) {
        //         console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        //     },
        //     // Function called when download errors
        //     function ( xhr ) {
        //         console.log( 'An error happened' );
        //     } );

        

    }

    fixCameraHeight() {
        var raycaster = new THREE.Raycaster();
        // point down
        raycaster.ray.direction.set( 0, -1, 0 );

        // ... from above max mountain height
        raycaster.ray.origin.set( this.camera.position.x, 500, this.camera.position.z );

        // ... find our landscape
        var intersections = raycaster.intersectObject( this.terrain );
        if ( intersections.length === 0 ) {
            console.warn("error! couldn't find landscape for camera intersection");
            this.stopDriving();
            return;
        }

        // ... get the new camera height
        var y = intersections[ 0 ].point.y;
        this.camera.position.y = y+10;
    }

    stopDriving() {
        this.isDriving = false;
    }

    animate( time ) {
        if ( this.stats ) {
            this.stats.begin();    
        }
        
 
        super.animate( time );
        if ( this.isDriving ) {
            TWEEN.update( time );
            this.fixCameraHeight();
        }

        if ( this.stats ) {
            this.stats.end();
        }
    }

}
export default Main;