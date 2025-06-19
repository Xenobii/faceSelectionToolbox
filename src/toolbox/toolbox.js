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
import Scene from "./scene.js";
import Utils from "./utils.js";
import GeometryHelpers from "./geomhelpers.js";

const Toolbox = {
    Scene,
    Utils,
    GeometryHelpers
};

Toolbox.prepareforSelection = (mesh, renderer, camera) => {
    Scene.init(mesh, renderer, camera);
};

export default Toolbox;