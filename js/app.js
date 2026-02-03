import * as THREE from 'three';

// ============================================
// APP STATE
// ============================================
const state = {
  currentScene: 0,
  scenes: [],
  isTransitioning: false,
  hasInteracted: false,
  mouse: { x: 0, y: 0 },
  raycaster: new THREE.Raycaster(),
  mouseVec: new THREE.Vector2()
};

// Scene content - we'll fill in proper text later
const sceneData = [
  {
    id: 'driving',
    text: 'every time i come back, my favorite thing is driving you around.',
    subtext: 'my little passenger princess.',
    hint: 'move your mouse to look around'
  },
  {
    id: 'cat',
    text: 'and somehow, i always end up playing with your cat.',
    subtext: 'she tolerates me now. i think.',
    hint: 'click on her to give pets'
  },
  {
    id: 'cafe',
    text: 'we hop from cafe to cafe, pretending we need more coffee.',
    subtext: 'we just need more time.',
    hint: 'click the coffee'
  },
  {
    id: 'terrace',
    text: 'those uno nights on the terrace...',
    subtext: 'you cheat. i let you win anyway.',
    hint: 'draw a card'
  },
  {
    id: 'paneer',
    text: 'and our never-ending quest for the best paneer chilly.',
    subtext: 'still searching. still eating.',
    hint: 'click the dish'
  }
];

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
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);
  window.addEventListener('touchstart', onTouch);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
  state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onClick(e) {
  state.mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  handleInteraction();
}

function onTouch(e) {
  if (e.touches.length > 0) {
    state.mouseVec.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    state.mouseVec.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    handleInteraction();
  }
}

function handleInteraction() {
  if (!currentSceneObj || state.hasInteracted) return;

  const { scene, animData, index } = currentSceneObj;
  state.raycaster.setFromCamera(state.mouseVec, camera);

  switch (index) {
    case 1: // Cat scene
      if (animData.cat) {
        const catIntersects = state.raycaster.intersectObject(animData.cat, true);
        if (catIntersects.length > 0) {
          triggerCatInteraction(animData);
        }
      }
      break;

    case 2: // Cafe scene
      if (animData.cups) {
        const cupIntersects = state.raycaster.intersectObjects(animData.cups, true);
        if (cupIntersects.length > 0) {
          triggerCafeInteraction(animData, scene);
        }
      }
      break;

    case 3: // Terrace scene
      if (animData.deck) {
        const deckIntersects = state.raycaster.intersectObject(animData.deck, true);
        if (deckIntersects.length > 0) {
          triggerTerraceInteraction(animData, scene);
        }
      }
      break;

    case 4: // Paneer scene
      if (animData.dish) {
        const dishIntersects = state.raycaster.intersectObject(animData.dish, true);
        if (dishIntersects.length > 0) {
          triggerPaneerInteraction(animData);
        }
      }
      break;
  }
}

// ============================================
// INTERACTION HANDLERS
// ============================================

function triggerCatInteraction(animData) {
  state.hasInteracted = true;

  // Create floating hearts
  const hearts = [];
  for (let i = 0; i < 8; i++) {
    const heart = createHeart();
    heart.position.set(
      animData.cat.position.x + (Math.random() - 0.5) * 1.5,
      animData.cat.position.y + 0.5,
      animData.cat.position.z + (Math.random() - 0.5) * 1.5
    );
    heart.userData.velocity = {
      x: (Math.random() - 0.5) * 0.02,
      y: 0.02 + Math.random() * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };
    heart.userData.life = 1;
    currentSceneObj.scene.add(heart);
    hearts.push(heart);
  }
  animData.hearts = hearts;
  animData.catPurring = true;

  // Update text
  showInteractionText('*purrrrrr*');

  // Show next button
  setTimeout(() => {
    elements.nextBtn.classList.remove('hidden');
  }, 1500);
}

