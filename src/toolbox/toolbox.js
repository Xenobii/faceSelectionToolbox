import * as THREE from "three";
import {
    computeBoundsTree, 
    disposeBoundsTree, 
    acceleratedRaycast,
    CONTAINED,
    INTERSECTED,
    NOT_INTERSECTED
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
        this.scene = scene;
        this.camera   = camera;
        this.renderer = renderer;
        this.mesh     = mesh;

        if (!optParams) optParams = {};
        this.defaultColor   = optParams.defaultColor   ?? new THREE.Color(0xffffff);
        this.highlightColor = optParams.highlightColor ?? new THREE.Color(0xff0000);
        this.rcLayer        = optParams.layer;
        
        this._screenPointerCoords = new THREE.Vector2(0.0, 0.0);

        this._bPauseQuery  = false;
        this._bInitialized = false;
        
        this.initRC();
        this.initMeshMat();
        this.initEventListeners();
        
        this._bInitialized = true;

        this.enable = false;
    }
    
    initRC() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(this.layers);
        this.raycaster.firstHitOnly = true;
        
        if (!this.mesh.geometry.boundsTree) {
            console.log("No bounds tree, computing bounds tree");
            this.mesh.geometry.computeBoundsTree();
        }
    }

    initEventListeners() {
        let el = this.renderer.domElement;

        el.addEventListener('mousemove', (e) => this._updateScreenMove(e), false);
        el.addEventListener('mousemove', () => this._query(), false);
    }

    initMeshMat() {
        this.mesh.material.vertexColors = true;
        this.mesh.material.needsUpdate  = true;

        if (!this.mesh.geometry.attributes.color) {
            // console.log("Initializing color");
            let colorArray, colorAttr;
            colorArray = new Float32Array(this.mesh.geometry.attributes.position.count * 3);

            for (let i = 0; i < this.mesh.geometry.attributes.position.count; i++) {
                colorArray[i * 3 + 0] = this.defaultColor.r;
                colorArray[i * 3 + 1] = this.defaultColor.g;
                colorArray[i * 3 + 2] = this.defaultColor.b;
            }

            colorAttr = new THREE.BufferAttribute(colorArray, 3);
            this.mesh.geometry.setAttribute('color', colorAttr);
        }
    }

    _updateScreenMove(e) {
        if (e.preventDefault) e.preventDefault();

        const rect = this.renderer.domElement.getBoundingClientRect();
        this._screenPointerCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this._screenPointerCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    _query() {
        if (this._bPauseQuery) return;

        this._hits = [];

        this.raycaster.setFromCamera(this._screenPointerCoords, this.camera);
        this.raycaster.intersectObject(this.mesh, true, this._hits);

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
    }

    _clearHighlights() {
        const colorAttr = this.mesh.geometry.attributes.color;
        const colorArray = colorAttr.array;

        for (let i=0; i < colorArray.length; i++) {
            colorArray[i] = 1;
        }

        colorAttr.needsUpdate = true;
    }

    _highlightFacesOnMesh(selectedFaces) {
        const colorAttr = this.mesh.geometry.attributes.color;
        const indexAttr = this.mesh.geometry.index;

        const colors = colorAttr.array;
        const stride = colorAttr.itemSize;
        const r = this.highlightColor.r, g = this.highlightColor.g, b = this.highlightColor.b;

        const writeVertex = (base) => {
            colors[base    ] = r;
            colors[base + 1] = g;
            colors[base + 2] = b;
        }

        if (indexAttr) {
            const indices = indexAttr.array;
            for (const face of selectedFaces){
                writeVertex(indices[face * 3    ] * stride);
                writeVertex(indices[face * 3 + 1] * stride);
                writeVertex(indices[face * 3 + 2] * stride);
            }
        } else {
            for (const face of selectedFaces){
                const faceStart = face * 3 * stride;
                writeVertex(faceStart);
                writeVertex(faceStart + stride);
                writeVertex(faceStart + 2 * stride);
            }
        }

        colorAttr.needsUpdate = true;
        return;
    }

    activate() {
        this.enabled = true;
    }

    deactivate() {
        this.enabled = false;
    }
};

