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
    // Get faces as array
    console.log(faces.length);
});

```

## License
[MIT](https://choosealicense.com/licenses/mit/)