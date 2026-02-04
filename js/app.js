import * as THREE from 'three';

// ============================================
// TEXT CONFIG - Edit all text content here!
// ============================================
const TEXT = {
  // Loading screen
  loader: 'loading...',

  // Intro screen
  intro: {
    title: 'hey simonne',
    subtitle: 'i planned us a perfect day.',
    startButton: 'let\'s go'
  },

  // Scene content (in order: cafe → driving → cat → terrace → paneer)
  scenes: {
    cafe: {
      text: 'our day starts at bombon.',
      subtext: 'turkish eggs and you - my two favorite things.',
      hint: 'click the coffee',
      interaction: 'perfect warmth'
    },
    driving: {
      text: 'then i drive you around in the afternoon sun.',
      subtext: 'my little passenger princess.',
      hint: 'click the car',
      interaction: 'beep beep'
    },
    cat: {
      text: 'we come home and there she is, sunbathing.',
      subtext: 'she tolerates me now. i think.',
      hint: 'click the cat',
      interaction: 'purrrr'
    },
    terrace: {
      text: 'uno on the terrace. no mercy.',
      subtext: 'you cheat. i let you win anyway.',
      hint: 'click the cards',
      interaction: '+4. sorry not sorry.'
    },
    paneer: {
      text: 'and we end with the best paneer chilly in pune.',
      subtext: 'asia kitchen. still undefeated.',
      hint: 'click the dish',
      interaction: 'numbing good'
    }
  },

  // Continue button
  continueButton: 'continue',

  // Finale screen
  finale: {
    question: 'that\'s our perfect day. will you be my valentine?',
    yesButton: 'yes',
    noButton: 'no',
    noButtonAfter: 'okay fine, yes',
    yesResponse: 'i knew you\'d say yes.<br><br>i love you, simonne.'
  }
};

// Scene order (change this array to reorder scenes)
const SCENE_ORDER = ['cafe', 'driving', 'cat', 'terrace', 'paneer'];

// Build sceneData from config
const sceneData = SCENE_ORDER.map(id => ({
  id,
  ...TEXT.scenes[id]
}));

// ============================================
// APP STATE
// ============================================
const state = {
  currentScene: 0,
  scenes: [],
  isTransitioning: false,
  mouseVec: new THREE.Vector2(),
  raycaster: new THREE.Raycaster(),
  hasInteracted: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
  loader: document.getElementById('loader'),
  loaderProgress: document.querySelector('.loader-progress'),
  intro: document.getElementById('intro'),
  startBtn: document.getElementById('start-btn'),
  sceneContainer: document.getElementById('scene-container'),
  canvas: document.getElementById('canvas'),
  sceneText: document.getElementById('scene-text'),
  nextBtn: document.getElementById('next-btn'),
  finale: document.getElementById('finale'),
  finaleText: document.getElementById('finale-text'),
  yesBtn: document.getElementById('yes-btn'),
  noBtn: document.getElementById('no-btn')
};

// ============================================
// THREE.JS SETUP
// ============================================
let renderer, camera, clock;
let currentSceneObj = null;

function initThree() {
  renderer = new THREE.WebGLRenderer({
    canvas: elements.canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  clock = new THREE.Clock();

  window.addEventListener('resize', onResize);
  window.addEventListener('click', handleInteraction);
  window.addEventListener('touchstart', handleInteraction);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// INTERACTION HANDLING
// ============================================

function handleInteraction(event) {
  if (!currentSceneObj || state.hasInteracted) return;

  // Get mouse/touch position
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  state.mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
  state.mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;

  const { scene, animData, index } = currentSceneObj;
  state.raycaster.setFromCamera(state.mouseVec, camera);

  // Scene-specific interactions
  switch (index) {
    case 0: // Cafe - click coffee
      if (animData.cups) {
        const hits = state.raycaster.intersectObjects(animData.cups, true);
        if (hits.length > 0) {
          triggerCafeInteraction(animData);
        }
      }
      break;
    case 1: // Driving - click car
      if (animData.car) {
        const hits = state.raycaster.intersectObjects([animData.car], true);
        if (hits.length > 0) {
          triggerCarInteraction(animData);
        }
      }
      break;
    case 2: // Cat - click cat
      if (animData.cat) {
        const hits = state.raycaster.intersectObjects([animData.cat], true);
        if (hits.length > 0) {
          triggerCatInteraction(animData, scene);
        }
      }
      break;
    case 3: // Terrace - click cards
      if (animData.cards) {
        const hits = state.raycaster.intersectObjects([animData.cards], true);
        if (hits.length > 0) {
          triggerTerraceInteraction(animData);
        }
      }
      break;
    case 4: // Paneer - click dish
      if (animData.dish) {
        const hits = state.raycaster.intersectObjects([animData.dish], true);
        if (hits.length > 0) {
          triggerPaneerInteraction(animData);
        }
      }
      break;
  }
}

function triggerCafeInteraction(animData) {
  state.hasInteracted = true;
  animData.steamActive = true;
  showInteractionText(TEXT.scenes.cafe.interaction);
}

function triggerCarInteraction(animData) {
  state.hasInteracted = true;
  animData.honk = true;
  showInteractionText(TEXT.scenes.driving.interaction);
}

function triggerCatInteraction(animData, scene) {
  state.hasInteracted = true;
  animData.catPurring = true;

  // Create floating hearts
  animData.hearts = [];
  for (let i = 0; i < 5; i++) {
    const heart = createHeart();
    heart.position.set(
      animData.cat.position.x + (Math.random() - 0.5) * 1,
      animData.cat.position.y + 0.5,
      animData.cat.position.z + (Math.random() - 0.5) * 1
    );
    heart.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      0.02 + Math.random() * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    heart.userData.life = 1;
    scene.add(heart);
    animData.hearts.push(heart);
  }

  showInteractionText(TEXT.scenes.cat.interaction);
}

function triggerTerraceInteraction(animData) {
  state.hasInteracted = true;
  animData.cardFlip = true;
  showInteractionText(TEXT.scenes.terrace.interaction);
}

function triggerPaneerInteraction(animData) {
  state.hasInteracted = true;
  animData.dishGlow = true;
  showInteractionText(TEXT.scenes.paneer.interaction);
}

function showInteractionText(text) {
  const interactionEl = document.createElement('p');
  interactionEl.className = 'interaction-text';
  interactionEl.textContent = text;
  elements.sceneText.appendChild(interactionEl);
  setTimeout(() => interactionEl.classList.add('visible'), 50);
}

function createHeart() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y + 0.1);
  shape.bezierCurveTo(x + 0.1, y + 0.2, x + 0.2, y + 0.1, x + 0.2, y);
  shape.bezierCurveTo(x + 0.2, y - 0.15, x, y - 0.25, x, y - 0.25);
  shape.bezierCurveTo(x, y - 0.25, x - 0.2, y - 0.15, x - 0.2, y);
  shape.bezierCurveTo(x - 0.2, y + 0.1, x - 0.1, y + 0.2, x, y + 0.1);

  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide });
  const heart = new THREE.Mesh(geo, mat);
  heart.scale.setScalar(0.5);
  return heart;
}

