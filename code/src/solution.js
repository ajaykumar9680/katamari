import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const footballUrl = new URL('../assets/scene.gltf', import.meta.url);

let scene, camera, renderer, ball;
let ballVelocity = new THREE.Vector3();
let movementSpeed = 0.1;
let rotationSpeed = 0.5;
let ballRadius = 30;
let groundSize = 1000;
let cubeSize = 30;
let numCubes;

window.init = async (canvas) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ canvas });

    createGround(0x336159, 0, 0, Math.PI / 2, 'assets/img/sky1.jpeg'); // Center ground
    createGround(0xff0000, 1000, 0, Math.PI / 2,'assets/img/river1.jpg'); // Right ground
    createGround(0x0000ff, -1000, 0, Math.PI / 2,'assets/img/thunder1.jpg'); // Left ground
    createGround(0xffff00, 0, -1000, Math.PI / 2,'assets/img/sky1.jpeg'); // Back ground
    createGround(0x00ffff, 1000, -1000, Math.PI / 2,'assets/img/sky1.jpeg'); // Back right ground

    ball = createBall();
    scene.add(ball);

    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    const orbit = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 90, 100);
    camera.lookAt(ball.position);
    orbit.update();

    document.addEventListener('keydown', handleKeyDown);

    addRandomCubes();
    loop();
    window.addEventListener('resize', onWindowResize);

    loadModel();
};

function createGround(color, x, z, rotation, texturePath) {
    const geometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10); // Adjust repetition as needed
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = rotation;
    ground.position.set(x, 0, z);
    scene.add(ground);
}


function createBall() {
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x87CEFA });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.y = ballRadius;
    return ball;
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load(footballUrl.href, function(gltf) {
        const model = gltf.scene;
        model.scale.set(20, 20, 20);
        model.position.y = 32;
        model.position.x = 100;
        model.rotation.y = Math.PI / 3;
        scene.add(model);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 0);
        scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.loop = () => {
    requestAnimationFrame(loop);
    checkCollision();
    ball.position.add(ballVelocity);

    // Define the maximum and minimum positions for the ball
    let minX = -1000 + ballRadius;
    let maxX = 1000 - ballRadius;
    let minZ = -1000 + ballRadius;
    let maxZ = 1000 - ballRadius;

    // Check for each ground's position and adjust the bounds accordingly
    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object !== ball) {
            const objectPos = object.position;
            minX = Math.min(minX, objectPos.x - groundSize / 2 + ballRadius);
            maxX = Math.max(maxX, objectPos.x + groundSize / 2 - ballRadius);
            minZ = Math.min(minZ, objectPos.z - groundSize / 2 + ballRadius);
            maxZ = Math.max(maxZ, objectPos.z + groundSize / 2 - ballRadius);
        }
    });

    // Clamp ball position within the adjusted bounds
    ball.position.x = THREE.MathUtils.clamp(ball.position.x, minX, maxX);
    ball.position.z = THREE.MathUtils.clamp(ball.position.z, minZ, maxZ);

    camera.position.x = ball.position.x;
    camera.position.z = ball.position.z + 100;
    camera.lookAt(ball.position);
    renderer.render(scene, camera);
};


function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            ballVelocity.z = -movementSpeed;
            ball.rotation.x -= rotationSpeed;
            break;
        case 'ArrowDown':
            ballVelocity.z = movementSpeed;
            ball.rotation.x += rotationSpeed;
            break;
        case 'ArrowLeft':
            ballVelocity.x = -movementSpeed;
            ball.rotation.y += rotationSpeed;
            break;
        case 'ArrowRight':
            ballVelocity.x = movementSpeed;
            ball.rotation.y -= rotationSpeed;
            break;
    }
}

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

const cubes = [];

function addRandomCubes() {
    numCubes = Math.floor(Math.random() * 20) + 30;
    const maxPosition = 500;
    for (let i = 0; i < numCubes; i++) {
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = 2 * Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
        cube.position.z = 2 * Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
        cube.position.y = cubeSize / 2;
        scene.add(cube);
        cubes.push(cube);
    }
}

function checkCollision() {
    for (let i = 0; i < cubes.length; i++) {
        const cube = cubes[i];
        const distance = ball.position.distanceTo(cube.position);
        const collisionThreshold = ballRadius + (cube.geometry.parameters.width / 2);
        if (distance < collisionThreshold) {
            ball.add(cube);
            cube.position.copy(cube.position.sub(ball.position));
            cubes.splice(i, 1);
            i--;
        }
    }
}