function createHeart() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y);
  shape.bezierCurveTo(x, y - 0.05, x - 0.1, y - 0.1, x - 0.15, y - 0.1);
  shape.bezierCurveTo(x - 0.25, y - 0.1, x - 0.25, y + 0.05, x - 0.25, y + 0.05);
  shape.bezierCurveTo(x - 0.25, y + 0.1, x - 0.15, y + 0.2, x, y + 0.25);
  shape.bezierCurveTo(x + 0.15, y + 0.2, x + 0.25, y + 0.1, x + 0.25, y + 0.05);
  shape.bezierCurveTo(x + 0.25, y + 0.05, x + 0.25, y - 0.1, x + 0.15, y - 0.1);
  shape.bezierCurveTo(x + 0.1, y - 0.1, x, y - 0.05, x, y);

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    side: THREE.DoubleSide,
    transparent: true
  });

  const heart = new THREE.Mesh(geometry, material);
  heart.scale.setScalar(0.5);
  heart.rotation.z = Math.PI;
  return heart;
}

function triggerCafeInteraction(animData, scene) {
  state.hasInteracted = true;

  // Create steam particles
  const steamParticles = [];
  for (let i = 0; i < 20; i++) {
    const steam = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
      })
    );
    const cupPos = animData.cups[0].position;
    steam.position.set(
      cupPos.x + (Math.random() - 0.5) * 0.1,
      cupPos.y + 0.15,
      cupPos.z + (Math.random() - 0.5) * 0.1
    );
    steam.userData.velocity = {
      x: (Math.random() - 0.5) * 0.005,
      y: 0.01 + Math.random() * 0.01,
      z: (Math.random() - 0.5) * 0.005
    };
    steam.userData.life = 1;
    scene.add(steam);
    steamParticles.push(steam);
  }
  animData.steam = steamParticles;

  showInteractionText('another cup? always.');

  setTimeout(() => {
    elements.nextBtn.classList.remove('hidden');
  }, 1500);
}

function triggerTerraceInteraction(animData, scene) {
  state.hasInteracted = true;

  // Flip a card from the deck
  const cardMessages = [
    '+4... for my love for you',
    'reverse! back to the start of us',
    'skip... your turn to do dishes',
    'wild card: i choose you'
  ];

  const message = cardMessages[Math.floor(Math.random() * cardMessages.length)];
  const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];

  // Create the drawn card
  const drawnCard = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.02, 0.38),
    createMaterial(colors[Math.floor(Math.random() * colors.length)])
  );
  drawnCard.position.copy(animData.deck.position);
  drawnCard.position.y += 0.1;
  scene.add(drawnCard);

  animData.drawnCard = drawnCard;
  animData.cardFlipping = true;
  animData.cardFlipProgress = 0;

  showInteractionText(message);

  setTimeout(() => {
    elements.nextBtn.classList.remove('hidden');
  }, 2000);
}

function triggerPaneerInteraction(animData) {
  state.hasInteracted = true;

  // Make dish glow/pulse
  animData.dishGlowing = true;

  showInteractionText("this one's pretty good. but we should keep looking. for science.");

  setTimeout(() => {
    elements.nextBtn.classList.remove('hidden');
  }, 1500);
}

