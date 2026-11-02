
import * as THREE from 'three';

// ==========================================
// ABYSS RUN - TEMPLE ESCAPE
// RIVER + STONE BRIDGE + WATERFALL UPDATE
// ==========================================

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x809b91);
scene.fog = new THREE.Fog(0x809b91, 35, 115);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight, 0.1, 200
);
camera.position.set(0, 5, 11);
camera.lookAt(0, 1, -5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// ==========================================
// CSS
// ==========================================

const style = document.createElement('style');

style.textContent = `
    * { box-sizing: border-box; }

    body {
        margin: 0;
        overflow: hidden;
        font-family: Arial, sans-serif;
        background: #18251d;
    }

    canvas { display: block; }

    #gameHUD {
        position: fixed;
        top: 18px;
        left: 20px;
        color: white;
        z-index: 10;
        font-size: 19px;
        font-weight: bold;
        line-height: 1.7;
        text-shadow: 2px 2px 5px black;
    }

    #gameTitle {
        position: fixed;
        top: 20px;
        width: 100%;
        text-align: center;
        color: #ffd46b;
        font-size: 25px;
        font-weight: bold;
        letter-spacing: 4px;
        text-shadow: 2px 2px 8px black;
        pointer-events: none;
    }

    #boulderWarning {
        position: fixed;
        top: 85px;
        width: 100%;
        text-align: center;
        color: #ff7045;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 2px 2px 5px black;
        display: none;
        pointer-events: none;
    }

    #controlsInfo {
        position: fixed;
        bottom: 15px;
        width: 100%;
        text-align: center;
        color: white;
        font-size: 13px;
        text-shadow: 2px 2px 5px black;
        pointer-events: none;
    }

    #gameOverScreen {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        background: rgba(0,0,0,.85);
        text-align: center;
    }

    #gameOverScreen h1 {
        color: #ffc451;
        font-size: 48px;
    }

    #gameOverScreen p { font-size: 22px; }

    #restartButton {
        padding: 14px 38px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, #ffd36b, #c77a16);
        color: #201405;
        font-weight: bold;
        font-size: 18px;
        cursor: pointer;
    }
`;

document.head.appendChild(style);

// ==========================================
// LIGHTING
// ==========================================

scene.add(new THREE.HemisphereLight(0xe8f5e8, 0x354126, 2));

const sunlight = new THREE.DirectionalLight(0xffe0a8, 2.5);
sunlight.position.set(-12, 22, 12);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
scene.add(sunlight);

// ==========================================
// MATERIALS
// ==========================================

const stone = new THREE.MeshStandardMaterial({
    color: 0x95866d,
    roughness: 0.95
});

const darkStone = new THREE.MeshStandardMaterial({
    color: 0x514838,
    roughness: 1
});

const gold = new THREE.MeshStandardMaterial({
    color: 0xffc53d,
    metalness: 0.75,
    roughness: 0.25,
    emissive: 0x704000,
    emissiveIntensity: 0.35
});

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x35542d,
    roughness: 1
});

const wood = new THREE.MeshStandardMaterial({
    color: 0x51301b
});

const fireMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7618,
    emissive: 0xff5100,
    emissiveIntensity: 2
});

// ==========================================
// GROUND AND ROAD
// ==========================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 180),
    groundMaterial
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.16, -40);
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.2, 180),
    new THREE.MeshStandardMaterial({
        color: 0x777267,
        roughness: 1
    })
);
road.position.set(0, -0.03, -40);
road.receiveShadow = true;
scene.add(road);

const laneMarkers = [];

for (let i = 0; i < 30; i++) {
    for (const x of [-1, 1]) {
        const marker = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.025, 2),
            new THREE.MeshStandardMaterial({ color: 0xd1c6a7 })
        );
        marker.position.set(x, 0.09, -i * 6);
        scene.add(marker);
        laneMarkers.push(marker);
    }
}

// ==========================================
// RIVER AND WATER
// ==========================================

const riverMaterial = new THREE.MeshStandardMaterial({
    color: 0x087eae,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.88,
    emissive: 0x00334c,
    emissiveIntensity: 0.35
});

