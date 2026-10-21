// ================================
// 3D AIR BATTLE
// ================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x72bdf5);
scene.fog = new THREE.Fog(0x72bdf5, 40, 180);


// CAMERA
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 6, 18);


// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);


// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(20, 30, 20);
scene.add(sun);


// ================================
// VARIABLES
// ================================

let player;
let enemies = [];
let bullets = [];

let gameRunning = false;

let score = 0;
let health = 100;

let keys = {};

let enemyTimer = 0;
let fireCooldown = 0;


// ================================
// PLAYER PLANE
// ================================

function createPlane(color = 0x1565c0) {

    const plane = new THREE.Group();

    // BODY
    const bodyGeometry = new THREE.CylinderGeometry(
        0.55,
        0.7,
        4,
        12
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3
    });

    const body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.rotation.x = Math.PI / 2;

    plane.add(body);


    // NOSE
    const noseGeometry = new THREE.ConeGeometry(
        0.55,
        1.3,
        12
    );

    const nose = new THREE.Mesh(
        noseGeometry,
        bodyMaterial
    );

    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -2.5;

    plane.add(nose);


    // WINGS
    const wingGeometry = new THREE.BoxGeometry(
        5,
        0.18,
        1.2
    );

    const wing = new THREE.Mesh(
        wingGeometry,
        bodyMaterial
    );

    wing.position.z = 0.3;

    plane.add(wing);


    // TAIL
    const tailGeometry = new THREE.BoxGeometry(
        1.6,
        0.15,
        1
    );

    const tail = new THREE.Mesh(
        tailGeometry,
        bodyMaterial
    );

    tail.position.z = 1.6;

    plane.add(tail);


    // VERTICAL TAIL
    const verticalTailGeometry =
        new THREE.BoxGeometry(0.15, 1.2, 1);

    const verticalTail = new THREE.Mesh(
        verticalTailGeometry,
        bodyMaterial
    );

    verticalTail.position.set(
        0,
        0.6,
        1.4
    );

    plane.add(verticalTail);


    return plane;
}


// ================================
// CREATE PLAYER
// ================================

player = createPlane(0x1565c0);

player.position.set(
    0,
    2,
    10
);

scene.add(player);


// ================================
// CLOUDS
// ================================

function createCloud(x, y, z) {

    const cloud = new THREE.Group();

    for (let i = 0; i < 5; i++) {

        const geometry =
            new THREE.SphereGeometry(
                2 + Math.random(),
                12,
                12
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0xffffff
            });

        const part =
            new THREE.Mesh(
                geometry,
                material
            );

        part.position.set(
            i * 2 - 4,
            Math.random(),
            Math.random()
        );

        cloud.add(part);
    }

    cloud.position.set(x, y, z);

    scene.add(cloud);
}


for (let i = 0; i < 12; i++) {

    createCloud(
        (Math.random() - 0.5) * 100,
        15 + Math.random() * 20,
        -Math.random() * 150
    );

}


// ================================
// BULLET
// ================================

function shoot() {

    if (!gameRunning) return;

    if (fireCooldown > 0) return;

    fireCooldown = 12;

    const geometry =
        new THREE.SphereGeometry(
            0.15,
            8,
            8
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffff00
        });

    const bullet =
        new THREE.Mesh(
            geometry,
            material
        );

    bullet.position.copy(player.position);

    bullet.position.z -= 3;

    scene.add(bullet);

    bullets.push(bullet);
}


// ================================
// ENEMY
// ================================

function createEnemy() {

    const enemy =
        createPlane(0xc62828);

    enemy.position.set(
        (Math.random() - 0.5) * 18,
        Math.random() * 8,
        -80
    );

    enemy.rotation.y = Math.PI;

    scene.add(enemy);

    enemies.push(enemy);
}


// ================================
// EXPLOSION EFFECT
// ================================

function explosion(position) {

    for (let i = 0; i < 12; i++) {

        const geometry =
            new THREE.SphereGeometry(
                0.15,
                6,
                6
            );

        const material =
            new THREE.MeshBasicMaterial({
                color: 0xff6600
            });

        const particle =
            new THREE.Mesh(
                geometry,
                material
            );

        particle.position.copy(position);

        particle.userData.velocity =
            new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );

        scene.add(particle);

        setTimeout(() => {
            scene.remove(particle);
        }, 500);
    }
}


// ================================
// KEYBOARD
// ================================

window.addEventListener("keydown", function(event) {

    keys[event.code] = true;

    if (event.code === "Space") {
        event.preventDefault();
        shoot();
    }

});


window.addEventListener("keyup", function(event) {

    keys[event.code] = false;

});


// ================================
// UPDATE PLAYER
// ================================

