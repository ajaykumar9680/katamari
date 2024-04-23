import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

let scene, camera, renderer, ball;
let ballVelocity = new THREE.Vector3();
let movementSpeed = 1.1;

let ballRadius = 20;
let groundSize = 1000;
let hdrs = [
    '../assets/hdr/golden.hdr', // Center ground
    '../assets/hdr/greentheme3.hdr', // Right ground
    '../assets/hdr/sky2.hdr', // Back ground
    '../assets/hdr/sky2.hdr' // Back right ground
];
let models={
    'football':new URL('../assets/scene.gltf', import.meta.url),
    'barrel':new URL('../assets/models/barel_02.glb', import.meta.url),
    'candle':new URL('../assets/models/candle/brass_candleholders_1k.gltf', import.meta.url),
    'stool':new URL('../assets/models/stool/folding_wooden_stool_1k.gltf', import.meta.url),
    'pineapple':new URL('../assets/models/pineapple/fruit.._pineapple.glb', import.meta.url),
    'jogan':new URL('../assets/models/pineapple/jogan_fruit.glb', import.meta.url),
    'pomelo':new URL('../assets/models/pineapple/pomelo_fruit.glb', import.meta.url),


}

window.init = async (canvas) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ canvas });
    scene.fog = new THREE.Fog(0xffffff, 0, 1000); //fog

    createGround(0x336159, 0, 0, Math.PI / 2, 'assets/img/grass1.jpg',40,'../assets/img/rock1.jpg'); // Center ground
    createGround(0xff0000, 1000, 0, Math.PI / 2,'assets/img/room.avif',30,'../assets/img/arid2_bk.jpg'); // Right ground
    //createGround(0x0000ff, -1000, 0, Math.PI / 2,'assets/img/thunder1.jpg'); // Left ground
    createGround(0xffff00, 0, -1000, Math.PI / 2,'assets/img/river1.jpg',20,'../assets/img/river1.jpg'); // Back ground
    createGround(0x00ffff, 1000, -1000, Math.PI / 2,'assets/img/road.jpg',10,'../assets/img/sky1.jpeg'); // Back right ground

    ball = createBall();
    scene.add(ball);

    //lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); //white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White light
    directionalLight.position.set(0, 1, 0); // From above
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // White light
    pointLight.position.set(0, 50, 0); // Positioning the light
    scene.add(pointLight);



    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    const orbit = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 90, 100);
    camera.lookAt(ball.position);
    orbit.update();
    const axesHelper = new THREE.AxesHelper( 50,50,50 );
    scene.add( axesHelper );

    window.addEventListener('resize', onWindowResize);
    // football model
    loadModel(models['football'].href, new THREE.Vector3(100, 30, 0), new THREE.Vector3(20, 20, 20), new THREE.Euler(0, Math.PI / 3, 0));
    // Load barrel model
    loadModel(models['barrel'].href, new THREE.Vector3(400, 0, 0), new THREE.Vector3(20, 20, 20), new THREE.Euler(0, -Math.PI / 3, 0));
    loadModel(models['candle'].href, new THREE.Vector3(300, 0, 0), new THREE.Vector3(60, 60, 60), new THREE.Euler(0, -Math.PI / 3, 0));
    loadModel(models['stool'].href, new THREE.Vector3(200, 0, 0), new THREE.Vector3(60, 60, 60), new THREE.Euler(0, -Math.PI / 3, 0));
    //loadModel(models['pineapple'].href, new THREE.Vector3(100, 0, 0), new THREE.Vector3(60, 60, 60), new THREE.Euler(0, -Math.PI / 3, 0));

    //loadModel(models['pomelo'].href, new THREE.Vector3(250, 0, 0), new THREE.Vector3(60, 60, 60), new THREE.Euler(0, -Math.PI / 3, 0));

    loadModel(models['jogan'].href, new THREE.Vector3(350, 0, 0), new THREE.Vector3(180, 180, 180), new THREE.Euler(0, -Math.PI / 3, 0));


    
};

function createGround(color, x, z, rotation, texturePath, numCubes,image) {
    const geometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(80,80); //repetition as needed
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = rotation;
    ground.position.set(x, 0, z);
    scene.add(ground);
    addRandomCubes(x, z, numCubes,image);
}