// ============================================
// SCENE CREATORS
// ============================================

// Helper: Create low-poly material
function createMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.1
  });
}

// Scene 1: Cafe (Bombon - Turkish eggs, cozy pillows, big windows)
function createCafeScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5e6d3); // Warm cream background
  scene.fog = new THREE.Fog(0xf5e6d3, 15, 40);

  // Warm morning light
  const ambient = new THREE.AmbientLight(0xfff5e6, 0.6);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xfffaf0, 0.8);
  sunLight.position.set(10, 15, 10);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = createMaterial(0x8b7355);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Cozy seating area (like Bombon)
  const seating = createCozySeating();
  seating.position.set(0, 0, 0);
  scene.add(seating);

  // Big window behind
  const windowFrame = createCafeWindow();
  windowFrame.position.set(0, 0, -3);
  scene.add(windowFrame);

  // Coffee table with Turkish eggs setup
  const table = createCafeTableWithFood();
  table.position.set(0, 0, 1.5);
  scene.add(table);

  // Coffee cups (for interaction)
  const cups = [];
  [-0.3, 0.3].forEach(x => {
    const cup = createCoffeeCup();
    cup.position.set(x, 0.65, 1.5);
    scene.add(cup);
    cups.push(cup);
  });

  camera.position.set(3, 2, 5);
  camera.lookAt(0, 0.8, 0);

  const animData = {
    time: 0,
    cups,
    steamParticles: [],
    steamActive: false
  };

  return { scene, animData };
}

function createCozySeating() {
  const seating = new THREE.Group();

  // Base couch (dark wicker look)
  const couchBase = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.5, 1.2),
    createMaterial(0x3d3530)
  );
  couchBase.position.set(0, 0.25, 0);
  couchBase.castShadow = true;
  seating.add(couchBase);

  // Couch back
  const couchBack = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 0.3),
    createMaterial(0x3d3530)
  );
  couchBack.position.set(0, 0.75, -0.45);
  couchBack.castShadow = true;
  seating.add(couchBack);

  // Cream cushions
  const cushionMat = createMaterial(0xf5f0e6);
  const cushion1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.25, 0.9),
    cushionMat
  );
  cushion1.position.set(0, 0.55, 0.05);
  cushion1.castShadow = true;
  seating.add(cushion1);

  // Back cushions (textured fringe pillows - cream and brown)
  const pillowColors = [0xf5f0e6, 0xc4a574, 0xf5f0e6, 0x8b7355];
  [-1, -0.35, 0.35, 1].forEach((x, i) => {
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.5, 0.25),
      createMaterial(pillowColors[i])
    );
    pillow.position.set(x, 0.9, -0.25);
    pillow.rotation.z = (Math.random() - 0.5) * 0.15;
    pillow.castShadow = true;
    seating.add(pillow);
  });

  return seating;
}

function createCafeWindow() {
  const windowGroup = new THREE.Group();

  // Window frame (black metal)
  const frameMat = createMaterial(0x1a1a1a);

  // Main frame
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 0.1), frameMat);
  frameTop.position.set(0, 3.5, 0);
  windowGroup.add(frameTop);

  const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 0.1), frameMat);
  frameBottom.position.set(0, 0.5, 0);
  windowGroup.add(frameBottom);

  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), frameMat);
  frameLeft.position.set(-2.5, 2, 0);
  windowGroup.add(frameLeft);

  const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), frameMat);
  frameRight.position.set(2.5, 2, 0);
  windowGroup.add(frameRight);

  // Vertical dividers
  [-1.25, 0, 1.25].forEach(x => {
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3, 0.05), frameMat);
    divider.position.set(x, 2, 0);
    windowGroup.add(divider);
  });

  // Window glass (slightly tinted)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xc5e6d3,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), glassMat);
  glass.position.set(0, 2, -0.05);
  windowGroup.add(glass);

  // Trees visible through window
  for (let i = 0; i < 4; i++) {
    const tree = createSimpleTree();
    tree.position.set(-3 + i * 2 + Math.random(), 0, -2);
    tree.scale.setScalar(0.6 + Math.random() * 0.3);
    windowGroup.add(tree);
  }

  return windowGroup;
}

function createSimpleTree() {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.5, 6),
    createMaterial(0x4a3728)
  );
  trunk.position.y = 0.75;
  tree.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(1, 8, 8),
    createMaterial(0x3d7a3d)
  );
  foliage.position.y = 2;
  foliage.scale.set(1, 1.2, 1);
  tree.add(foliage);

  return tree;
}

function createCafeTableWithFood() {
  const table = new THREE.Group();

  // Small round table
  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.05, 12),
    createMaterial(0x2a2520)
  );
  tableTop.position.y = 0.6;
  tableTop.castShadow = true;
  table.add(tableTop);

  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.6, 8),
    createMaterial(0x1a1a1a)
  );
  tableLeg.position.y = 0.3;
  table.add(tableLeg);

  // Turkish eggs plate
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.22, 0.03, 12),
    createMaterial(0xfafafa)
  );
  plate.position.set(0, 0.64, 0);
  table.add(plate);

  // Yogurt base
  const yogurt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12),
    createMaterial(0xfff8f0)
  );
  yogurt.position.set(0, 0.66, 0);
  table.add(yogurt);

  // Egg yolks
  [-0.06, 0.06].forEach(x => {
    const yolk = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      createMaterial(0xffa500)
    );
    yolk.position.set(x, 0.68, 0);
    yolk.scale.y = 0.5;
    table.add(yolk);
  });

  // Chili oil drizzle (red dots)
  for (let i = 0; i < 6; i++) {
    const oil = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 6, 6),
      createMaterial(0xcc3300)
    );
    const angle = (i / 6) * Math.PI * 2;
    oil.position.set(
      Math.cos(angle) * 0.12,
      0.67,
      Math.sin(angle) * 0.12
    );
    table.add(oil);
  }

  return table;
}