function showInteractionText(text) {
  const hint = document.querySelector('.hint');
  if (hint) hint.remove();

  const interactionEl = document.createElement('p');
  interactionEl.className = 'interaction-text';
  interactionEl.textContent = text;
  elements.sceneText.appendChild(interactionEl);

  setTimeout(() => {
    interactionEl.classList.add('visible');
  }, 100);
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

// Scene 1: Driving
function createDrivingScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 20, 80);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0x8888ff, 0.6);
  moonLight.position.set(10, 20, 10);
  moonLight.castShadow = true;
  scene.add(moonLight);

  const warmLight = new THREE.PointLight(0xffaa55, 0.5, 50);
  warmLight.position.set(0, 5, 0);
  scene.add(warmLight);

  // Ground/Road
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = createMaterial(0x1a1a1a);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road
  const roadGeo = new THREE.PlaneGeometry(8, 200);
  const roadMat = createMaterial(0x2a2a2a);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  scene.add(road);

  // Road lines
  for (let i = -100; i < 100; i += 8) {
    const lineGeo = new THREE.PlaneGeometry(0.2, 3);
    const lineMat = createMaterial(0x444444);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.02, i);
    scene.add(line);
  }

  // Car (white sedan - simple low-poly)
  const car = createCar();
  car.position.set(0, 0, 0);
  scene.add(car);

  // Trees along the road
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const tree = createTree();
    tree.position.set(
      side * (8 + Math.random() * 10),
      0,
      -50 + i * 6 + Math.random() * 2
    );
    tree.scale.setScalar(0.8 + Math.random() * 0.4);
    scene.add(tree);
  }

  // Street lights
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const light = createStreetLight();
    light.position.set(side * 5, 0, -30 + i * 15);
    scene.add(light);
  }

  // Camera setup - store base position for parallax
  const baseCameraPos = { x: 8, y: 4, z: 12 };
  camera.position.set(baseCameraPos.x, baseCameraPos.y, baseCameraPos.z);
  camera.lookAt(car.position);

  // Animation data
  const animData = {
    car,
    time: 0,
    baseCameraPos,
    roadLines: scene.children.filter(c => c.geometry?.parameters?.width === 0.2)
  };

  return { scene, animData };
}

function createCar() {
  const car = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(2, 0.8, 4);
  const bodyMat = createMaterial(0xf5f5f5);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  car.add(body);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2);
  const cabinMat = createMaterial(0xffffff);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.15, -0.2);
  cabin.castShadow = true;
  car.add(cabin);

  // Windows (dark)
  const windowMat = createMaterial(0x222233);

  const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 0.1),
    windowMat
  );
  frontWindow.position.set(0, 1.1, 0.75);
  frontWindow.rotation.x = 0.2;
  car.add(frontWindow);

  const backWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 0.1),
    windowMat
  );
  backWindow.position.set(0, 1.1, -1.15);
  backWindow.rotation.x = -0.2;
  car.add(backWindow);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 8);
  const wheelMat = createMaterial(0x1a1a1a);

  const wheelPositions = [
    [-0.9, 0.35, 1.2],
    [0.9, 0.35, 1.2],
    [-0.9, 0.35, -1.2],
    [0.9, 0.35, -1.2]
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    wheel.castShadow = true;
    car.add(wheel);
  });

  // Headlights
  const headlightGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
  const headlightMat = createMaterial(0xffffcc);

  [-0.6, 0.6].forEach(x => {
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(x, 0.6, 2);
    car.add(headlight);
  });

  // Taillights
  const taillightMat = createMaterial(0xff3333);
  [-0.6, 0.6].forEach(x => {
    const taillight = new THREE.Mesh(headlightGeo, taillightMat);
    taillight.position.set(x, 0.6, -2);
    car.add(taillight);
  });

  return car;
}

function createTree() {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
  const trunkMat = createMaterial(0x4a3728);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1;
  trunk.castShadow = true;
  tree.add(trunk);

  // Foliage (stacked cones)
  const foliageMat = createMaterial(0x2d5a27);

  const cone1 = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 2, 6),
    foliageMat
  );
  cone1.position.y = 2.5;
  cone1.castShadow = true;
  tree.add(cone1);

  const cone2 = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 1.8, 6),
    foliageMat
  );
  cone2.position.y = 3.8;
  cone2.castShadow = true;
  tree.add(cone2);

  const cone3 = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.5, 6),
    foliageMat
  );
  cone3.position.y = 4.8;
  cone3.castShadow = true;
  tree.add(cone3);

  return tree;
}

function createStreetLight() {
  const light = new THREE.Group();

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 5, 6);
  const poleMat = createMaterial(0x3a3a3a);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 2.5;
  light.add(pole);

  // Arm
  const armGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.position.set(-0.75, 5, 0);
  light.add(arm);

  // Lamp
  const lampGeo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
  const lampMat = createMaterial(0xffeecc);
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.set(-1.5, 4.9, 0);
  light.add(lamp);

  // Point light
  const pointLight = new THREE.PointLight(0xffaa66, 0.3, 15);
  pointLight.position.set(-1.5, 4.8, 0);
  light.add(pointLight);

  return light;
}