function createBall() {
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('../assets/textures/ball1.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    //const material = new THREE.MeshBasicMaterial({ color: 0x87CEFA });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.y = ballRadius;
    return ball;
}

function loadModel(modelUrl, position, scale, rotation) {
    const loader = new GLTFLoader();
    loader.load(modelUrl, function(gltf) {
        const model = gltf.scene;
        model.scale.set(scale.x, scale.y, scale.z);
        model.position.copy(position);
        model.rotation.copy(rotation);
        scene.add(model);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


let minX = -500 + ballRadius;
let maxX = 500 - ballRadius;
let minZ = -500 + ballRadius;
let maxZ = 450 - ballRadius;
let rotationSpeed = 0.01;
window.loop = (dt,cavas,input) => {
    checkCollision();
    ball.position.add(ballVelocity);

    if (input.keys.has('ArrowUp')) {
        ballVelocity.z = -(movementSpeed * dt * 0.2);
        ball.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -rotationSpeed * dt);
    } 
    if (input.keys.has('ArrowDown')) {
        ballVelocity.z = movementSpeed * dt * 0.2;
        ball.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationSpeed * dt);
    }
    if (input.keys.has('ArrowLeft')) {
        ballVelocity.x = -movementSpeed * dt * 0.2;
        ball.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), rotationSpeed * dt);
    } 
    if (input.keys.has('ArrowRight')) {
        ballVelocity.x = movementSpeed * dt * 0.2;
        ball.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -rotationSpeed * dt);
    }
    
    if(camera.position.x>500 && camera.position.z>-400){
        setback(2);
    }
    else if(camera.position.x>500 &&camera.position.z<-400){
        setback(4);
    }
    else if(camera.position.x<500 && camera.position.z<-400){
        setback(3);
    }
    else if(camera.position.x<500 && camera.position.z>-400){
        setback(1);
    }
    if(cubeCount==10||cubeCount==25 ||cubeCount==5 ||cubeCount==20){
        console.log('cube count: ',cubeCount);
    }


    //ball position within the adjusted bounds
    ball.position.x = THREE.MathUtils.clamp(ball.position.x, minX, maxX);
    ball.position.z = THREE.MathUtils.clamp(ball.position.z, minZ, maxZ);

    camera.position.x = ball.position.x;
    camera.position.z = ball.position.z+100;
    camera.lookAt(ball.position);
    renderer.render(scene, camera);
};



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

function addRandomCubes(positionX, positionZ, numCubes,image) {
    const cubeSize = 15; // Size of cube
    const maxPosition = 500; // Maximum position range
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image); //texture image

    for (let i = 0; i < numCubes; i++) {
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        //const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }); // Random color
        const cube = new THREE.Mesh(geometry, material);
        //random positions within the specified range
        const randomX = positionX + 2 * Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;
        const randomZ = positionZ + 2 * Math.random() * (maxPosition - cubeSize * 2) - maxPosition + cubeSize;

        cube.position.set(randomX, cubeSize / 2, randomZ); // Set cube position
        scene.add(cube); //cube to the scene
        cubes.push(cube);
    }
}

let cubeCount=0

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
            cubeCount += 1;
            //increaseBallSize(cubeCount);
        }
    }
}

function increaseBallSize(cubeCount) {
    ball.scale.set(cubeCount * 0.05 + 1, cubeCount * 0.05 + 1, cubeCount * 0.05 + 1);
}


let n1=1;
let n2=1;
let n3=1;
let n4=1;
function setback(n){
    if(n==1){
        if(n1==1){
        //scene.background=new THREE.Color(0xff0000);
        console.log("ground1");
        /*new RGBELoader().load(hdrs[0],(environmentMap)=>{

            //environmentMap.map=THREE.EquirectangularRefractionMapping;
            scene.background=environmentMap;
            });*/
        n1=n1+1;
        }
        n2=1;n3=1;n4=1;
        if(cubeCount>5 && cubeCount<10){
            maxX=1500-ballRadius;
            if(ball.position.x>500){
                minX=500+ballRadius;
            }
        }
    }
    else if(n==2){
        if(n2==1){
            //scene.background=new THREE.Color(0xff0000);
            console.log("ground2");
            /*new RGBELoader().load(hdrs[1],(environmentMap)=>{
    
                //environmentMap.map=THREE.EquirectangularRefractionMapping;
                scene.background=environmentMap;
                });*/
            n2=n2+1;
            }
            n1=1;n3=1;n4=1;
            if(cubeCount>10){
                //minX=500-ballRadius;
                minZ=-1500+ballRadius; 
                               
            }
    }
    else if(n==3){
        if(n3==1){
            //scene.background=new THREE.Color(0xff0000);
            console.log("ground3");
            //scene.fog = new THREE.Fog(0xffffff, 0, 1500);
            /*new RGBELoader().load(hdrs[2],(environmentMap)=>{
    
                //environmentMap.map=THREE.EquirectangularRefractionMapping;
                scene.background=environmentMap;
                });*/
            n3=n3+1;
            }
            n1=1;n2=1;n4=1;
            console.log(ball.position.z);
    }
    else if(n==4){
        if(n4==1){
            //scene.background=new THREE.Color(0xff0000);
            console.log("ground4");
            /*scene.fog = new THREE.Fog(0xffffff, 0, 1500);
            new RGBELoader().load(hdrs[2],(environmentMap)=>{
    
                //environmentMap.map=THREE.EquirectangularRefractionMapping;
                scene.background=environmentMap;
                });*/
            n4=n4+1;
            }
            n1=1;n2=1;n3=1;
            if(ball.position.z<-500){
                maxZ=-500-ballRadius;
                minX=-500+ballRadius;
            }
    }
}