function createCoffeeCup() {
  const cup = new THREE.Group();

  const cupBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.12, 12),
    createMaterial(0xfafafa)
  );
  cupBody.castShadow = true;
  cup.add(cupBody);

  // Coffee inside
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.02, 12),
    createMaterial(0x3a2a1a)
  );
  coffee.position.y = 0.04;
  cup.add(coffee);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.015, 8, 12, Math.PI),
    createMaterial(0xfafafa)
  );
  handle.position.set(0.1, 0, 0);
  handle.rotation.y = Math.PI / 2;
  cup.add(handle);

  return cup;
}

// Scene 2: Driving (Sunny afternoon, Honda City)
function createDrivingScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sunny blue sky
  scene.fog = new THREE.Fog(0x87ceeb, 30, 100);

  // Bright sunlight
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xfffaf0, 1);
  sunLight.position.set(20, 30, 10);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = createMaterial(0x7caa5a); // Grass green
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road
  const roadGeo = new THREE.PlaneGeometry(8, 200);
  const roadMat = createMaterial(0x3a3a3a);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  scene.add(road);

  // Road lines
  for (let i = -100; i < 100; i += 8) {
    const lineGeo = new THREE.PlaneGeometry(0.15, 3);
    const lineMat = createMaterial(0xffffff);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.02, i);
    scene.add(line);
  }

  // Honda City (white sedan)
  const car = createHondaCity();
  car.position.set(0, 0, 0);
  scene.add(car);

  // Trees along the road (green, leafy for sunny day)
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const tree = createSunnyTree();
    tree.position.set(
      side * (8 + Math.random() * 10),
      0,
      -50 + i * 6 + Math.random() * 2
    );
    tree.scale.setScalar(0.8 + Math.random() * 0.4);
    scene.add(tree);
  }

  // Sun in the sky
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffdd00 })
  );
  sun.position.set(30, 40, -30);
  scene.add(sun);

  // Clouds
  for (let i = 0; i < 8; i++) {
    const cloud = createCloud();
    cloud.position.set(
      (Math.random() - 0.5) * 80,
      15 + Math.random() * 10,
      -30 + Math.random() * 30
    );
    cloud.scale.setScalar(1 + Math.random() * 1.5);
    scene.add(cloud);
  }

  camera.position.set(8, 4, 12);
  camera.lookAt(car.position);

  const animData = {
    car,
    time: 0,
    honk: false
  };

  return { scene, animData };
}

function createHondaCity() {
  const car = new THREE.Group();

  // Main body (sedan shape - longer)
  const bodyGeo = new THREE.BoxGeometry(1.8, 0.6, 4.5);
  const bodyMat = createMaterial(0xf8f8f8);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  car.add(body);

  // Cabin (sloped for sedan)
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.55, 2.2);
  const cabinMat = createMaterial(0xffffff);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.05, -0.3);
  cabin.castShadow = true;
  car.add(cabin);

  // Windows (dark tint)
  const windowMat = createMaterial(0x1a2030);

  // Front windshield (sloped)
  const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.45, 0.08),
    windowMat
  );
  frontWindow.position.set(0, 1, 0.75);
  frontWindow.rotation.x = 0.25;
  car.add(frontWindow);

  // Rear window
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.4, 0.08),
    windowMat
  );
  rearWindow.position.set(0, 1, -1.35);
  rearWindow.rotation.x = -0.2;
  car.add(rearWindow);

  // Side windows
  [-0.81, 0.81].forEach(x => {
    const sideWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.35, 1.5),
      windowMat
    );
    sideWindow.position.set(x, 1, -0.3);
    car.add(sideWindow);
  });

  // Chrome trunk strip (Honda City signature)
  const chromeStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.06, 0.08),
    createMaterial(0xc0c0c0)
  );
  chromeStrip.position.set(0, 0.85, -2.25);
  car.add(chromeStrip);

  // Shark fin antenna
  const antenna = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.15, 4),
    createMaterial(0x1a1a1a)
  );
  antenna.position.set(0, 1.35, -0.8);
  antenna.rotation.x = -0.2;
  car.add(antenna);

  // Honda badge (back)
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.12, 0.02),
    createMaterial(0xc0c0c0)
  );
  badge.position.set(0, 0.7, -2.26);
  car.add(badge);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12);
  const wheelMat = createMaterial(0x1a1a1a);
  const hubMat = createMaterial(0x808080);

  const wheelPositions = [
    [-0.85, 0.32, 1.3],
    [0.85, 0.32, 1.3],
    [-0.85, 0.32, -1.3],
    [0.85, 0.32, -1.3]
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    wheel.castShadow = true;
    car.add(wheel);

    // Hub cap
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.23, 8),
      hubMat
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(...pos);
    car.add(hub);
  });

  // Headlights
  const headlightMat = createMaterial(0xffffee);
  [-0.55, 0.55].forEach(x => {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.15, 0.08),
      headlightMat
    );
    headlight.position.set(x, 0.55, 2.26);
    car.add(headlight);
  });

  // Taillights
  const taillightMat = createMaterial(0xcc2222);
  [-0.6, 0.6].forEach(x => {
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.12, 0.08),
      taillightMat
    );
    taillight.position.set(x, 0.65, -2.26);
    car.add(taillight);
  });

  // Side mirrors
  [-0.95, 0.95].forEach(x => {
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.12),
      createMaterial(0xf8f8f8)
    );
    mirror.position.set(x, 0.9, 0.6);
    car.add(mirror);
  });

  return car;
}

function createSunnyTree() {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6);
  const trunkMat = createMaterial(0x5a4a3a);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  tree.add(trunk);

  // Leafy canopy (multiple spheres for fuller look)
  const foliageMat = createMaterial(0x4a8a3a);

  const positions = [
    [0, 3.5, 0, 1.5],
    [-0.8, 3, 0.4, 1],
    [0.7, 3.2, -0.3, 1.1],
    [0, 4.2, 0, 1]
  ];

  positions.forEach(([x, y, z, s]) => {
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(s, 8, 8),
      foliageMat
    );
    foliage.position.set(x, y, z);
    foliage.castShadow = true;
    tree.add(foliage);
  });

  return tree;
}