// Scene 2: Cat
function createCatScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a1f1a);

  // Warm indoor lighting
  const ambient = new THREE.AmbientLight(0xffeedd, 0.5);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = createMaterial(0x3d2817);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Cat (white and black)
  const cat = createCat();
  cat.position.set(0, 0, 0);
  scene.add(cat);

  // Simple couch in background
  const couch = createCouch();
  couch.position.set(0, 0, -4);
  scene.add(couch);

  // Cat toy
  const toyGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const toyMat = createMaterial(0xff6b6b);
  const toy = new THREE.Mesh(toyGeo, toyMat);
  toy.position.set(1.5, 0.2, 1);
  toy.castShadow = true;
  scene.add(toy);

  camera.position.set(0, 3, 6);
  camera.lookAt(cat.position);

  const animData = {
    cat,
    toy,
    time: 0,
    hearts: [],
    catPurring: false
  };

  return { scene, animData };
}

function createCat() {
  const cat = new THREE.Group();

  const whiteMat = createMaterial(0xfafafa);
  const blackMat = createMaterial(0x1a1a1a);

  // Body (white)
  const bodyGeo = new THREE.SphereGeometry(0.6, 8, 8);
  bodyGeo.scale(1, 0.8, 1.3);
  const body = new THREE.Mesh(bodyGeo, whiteMat);
  body.position.y = 0.5;
  body.castShadow = true;
  cat.add(body);

  // Head (white with black patches)
  const headGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const head = new THREE.Mesh(headGeo, whiteMat);
  head.position.set(0, 0.8, 0.7);
  head.castShadow = true;
  cat.add(head);

  // Black patch on head
  const patchGeo = new THREE.SphereGeometry(0.25, 8, 8);
  const patch = new THREE.Mesh(patchGeo, blackMat);
  patch.position.set(0.15, 0.95, 0.75);
  cat.add(patch);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.12, 0.25, 4);

  const earL = new THREE.Mesh(earGeo, whiteMat);
  earL.position.set(-0.2, 1.15, 0.65);
  earL.rotation.z = -0.2;
  cat.add(earL);

  const earR = new THREE.Mesh(earGeo, blackMat);
  earR.position.set(0.2, 1.15, 0.65);
  earR.rotation.z = 0.2;
  cat.add(earR);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = createMaterial(0x3a5a3a);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.12, 0.85, 1.05);
  cat.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.12, 0.85, 1.05);
  cat.add(eyeR);

  // Nose
  const noseGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const noseMat = createMaterial(0xffaaaa);
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 0.75, 1.1);
  cat.add(nose);

  // Tail (black)
  const tailGeo = new THREE.CylinderGeometry(0.08, 0.05, 1, 6);
  const tail = new THREE.Mesh(tailGeo, blackMat);
  tail.position.set(0, 0.6, -0.8);
  tail.rotation.x = -0.5;
  tail.name = 'tail';
  cat.add(tail);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 6);
  const legPositions = [
    [-0.25, 0.2, 0.3, whiteMat],
    [0.25, 0.2, 0.3, blackMat],
    [-0.25, 0.2, -0.3, whiteMat],
    [0.25, 0.2, -0.3, blackMat]
  ];

  legPositions.forEach(([x, y, z, mat]) => {
    const leg = new THREE.Mesh(legGeo, mat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    cat.add(leg);
  });

  return cat;
}

function createCouch() {
  const couch = new THREE.Group();
  const couchMat = createMaterial(0x4a3f35);

  // Base
  const baseGeo = new THREE.BoxGeometry(4, 0.8, 1.5);
  const base = new THREE.Mesh(baseGeo, couchMat);
  base.position.y = 0.4;
  base.castShadow = true;
  couch.add(base);

  // Back
  const backGeo = new THREE.BoxGeometry(4, 1.2, 0.4);
  const back = new THREE.Mesh(backGeo, couchMat);
  back.position.set(0, 1, -0.55);
  back.castShadow = true;
  couch.add(back);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.4, 0.8, 1.5);
  [-2, 2].forEach(x => {
    const arm = new THREE.Mesh(armGeo, couchMat);
    arm.position.set(x, 0.8, 0);
    arm.castShadow = true;
    couch.add(arm);
  });

  return couch;
}

