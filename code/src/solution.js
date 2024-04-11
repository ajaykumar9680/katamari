// Import Three.js library
import * as THREE from 'three';

// global variables for Three.js objects
let scene, camera, renderer, ball;

// Define global variables for controlling ball movement
let ballVelocity = new THREE.Vector3();
let movementSpeed = 0.1;
let rotationSpeed = 0.05; // Adjust rotation speed as needed
let ballRadius = 10; // Increase ball size

// Initialize function
window.init = async (canvas) => {
    // Set up Three.js scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas });

    // Create skybox
    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const textureLoader = new THREE.TextureLoader();
    const textureUrls = [
        'assets/img/grass1.jpg',
        'assets/img/grass1.jpg',
        'assets/img/grass1.jpg',
        'assets/img/grass1.jpg',
        'assets/img/grass1.jpg',
        'assets/img/grass1.jpg'
    ];
    const skyboxMaterials = textureUrls.map(url => new THREE.MeshBasicMaterial({
        map: textureLoader.load(url),
        side: THREE.BackSide // Render on the inside of the cube
    }));
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);

    //ground plane (playable area)
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2; // Rotate to be horizontal
    scene.add(ground);

    // Create the ball (Katamari)
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32); // Increase ball size
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    // Adjust ball position to be on top of the ground plane
    ball.position.y = ballRadius;
    scene.add(ball);

    // Set up camera position
    camera.position.set(0, 50, 100);
    camera.lookAt(ball.position); // Always look at the ball

    // Start listening for keyboard events
    document.addEventListener('keydown', handleKeyDown);

    // Add random cubes to the scene
    addRandomCubes();

    // Start the game loop
    loop();
};

// Game loop function
window.loop = () => {
    requestAnimationFrame(loop);

    // Move the ball
    ball.position.add(ballVelocity);

    // Constrain ball position within playable area (inside the skybox)
    const maxPosition = 500 - ballRadius; // Adjust for ball size
    ball.position.x = THREE.MathUtils.clamp(ball.position.x, -maxPosition, maxPosition);
    ball.position.z = THREE.MathUtils.clamp(ball.position.z, -maxPosition, maxPosition);

    // Calculate rotation angle based on ball's movement direction
    let targetRotation = Math.atan2(ballVelocity.x, ballVelocity.z);

    // Smoothly rotate the ball towards the target rotation
    ball.rotation.y += rotationSpeed * Math.sign(targetRotation - ball.rotation.y);

    // Update camera position to follow the ball
    camera.position.x = ball.position.x;
    camera.position.z = ball.position.z + 100; // Adjust camera height
    camera.lookAt(ball.position); // Always look at the ball

    // Render the scene
    renderer.render(scene, camera);
};

// Handle keyboard input for controlling ball movement
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            ballVelocity.z = -movementSpeed; // Move the ball upward
            break;
        case 'ArrowDown':
            ballVelocity.z = movementSpeed; // Move the ball downward
            break;
        case 'ArrowLeft':
            ballVelocity.x = -movementSpeed;
            break;
        case 'ArrowRight':
            ballVelocity.x = movementSpeed;
            break;
    }
}

// Reset ball movement when arrow key is released
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

// Function to add random cubes to the scene
// Function to add random cubes to the scene
// Function to add random cubes to the scene
function addRandomCubes() {
  const numCubes = Math.floor(Math.random() * 20) + 20; // Random number of cubes (5-24)
  const maxPosition = 500; // Maximum position within the playable area
  const cubeSize = 20; // Adjust cube size as needed

  for (let i = 0; i < numCubes; i++) {
      // Create cube geometry and material
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });

      // Create cube mesh
      const cube = new THREE.Mesh(geometry, material);

      // Set random position within the playable area, ensuring the cube is fully inside
      cube.position.x = Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
      cube.position.z = Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
      cube.position.y = cubeSize / 2; // Adjust cube position so that it sits on top of the ground plane

      // Add cube to the scene
      scene.add(cube);
  }
}