function createCloud() {
  const cloud = new THREE.Group();
  const cloudMat = createMaterial(0xffffff);

  const positions = [
    [0, 0, 0, 2],
    [1.5, 0.3, 0, 1.5],
    [-1.5, 0.2, 0, 1.6],
    [0.8, -0.2, 0.5, 1.3],
    [-0.7, -0.1, -0.4, 1.4]
  ];

  positions.forEach(([x, y, z, s]) => {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(s, 8, 8),
      cloudMat
    );
    puff.position.set(x, y, z);
    cloud.add(puff);
  });

  return cloud;
}

// Scene 3: Cat (Sunbathing - white with black patches)
function createCatScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sunny sky

  // Bright sunlight
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xfffaf0, 1);
  sunLight.position.set(10, 20, 5);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Wooden deck floor (like the terrace photo)
  const floorGeo = new THREE.PlaneGeometry(15, 15);
  const floorMat = createMaterial(0x9a8a6a);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Wood plank lines
  for (let i = -7; i < 7; i++) {
    const plankLine = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.02, 0.05),
      createMaterial(0x7a6a5a)
    );
    plankLine.position.set(0, 0.01, i);
    scene.add(plankLine);
  }

  // Cat (white with black patches, lying in sun)
  const cat = createCowCat();
  cat.position.set(0, 0, 0);
  cat.rotation.y = -0.3;
  scene.add(cat);

  // Sun patch on the floor
  const sunPatch = new THREE.Mesh(
    new THREE.CircleGeometry(2, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfff8e0,
      transparent: true,
      opacity: 0.3
    })
  );
  sunPatch.rotation.x = -Math.PI / 2;
  sunPatch.position.set(0.5, 0.02, 0);
  scene.add(sunPatch);

  // Cardboard box nearby
  const box = createCardboardBox();
  box.position.set(2, 0, 1);
  box.rotation.y = 0.3;
  scene.add(box);

  // Some plants in the background
  for (let i = 0; i < 3; i++) {
    const plant = createPottedPlant();
    plant.position.set(-4 + i * 2, 0, -4);
    scene.add(plant);
  }

  camera.position.set(2, 2.5, 5);
  camera.lookAt(cat.position);

  const animData = {
    cat,
    time: 0,
    catPurring: false,
    hearts: []
  };

  return { scene, animData };
}

function createCowCat() {
  const cat = new THREE.Group();

  const whiteMat = createMaterial(0xfafafa);
  const blackMat = createMaterial(0x1a1a1a);
  const pinkMat = createMaterial(0xffb6c1);

  // Body (white, lying down/stretched)
  const bodyGeo = new THREE.SphereGeometry(0.5, 8, 8);
  bodyGeo.scale(1.2, 0.7, 1.8);
  const body = new THREE.Mesh(bodyGeo, whiteMat);
  body.position.y = 0.35;
  body.castShadow = true;
  cat.add(body);

  // Black patch on body (like cow spots)
  const patchGeo1 = new THREE.SphereGeometry(0.25, 8, 8);
  const patch1 = new THREE.Mesh(patchGeo1, blackMat);
  patch1.position.set(0.2, 0.5, -0.3);
  patch1.scale.set(1.2, 0.8, 1);
  cat.add(patch1);

  const patch2 = new THREE.Mesh(patchGeo1, blackMat);
  patch2.position.set(-0.15, 0.45, 0.2);
  patch2.scale.set(0.9, 0.7, 0.8);
  cat.add(patch2);

  // Head (white with black top)
  const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const head = new THREE.Mesh(headGeo, whiteMat);
  head.position.set(0, 0.5, 0.85);
  head.castShadow = true;
  cat.add(head);

  // Black cap on head
  const capGeo = new THREE.SphereGeometry(0.28, 8, 8);
  const cap = new THREE.Mesh(capGeo, blackMat);
  cap.position.set(0, 0.65, 0.8);
  cap.scale.y = 0.6;
  cat.add(cap);

  // Ears (both black like in the photo)
  const earGeo = new THREE.ConeGeometry(0.1, 0.2, 4);

  const earL = new THREE.Mesh(earGeo, blackMat);
  earL.position.set(-0.2, 0.85, 0.75);
  earL.rotation.z = -0.3;
  earL.rotation.x = 0.2;
  cat.add(earL);

  const earR = new THREE.Mesh(earGeo, blackMat);
  earR.position.set(0.2, 0.85, 0.75);
  earR.rotation.z = 0.3;
  earR.rotation.x = 0.2;
  cat.add(earR);

  // Inner ears (pink)
  const innerEarGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
  const innerEarL = new THREE.Mesh(innerEarGeo, pinkMat);
  innerEarL.position.set(-0.18, 0.82, 0.78);
  innerEarL.rotation.z = -0.3;
  innerEarL.rotation.x = 0.2;
  cat.add(innerEarL);

  const innerEarR = new THREE.Mesh(innerEarGeo, pinkMat);
  innerEarR.position.set(0.18, 0.82, 0.78);
  innerEarR.rotation.z = 0.3;
  innerEarR.rotation.x = 0.2;
  cat.add(innerEarR);

  // Eyes (closed, relaxed - sunbathing)
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.02, 0.02);
  const eyeMat = createMaterial(0x1a1a1a);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 0.52, 1.15);
  cat.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.1, 0.52, 1.15);
  cat.add(eyeR);

  // Nose
  const noseGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const nose = new THREE.Mesh(noseGeo, pinkMat);
  nose.position.set(0, 0.42, 1.18);
  cat.add(nose);

  // Whiskers
  const whiskerMat = createMaterial(0x888888);
  const whiskerGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.25, 4);

  [-1, 1].forEach(side => {
    for (let i = 0; i < 3; i++) {
      const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
      whisker.position.set(
        side * 0.15,
        0.4 + i * 0.04,
        1.15
      );
      whisker.rotation.z = Math.PI / 2 + side * (0.2 + i * 0.1);
      cat.add(whisker);
    }
  });

  // Tail (black, curled along the ground)
  const tailGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6);
  const tail = new THREE.Mesh(tailGeo, blackMat);
  tail.position.set(0.2, 0.2, -0.9);
  tail.rotation.x = 1.3;
  tail.rotation.z = 0.3;
  cat.add(tail);

  // Tail tip curl
  const tailTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 6, 6),
    blackMat
  );
  tailTip.position.set(0.35, 0.15, -1.25);
  cat.add(tailTip);

  // Paws (white with some black)
  const pawGeo = new THREE.SphereGeometry(0.1, 6, 6);

  // Front paws (stretched out)
  const pawFL = new THREE.Mesh(pawGeo, whiteMat);
  pawFL.position.set(-0.3, 0.1, 0.6);
  pawFL.scale.set(0.8, 0.5, 1.2);
  cat.add(pawFL);

  const pawFR = new THREE.Mesh(pawGeo, blackMat);
  pawFR.position.set(0.35, 0.1, 0.5);
  pawFR.scale.set(0.8, 0.5, 1.2);
  cat.add(pawFR);

  // Back paws (tucked)
  const pawBL = new THREE.Mesh(pawGeo, whiteMat);
  pawBL.position.set(-0.35, 0.15, -0.5);
  pawBL.scale.set(0.9, 0.5, 1);
  cat.add(pawBL);

  const pawBR = new THREE.Mesh(pawGeo, blackMat);
  pawBR.position.set(0.4, 0.15, -0.4);
  pawBR.scale.set(0.9, 0.5, 1);
  cat.add(pawBR);

  return cat;
}

