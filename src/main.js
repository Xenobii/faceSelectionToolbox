import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import Stats from "stats.js"
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree, MeshBVHHelper} from 'three-mesh-bvh';

import Toolbox from "./toolbox/toolbox.js";
import Tools from "./toolbox/toolbox.js"

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;


let params = {
    visualizeBounds: false,
    visualBoundsDepth: 10,
};

let stats;
let scene, camera, renderer, controls, boundsViz;
let mesh;


function init() {
    const bgColor = 0x263238 / 2;

    // Renderer
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( bgColor, 1 );
    document.body.appendChild( renderer.domElement );

    // Scene setup
    scene = new THREE.Scene();
    
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    // Geometry setup
    const radius = 1;
    const tube = 0.4;
    const tubularSegments = 400;
    const radialSegments = 100;

    const knotGeometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments);
    const material = new THREE.MeshStandardMaterial({
        color: 0x909090,
        // flatshading: true,
    })
    mesh = new THREE.Mesh(knotGeometry, material);
    mesh.geometry.computeBoundsTree();
    scene.add(mesh);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 50);
    camera.position.set(3, 3, 3);
    camera.far = 100;
    camera.updateProjectionMatrix();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    
    // Stats
    stats = new Stats();
    document.body.appendChild(stats.dom);

    const tools = new Tools(scene, camera, renderer, mesh);
};

function setupEventHandlers() {
    // On resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false );
};

function setupUI() {
    // Create containers
    const topRightContainer = document.createElement('div');
    topRightContainer.id = 'uicanvastr';
    topRightContainer.style.position = 'absolute';
    topRightContainer.style.top = '50px';
    topRightContainer.style.right = '50px';
    topRightContainer.style.zIndex = '120';
    document.body.appendChild(topRightContainer);

    // Add toolbox pane
    const toolboxPane = new Pane({
        container: topRightContainer,
        title: 'Toolbox',
        expanded: true,
    });

    // Brush Button
    const btnBrush = toolboxPane.addButton({
        title: 'Brush',
    });
    btnBrush.on('click', () => {
        // What it does
    });

    // Eraser Button
    const btnEraser = toolboxPane.addButton({
        title: 'Eraser',
    });
    btnEraser.on('click', () => {
        // What it does
    });

    // Lasso Button
    const btnLasso = toolboxPane.addButton({
        title: 'Lasso',
    });
    btnLasso.on('click', () => {
        // What it does
    });
};

function updateFromOptions() {
    if (boundsViz && !params.visualizeBounds) {
        scene.remove(boundsViz);
        boundsViz = null;
    }

    if (!boundsViz && params.visualizeBounds) {
        boundsViz = new MeshBVHHelper(mesh);
        scene.add(boundsViz);
    }

    if (boundsViz) {
        boundsViz.depth = params.visualBoundsDepth;
    }
}

let lastTime = window.performance.now();
function render () {
    const delta = window.performance.now() - lastTime;
    lastTime = window.performance.now();
    
    stats.begin();

    if (boundsViz) boundsViz.update();

    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(render);
};


init();
setupUI();
setupEventHandlers();
updateFromOptions();
render();