const riverBanksMaterial = new THREE.MeshStandardMaterial({
    color: 0x74674f,
    roughness: 1
});

const foamMaterial = new THREE.MeshStandardMaterial({
    color: 0xc5f5ff,
    emissive: 0x4ca9c4,
    emissiveIntensity: 0.5
});

const rivers = [];
const riverRipples = [];

for (const side of [-1, 1]) {

    // Main river
    const river = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 180),
        riverMaterial
    );

    river.rotation.x = -Math.PI / 2;
    river.position.set(side * 5.65, -0.08, -40);
    scene.add(river);
    rivers.push(river);

    // River bank
    const bank = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.45, 180),
        riverBanksMaterial
    );

    bank.position.set(side * 3.65, 0.02, -40);
    bank.castShadow = true;
    scene.add(bank);

    // Outer river bank
    const outerBank = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.55, 180),
        riverBanksMaterial
    );

    outerBank.position.set(side * 7.85, 0.04, -40);
    scene.add(outerBank);

    // Water ripples
    for (let i = 0; i < 25; i++) {
        const ripple = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7 + Math.random() * 1.2,
                0.025,
                0.08
            ),
            foamMaterial
        );

        ripple.position.set(
            side * (4.4 + Math.random() * 2.5),
            -0.035,
            -i * 7
        );

        scene.add(ripple);
        riverRipples.push(ripple);
    }

    // Bridge side railings
    for (const xOffset of [side * 3.45]) {
        const railing = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.65, 180),
            darkStone
        );

        railing.position.set(xOffset, 0.37, -40);
        scene.add(railing);
    }

    // Stone bridge supports
    for (let i = 0; i < 12; i++) {
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.8, 1.2),
            stone
        );

        support.position.set(side * 3.5, -0.35, -i * 15);
        scene.add(support);
    }
}

// Water flow animation
let waterTime = 0;

function updateWater(delta, speed) {
    waterTime += delta;

    riverRipples.forEach((ripple, index) => {
        ripple.position.z += speed * delta * 1.3;

        if (ripple.position.z > 8) {
            ripple.position.z -= 180;
        }

        ripple.position.x += Math.sin(waterTime * 2 + index) * 0.002;
        ripple.material.opacity = 0.65 + Math.sin(waterTime * 3 + index) * 0.2;
    });

    rivers.forEach((river, index) => {
        river.position.y = -0.08 + Math.sin(waterTime * 2 + index) * 0.012;
    });
}

// ==========================================
// PLAYER
// ==========================================

const player = new THREE.Group();
scene.add(player);

const blue = new THREE.MeshStandardMaterial({ color: 0x1681d2 });
const skin = new THREE.MeshStandardMaterial({ color: 0xd99a70 });
const black = new THREE.MeshStandardMaterial({ color: 0x20232b });

const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.9, 0.4),
    blue
);
body.position.y = 1.15;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 18, 18),
    skin
);
head.position.y = 1.85;
player.add(head);

const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 16, 10),
    black
);
hair.scale.set(1, 0.5, 1);
hair.position.y = 2.02;
player.add(hair);

const arms = [];
const legs = [];

for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.7, 0.22),
        blue
    );
    arm.position.set(side * 0.43, 1.15, 0);
    player.add(arm);
    arms.push(arm);

    const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.65, 0.28),
        black
    );
    leg.position.set(side * 0.19, 0.4, 0);
    player.add(leg);
    legs.push(leg);
}

player.position.set(0, 0, 4);

// ==========================================
// GAME VARIABLES
// ==========================================

const lanes = [-2, 0, 2];

let currentLane = 1;
let targetX = 0;
let isJumping = false;
let jumpVelocity = 0;

let gameRunning = true;
let score = 0;
let coinsCollected = 0;
let speed = 16;
let animationTime = 0;
let spawnTimer = 0;

const obstacles = [];
const coins = [];
const trees = [];
const templeStructures = [];
const animatedFires = [];

// ==========================================
// GIANT ROLLING BOULDER
// ==========================================

const boulder = new THREE.Group();

const boulderMaterial = new THREE.MeshStandardMaterial({
    color: 0x625e55,
    roughness: 1,
    flatShading: true
});

const boulderMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 2),
    boulderMaterial
);

boulderMesh.castShadow = true;
boulderMesh.receiveShadow = true;
boulder.add(boulderMesh);

const crackMaterial = new THREE.MeshStandardMaterial({
    color: 0x292722,
    roughness: 1
});

for (let i = 0; i < 10; i++) {
    const crack = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.8, 0.1),
        crackMaterial
    );

    crack.position.set(
        Math.sin(i * 2.4) * 1.2,
        Math.cos(i * 2.4) * 1.2,
        1.2
    );

    crack.rotation.z = i * 0.7;
    boulder.add(crack);
}

boulder.position.set(0, 1.8, 17);
scene.add(boulder);

let boulderSpeed = 2.8;
let boulderHits = 0;

// ==========================================
// TEMPLE PILLARS
// ==========================================

function createPillar(x, z) {
    const group = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.5, 1.7),
        darkStone
    );
    base.position.y = 0.25;
    group.add(base);

    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.62, 4.3, 10),
        stone
    );
    column.position.y = 2.65;
    column.castShadow = true;
    group.add(column);

    const capital = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 1.8),
        darkStone
    );
    capital.position.y = 4.9;
    group.add(capital);

    for (const y of [1.1, 2.4, 3.7, 4.75]) {
        const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.51, 0.51, 0.12, 10),
            gold
        );
        band.position.y = y;
        group.add(band);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    templeStructures.push(group);
}

for (let z = -85; z <= 10; z += 15) {
    createPillar(-5.3, z);
    createPillar(5.3, z);
}

// ==========================================
// GOLDEN TORCHES
// ==========================================

function createGoldenTorch(x, z) {
    const torch = new THREE.Group();

    const holder = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.35, 0.45),
        gold
    );
    holder.position.y = 1.3;
    torch.add(holder);

    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.11, 1.1, 8),
        wood
    );
    handle.position.y = 1.85;
    torch.add(handle);

    const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.13, 0.3, 12),
        gold
    );
    bowl.position.y = 2.45;
    torch.add(bowl);

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.8, 12),
        fireMaterial
    );
    flame.position.y = 2.95;
    torch.add(flame);

    const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.48, 10),
        new THREE.MeshBasicMaterial({ color: 0xffdc45 })
    );
    innerFlame.position.y = 2.95;
    torch.add(innerFlame);

    const light = new THREE.PointLight(0xff9b26, 3, 10);
    light.position.y = 3;
    torch.add(light);

    torch.position.set(x, 0, z);
    scene.add(torch);
    templeStructures.push(torch);

    animatedFires.push({ flame, innerFlame, light });
}

// ==========================================
// GRAND TEMPLE ENTRANCE
// ==========================================

function createTempleGate(z) {
    const gate = new THREE.Group();

    const leftTower = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 6, 1.4),
        stone
    );
    leftTower.position.set(-3.65, 3, 0);
    leftTower.castShadow = true;
    gate.add(leftTower);

    const rightTower = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 6, 1.4),
        stone
    );
    rightTower.position.set(3.65, 3, 0);
    rightTower.castShadow = true;
    gate.add(rightTower);

    const arch = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 1.2, 1.7),
        darkStone
    );
    arch.position.y = 5.7;
    gate.add(arch);

    const goldArch = new THREE.Mesh(
        new THREE.BoxGeometry(7.9, 0.16, 1.8),
        gold
    );
    goldArch.position.set(0, 5.05, 0);
    gate.add(goldArch);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(5.2, 2.5, 4),
        stone
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 7.2;
    gate.add(roof);

    const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.3, 8),
        gold
    );
    tip.position.y = 9.1;
    gate.add(tip);

    const emblem = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.13, 12, 32),
        gold
    );
    emblem.position.set(0, 5.7, -0.95);
    gate.add(emblem);

    const centerGem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38),
        gold
    );
    centerGem.position.set(0, 5.7, -1.05);
    gate.add(centerGem);

    gate.position.z = z;
    scene.add(gate);
    templeStructures.push(gate);

    createGoldenTorch(-4.5, z - 1);
    createGoldenTorch(4.5, z - 1);
}