// Scene 3: Cafe
function createCafeScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e2a);
  scene.fog = new THREE.Fog(0x1e1e2a, 15, 40);

  // Warm lighting
  const ambient = new THREE.AmbientLight(0xffeedd, 0.3);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
  mainLight.position.set(10, 15, 10);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Street/ground
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = createMaterial(0x2a2a2a);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Cafe building
  const cafe = createCafeBuilding();
  cafe.position.set(0, 0, -5);
  scene.add(cafe);

  // Table outside
  const table = createCafeTable();
  table.position.set(0, 0, 2);
  scene.add(table);

  // Coffee cups on table - store references
  const cups = [];
  [-0.4, 0.4].forEach(x => {
    const cup = createCoffeeCup();
    cup.position.set(x, 1.05, 2);
    scene.add(cup);
    cups.push(cup);
  });

  // String lights
  for (let i = 0; i < 8; i++) {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      createMaterial(0xffee88)
    );
    bulb.position.set(-3 + i * 0.9, 3.5, -3);
    scene.add(bulb);

    const light = new THREE.PointLight(0xffdd66, 0.15, 5);
    light.position.copy(bulb.position);
    scene.add(light);
  }

  camera.position.set(5, 3, 8);
  camera.lookAt(0, 1, 0);

  const animData = {
    time: 0,
    cups,
    steam: []
  };

  return { scene, animData };
}

function createCafeBuilding() {
  const building = new THREE.Group();

  // Main structure
  const wallMat = createMaterial(0x3a3530);
  const wallGeo = new THREE.BoxGeometry(8, 5, 6);
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 2.5;
  walls.castShadow = true;
  building.add(walls);

  // Front window
  const windowMat = createMaterial(0x445566);
  const windowGeo = new THREE.BoxGeometry(3, 2.5, 0.1);
  const window1 = new THREE.Mesh(windowGeo, windowMat);
  window1.position.set(0, 2, 3.01);
  building.add(window1);

  // Door
  const doorMat = createMaterial(0x2a2520);
  const doorGeo = new THREE.BoxGeometry(1.2, 2.5, 0.1);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-2.5, 1.25, 3.01);
  building.add(door);

  // Awning
  const awningMat = createMaterial(0x8b4513);
  const awningGeo = new THREE.BoxGeometry(8, 0.2, 2);
  const awning = new THREE.Mesh(awningGeo, awningMat);
  awning.position.set(0, 4.2, 4);
  awning.rotation.x = 0.15;
  building.add(awning);

  // Sign
  const signMat = createMaterial(0x2a2a2a);
  const signGeo = new THREE.BoxGeometry(2, 0.6, 0.1);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 4.8, 3.5);
  building.add(sign);

  return building;
}

function createCafeTable() {
  const table = new THREE.Group();

  // Table top
  const topGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 12);
  const topMat = createMaterial(0x4a3a2a);
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 1;
  top.castShadow = true;
  table.add(top);

  // Leg
  const legGeo = new THREE.CylinderGeometry(0.08, 0.1, 1, 8);
  const leg = new THREE.Mesh(legGeo, topMat);
  leg.position.y = 0.5;
  table.add(leg);

  // Chairs
  [-1.2, 1.2].forEach(x => {
    const chair = createChair();
    chair.position.set(x, 0, 0);
    chair.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    table.add(chair);
  });

  return table;
}

function createChair() {
  const chair = new THREE.Group();
  const chairMat = createMaterial(0x3a3a3a);

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
  const seat = new THREE.Mesh(seatGeo, chairMat);
  seat.position.y = 0.6;
  chair.add(seat);

  // Back
  const backGeo = new THREE.BoxGeometry(0.5, 0.6, 0.08);
  const back = new THREE.Mesh(backGeo, chairMat);
  back.position.set(0, 0.9, -0.21);
  chair.add(back);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, chairMat);
    leg.position.set(x, 0.3, z);
    chair.add(leg);
  });

  return chair;
}