function createCardboardBox() {
  const box = new THREE.Group();
  const cardboardMat = createMaterial(0xc4a574);

  // Box body (open top)
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.02, 0.6),
    cardboardMat
  );
  base.position.y = 0.01;
  box.add(base);

  // Walls
  const wallFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.4, 0.03),
    cardboardMat
  );
  wallFront.position.set(0, 0.2, 0.3);
  box.add(wallFront);

  const wallBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.4, 0.03),
    cardboardMat
  );
  wallBack.position.set(0, 0.2, -0.3);
  box.add(wallBack);

  const wallLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.4, 0.6),
    cardboardMat
  );
  wallLeft.position.set(-0.4, 0.2, 0);
  box.add(wallLeft);

  const wallRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.4, 0.6),
    cardboardMat
  );
  wallRight.position.set(0.4, 0.2, 0);
  box.add(wallRight);

  // Flaps (open)
  const flapMat = createMaterial(0xb8956a);

  const flapFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.25, 0.02),
    flapMat
  );
  flapFront.position.set(0, 0.42, 0.42);
  flapFront.rotation.x = -0.8;
  box.add(flapFront);

  return box;
}

function createPottedPlant() {
  const plant = new THREE.Group();

  // Pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.2, 0.35, 8),
    createMaterial(0x8b4513)
  );
  pot.position.y = 0.175;
  plant.add(pot);

  // Soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8),
    createMaterial(0x3d2817)
  );
  soil.position.y = 0.35;
  plant.add(soil);

  // Leaves
  const leafMat = createMaterial(0x3d8a3d);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      leafMat
    );
    const angle = (i / 6) * Math.PI * 2;
    leaf.position.set(
      Math.cos(angle) * 0.15,
      0.55 + Math.random() * 0.2,
      Math.sin(angle) * 0.15
    );
    leaf.scale.set(0.6, 1, 0.4);
    plant.add(leaf);
  }

  return plant;
}

// Scene 4: Terrace (Daytime - wicker furniture, Buddha, vertical gardens)
function createTerraceScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Daytime sky

  // Bright sunlight
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xfffaf0, 0.9);
  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Wooden deck floor
  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = createMaterial(0x9a8a6a);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Wood plank lines
  for (let i = -6; i < 6; i++) {
    const plankLine = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.02, 0.05),
      createMaterial(0x7a6a5a)
    );
    plankLine.position.set(0, 0.01, i);
    scene.add(plankLine);
  }

  // Back wall with stone texture
  const wallGeo = new THREE.PlaneGeometry(12, 6);
  const wallMat = createMaterial(0xa09080);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 3, -6);
  scene.add(wall);

  // Vertical gardens (green wall on sides)
  const greenWall = createVerticalGarden();
  greenWall.position.set(-4.5, 0, -5);
  scene.add(greenWall);

  const greenWall2 = createVerticalGarden();
  greenWall2.position.set(4.5, 0, -5);
  scene.add(greenWall2);

  // Buddha statue
  const buddha = createBuddha();
  buddha.position.set(0, 0, -4.5);
  scene.add(buddha);

  // Wicker sofa with cushions
  const sofa = createWickerSofa();
  sofa.position.set(0, 0, -2);
  scene.add(sofa);

  // Coffee table with Uno cards
  const table = createWickerTable();
  table.position.set(0, 0, 0.5);
  scene.add(table);

  // Uno cards on table (for interaction)
  const cards = createUnoCards();
  cards.position.set(0, 0.45, 0.5);
  scene.add(cards);

  // Glass railing
  const railing = createGlassRailing();
  railing.position.set(0, 0, 4);
  scene.add(railing);

  // View beyond railing (buildings/sky)
  const cityView = createDistantView();
  cityView.position.set(0, 0, 8);
  scene.add(cityView);

  camera.position.set(4, 2.5, 4);
  camera.lookAt(0, 0.5, 0);

  const animData = {
    time: 0,
    cards,
    cardFlip: false,
    flipAngle: 0
  };

  return { scene, animData };
}

function createVerticalGarden() {
  const garden = new THREE.Group();

  // Frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 0.3),
    createMaterial(0x3d3530)
  );
  frame.position.y = 2;
  garden.add(frame);

  // Leaves/vines
  const leafMat = createMaterial(0x3d8a3d);
  const leafMat2 = createMaterial(0x4a9a4a);

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 4; x++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 6, 6),
        Math.random() > 0.5 ? leafMat : leafMat2
      );
      leaf.position.set(
        -0.7 + x * 0.5 + (Math.random() - 0.5) * 0.2,
        0.5 + y * 0.5,
        0.2 + Math.random() * 0.1
      );
      leaf.scale.set(0.8 + Math.random() * 0.4, 0.6, 0.4);
      garden.add(leaf);
    }
  }

  return garden;
}