createTempleGate(-35);
createTempleGate(-105);

for (let z = -60; z <= 0; z += 20) {
    createGoldenTorch(-4.5, z);
    createGoldenTorch(4.5, z);
}

// ==========================================
// WATERFALL BACKGROUND
// ==========================================

const waterfallGroup = new THREE.Group();

const cliffMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b5544,
    roughness: 1
});

const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 3),
    cliffMaterial
);
cliff.position.set(0, 6.5, 0);
waterfallGroup.add(cliff);

// Main waterfall
const waterfallMaterial = new THREE.MeshStandardMaterial({
    color: 0x43c9ee,
    transparent: true,
    opacity: 0.82,
    emissive: 0x087baf,
    emissiveIntensity: 0.55,
    side: THREE.DoubleSide,
    roughness: 0.15
});

const waterfall = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 12, 8, 12),
    waterfallMaterial
);
waterfall.position.set(0, 5.8, 1.56);
waterfallGroup.add(waterfall);

// Waterfall streams
const waterfallStreams = [];

for (let i = 0; i < 9; i++) {
    const stream = new THREE.Mesh(
        new THREE.BoxGeometry(0.18 + Math.random() * 0.18, 9, 0.08),
        foamMaterial
    );

    stream.position.set(-3.2 + i * 0.8, 5.7, 1.7);
    waterfallGroup.add(stream);
    waterfallStreams.push(stream);
}

// Waterfall splash
const splash = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.3, 2),
    foamMaterial
);
splash.position.set(0, 0.1, 1.5);
waterfallGroup.add(splash);

// Rocks around waterfall
for (let i = 0; i < 8; i++) {
    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.7),
        darkStone
    );

    rock.position.set(
        -7 + Math.random() * 14,
        Math.random() * 1.2,
        1.8
    );

    waterfallGroup.add(rock);
}

waterfallGroup.position.set(0, 0, -105);
scene.add(waterfallGroup);

function updateWaterfall(delta) {
    waterfallStreams.forEach((stream, index) => {
        stream.position.y = 5.7 + Math.sin(waterTime * 3 + index) * 0.18;
        stream.scale.y = 1 + Math.sin(waterTime * 4 + index) * 0.035;
    });

    waterfall.position.x = Math.sin(waterTime * 1.5) * 0.08;
    splash.material.opacity = 0.65 + Math.sin(waterTime * 5) * 0.2;
}

// ==========================================
// JUNGLE TREES
// ==========================================

function createTree(x, z) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.35, 3, 8),
        wood
    );
    trunk.position.y = 1.5;
    tree.add(trunk);

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x20542b,
        roughness: 1
    });

    for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.5 - i * 0.25, 2.5, 8),
            leavesMaterial
        );
        leaves.position.y = 3 + i * 0.8;
        tree.add(leaves);
    }

    tree.position.set(x, 0, z);
    scene.add(tree);
    trees.push(tree);
}

for (let z = -85; z <= 10; z += 10) {
    createTree(-10, z);
    createTree(10, z - 4);
}

// ==========================================
// OBSTACLES
// ==========================================

function createObstacle(lane, z) {
    const group = new THREE.Group();

    const rock = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1),
        darkStone
    );
    rock.position.y = 0.6;
    rock.castShadow = true;
    group.add(rock);

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.15, 1.1),
        stone
    );
    top.position.y = 1.25;
    group.add(top);

    group.position.set(lanes[lane], 0, z);
    scene.add(group);
    obstacles.push({ mesh: group });
}

// ==========================================
// COINS
// ==========================================

function createCoin(lane, z) {
    const coin = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.09, 10, 22),
        gold
    );

    coin.position.set(lanes[lane], 1.2, z);
    coin.castShadow = true;
    scene.add(coin);

    coins.push({ mesh: coin, collected: false });
}

// ==========================================
// INITIAL OBJECTS
// ==========================================

function spawnInitialObjects() {
    for (let i = 0; i < 10; i++) {
        const z = -15 - i * 12;

        if (i % 2 === 0) {
            createObstacle(Math.floor(Math.random() * 3), z);
        }

        createCoin(Math.floor(Math.random() * 3), z - 4);
    }
}