function createCoffeeCup() {
  const cup = new THREE.Group();

  // Cup body
  const cupGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.2, 12);
  const cupMat = createMaterial(0xfafafa);
  const cupMesh = new THREE.Mesh(cupGeo, cupMat);
  cupMesh.castShadow = true;
  cup.add(cupMesh);

  // Coffee inside
  const coffeeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12);
  const coffeeMat = createMaterial(0x3a2a1a);
  const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffee.position.y = 0.08;
  cup.add(coffee);

  return cup;
}

// Scene 4: Terrace
function createTerraceScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // Night lighting
  const ambient = new THREE.AmbientLight(0x4444ff, 0.2);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  moonLight.position.set(10, 20, -10);
  scene.add(moonLight);

  const warmLight = new THREE.PointLight(0xffaa55, 0.8, 15);
  warmLight.position.set(0, 3, 0);
  scene.add(warmLight);

  // Terrace floor
  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = createMaterial(0x3a3a3a);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Railing
  const railingMat = createMaterial(0x2a2a2a);
  for (let i = 0; i < 12; i++) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1, 6),
      railingMat
    );
    post.position.set(-6 + i, 0.5, -6);
    scene.add(post);
  }

  const railTop = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.08, 0.08),
    railingMat
  );
  railTop.position.set(0, 1, -6);
  scene.add(railTop);

  // Small table
  const table = new THREE.Group();
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.08, 1),
    createMaterial(0x4a3a2a)
  );
  tableTop.position.y = 0.6;
  table.add(tableTop);

  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6),
    createMaterial(0x3a3a3a)
  );
  tableLeg.position.y = 0.3;
  table.add(tableLeg);

  table.position.set(0, 0, 0);
  scene.add(table);

  // Uno cards on table
  const cards = createUnoCards();
  cards.position.set(0, 0.65, 0);
  scene.add(cards);

  // Get reference to deck
  const deck = cards.children.find(c => c.geometry?.parameters?.height === 0.15);

  // Cushions/seating
  [-1.5, 1.5].forEach(x => {
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.8),
      createMaterial(0x4a3a5a)
    );
    cushion.position.set(x, 0.15, 0);
    cushion.castShadow = true;
    scene.add(cushion);
  });

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 200; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 100,
      Math.random() * 30 + 10,
      (Math.random() - 0.5) * 100 - 30
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // City silhouette in background
  for (let i = 0; i < 15; i++) {
    const height = 3 + Math.random() * 8;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(2 + Math.random() * 2, height, 2),
      createMaterial(0x151520)
    );
    building.position.set(-20 + i * 3 + Math.random() * 2, height / 2, -20);
    scene.add(building);

    // Random lit windows
    for (let j = 0; j < 3; j++) {
      const windowLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.1),
        createMaterial(0xffeeaa)
      );
      windowLight.position.set(
        building.position.x + (Math.random() - 0.5) * 1.5,
        Math.random() * height * 0.8 + 1,
        -19
      );
      scene.add(windowLight);
    }
  }

  camera.position.set(4, 2.5, 5);
  camera.lookAt(0, 0.5, 0);

  const animData = {
    time: 0,
    stars,
    deck,
    drawnCard: null,
    cardFlipping: false,
    cardFlipProgress: 0
  };

  return { scene, animData };
}

function createUnoCards() {
  const cards = new THREE.Group();

  const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];

  for (let i = 0; i < 5; i++) {
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.01, 0.28),
      createMaterial(colors[i % colors.length])
    );
    card.position.set(
      (Math.random() - 0.5) * 0.6,
      i * 0.015,
      (Math.random() - 0.5) * 0.4
    );
    card.rotation.y = Math.random() * 0.5 - 0.25;
    cards.add(card);
  }

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.15, 0.28),
    createMaterial(0x1a1a1a)
  );
  deck.position.set(0.4, 0.075, 0);
  cards.add(deck);

  return cards;
}