function createBuddha() {
  const buddha = new THREE.Group();

  // Base/pedestal
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 0.3, 12),
    createMaterial(0x4a4a4a)
  );
  base.position.y = 0.15;
  buddha.add(base);

  // Body (sitting)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 8),
    createMaterial(0x5a5a5a)
  );
  body.position.y = 0.6;
  body.scale.set(1, 0.9, 0.8);
  buddha.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    createMaterial(0x5a5a5a)
  );
  head.position.y = 1.05;
  buddha.add(head);

  // Hair/ushnisha
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    createMaterial(0x4a4a4a)
  );
  hair.position.y = 1.25;
  buddha.add(hair);

  return buddha;
}

function createWickerSofa() {
  const sofa = new THREE.Group();

  // Base (dark wicker)
  const baseMat = createMaterial(0x3d3530);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.5, 1.2),
    baseMat
  );
  base.position.y = 0.25;
  sofa.add(base);

  // Back
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 1.2, 0.3),
    baseMat
  );
  back.position.set(0, 0.85, -0.45);
  sofa.add(back);

  // Arms
  [-1.75, 1.75].forEach(x => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.7, 1.2),
      baseMat
    );
    arm.position.set(x, 0.6, 0);
    sofa.add(arm);
  });

  // Cream seat cushion
  const seatCushion = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.25, 0.9),
    createMaterial(0xf5f0e6)
  );
  seatCushion.position.set(0, 0.55, 0.05);
  sofa.add(seatCushion);

  // Back cushions (cream)
  for (let i = 0; i < 3; i++) {
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.2),
      createMaterial(0xf5f0e6)
    );
    cushion.position.set(-1 + i, 0.95, -0.25);
    cushion.rotation.z = (Math.random() - 0.5) * 0.1;
    sofa.add(cushion);
  }

  // Red accent pillows
  const redPillow1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 0.15),
    createMaterial(0xcc3333)
  );
  redPillow1.position.set(-1.2, 0.7, 0.1);
  redPillow1.rotation.z = 0.2;
  sofa.add(redPillow1);

  const redPillow2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 0.15),
    createMaterial(0xcc3333)
  );
  redPillow2.position.set(1.2, 0.7, 0.1);
  redPillow2.rotation.z = -0.15;
  sofa.add(redPillow2);

  return sofa;
}

function createWickerTable() {
  const table = new THREE.Group();

  // Table top (dark wicker)
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.1, 1),
    createMaterial(0x3d3530)
  );
  top.position.y = 0.4;
  table.add(top);

  // Legs
  const legMat = createMaterial(0x3d3530);
  [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.4, 0.1),
      legMat
    );
    leg.position.set(x, 0.2, z);
    table.add(leg);
  });

  return table;
}

function createUnoCards() {
  const cards = new THREE.Group();

  const colors = [0xff4444, 0x44cc44, 0x4444ff, 0xffcc00];

  // Scattered cards
  for (let i = 0; i < 6; i++) {
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.008, 0.18),
      createMaterial(colors[i % colors.length])
    );
    card.position.set(
      (Math.random() - 0.5) * 0.5,
      i * 0.01,
      (Math.random() - 0.5) * 0.3
    );
    card.rotation.y = Math.random() * 0.6 - 0.3;
    cards.add(card);
  }

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.18),
    createMaterial(0x1a1a1a)
  );
  deck.position.set(0.5, 0.06, 0);
  cards.add(deck);

  // +4 card (special - for interaction)
  const plus4 = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.008, 0.18),
    createMaterial(0x1a1a1a)
  );
  plus4.position.set(-0.5, 0.004, 0);
  plus4.userData.isPlus4 = true;
  cards.add(plus4);

  // +4 colored corners
  const cornerColors = [0xff4444, 0x44cc44, 0x4444ff, 0xffcc00];
  const cornerPositions = [
    [-0.03, 0.009, -0.05],
    [0.03, 0.009, -0.05],
    [-0.03, 0.009, 0.05],
    [0.03, 0.009, 0.05]
  ];
  cornerPositions.forEach((pos, i) => {
    const corner = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.002, 0.04),
      createMaterial(cornerColors[i])
    );
    corner.position.set(-0.5 + pos[0], pos[1], pos[2]);
    cards.add(corner);
  });

  return cards;
}

function createGlassRailing() {
  const railing = new THREE.Group();

  // Posts
  const postMat = createMaterial(0x404040);
  [-4, -2, 0, 2, 4].forEach(x => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
      postMat
    );
    post.position.set(x, 0.6, 0);
    railing.add(post);
  });

  // Top rail
  const topRail = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.05, 0.05),
    postMat
  );
  topRail.position.set(0, 1.2, 0);
  railing.add(topRail);

  // Glass panels
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.2,
    roughness: 0.1
  });

  for (let i = 0; i < 4; i++) {
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.1),
      glassMat
    );
    glass.position.set(-3 + i * 2, 0.55, 0);
    railing.add(glass);
  }

  return railing;
}

function createDistantView() {
  const view = new THREE.Group();

  // Distant buildings
  for (let i = 0; i < 10; i++) {
    const height = 2 + Math.random() * 4;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(1.5 + Math.random(), height, 1),
      createMaterial(0x707080)
    );
    building.position.set(-8 + i * 2 + Math.random(), height / 2 - 2, 0);
    view.add(building);
  }

  return view;
}