spawnInitialObjects();

// ==========================================
// HUD
// ==========================================

const hud = document.createElement('div');
hud.id = 'gameHUD';
hud.innerHTML = `
    SCORE: <span id="scoreValue">0</span><br>
    COINS: <span id="coinValue">0</span>
`;
document.body.appendChild(hud);

const title = document.createElement('div');
title.id = 'gameTitle';
title.textContent = 'ABYSS RUN - TEMPLE ESCAPE';
document.body.appendChild(title);

const boulderWarning = document.createElement('div');
boulderWarning.id = 'boulderWarning';
boulderWarning.textContent = '⚠ GIANT BOULDER CHASING YOU!';
document.body.appendChild(boulderWarning);

const controls = document.createElement('div');
controls.id = 'controlsInfo';
controls.textContent =
    'A / LEFT: LEFT | D / RIGHT: RIGHT | SPACE / UP: JUMP';
document.body.appendChild(controls);

// ==========================================
// GAME OVER SCREEN
// ==========================================

const gameOverScreen = document.createElement('div');
gameOverScreen.id = 'gameOverScreen';

gameOverScreen.innerHTML = `
    <h1>GAME OVER</h1>
    <p>Your Score: <span id="finalScore">0</span></p>
    <p>Coins: <span id="finalCoins">0</span></p>
    <button id="restartButton">RESTART</button>
`;

document.body.appendChild(gameOverScreen);

// ==========================================
// PLAYER CONTROLS
// ==========================================

function moveLeft() {
    if (!gameRunning) return;

    currentLane = Math.max(0, currentLane - 1);
    targetX = lanes[currentLane];
}

function moveRight() {
    if (!gameRunning) return;

    currentLane = Math.min(2, currentLane + 1);
    targetX = lanes[currentLane];
}

function jump() {
    if (!gameRunning || isJumping) return;

    isJumping = true;
    jumpVelocity = 9;
}

window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) {
        event.preventDefault();
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        moveLeft();
    }

    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        moveRight();
    }

    if (
        event.code === 'ArrowUp' ||
        event.code === 'KeyW' ||
        event.code === 'Space'
    ) {
        jump();
    }
});

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkCollisions() {
    for (const item of obstacles) {
        const dx = Math.abs(item.mesh.position.x - player.position.x);
        const dz = Math.abs(item.mesh.position.z - player.position.z);

        if (
            dx < 0.8 &&
            dz < 0.85 &&
            player.position.y < 0.8
        ) {
            endGame();
            return;
        }
    }

    for (const item of coins) {
        if (item.collected) continue;

        const dx = Math.abs(item.mesh.position.x - player.position.x);
        const dz = Math.abs(item.mesh.position.z - player.position.z);

        if (dx < 0.9 && dz < 1.2) {
            item.collected = true;
            scene.remove(item.mesh);

            coinsCollected++;
            score += 10;

            document.getElementById('coinValue').textContent =
                coinsCollected;
        }
    }
}

// ==========================================
// BOULDER COLLISION
// ==========================================

function checkBoulderCollision() {
    const dx = Math.abs(boulder.position.x - player.position.x);
    const dz = Math.abs(boulder.position.z - player.position.z);

    if (dx < 1.65 && dz < 2.3) {
        endGame();
    }
}

// ==========================================
// GAME OVER
// ==========================================

function endGame() {
    if (!gameRunning) return;

    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCoins').textContent = coinsCollected;

    gameOverScreen.style.display = 'flex';
}

// ==========================================
// RESTART GAME
// ==========================================

function restartGame() {
    obstacles.forEach(item => scene.remove(item.mesh));
    coins.forEach(item => scene.remove(item.mesh));

    obstacles.length = 0;
    coins.length = 0;

    score = 0;
    coinsCollected = 0;
    speed = 16;
    spawnTimer = 0;
    animationTime = 0;

    currentLane = 1;
    targetX = 0;

    player.position.set(0, 0, 4);

    isJumping = false;
    jumpVelocity = 0;

    boulder.position.set(0, 1.8, 17);
    boulder.rotation.set(0, 0, 0);
    boulderSpeed = 2.8;

    boulderWarning.style.display = 'none';

    spawnInitialObjects();

    document.getElementById('scoreValue').textContent = 0;
    document.getElementById('coinValue').textContent = 0;

    gameOverScreen.style.display = 'none';
    gameRunning = true;
}