// Scene 5: Paneer Chilly Quest
function createPaneerScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.Fog(0x1a1410, 10, 35);

  // Warm lighting
  const ambient = new THREE.AmbientLight(0xffddbb, 0.4);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

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
    createMaterial(0x4a3a2a)
  );
  table.position.y = 1;
  table.castShadow = true;
  scene.add(table);

  // Table legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 6);
  const legMat = createMaterial(0x3a3a3a);
  [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.5, z);
    scene.add(leg);
  });

  // Paneer dish
  const dish = createPaneerDish();
  dish.position.set(0, 1.1, 0);
  scene.add(dish);

  // Plates
  [-0.7, 0.7].forEach(x => {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.28, 0.03, 12),
      createMaterial(0xfafafa)
    );
    plate.position.set(x, 1.07, 0.4);
    scene.add(plate);
  });

  // Neon sign in background
  const signGroup = new THREE.Group();

  const signBacking = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 0.1),
    createMaterial(0x1a1a1a)
  );
  signGroup.add(signBacking);

  const neonLight = new THREE.PointLight(0xff6b6b, 1, 10);
  neonLight.position.set(0, 0, 0.5);
  signGroup.add(neonLight);

  signGroup.position.set(0, 3, -5);
  scene.add(signGroup);

  // Chili decorations
  for (let i = 0; i < 5; i++) {
    const chili = createChili();
    chili.position.set(
      -3 + i * 1.5,
      3.5,
      -4
    );
    chili.rotation.z = Math.random() * 0.5 - 0.25;
    scene.add(chili);
  }

  camera.position.set(0, 2.5, 4);
  camera.lookAt(0, 1, 0);

  const animData = {
    time: 0,
    neonLight,
    dish,
    dishGlowing: false
  };

  return { scene, animData };
}

function createPaneerDish() {
  const dish = new THREE.Group();

  // Bowl/plate
  const bowlGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.15, 12);
  const bowlMat = createMaterial(0x2a2a2a);
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.castShadow = true;
  dish.add(bowl);

  // Gravy
  const gravyGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 12);
  const gravyMat = createMaterial(0x8b2500);
  const gravy = new THREE.Mesh(gravyGeo, gravyMat);
  gravy.position.y = 0.05;
  dish.add(gravy);

  // Paneer cubes
  const paneerMat = createMaterial(0xffeedd);
  for (let i = 0; i < 6; i++) {
    const paneer = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.12),
      paneerMat
    );
    const angle = (i / 6) * Math.PI * 2;
    paneer.position.set(
      Math.cos(angle) * 0.25,
      0.12,
      Math.sin(angle) * 0.25
    );
    paneer.rotation.y = Math.random() * 0.5;
    dish.add(paneer);
  }

  // Green garnish (cilantro suggestion)
  const garnishMat = createMaterial(0x44aa44);
  for (let i = 0; i < 4; i++) {
    const garnish = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      garnishMat
    );
    garnish.position.set(
      (Math.random() - 0.5) * 0.4,
      0.12,
      (Math.random() - 0.5) * 0.4
    );
    dish.add(garnish);
  }

  return dish;
}

function createChili() {
  const chili = new THREE.Group();

  const chiliMat = createMaterial(0xff3322);

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(0.08, 0.3, 4, 8);
  const body = new THREE.Mesh(bodyGeo, chiliMat);
  body.rotation.z = Math.PI / 2;
  chili.add(body);

  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.1, 6);
  const stemMat = createMaterial(0x44aa44);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(-0.2, 0.02, 0);
  chili.add(stem);

  return chili;
}

// ============================================
// SCENE MANAGEMENT
// ============================================