class Brush extends Tools {
    constructor(scene, camera, renderer, mesh, optParams) {
        super(scene, camera, renderer, mesh, optParams)
        
        this.initBrushEventListeners();
        this.initSelector();

        this.selectorSize = 0.5;
        this.tempSelection = new Set();

        this.selectorMesh.visible = false;
        this._onStrokeEndCallback = null;
    }

    initBrushEventListeners() {
        let el = this.renderer.domElement;

        el.addEventListener('mousedown', (e) => {
            if (this.enabled) {
                if (e.button === 0) {
                    this._bLeftMouseDown = true;
                    this._brushActive();
                }
            }
        }, false);
        el.addEventListener('mouseup', (e) => {
            if (this.enabled) {
                if (e.button === 0) {
                    this._bLeftMouseDown = false;
    
                    if (this._onStrokeEndCallback) {
                        this._onStrokeEndCallback([...this.tempSelection]);
                    }
    
                    this.tempSelection.clear();
                }
            }
        }, false)
        el.addEventListener('mousemove', () => {
            if (this.enabled) {
                this._moveSelector();
                if (this._bLeftMouseDown === true) {
                    this._brushActive();
                }
            }
        })
    }

    initSelector() {
        this.selectorGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        this.selectorMaterial = new THREE.MeshStandardMaterial({
            color:0x00ff00,
            roughness: 0.75,
            metalness: 0,
            transparent: true,
            opacity: 0.5,
            premultipliedAlpha: true,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5,
        });
        this.selectorMesh = new THREE.Mesh(this.selectorGeometry, this.selectorMaterial);
        this.selectorMesh.visible = false;
        this.scene.add(this.selectorMesh);
    }

    _moveSelector() {
        if (this._queryData === undefined) {
            this.selectorMesh.visible = false;
            return false;
        }
        this.selectorMesh.visible = true;
        this.selectorMesh.position.copy(this._queryData.p);
    }

    _selectMultipleFaces() {
        if (this._bPauseQuery) return false;
        if (this._queryData === undefined) return false;

        const inverseMatrix = new THREE.Matrix4();
        inverseMatrix.copy(this.mesh.matrixWorld).invert();

        const sphere = new THREE.Sphere();
        sphere.center.copy(this.selectorMesh.position).applyMatrix4(inverseMatrix);
        sphere.radius = this.selectorSize;

        const faces   = [];
        const tempVec = new THREE.Vector3();

        if (this.mesh.geometry.boundsTree) {
            this.mesh.geometry.boundsTree.shapecast({
                intersectsBounds: box => {
                    const intersects = sphere.intersectsBox(box);
                    const {min, max} = box;
                    if (intersects) {
                        for (let x=0; x<=1; x++) {
                            for (let y=0; y<=1; y++) {
                                for (let z=0; z<=1; z++) {
                                    tempVec.set(
                                        x === 0 ? min.x : max.x,
                                        y === 0 ? min.y : max.y,
                                        z === 0 ? min.z : max.z
                                    );
                                    if (!sphere.containsPoint(tempVec)) {
                                        return INTERSECTED;
                                    }
                                }
                            }
                        }
                        return CONTAINED
                    }
                    return intersects ? INTERSECTED: NOT_INTERSECTED
                },
                intersectsTriangle: (tri, i, contained) => {
                    if (contained || tri.intersectsSphere(sphere)) {
                        faces.push(i)
                    }
                }
            })
        }
        else {
            console.log("Face selection failed, geometry has no bounds tree.")
        }
        return faces
    }

    _brushActive() {
        const newFaces = this._selectMultipleFaces();
        if (!newFaces.length) return false;

        const newFacesSet = new Set(newFaces);
        newFacesSet.forEach(f => this.tempSelection.add(f));

        this._clearHighlights();
        this._highlightFacesOnMesh(this.tempSelection);
    }

    onStrokeEnd(callback) {
        this._onStrokeEndCallback = callback;
    }
}


export {Tools, Brush};