// Scene 5: Paneer Chilly (Evening dinner - Asia Kitchen)
function createPaneerScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.Fog(0x1a1410, 10, 35);

  // Warm restaurant lighting
  const ambient = new THREE.AmbientLight(0xffddbb, 0.4);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Warm accent lights
  const warmLight1 = new THREE.PointLight(0xff8844, 0.6, 10);
  warmLight1.position.set(-2, 3, 0);
  scene.add(warmLight1);

  const warmLight2 = new THREE.PointLight(0xff6622, 0.5, 10);
  warmLight2.position.set(2, 3, 0);
  scene.add(warmLight2);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = createMaterial(0x2a2520);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Table
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.1, 1.5),
    createMaterial(0x2a2018)
  );
  table.position.y = 1;
  table.castShadow = true;
  scene.add(table);

  // Table legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 6);
  const legMat = createMaterial(0x1a1a1a);
  [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.5, z);
    scene.add(leg);
  });

  // Numbing Paneer dish (main attraction)
  const dish = createNumbingPaneer();
  dish.position.set(0, 1.1, 0);
  scene.add(dish);

  // Plates for two
  [-0.7, 0.7].forEach(x => {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.28, 0.03, 12),
      createMaterial(0xfafafa)
    );
    plate.position.set(x, 1.07, 0.4);
    scene.add(plate);
  });

  // Chopsticks
  [[-0.5, 0.5], [0.9, 0.5]].forEach(([x, z]) => {
    const chopsticks = createChopsticks();
    chopsticks.position.set(x, 1.05, z);
    chopsticks.rotation.y = 0.3;
    scene.add(chopsticks);
  });

  // Asian restaurant decor
  const lantern1 = createChineseLantern();
  lantern1.position.set(-2, 3.5, -2);
  scene.add(lantern1);

  const lantern2 = createChineseLantern();
  lantern2.position.set(2, 3.5, -2);
  scene.add(lantern2);

  // Wall sign (Asia Kitchen)
  const signGroup = new THREE.Group();
  const signBacking = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.8, 0.1),
    createMaterial(0x1a1a1a)
  );
  signGroup.add(signBacking);

  // Red accent border
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 0.9, 0.08),
    createMaterial(0xcc2222)
  );
  border.position.z = -0.02;
  signGroup.add(border);

  signGroup.position.set(0, 3, -5);
  scene.add(signGroup);

  // Chili decorations
  for (let i = 0; i < 5; i++) {
    const chili = createChili();
    chili.position.set(-2 + i * 1, 3.8, -4);
    chili.rotation.z = Math.random() * 0.4 - 0.2;
    scene.add(chili);
  }

  camera.position.set(0, 2.5, 4);
  camera.lookAt(0, 1, 0);

  const animData = {
    time: 0,
    dish,
    dishGlow: false,
    glowIntensity: 0
  };

  return { scene, animData };
}

function createNumbingPaneer() {
  const dish = new THREE.Group();

  // Hot pot / sizzling plate
  const plateMat = createMaterial(0x1a1a1a);
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.5, 0.12, 16),
    plateMat
  );
  plate.castShadow = true;
  dish.add(plate);

  // Wooden base
  const woodBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16),
    createMaterial(0x5a4a3a)
  );
  woodBase.position.y = -0.08;
  dish.add(woodBase);

  // Spicy red oil base
  const oilGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.04, 16);
  const oilMat = createMaterial(0x8b2500);
  const oil = new THREE.Mesh(oilGeo, oilMat);
  oil.position.y = 0.05;
  dish.add(oil);

  // Sichuan peppercorns (small dark red dots)
  for (let i = 0; i < 15; i++) {
    const pepper = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 6, 6),
      createMaterial(0x4a1a0a)
    );
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.4;
    pepper.position.set(
      Math.cos(angle) * r,
      0.08,
      Math.sin(angle) * r
    );
    dish.add(pepper);
  }

  // Paneer cubes
  const paneerMat = createMaterial(0xffeedd);
  for (let i = 0; i < 8; i++) {
    const paneer = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.1),
      paneerMat
    );
    const angle = (i / 8) * Math.PI * 2;
    paneer.position.set(
      Math.cos(angle) * 0.25,
      0.11,
      Math.sin(angle) * 0.25
    );
    paneer.rotation.y = Math.random();
    dish.add(paneer);
  }

  // Dried chilies
  for (let i = 0; i < 6; i++) {
    const chili = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.02, 0.06, 4, 6),
      createMaterial(0xaa2211)
    );
    const angle = Math.random() * Math.PI * 2;
    chili.position.set(
      Math.cos(angle) * 0.3,
      0.1,
      Math.sin(angle) * 0.3
    );
    chili.rotation.z = Math.PI / 2;
    chili.rotation.y = Math.random();
    dish.add(chili);
  }

  // Green onion garnish
  const garnishMat = createMaterial(0x44aa44);
  for (let i = 0; i < 8; i++) {
    const garnish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6),
      garnishMat
    );
    garnish.position.set(
      (Math.random() - 0.5) * 0.5,
      0.12,
      (Math.random() - 0.5) * 0.5
    );
    garnish.rotation.x = Math.PI / 2;
    garnish.rotation.z = Math.random();
    dish.add(garnish);
  }

  // Steam effect placeholder (will be animated)
  dish.userData.steamParticles = [];

  return dish;
}

function createChopsticks() {
  const chopsticks = new THREE.Group();
  const stickMat = createMaterial(0x3d2817);

  const stick1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.008, 0.35, 6),
    stickMat
  );
  stick1.rotation.z = Math.PI / 2;
  stick1.position.x = 0.02;
  chopsticks.add(stick1);

  const stick2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.008, 0.35, 6),
    stickMat
  );
  stick2.rotation.z = Math.PI / 2;
  stick2.position.set(-0.02, 0, 0.03);
  chopsticks.add(stick2);

  return chopsticks;
}

function createChineseLantern() {
  const lantern = new THREE.Group();

  // Main body
  const bodyMat = createMaterial(0xcc2222);
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    bodyMat
  );
  body.scale.y = 1.3;
  lantern.add(body);

  // Top cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.1, 12),
    createMaterial(0xffcc00)
  );
  cap.position.y = 0.4;
  lantern.add(cap);

  // Bottom cap
  const bottomCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.15, 0.1, 12),
    createMaterial(0xffcc00)
  );
  bottomCap.position.y = -0.4;
  lantern.add(bottomCap);

  // Tassel
  const tassel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.06, 0.25, 8),
    createMaterial(0xcc2222)
  );
  tassel.position.y = -0.6;
  lantern.add(tassel);

  // Light
  const light = new THREE.PointLight(0xff6644, 0.4, 5);
  light.position.y = 0;
  lantern.add(light);

  return lantern;
}

function createChili() {
  const chili = new THREE.Group();

  const chiliMat = createMaterial(0xff3322);

  const bodyGeo = new THREE.CapsuleGeometry(0.06, 0.25, 4, 8);
  const body = new THREE.Mesh(bodyGeo, chiliMat);
  body.rotation.z = Math.PI / 2;
  chili.add(body);

  const stemGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.08, 6);
  const stemMat = createMaterial(0x44aa44);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(-0.17, 0.02, 0);
  chili.add(stem);

  return chili;
}

// ============================================
// SCENE MANAGEMENT
// ============================================