function updatePlayer() {

    const speed = 0.35;

    if (
        keys["ArrowLeft"] ||
        keys["KeyA"]
    ) {
        player.position.x -= speed;
    }

    if (
        keys["ArrowRight"] ||
        keys["KeyD"]
    ) {
        player.position.x += speed;
    }

    if (
        keys["ArrowUp"] ||
        keys["KeyW"]
    ) {
        player.position.y += speed;
    }

    if (
        keys["ArrowDown"] ||
        keys["KeyS"]
    ) {
        player.position.y -= speed;
    }


    // LIMITS

    player.position.x =
        Math.max(
            -12,
            Math.min(12, player.position.x)
        );

    player.position.y =
        Math.max(
            -2,
            Math.min(12, player.position.y)
        );


    // Plane tilt

    player.rotation.z =
        -player.position.x * 0.04;

}


// ================================
// UPDATE BULLETS
// ================================

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.position.z -= 1.5;


        if (bullet.position.z < -120) {

            scene.remove(bullet);
            bullets.splice(i, 1);

            continue;
        }


        // COLLISION WITH ENEMY

        for (let j = enemies.length - 1; j >= 0; j--) {

            const enemy = enemies[j];

            const distance =
                bullet.position.distanceTo(
                    enemy.position
                );

            if (distance < 2.5) {

                explosion(enemy.position);

                scene.remove(enemy);
                enemies.splice(j, 1);

                scene.remove(bullet);
                bullets.splice(i, 1);

                score += 10;

                document.getElementById(
                    "score"
                ).textContent = score;

                break;
            }

        }

    }

}


// ================================
// UPDATE ENEMIES
// ================================

function updateEnemies() {

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        enemy.position.z += 0.45;

        // Enemy movement

        enemy.position.x +=
            Math.sin(Date.now() * 0.002 + i) * 0.02;


        // Player collision

        const distance =
            enemy.position.distanceTo(
                player.position
            );

        if (distance < 3) {

            explosion(enemy.position);

            scene.remove(enemy);
            enemies.splice(i, 1);

            health -= 20;

            if (health < 0) {
                health = 0;
            }

            document.getElementById(
                "health"
            ).textContent = health;

            if (health <= 0) {
                endGame();
            }

            continue;
        }


        // Enemy passed player

        if (enemy.position.z > 25) {

            scene.remove(enemy);
            enemies.splice(i, 1);
        }

    }

}


// ================================
// GAME START
// ================================

function startGame() {

    score = 0;
    health = 100;

    document.getElementById(
        "score"
    ).textContent = score;

    document.getElementById(
        "health"
    ).textContent = health;


    // Remove old enemies

    enemies.forEach(enemy => {
        scene.remove(enemy);
    });

    enemies = [];


    // Remove bullets

    bullets.forEach(bullet => {
        scene.remove(bullet);
    });

    bullets = [];


    player.position.set(
        0,
        2,
        10
    );


    gameRunning = true;

    document.getElementById(
        "menu"
    ).classList.add("hidden");

    document.getElementById(
        "gameOver"
    ).classList.add("hidden");
}


// ================================
// GAME OVER
// ================================

function endGame() {

    gameRunning = false;

    document.getElementById(
        "finalScore"
    ).textContent = score;

    document.getElementById(
        "gameOver"
    ).classList.remove("hidden");
}


// ================================
// BUTTONS
// ================================

document.getElementById(
    "startBtn"
).addEventListener(
    "click",
    startGame
);

document.getElementById(
    "restartBtn"
).addEventListener(
    "click",
    startGame
);


// ================================
// GAME LOOP
// ================================

function animate() {

    requestAnimationFrame(animate);


    if (gameRunning) {

        updatePlayer();

        updateBullets();

        updateEnemies();


        // Enemy spawn

        enemyTimer++;

        if (enemyTimer > 70) {

            createEnemy();

            enemyTimer = 0;
        }


        if (fireCooldown > 0) {
            fireCooldown--;
        }


        // Camera follows player

        camera.position.x +=
            (player.position.x - camera.position.x) * 0.05;

        camera.position.y +=
            (player.position.y + 4 - camera.position.y) * 0.05;

    }


    renderer.render(
        scene,
        camera
    );
}

animate();


// ================================
// WINDOW RESIZE
// ================================

window.addEventListener(
    "resize",
    function() {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

// ================================
// MOBILE TOUCH CONTROLS
// ================================

function mobileButton(buttonId, keyName) {

    const button = document.getElementById(buttonId);

    button.addEventListener("touchstart", function(e) {

        e.preventDefault();

        keys[keyName] = true;

    }, { passive: false });


    button.addEventListener("touchend", function(e) {

        e.preventDefault();

        keys[keyName] = false;

    }, { passive: false });


    button.addEventListener("touchcancel", function(e) {

        e.preventDefault();

        keys[keyName] = false;

    }, { passive: false });
}


// Movement

mobileButton("upBtn", "ArrowUp");

mobileButton("downBtn", "ArrowDown");

mobileButton("leftBtn", "ArrowLeft");

mobileButton("rightBtn", "ArrowRight");


// FIRE

const fireButton =
    document.getElementById("fireBtn");

fireButton.addEventListener(
    "touchstart",
    function(e) {

        e.preventDefault();

        shoot();

    },
    { passive: false }
);