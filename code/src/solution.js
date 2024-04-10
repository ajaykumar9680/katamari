import * as THREE from 'three';

window.init = async (canvas) => {
  //scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  //infinite grass ground
  const grassTexture = new THREE.TextureLoader().load('assets/img/grass1.jpg');
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(100, 100); //repeat factor for the grass

  const groundGeometry = new THREE.PlaneGeometry(10000, 10000); //ground plane
  const groundMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate horizontal
  scene.add(ground);

  //camera position
  camera.position.set(0, 35, 80);

  // Create the ball (katamari)
  const ballGeometry = new THREE.SphereGeometry(10, 32, 32); //radius and segments
  const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 10, 0); //position to sit on top of the plane
  scene.add(ball);

  // Handle keyboard controls
  const moveSpeed = 0.3;
  const keyboardState = {};
  document.addEventListener('keydown', (event) => {
    keyboardState[event.key] = true;
  });
  document.addEventListener('keyup', (event) => {
    keyboardState[event.key] = false;
  });

  
  function update() {
    const planeSize = 1000; // Size of the plane
    const ballRadius = 10; // Radius of the ball
    const ballPosition = ball.position.clone();
  
    // Handle camera movement
    if (keyboardState['ArrowLeft']) {
      camera.position.x -= moveSpeed;
    }
    if (keyboardState['ArrowRight']) {
      camera.position.x += moveSpeed;
    }
    if (keyboardState['ArrowUp']) {
      camera.position.z -= moveSpeed;
    }
    if (keyboardState['ArrowDown']) {
      camera.position.z += moveSpeed;
    }
  
    // Handle ball movement
    if (keyboardState['ArrowLeft']) {
      ballPosition.x -= moveSpeed;
    }
    if (keyboardState['ArrowRight']) {
      ballPosition.x += moveSpeed;
    }
    if (keyboardState['ArrowUp']) {
      ballPosition.z -= moveSpeed;
    }
    if (keyboardState['ArrowDown']) {
      ballPosition.z += moveSpeed;
    }
  
    // for collision with the plane boundaries
    if (ballPosition.x - ballRadius < -planeSize / 2) {
      ballPosition.x = -planeSize / 2 + ballRadius;
    }
    if (ballPosition.x + ballRadius > planeSize / 2) {
      ballPosition.x = planeSize / 2 - ballRadius;
    }
    if (ballPosition.z - ballRadius < -planeSize / 2) {
      ballPosition.z = -planeSize / 2 + ballRadius;
    }
    if (ballPosition.z + ballRadius > planeSize / 2) {
      ballPosition.z = planeSize / 2 - ballRadius;
    }
  
    // Update the ball's position
    ball.position.copy(ballPosition);
  
    renderer.render(scene, camera);
  }

  // Start the game loop
  window.loop = (dt, canvas, input) => {
    update();
  };
};
