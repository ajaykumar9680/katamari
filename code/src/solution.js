import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const footballUrl = new URL('../assets/scene.gltf', import.meta.url);


// global variables
let scene, camera, renderer, ball;

//global variables for controlling ball movement
let ballVelocity = new THREE.Vector3();
let movementSpeed = 0.1;
let rotationSpeed = 0.5; //rotation speed
let ballRadius = 30; //ball size


window.init = async (canvas) => {
    // scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ canvas });

    //skybox
    const skyboxGeometry = new THREE.BoxGeometry(100000, 1000, 100000);
    const textureLoader = new THREE.TextureLoader();
    const textureUrls = [
        'assets/img/river1.jpg',//right
        'assets/img/thunder1.jpg', //left
        'assets/img/thunder1.jpg',//top
        'assets/img/grass1.jpg',//bottom
        'assets/img/thunder1.jpg',//front
        'assets/img/river1.jpg' //back
    ];
    const skyboxMaterials = textureUrls.map(url => new THREE.MeshBasicMaterial({
        map: textureLoader.load(url),
        side: THREE.BackSide // Render on inside of the cube
    }));
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);

    //ground plane (playable area)
    const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x336159, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2; // Rotate horizontal //center one
    scene.add(ground);
    // ground 2
    const groundGeometry2 = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const ground2 = new THREE.Mesh(groundGeometry2, groundMaterial2);
    ground2.rotation.x = Math.PI / 2; // Rotate horizontal
    ground2.position.set(10000, 0, 0); //right to center one
    scene.add(ground2);
    // ground 3
    const groundGeometry3 = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial3 = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    const ground3 = new THREE.Mesh(groundGeometry3, groundMaterial3);
    ground3.rotation.x = Math.PI / 2; // Rotate horizontal
    ground3.position.set(-10000, 0, 0); //left to center one
    scene.add(ground3);
    // ground 4
    const groundGeometry4 = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial4 = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const ground4 = new THREE.Mesh(groundGeometry4, groundMaterial4);
    ground4.rotation.x = Math.PI / 2; // Rotate horizontal
    ground4.position.set(0, 0, -10000); //back to center one
    scene.add(ground4);
    // ground 5
    const groundGeometry5 = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial5 = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const ground5 = new THREE.Mesh(groundGeometry5, groundMaterial5);
    ground5.rotation.x = Math.PI / 2; // Rotate horizontal
    ground5.position.set(10000, 0, -10000); //back right to center one
    scene.add(ground5);


    /* i am saving this for later use now i am getting some errors i will learn to resolve those next***
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('path/to/your/image.jpg'); // Load your image texture
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10); // Adjust repetition as needed
    const groundMaterial = new THREE.MeshBasicMaterial({ map: texture }); */

    // Creating ball (Katamari like ball)
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32); //ball size
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEFA });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    //ball position to be on top of the ground plane
    ball.position.y = ballRadius;
    scene.add(ball);

    const gridHelper = new THREE.GridHelper( 100, 100 );
    scene.add( gridHelper );

    const axesHelper = new THREE.AxesHelper( 50 );
    //scene.add( axesHelper );

    const assetLoader = new GLTFLoader();

    // After loading the model
    assetLoader.load(footballUrl.href, function(gltf) {
    const model = gltf.scene;

    // Scale the model
    model.scale.set(20, 20, 20);

    //model to the scene
    scene.add(model);

    // Position the model
    model.position.y=32;
    model.position.x=100;
    model.rotation.y = Math.PI / 3;


    //lighting to the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0); //light position
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040); //white light
    scene.add(ambientLight);

}, undefined, function(error){console.log(error);});

    //camera position
    camera.position.set(0, 90, 100);
    camera.lookAt(ball.position); // Always look at ball

    //listening for keyboard events
    document.addEventListener('keydown', handleKeyDown);

    // Adding random cubes to the scene
    addRandomCubes();

    // Start the game loop
    loop();
    window.addEventListener('resize', onWindowResize);

};

//to handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game loop function
window.loop = () => {
    requestAnimationFrame(loop);
    //ball.rotation.y=100;
    checkCollision();

    // Move the ball
    ball.position.add(ballVelocity);

    //ball position within the ground area
    const groundSize = 10000;
    const maxPositionX = groundSize / 2 - ballRadius;
    const maxPositionZ = groundSize / 2 - ballRadius;
    ball.position.x = THREE.MathUtils.clamp(ball.position.x, -maxPositionX, maxPositionX);
    ball.position.z = THREE.MathUtils.clamp(ball.position.z, -maxPositionZ, maxPositionZ);


    //let targetRotation = Math.atan2(ballVelocity.x, ballVelocity.z);

    //ball.rotation.x += rotationSpeed * Math.sign(targetRotation - ball.rotation.y);

    //camera position to follow the ball
    camera.position.x = ball.position.x;
    camera.position.z = ball.position.z + 100;
    camera.lookAt(ball.position);
    // Render the scene
    renderer.render(scene, camera);
};

//keyboard input for controlling ball movement
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            ballVelocity.z = -movementSpeed;
            ball.rotation.x-=rotationSpeed;
            //ball.rotation.y=10;
            break;
        case 'ArrowDown':
            ballVelocity.z = movementSpeed;
            ball.rotation.x+=rotationSpeed;
            break;
        case 'ArrowLeft':
            ballVelocity.x = -movementSpeed;
            //ball.rotation.z+=rotationSpeed;
            ball.rotation.y+=rotationSpeed;
            break;
        case 'ArrowRight':
            ballVelocity.x = movementSpeed;
            ball.rotation.y-=rotationSpeed;
            break;
    }
}

// Reset ball when arrow key is released
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            ballVelocity.z = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            ballVelocity.x = 0;
            break;
    }
});
const cubes=[];
let numCubes;
//to add random cubes to the scene
function addRandomCubes() {
  numCubes = Math.floor(Math.random() * 20) + 30;
  const maxPosition = 5000;
  const cubeSize = 30;

  for (let i = 0; i < numCubes; i++) {
      //cube geometry and material
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });

      // Create cube mesh
      const cube = new THREE.Mesh(geometry, material);

      cube.position.x = 2*Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
      cube.position.z = 2*Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
      cube.position.y = cubeSize / 2; 

      //adding the cube to scene
      scene.add(cube);
      cubes.push(cube);
  }
}
function checkCollision() {
    for (let i = 0; i < cubes.length; i++) {
        const cube = cubes[i];
        const distance = ball.position.distanceTo(cube.position);
        const collisionThreshold = ballRadius + (cube.geometry.parameters.width / 2); // Radius of ball + half the size of the cube
        
        if (distance < collisionThreshold) { 
            // Attach cube to the ball
            ball.add(cube);

            //cube's position to be relative to the ball
            cube.position.copy(cube.position.sub(ball.position));

            cubes.splice(i, 1); // Remove cube from the list of cubes
            i--; // Decrement index to account for removed cube
        }
    }
}




