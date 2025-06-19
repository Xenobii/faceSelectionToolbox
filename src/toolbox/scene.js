import * as THREE from "three";
import {
    computeBoundsTree, disposeBoundsTree, acceleratedRaycast,
} from 'three-mesh-bvh';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


let Scene = {};


Scene.init = (mesh, renderer, camera) => {
    // Init screen coords
    Scene._screenPointerCoords = new THREE.Vector2(0.0, 0.0);

    // Init all things rendering
    Scene.initRenderer(renderer);
    Scene.initCamera(camera);
    Scene.initRaycasting(Scene.renderer);

    // Setup event listeners
    Scene.setupBaseListeners(Scene.renderer.domElement);

    // Prepare mesh
    Scene.prepareMesh(mesh);

    // Setup update routine
    Scene._onUpdate(undefined);
};

Scene._onUpdate = (onUpdate) => {
    Scene.renderer.setAnimationLoop(onUpdate);
};


Scene.initRenderer = (renderer) => {
    if (renderer) Scene.renderer = renderer;
    else {
        const wglopts = {
            antialias: true,
            alpha: true,
        };
        Scene.renderer = new THREE.WebGLRenderer(wglopts);
        Scene.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Scene.renderer.domElement);
    }
};


Scene.initCamera = (camera) => {
    if (camera) Scene.camera = camera;
    else {
        const fov = 75;
        const aspect = window.innerWidth/window.innerHeight;
        const near = 0.1;
        const far = 10;
        Scene.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
    }
};


Scene.initRaycasting = (renderer) => {
    Scene.raycaster = new THREE.Raycaster();
    Scene.raycaster.firstHitOnly = true;

    return Scene.raycaster;
};


Scene.setupBaseListeners = (el) => {
    // Resize
    window.addEventListener('resize', Scene._onResize, false);

    // Mouse move
    el.addEventListener('mousemove', Scene._updateScreenMove, false);
};


Scene._updateScreenMove = (e) => {
    if (e.preventDefault) e.preventDefault();

    // Adjust screen pointer coordinates
    Scene._screenPointerCoords.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    Scene._screenPointerCoords.y = ( e.clientY / window.innerHeight ) * 2 - 1;
};


Scene._onResize = () => {
    // Adjust Camera
    Scene.camera.aspect = window.innerWidth / window.innerHeight;
    Scene.camera.updateProjectionMatrix();

    // Adjust Renderer
    Scene.renderer.setSize(window.innerWidth, window.innerHeight);
};

Scene.prepareMesh = (mesh) => {
    if (!mesh) {
        console.warn("No mesh provided!");
        return false;
    }

    // Color properties
    mesh.material.vertexShape = true;
    mesh.material.needsUpdate = true;

    // Initialize vertex colors if they don't exist
    if (!mesh.geometry.attributes.color) {
        console.log("Initializing vertex colors");

        const colorArray = new Float32Array(mesh.geometry.attributes.position.count * 3);
        colorArray.fill(new THREE.Color(0x000000)); // Default white color

        const colorAttr = new THREE.BufferAttribute(colorArray, 3);

        mesh.geometry.setAttribute('color', colorAttr);
    }

    // Compute bounds tree
    if (!mesh.geometry.boundsTree) {
        console.log("Computing bounds tree");
        mesh.geometry.computeBoundsTree();
    }
};

Scene._queryScene = (camera, raycaster) => {
    
}

export default Scene;