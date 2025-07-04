# Face Selection Toolbox

A toolbox for face selection using Three.js and Three Mesh BVH.

## Usage

```js
import { Brush, Lasso } from "./toolbox/toolbox.js"
import { Toolbox } from "./toolbox/toolbox.js"

// Create your THREE.js scene

toolbox = new Toolbox(scene, camera, renderer, mesh);

toolbox.activateBrush();
toolbox.activateLasso();

toolbox.onSelectionEnd((faces) => {
    console.log(faces.length); 
});

```
## Activation
```js
toolbox.activate();   // Activate toolbox functionalities
toolbox.deactivate(); // Deactivate toolbox functionalities
```

## Visibility
```js
const color = "0x00ff00";
toolbox.changeHighlightColor(color); // Change highlight color
 
toolbox.enableHighlights();  // Display highlighted faces
toolbox.disableHighlights(); // Hide highlighted faces

// or

toolbox.toggleHighlights(); // Toggle highlights (true/false)
```

## History
```js
toolbox.undo(); // Undo
toolbox.redo(); // Redo
```