// Reordered: cafe, driving, cat, terrace, paneer
const sceneCreators = [
  createCafeScene,
  createDrivingScene,
  createCatScene,
  createTerraceScene,
  createPaneerScene
];

function loadScene(index) {
  if (index >= sceneCreators.length) {
    showFinale();
    return;
  }

  state.hasInteracted = false;

  const { scene, animData } = sceneCreators[index]();
  currentSceneObj = { scene, animData, index };

  // Update text
  const data = sceneData[index];
  elements.sceneText.innerHTML = `
    <p>${data.text}</p>
    <p class="small">${data.subtext}</p>
    <p class="hint">${data.hint}</p>
  `;

  // Fade in text after a moment
  setTimeout(() => {
    elements.sceneText.classList.add('visible');
  }, 500);

  // Show next button after delay
  setTimeout(() => {
    elements.nextBtn.classList.remove('hidden');
  }, 2000);
}

function nextScene() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  elements.sceneText.classList.remove('visible');
  elements.nextBtn.classList.add('hidden');

  setTimeout(() => {
    state.currentScene++;
    loadScene(state.currentScene);
    state.isTransitioning = false;
  }, 600);
}

function showFinale() {
  elements.sceneContainer.classList.remove('active');
  elements.finale.classList.add('active');
  elements.finaleText.textContent = TEXT.finale.question;
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
  requestAnimationFrame(animate);

  if (!currentSceneObj) return;

  const delta = clock.getDelta();
  const { scene, animData } = currentSceneObj;

  animData.time += delta;

  // Scene-specific animations
  switch (currentSceneObj.index) {
    case 0: // Cafe
      // Steam animation when activated
      if (animData.steamActive && animData.cups.length > 0) {
        if (Math.random() < 0.15) {
          const cup = animData.cups[Math.floor(Math.random() * animData.cups.length)];
          const steam = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.6
            })
          );
          steam.position.copy(cup.position);
          steam.position.y += 0.1;
          steam.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            0.02,
            (Math.random() - 0.5) * 0.01
          );
          steam.userData.life = 1;
          scene.add(steam);
          animData.steamParticles.push(steam);
        }

        // Update steam particles
        animData.steamParticles = animData.steamParticles.filter(p => {
          p.position.add(p.userData.velocity);
          p.userData.life -= delta * 0.8;
          p.material.opacity = p.userData.life * 0.6;
          p.scale.setScalar(1 + (1 - p.userData.life) * 2);
          if (p.userData.life <= 0) {
            scene.remove(p);
            return false;
          }
          return true;
        });
      }
      // Gentle camera sway
      camera.position.x = 3 + Math.sin(animData.time * 0.2) * 0.2;
      break;

    case 1: // Driving
      // Gentle car bobbing (driving on road)
      if (animData.car) {
        animData.car.position.y = Math.sin(animData.time * 3) * 0.015;
        animData.car.rotation.z = Math.sin(animData.time * 2) * 0.008;
      }
      // Camera follows slightly
      camera.position.x = 8 + Math.sin(animData.time * 0.3) * 0.5;

      // Honk effect
      if (animData.honk) {
        animData.car.position.z = Math.sin(animData.time * 20) * 0.02;
        setTimeout(() => {
          if (animData.car) animData.car.position.z = 0;
        }, 300);
        animData.honk = false;
      }
      break;

    case 2: // Cat
      if (animData.cat) {
        // Cat breathing
        animData.cat.scale.y = 1 + Math.sin(animData.time * 1.5) * 0.015;

        // Purring vibration when activated
        if (animData.catPurring) {
          animData.cat.position.y = Math.sin(animData.time * 15) * 0.005;
        }
      }

      // Update floating hearts
      if (animData.hearts) {
        animData.hearts = animData.hearts.filter(heart => {
          heart.position.add(heart.userData.velocity);
          heart.rotation.z = Math.sin(animData.time * 3) * 0.2;
          heart.userData.life -= delta * 0.3;
          heart.material.opacity = heart.userData.life;
          if (heart.userData.life <= 0) {
            scene.remove(heart);
            return false;
          }
          return true;
        });
      }
      break;

    case 3: // Terrace
      // Card flip animation
      if (animData.cardFlip && animData.cards) {
        animData.flipAngle += delta * 5;
        const plus4 = animData.cards.children.find(c => c.userData.isPlus4);
        if (plus4 && animData.flipAngle < Math.PI) {
          plus4.rotation.x = animData.flipAngle;
          plus4.position.y = 0.004 + Math.sin(animData.flipAngle) * 0.1;
        }
      }
      break;

    case 4: // Paneer
      // Dish glow effect
      if (animData.dishGlow && animData.dish) {
        animData.glowIntensity = 0.5 + Math.sin(animData.time * 3) * 0.3;
        // Find the oil mesh and pulse its emissive
        const oil = animData.dish.children.find(c =>
          c.geometry?.parameters?.radiusTop === 0.48
        );
        if (oil && oil.material) {
          oil.material.emissive = new THREE.Color(0x441100);
          oil.material.emissiveIntensity = animData.glowIntensity;
        }
      }
      break;
  }

  renderer.render(scene, camera);
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  // Simulate loading
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      setTimeout(showIntro, 300);
    }
    elements.loaderProgress.style.width = `${progress}%`;
  }, 150);

  initThree();

  // Event listeners
  elements.startBtn.addEventListener('click', startExperience);
  elements.nextBtn.addEventListener('click', nextScene);
  elements.yesBtn.addEventListener('click', () => handleFinale(true));
  elements.noBtn.addEventListener('click', () => handleFinale(false));

  animate();
}

function showIntro() {
  elements.loader.classList.remove('active');
  elements.intro.classList.add('active');
}

function startExperience() {
  elements.intro.classList.remove('active');
  elements.sceneContainer.classList.add('active');
  loadScene(0);
}

function handleFinale(isYes) {
  if (isYes) {
    elements.finaleText.innerHTML = TEXT.finale.yesResponse;
    elements.yesBtn.style.display = 'none';
    elements.noBtn.style.display = 'none';
  } else {
    elements.noBtn.textContent = TEXT.finale.noButtonAfter;
    elements.noBtn.classList.remove('btn-no');
    elements.noBtn.classList.add('btn-yes');
    elements.noBtn.onclick = () => handleFinale(true);
  }
}

init();
