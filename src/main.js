import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import Stats from "stats.js"
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree, MeshBVHHelper} from 'three-mesh-bvh';

import { Lasso, Brush, Toolbox } from "./toolbox/toolbox.js"

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
let brush, lasso;
let toolbox;


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
    const material = new THREE.MeshLambertMaterial({
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

    const selectedFaces = [];

    // Tools
    toolbox = new Toolbox(scene, camera, renderer, mesh);
    toolbox.deactivate();
    toolbox.deactivateBrush();
    toolbox.deactivateLasso();

    toolbox.onSelectionEnd((faces) => {
        console.log(faces.length);
    });

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
    function topRightContainerSetup() {
        
        // Create container
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
            toolbox.deactivateLasso();
            toolbox.activateBrush();
            controls.enabled = false;
        });

        // Lasso Button
        const btnLasso = toolboxPane.addButton({
            title: 'Lasso',
        });
        btnLasso.on('click', () => {
            toolbox.deactivateBrush();
            toolbox.activateLasso();
            controls.enabled = false;
        });

        // None Button
        const btnNone = toolboxPane.addButton({
            title: 'None',
        });
        btnNone.on('click', () => {
            toolbox.deactivateBrush();
            toolbox.deactivateLasso();
            controls.enabled = true;
        });
    }

    function middleRightContainerSetup() {
        // Create container
        const middleRightContainer = document.createElement('div');
        middleRightContainer.id = 'uicanvastr';
        middleRightContainer.style.position = 'absolute';
        middleRightContainer.style.top = '180px';
        middleRightContainer.style.right = '50px';
        middleRightContainer.style.zIndex = '120';
        document.body.appendChild(middleRightContainer);

        // Add history pane
        const histroyPane = new Pane({
            container: middleRightContainer,
            title: 'History',
            expanded: true,
        });

        // Undo button
        const btnUndo = histroyPane.addButton({
            title: 'Undo',
        });
        btnUndo.on('click',  () => {
            toolbox.undo();
        });

        // Redo button
        const btnRedo = histroyPane.addButton({
            title: 'Redo',
        });
        btnRedo.on('click',  () => {
            toolbox.redo();
        });
    }

    function bottomRightContainterSetup() {
        
        // Create container
        const bottomRightContainter = document.createElement('div');
        bottomRightContainter.id = 'uicanvasbr';
        bottomRightContainter.style.position = 'absolute';
        bottomRightContainter.style.bottom = '70px';
        bottomRightContainter.style.right = '50px';
        bottomRightContainter.style.zIndex = '120';
        document.body.appendChild(bottomRightContainter);

        // Add parameter pane 
        const paramsPane = new Pane({
            container: bottomRightContainter,
            title: 'Parameters',
            expanded: true
        });

        // Select Obstructed Faces button
        paramsPane.addBinding(toolbox, 'selectObstructedFaces');
        paramsPane.addBinding(toolbox, 'normalThreshold', {
            min: -1, max: 1
        });
    }

    topRightContainerSetup();
    middleRightContainerSetup();
    bottomRightContainterSetup();

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