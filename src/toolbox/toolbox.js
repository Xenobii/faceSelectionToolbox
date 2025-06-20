import * as THREE from "three";
import {
    computeBoundsTree, 
    disposeBoundsTree, 
    acceleratedRaycast
} from 'three-mesh-bvh';

// Initialize THREE extensions once
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// Import and re-export Scene
import Utils from "./utils.js";
import GeometryHelpers from "./geomhelpers.js";

const Toolbox = {
    Utils,
    GeometryHelpers
};

class Tools {
    constructor(scene, camera, renderer, mesh, optParams) {
        this.scene    = scene;
        this.camera   = camera;
        this.renderer = renderer;
        this.mesh     = mesh;

        this._screenPointerCoords = new THREE.Vector2(0.0, 0.0);

        this._bPauseQuery  = false;
        this._bInitialized = false;

        this.init();
    }
    
    init() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.firstHitOnly = true;
        
        if (!this.mesh.geometry.boundsTree) {
            console.log("No bounds tree, computing bounds tree");
            this.mesh.geometry.computeBoundsTree();
        }
        this.initMeshMat();
        this.initEventListeners();
    }

    initEventListeners() {
        let el = this.renderer.domElement;

        el.addEventListener('mousemove', this._updateScreenMove, false);
        el.addEventListener('mousemove', this._query, false);
    }

    initMeshMat() {
        this.mesh.material.vertexColors = true;
        this.mesh.material.needsUpdate  = true;

        if (!this.mesh.geometry.attributes.color) {
            console.log("Initializing color");
            let colorArray, colorAttr;
            colorArray = new Float32Array(this.mesh.geometry.attributes.position.count * 3);
            colorArray.fill(new THREE.Color(0xffffff)); // Default to white
            colorAttr = new THREE.BufferAttribute(colorArray, 3);
            this.mesh.geometry.setAttribute('color', colorAttr);
        }
    }

    _query() {
        if (!this._bPauseQuery) return;

        this._hits = [];

        this.raycaster.setFromCamera(this._screenPointerCoords, this.camera);
        this.raycaster.intersectObject(this.scene.children, true, this._hits);

        let hitsnum = this._hits.length;
        if (hitsnum <= 0) {
            this._queryData = undefined;
            return;
        }

        const h = this._hits[0];
        this._queryData = {};
        this._queryData.p = h.point;
        this._queryData.d = h.distance;
        this._queryData.o = h.object;

        // Compute normals
        console.log(this._queryData)
    }

    _updateScreenMove(e) {
        if (e.preventDefault) e.preventDefault();

        this._screenPointerCoords.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this._screenPointerCoords.y = ( e.clientY / window.innerHeight ) * 2 - 1;
    }

    brush() {

    }
};

export default Tools;