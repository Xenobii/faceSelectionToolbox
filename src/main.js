import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

import Toolbox from "./toolbox/toolbox.js";


function main() {
    setupScene();
    setupEventHandlers();
    setupUI();
};

function setupScene() {
    // Dimentions
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(w, h);
    document.body.appendChild(renderer.domElement);

    // Camera
    const fov = 75;
    const aspect = w/h;
    const near = 0.1;
    const far = 10;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0b0ff);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Geometry
    const geometry = new THREE.IcosahedronGeometry(1.0, 10);
    const material = new THREE.MeshStandardMaterial({
        color: 0x909090,
        // wireframe: true,
        flatShading: true,
    });

    // Light
    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Toolbox
    Toolbox.prepareforSelection(mesh, renderer, camera);

    // Render Scene
    function animate(t=0) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
    };
    animate();
};

function setupEventHandlers() {
    let el = document;

    // Setup event hanlders
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

main();