const sceneCreators = [
  createDrivingScene,
  createCatScene,
  createCafeScene,
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
    ${data.hint ? `<p class="hint">${data.hint}</p>` : ''}
  `;

  // Fade in text after a moment
  setTimeout(() => {
    elements.sceneText.classList.add('visible');
  }, 500);

  // For driving scene, show next button after delay (no click interaction)
  if (index === 0) {
    setTimeout(() => {
      elements.nextBtn.classList.remove('hidden');
    }, 3000);
  }
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
  elements.finaleText.textContent = "will you be my valentine?";
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
    case 0: // Driving
      // Gentle car bobbing
      if (animData.car) {
        animData.car.position.y = Math.sin(animData.time * 2) * 0.02;
        animData.car.rotation.z = Math.sin(animData.time * 1.5) * 0.01;
      }
      // Parallax camera based on mouse
      if (animData.baseCameraPos) {
        camera.position.x = animData.baseCameraPos.x + state.mouse.x * 2;
        camera.position.y = animData.baseCameraPos.y + state.mouse.y * 0.5;
        camera.lookAt(animData.car.position);
      }
      break;

    case 1: // Cat
      if (animData.cat) {
        // Cat breathing/idle animation
        animData.cat.scale.y = 1 + Math.sin(animData.time * 2) * 0.02;
        // Tail wag - faster if purring
        const tail = animData.cat.getObjectByName('tail');
        if (tail) {
          const wagSpeed = animData.catPurring ? 8 : 3;
          tail.rotation.z = Math.sin(animData.time * wagSpeed) * 0.3;
        }
      }
      if (animData.toy) {
        animData.toy.position.y = 0.2 + Math.sin(animData.time * 2) * 0.05;
      }
      // Animate hearts
      if (animData.hearts && animData.hearts.length > 0) {
        animData.hearts.forEach((heart, i) => {
          heart.position.x += heart.userData.velocity.x;
          heart.position.y += heart.userData.velocity.y;
          heart.position.z += heart.userData.velocity.z;
          heart.userData.life -= delta * 0.5;
          heart.material.opacity = heart.userData.life;
          heart.rotation.y = animData.time * 2;

          if (heart.userData.life <= 0) {
            scene.remove(heart);
            animData.hearts.splice(i, 1);
          }
        });
      }
      break;

    case 2: // Cafe
      // Gentle camera sway
      camera.position.x = 5 + Math.sin(animData.time * 0.2) * 0.3;

      // Animate steam
      if (animData.steam && animData.steam.length > 0) {
        animData.steam.forEach((particle, i) => {
          particle.position.x += particle.userData.velocity.x;
          particle.position.y += particle.userData.velocity.y;
          particle.position.z += particle.userData.velocity.z;
          particle.userData.life -= delta * 0.3;
          particle.material.opacity = particle.userData.life * 0.4;

          if (particle.userData.life <= 0) {
            scene.remove(particle);
            animData.steam.splice(i, 1);
          }
        });
      }
      break;

    case 3: // Terrace
      // Rotate stars slowly
      if (animData.stars) {
        animData.stars.rotation.y = animData.time * 0.01;
      }
      // Card flip animation
      if (animData.cardFlipping && animData.drawnCard) {
        animData.cardFlipProgress += delta * 2;
        const progress = Math.min(animData.cardFlipProgress, 1);

        // Rise and flip
        animData.drawnCard.position.y = 0.75 + progress * 0.5;
        animData.drawnCard.position.x = 0.4 - progress * 0.6;
        animData.drawnCard.rotation.y = progress * Math.PI;

        if (progress >= 1) {
          animData.cardFlipping = false;
        }
      }
      break;

    case 4: // Paneer
      // Neon flicker
      if (animData.neonLight) {
        animData.neonLight.intensity = 1 + Math.sin(animData.time * 10) * 0.1;
      }
      // Dish glow pulse
      if (animData.dishGlowing && animData.dish) {
        const pulse = Math.sin(animData.time * 4) * 0.1 + 1;
        animData.dish.scale.setScalar(pulse);
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
    elements.finaleText.innerHTML = "i knew you'd say yes 💝<br><br>i love you, simonne.";
    elements.yesBtn.style.display = 'none';
    elements.noBtn.style.display = 'none';
  } else {
    elements.noBtn.textContent = "okay fine, yes";
    elements.noBtn.classList.remove('btn-no');
    elements.noBtn.classList.add('btn-yes');
    elements.noBtn.onclick = () => handleFinale(true);
  }
}

init();