document.getElementById('restartButton').addEventListener(
    'click',
    restartGame
);

// ==========================================
// UPDATE GAME
// ==========================================

function updateGame(delta) {
    if (!gameRunning) return;

    speed = Math.min(speed + delta * 0.15, 27);
    score += Math.floor(delta * 10);

    document.getElementById('scoreValue').textContent = score;

    // Player movement
    player.position.x +=
        (targetX - player.position.x) * Math.min(1, delta * 12);

    // Jump physics
    if (isJumping) {
        player.position.y += jumpVelocity * delta;
        jumpVelocity -= 22 * delta;

        if (player.position.y <= 0) {
            player.position.y = 0;
            jumpVelocity = 0;
            isJumping = false;
        }
    }

    // Running animation
    animationTime += delta * 12;

    if (!isJumping) {
        legs[0].rotation.x = Math.sin(animationTime) * 0.8;
        legs[1].rotation.x = -Math.sin(animationTime) * 0.8;

        arms[0].rotation.x = -Math.sin(animationTime) * 0.5;
        arms[1].rotation.x = Math.sin(animationTime) * 0.5;

        player.position.y = Math.abs(Math.sin(animationTime)) * 0.06;
    }

    // Temple structures
    templeStructures.forEach(item => {
        item.position.z += speed * delta;

        if (item.position.z > 20) {
            item.position.z -= 110;
        }
    });

    // Trees
    trees.forEach(tree => {
        tree.position.z += speed * delta;

        if (tree.position.z > 15) {
            tree.position.z -= 100;
        }
    });

    // Road markings
    laneMarkers.forEach(marker => {
        marker.position.z += speed * delta;

        if (marker.position.z > 8) {
            marker.position.z -= 180;
        }
    });

    // River and waterfall animation
    updateWater(delta, speed);
    updateWaterfall(delta);

    // Torch animation
    animatedFires.forEach((item, index) => {
        const flicker = Math.sin(animationTime * 2 + index) * 0.1;

        item.flame.scale.y = 1 + flicker;
        item.innerFlame.scale.y = 1 - flicker;
        item.light.intensity = 2.5 + Math.abs(flicker) * 5;
    });

    // Obstacles
    obstacles.forEach(item => {
        item.mesh.position.z += speed * delta;
    });

    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].mesh.position.z > 12) {
            scene.remove(obstacles[i].mesh);
            obstacles.splice(i, 1);
        }
    }

    // Coins
    coins.forEach(item => {
        if (item.collected) return;

        item.mesh.position.z += speed * delta;
        item.mesh.rotation.y += delta * 3;
    });

    for (let i = coins.length - 1; i >= 0; i--) {
        if (
            coins[i].collected ||
            coins[i].mesh.position.z > 12
        ) {
            scene.remove(coins[i].mesh);
            coins.splice(i, 1);
        }
    }

    // Spawn obstacles and coins
    spawnTimer += delta;

    if (spawnTimer > 1.8) {
        spawnTimer = 0;

        const obstacleLane = Math.floor(Math.random() * 3);
        const coinLane = Math.floor(Math.random() * 3);

        createObstacle(obstacleLane, -75);
        createCoin(coinLane, -82);
    }

    // Boulder chase
    boulder.position.z -= boulderSpeed * delta;

    boulder.rotation.x += delta * 2.5;
    boulder.rotation.z += delta * 0.5;

    boulderSpeed = Math.min(boulderSpeed + delta * 0.04, 5);

    boulderWarning.style.display =
        boulder.position.z < 11 ? 'block' : 'none';

    checkBoulderCollision();

    if (!gameRunning) return;

    if (boulder.position.z < 0) {
        boulder.position.z = 17;
        boulderHits++;
    }

    checkCollisions();
}

// ==========================================
// ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updateGame(delta);
    renderer.render(scene, camera);
}

animate();

// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
