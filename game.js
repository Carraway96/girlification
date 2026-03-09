const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WORLD = {
  width: canvas.width,
  height: canvas.height,
  bounds: { x: 18, y: 44, w: canvas.width - 36, h: canvas.height - 58 },
  entrance: { x: 22, y: 470 }
};

const DIALOGUE_LINES = [
  "“Jag kan ställa den här här så länge.”",
  "“Den tar ju nästan ingen plats.”",
  "“Jag tänkte att det är praktiskt om den redan finns här.”",
  "“Jag glömde den sist ändå.”",
  "“Du använder ju ändå inte den här hyllan.”",
  "“Den passar faktiskt ganska bra här.”",
  "“Det känns mer hemtrevligt så.”",
  "“Den är bara tillfällig.”",
  "“Jag har ändå med mig den varje gång jag kommer hit.”",
  "“Det är ju nästan som att jag bor här ibland.”"
];

const ITEM_DEFS = {
  candle: { name: "Candle", abbr: "C", color: "#f4cf65", value: 2, annoyance: 7, useful: false, preferredTags: ["table", "shelf", "counter", "dresser"], unlockDay: 1 },
  pillow: { name: "Decorative Pillow", abbr: "P", color: "#ef9aa5", value: 3, annoyance: 8, useful: false, preferredTags: ["sofa", "bed", "chair"], unlockDay: 1 },
  plant: { name: "Plant", abbr: "PL", color: "#67a96a", value: 4, annoyance: 8, useful: false, preferredTags: ["window", "table", "floor"], unlockDay: 1 },
  blanket: { name: "Blanket", abbr: "B", color: "#8ab0de", value: 5, annoyance: 9, useful: false, preferredTags: ["sofa", "bed", "chair"], unlockDay: 1 },
  framed_art: { name: "Framed Art", abbr: "A", color: "#d08b5f", value: 6, annoyance: 9, useful: false, preferredTags: ["wall", "shelf"], unlockDay: 1 },
  fairy_lights: { name: "Fairy Lights", abbr: "FL", color: "#ffdbe8", value: 8, annoyance: 11, useful: false, preferredTags: ["wall", "window", "bed"], unlockDay: 2 },
  basket: { name: "Storage Basket", abbr: "SB", color: "#b99c7a", value: 10, annoyance: 13, useful: true, preferredTags: ["floor", "shelf", "counter"], unlockDay: 1 },
  storage_box: { name: "Practical Storage Box", abbr: "BX", color: "#918f9d", value: 10, annoyance: 15, useful: true, preferredTags: ["floor", "shelf", "dresser"], unlockDay: 2 },
  skincare: { name: "Skincare Products", abbr: "SK", color: "#f7b7d4", value: 4, annoyance: 12, useful: true, preferredTags: ["sink", "shelf", "counter"], unlockDay: 1 },
  mug: { name: "Extra Mug", abbr: "M", color: "#d8d8e8", value: 3, annoyance: 12, useful: true, preferredTags: ["counter", "table", "shelf"], unlockDay: 1 }
};

const ROOMS = [
  {
    id: "living",
    name: "Living Room",
    rect: { x: 30, y: 66, w: 420, h: 260 },
    allowed: ["candle", "pillow", "plant", "blanket", "framed_art", "fairy_lights", "basket"],
    spots: [
      { x: 100, y: 120, tag: "table" }, { x: 176, y: 224, tag: "sofa" }, { x: 260, y: 236, tag: "sofa" },
      { x: 372, y: 122, tag: "window" }, { x: 405, y: 230, tag: "wall" }, { x: 72, y: 264, tag: "shelf" },
      { x: 300, y: 120, tag: "table" }, { x: 220, y: 160, tag: "chair" }
    ],
    hideSpots: [{ x: 52, y: 306 }, { x: 74, y: 306 }],
    lowImpactSpots: [{ x: 48, y: 92 }, { x: 66, y: 92 }, { x: 92, y: 306 }],
    permanentBonus: 8,
    permanentFeature: "Throw blanket + candles feel permanent"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    rect: { x: 470, y: 66, w: 220, h: 210 },
    allowed: ["mug", "basket", "storage_box", "plant", "candle"],
    spots: [
      { x: 500, y: 112, tag: "counter" }, { x: 548, y: 112, tag: "counter" }, { x: 612, y: 112, tag: "counter" },
      { x: 642, y: 160, tag: "shelf" }, { x: 522, y: 212, tag: "table" }, { x: 604, y: 236, tag: "floor" }, { x: 660, y: 234, tag: "shelf" }
    ],
    hideSpots: [{ x: 486, y: 252 }, { x: 510, y: 252 }],
    lowImpactSpots: [{ x: 478, y: 84 }, { x: 686, y: 84 }],
    permanentBonus: 6,
    permanentFeature: "Mug colony settles in"
  },
  {
    id: "bathroom",
    name: "Bathroom",
    rect: { x: 710, y: 66, w: 260, h: 210 },
    allowed: ["skincare", "candle", "basket", "plant"],
    spots: [
      { x: 742, y: 106, tag: "sink" }, { x: 804, y: 108, tag: "shelf" }, { x: 882, y: 108, tag: "shelf" },
      { x: 938, y: 140, tag: "counter" }, { x: 758, y: 218, tag: "floor" }, { x: 858, y: 230, tag: "floor" }, { x: 930, y: 230, tag: "shelf" }
    ],
    hideSpots: [{ x: 730, y: 252 }, { x: 756, y: 252 }],
    lowImpactSpots: [{ x: 718, y: 84 }, { x: 960, y: 252 }],
    permanentBonus: 8,
    permanentFeature: "Skincare shelf appears"
  },
  {
    id: "hallway",
    name: "Hallway",
    rect: { x: 30, y: 346, w: 420, h: 244 },
    allowed: ["basket", "framed_art", "plant", "storage_box", "fairy_lights"],
    spots: [
      { x: 84, y: 380, tag: "floor" }, { x: 156, y: 382, tag: "shelf" }, { x: 226, y: 380, tag: "wall" },
      { x: 316, y: 384, tag: "shelf" }, { x: 406, y: 392, tag: "wall" }, { x: 92, y: 540, tag: "floor" },
      { x: 212, y: 530, tag: "floor" }, { x: 342, y: 540, tag: "floor" }
    ],
    hideSpots: [{ x: 436, y: 574 }, { x: 408, y: 574 }],
    lowImpactSpots: [{ x: 52, y: 362 }, { x: 432, y: 362 }],
    permanentBonus: 5,
    permanentFeature: "Extra shoes appear by the door"
  },
  {
    id: "bedroom",
    name: "Bedroom",
    rect: { x: 470, y: 294, w: 500, h: 296 },
    allowed: ["pillow", "blanket", "plant", "framed_art", "fairy_lights", "storage_box", "basket"],
    spots: [
      { x: 562, y: 364, tag: "bed" }, { x: 638, y: 362, tag: "bed" }, { x: 726, y: 360, tag: "bed" },
      { x: 858, y: 362, tag: "dresser" }, { x: 926, y: 368, tag: "wall" }, { x: 520, y: 512, tag: "chair" },
      { x: 680, y: 530, tag: "floor" }, { x: 842, y: 532, tag: "window" }, { x: 936, y: 522, tag: "dresser" }
    ],
    hideSpots: [{ x: 952, y: 572 }, { x: 922, y: 572 }],
    lowImpactSpots: [{ x: 476, y: 302 }, { x: 968, y: 302 }],
    permanentBonus: 9,
    permanentFeature: "Decorative pillows resist removal"
  }
];

const WALLS = [
  { x: 30, y: 334, w: 190, h: 12 },
  { x: 300, y: 334, w: 150, h: 12 },
  { x: 454, y: 66, w: 12, h: 360 },
  { x: 454, y: 492, w: 12, h: 98 },
  { x: 470, y: 282, w: 280, h: 12 },
  { x: 840, y: 282, w: 130, h: 12 }
];

const FURNITURE = [
  { id: "living_sofa", label: "Sofa", rect: { x: 140, y: 210, w: 170, h: 46 }, color: "#b9afc4" },
  { id: "living_table", label: "Coffee", rect: { x: 92, y: 128, w: 94, h: 44 }, color: "#c79f7f" },
  { id: "living_tv", label: "TV", rect: { x: 332, y: 208, w: 90, h: 34 }, color: "#616875" },
  { id: "living_shelf", label: "Shelf", rect: { x: 46, y: 236, w: 30, h: 84 }, color: "#947856" },
  { id: "hall_shoes", label: "Shoes", rect: { x: 54, y: 512, w: 92, h: 40 }, color: "#9b8f81" },
  { id: "hall_bench", label: "Bench", rect: { x: 246, y: 528, w: 150, h: 38 }, color: "#8b6f50" },
  { id: "kitchen_counter", label: "Counter", rect: { x: 486, y: 88, w: 186, h: 32 }, color: "#7e8b96" },
  { id: "kitchen_island", label: "Island", rect: { x: 514, y: 188, w: 110, h: 54 }, color: "#8f8f8f" },
  { id: "bath_sink", label: "Sink", rect: { x: 734, y: 90, w: 86, h: 34 }, color: "#7f8f9c" },
  { id: "bath_tub", label: "Tub", rect: { x: 850, y: 164, w: 102, h: 70 }, color: "#b2c8d6" },
  { id: "bed_main", label: "Bed", rect: { x: 542, y: 334, w: 220, h: 86 }, color: "#cbc0d7" },
  { id: "bed_dresser", label: "Dresser", rect: { x: 846, y: 334, w: 110, h: 46 }, color: "#8f7a66" },
  { id: "bed_wardrobe", label: "Wardrobe", rect: { x: 914, y: 438, w: 48, h: 130 }, color: "#75665f" }
];

const COLLIDERS = [...WALLS, ...FURNITURE.map((item) => item.rect)];

function loadImage(path, fallbackPath) {
  const image = new Image();

  if (fallbackPath) {
    let retried = false;
    image.onerror = () => {
      if (retried) return;
      retried = true;
      image.src = fallbackPath;
    };
  }

  image.src = path;
  return image;
}

const SPRITES = {
  girl: {
    up: loadImage("images/girl_back.png", "image-folder/girl_back.png"),
    down: loadImage("images/girl_front.png", "image-folder/girl_front.png"),
    left: loadImage("images/girl_left.png", "image-folder/girl_left.png"),
    right: loadImage("images/girl_right.png", "image-folder/girl_right.png")
  },
  avatar: loadImage("images/girl_avatar.png", "image-folder/girl_avatar.png")
};

const audioState = { context: null, enabled: true };
const input = { held: new Set(), pressed: new Set() };

function buildRoomState() {
  const map = {};
  for (const room of ROOMS) {
    map[room.id] = { status: "Neutral", score: 0, permanentUnlocked: false, permanentBonus: 0, feature: room.permanentFeature };
  }
  return map;
}

function createInitialState() {
  return {
    player: { x: 170, y: 475, radius: 12, speed: 190 },
    items: [],
    nextItemId: 1,
    girlfriend: {
      active: false,
      phase: "idle",
      x: WORLD.entrance.x - 58,
      y: WORLD.entrance.y,
      targetX: WORLD.entrance.x,
      targetY: WORLD.entrance.y,
      pendingItem: null,
      line: "",
      speed: 132,
      facing: "down"
    },
    meters: { girlification: 0, annoyance: 0 },
    synergies: [],
    roomState: buildRoomState(),
    spawnTimer: randRange(20, 40),
    elapsed: 0,
    day: 1,
    dayDuration: 55,
    targetDays: 3,
    timeInDay: 0,
    subtitle: { text: "Defend the bachelor apartment without making it weird.", timer: 5, speaker: "narrator" },
    actionMenu: { open: false, itemId: null },
    nearestItemId: null,
    recentRemovals: [],
    lastActionTime: -999,
    lastBumpAt: -999,
    moodSwing: { active: false, daysTriggered: 0, lockUntilDay: 2 },
    comboRaid: { active: false, remaining: 0, timer: 0, nextEligibleAt: 35 },
    powerups: {
      closetBlitz: { cooldown: 28, duration: 6, readyAt: 0, activeFor: 0 },
      calmTalk: { cooldown: 36, duration: 8, readyAt: 0, activeFor: 0 }
    },
    gameOver: false,
    result: "",
    stats: { removed: 0, hidden: 0, relocated: 0, roomsLost: 0, suspicionTriggered: 0 }
  };
}

let state = createInitialState();

window.addEventListener("keydown", (event) => {
  const watched = ["KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyQ", "KeyF", "Digit1", "Digit2", "Digit3", "Escape", "KeyR"];
  if (watched.includes(event.code)) {
    event.preventDefault();
  }

  if (!input.held.has(event.code)) {
    input.pressed.add(event.code);
  }
  input.held.add(event.code);

  ensureAudioReady();
});

window.addEventListener("keyup", (event) => {
  input.held.delete(event.code);
});
function ensureAudioReady() {
  if (!audioState.enabled) {
    return;
  }

  if (!audioState.context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      audioState.enabled = false;
      return;
    }
    audioState.context = new Ctor();
  }

  if (audioState.context.state === "suspended") {
    audioState.context.resume();
  }
}

function playSfx(kind) {
  ensureAudioReady();
  const audioContext = audioState.context;
  if (!audioContext || !audioState.enabled) {
    return;
  }

  const now = audioContext.currentTime;

  function tone(frequency, duration, type, volume, offset = 0) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now + offset);

    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(volume, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now + offset);
    oscillator.stop(now + offset + duration + 0.02);
  }

  if (kind === "menu") {
    tone(540, 0.08, "square", 0.035);
  } else if (kind === "place") {
    tone(520, 0.12, "sine", 0.03);
    tone(760, 0.12, "triangle", 0.02, 0.08);
  } else if (kind === "hide") {
    tone(240, 0.1, "triangle", 0.03);
  } else if (kind === "relocate") {
    tone(320, 0.08, "sine", 0.028);
    tone(370, 0.08, "sine", 0.022, 0.05);
  } else if (kind === "remove") {
    tone(280, 0.11, "sawtooth", 0.03);
    tone(170, 0.16, "sawtooth", 0.02, 0.05);
  } else if (kind === "danger") {
    tone(820, 0.12, "square", 0.04);
    tone(620, 0.12, "square", 0.03, 0.13);
  } else if (kind === "bump") {
    tone(150, 0.05, "triangle", 0.018);
  } else if (kind === "powerup") {
    tone(470, 0.08, "triangle", 0.03);
    tone(640, 0.09, "triangle", 0.028, 0.06);
  } else if (kind === "raid") {
    tone(700, 0.1, "square", 0.04);
    tone(840, 0.1, "square", 0.035, 0.08);
  } else if (kind === "win") {
    tone(520, 0.12, "triangle", 0.03);
    tone(640, 0.16, "triangle", 0.03, 0.11);
    tone(780, 0.18, "triangle", 0.025, 0.23);
  } else if (kind === "lose") {
    tone(280, 0.16, "sine", 0.03);
    tone(220, 0.18, "sine", 0.028, 0.12);
    tone(170, 0.2, "sine", 0.022, 0.25);
  }
}

function consumePressed(code) {
  if (input.pressed.has(code)) {
    input.pressed.delete(code);
    return true;
  }
  return false;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function circleIntersectsRect(x, y, radius, rect) {
  const nearestX = clamp(x, rect.x, rect.x + rect.w);
  const nearestY = clamp(y, rect.y, rect.y + rect.h);
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function collidesWithStatic(x, y, radius) {
  return COLLIDERS.some((rect) => circleIntersectsRect(x, y, radius, rect));
}

function getRoomById(roomId) {
  return ROOMS.find((room) => room.id === roomId);
}

function getItemById(itemId) {
  return state.items.find((item) => item.id === itemId);
}

function canUseTypeToday(type) {
  return state.day >= ITEM_DEFS[type].unlockDay;
}

function findFreeSpot(room, type) {
  const definition = ITEM_DEFS[type];
  const preferred = room.spots.filter((spot) => definition.preferredTags.includes(spot.tag));
  const baseCandidates = preferred.length > 0 ? preferred : room.spots;

  const free = baseCandidates.filter((spot) => {
    return !state.items.some((item) => dist(item.x, item.y, spot.x, spot.y) < 26);
  });

  const pool = free.length > 0 ? free : baseCandidates;
  return pool.length > 0 ? pick(pool) : null;
}

function showSubtitle(text, duration = 3.5, options = {}) {
  state.subtitle.text = text;
  state.subtitle.timer = duration;
  state.subtitle.speaker = options.speaker || "narrator";
}

function nearestItem(maxRange) {
  let nearest = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of state.items) {
    const distance = dist(state.player.x, state.player.y, item.x, item.y);
    if (distance < maxRange && distance < bestDistance) {
      nearest = item;
      bestDistance = distance;
    }
  }

  return nearest;
}

function updatePlayer(dt) {
  if (state.actionMenu.open) {
    return;
  }

  let moveX = 0;
  let moveY = 0;

  if (input.held.has("KeyW")) moveY -= 1;
  if (input.held.has("KeyS")) moveY += 1;
  if (input.held.has("KeyA")) moveX -= 1;
  if (input.held.has("KeyD")) moveX += 1;

  if (moveX === 0 && moveY === 0) {
    return;
  }

  const len = Math.hypot(moveX, moveY);
  moveX = (moveX / len) * state.player.speed * dt;
  moveY = (moveY / len) * state.player.speed * dt;

  let bumped = false;

  const nextX = clamp(state.player.x + moveX, WORLD.bounds.x, WORLD.bounds.x + WORLD.bounds.w);
  if (!collidesWithStatic(nextX, state.player.y, state.player.radius)) {
    state.player.x = nextX;
  } else {
    bumped = true;
  }

  const nextY = clamp(state.player.y + moveY, WORLD.bounds.y, WORLD.bounds.y + WORLD.bounds.h);
  if (!collidesWithStatic(state.player.x, nextY, state.player.radius)) {
    state.player.y = nextY;
  } else {
    bumped = true;
  }

  if (bumped && state.elapsed - state.lastBumpAt > 0.2) {
    state.lastBumpAt = state.elapsed;
    playSfx("bump");
  }
}

function updateInteraction() {
  const near = nearestItem(48);
  state.nearestItemId = near ? near.id : null;

  if (consumePressed("KeyE")) {
    if (state.actionMenu.open) {
      state.actionMenu.open = false;
      state.actionMenu.itemId = null;
    } else if (near) {
      state.actionMenu.open = true;
      state.actionMenu.itemId = near.id;
      playSfx("menu");
    }
  }

  if (!state.actionMenu.open) {
    return;
  }

  const selected = getItemById(state.actionMenu.itemId);
  if (!selected) {
    state.actionMenu.open = false;
    state.actionMenu.itemId = null;
    return;
  }

  if (consumePressed("Escape")) {
    state.actionMenu.open = false;
    state.actionMenu.itemId = null;
    return;
  }

  if (consumePressed("Digit1")) performAction(selected, "hide");
  if (consumePressed("Digit2")) performAction(selected, "relocate");
  if (consumePressed("Digit3")) performAction(selected, "remove");
}

function isPowerupActive(name) {
  return state.powerups[name].activeFor > 0;
}

function powerupCooldownLeft(name) {
  return Math.max(0, state.powerups[name].readyAt - state.elapsed);
}

function activateClosetBlitz() {
  const power = state.powerups.closetBlitz;
  if (state.elapsed < power.readyAt) {
    return;
  }

  power.readyAt = state.elapsed + power.cooldown;
  power.activeFor = power.duration;

  const candidates = state.items
    .filter((item) => item.state !== "hidden")
    .sort((a, b) => dist(state.player.x, state.player.y, a.x, a.y) - dist(state.player.x, state.player.y, b.x, b.y));

  let moved = 0;
  for (const item of candidates) {
    if (dist(state.player.x, state.player.y, item.x, item.y) > 150) {
      continue;
    }

    const room = getRoomById(item.roomId);
    const target = pick(room.hideSpots);
    item.x = target.x + randRange(-5, 5);
    item.y = target.y + randRange(-4, 4);
    item.state = "hidden";
    moved += 1;

    if (moved >= 3) {
      break;
    }
  }

  const noun = moved === 1 ? "item" : "items";
  if (moved > 0) {
    showSubtitle("Closet Blitz: hid " + moved + " " + noun + " in one sweep.", 2.8);
  } else {
    showSubtitle("Closet Blitz ready. No nearby clutter to hide.", 2.8);
  }
  playSfx("powerup");
}

function activateCalmTalk() {
  const power = state.powerups.calmTalk;
  if (state.elapsed < power.readyAt) {
    return;
  }

  power.readyAt = state.elapsed + power.cooldown;
  power.activeFor = power.duration;
  state.meters.annoyance = clamp(state.meters.annoyance - 14, 0, 100);

  showSubtitle("Calm Talk active: tension drops and reactions soften.", 2.8);
  playSfx("powerup");
}

function tryActivatePowerups() {
  if (consumePressed("KeyQ")) {
    activateClosetBlitz();
  }
  if (consumePressed("KeyF")) {
    activateCalmTalk();
  }
}

function updatePowerups(dt) {
  for (const key of Object.keys(state.powerups)) {
    state.powerups[key].activeFor = Math.max(0, state.powerups[key].activeFor - dt);
  }
}
function girlfriendNearby(item) {
  if (!state.girlfriend.active) {
    return false;
  }
  return dist(state.girlfriend.x, state.girlfriend.y, item.x, item.y) < 130;
}

function raiseAnnoyance(amount) {
  let adjusted = amount;

  if (state.moodSwing.active) {
    adjusted *= 1.28;
  }
  if (isPowerupActive("calmTalk")) {
    adjusted *= 0.6;
  }
  if (isPowerupActive("closetBlitz")) {
    adjusted *= 0.85;
  }

  const before = state.meters.annoyance;
  state.meters.annoyance = clamp(state.meters.annoyance + adjusted, 0, 100);

  if (before < 70 && state.meters.annoyance >= 70) {
    state.stats.suspicionTriggered += 1;
    playSfx("danger");
  }
}

function computeItemInfluence(item) {
  let actionFactor = 1;
  if (item.state === "hidden") actionFactor = 0.35;
  if (item.state === "relocated") actionFactor = 0.66;

  const ageSeconds = Math.max(0, state.elapsed - item.placedAt);
  const ageFactor = 1 + Math.min(ageSeconds, 120) / 120 * 0.62;

  return item.value * actionFactor * ageFactor;
}

function computeRoomInfluence(roomId) {
  return state.items
    .filter((item) => item.roomId === roomId)
    .reduce((sum, item) => sum + computeItemInfluence(item), 0);
}

function performAction(item, action) {
  const room = getRoomById(item.roomId);
  const wasRoomScore = computeRoomInfluence(item.roomId);
  let annoyanceDelta = 0;

  if (action === "hide") {
    const target = pick(room.hideSpots);
    item.x = target.x + randRange(-6, 6);
    item.y = target.y + randRange(-5, 5);
    item.state = "hidden";
    annoyanceDelta += girlfriendNearby(item) ? 3 : 1;
    state.stats.hidden += 1;
    showSubtitle("You quietly tucked it away.", 2.5);
    playSfx("hide");
  }

  if (action === "relocate") {
    const target = pick(room.lowImpactSpots);
    item.x = target.x + randRange(-7, 7);
    item.y = target.y + randRange(-6, 6);
    item.state = "relocated";
    annoyanceDelta += girlfriendNearby(item) ? 2 : 0.5;
    state.stats.relocated += 1;
    showSubtitle("Relocated to a low-impact bachelor corner.", 2.5);
    playSfx("relocate");
  }

  if (action === "remove") {
    annoyanceDelta += item.annoyance;
    if (girlfriendNearby(item)) annoyanceDelta += 14;

    const rapidWindow = state.recentRemovals.filter((t) => state.elapsed - t < 18).length;
    if (rapidWindow >= 2) annoyanceDelta += 7;
    if (item.useful) annoyanceDelta += 6;
    if (state.roomState[item.roomId].status === "Girlified") annoyanceDelta += 5;

    state.items = state.items.filter((entry) => entry.id !== item.id);
    state.recentRemovals.push(state.elapsed);
    state.stats.removed += 1;

    const nowRoomScore = computeRoomInfluence(item.roomId);
    if (wasRoomScore - nowRoomScore > 9) annoyanceDelta += 6;

    showSubtitle("Hard removal. Risky, but effective.", 2.5);
    playSfx("remove");
  }

  if (action === "remove" && item.type === "pillow" && state.roomState.bedroom.permanentUnlocked) {
    annoyanceDelta += 4;
  }

  raiseAnnoyance(annoyanceDelta);
  state.lastActionTime = state.elapsed;
  state.actionMenu.open = false;
  state.actionMenu.itemId = null;
}
function chooseRoomForPlacement() {
  const weighted = [];
  for (const room of ROOMS) {
    const status = state.roomState[room.id].status;
    const repeat = status === "Neutral" ? 3 : status === "Contested" ? 2 : 1;
    for (let i = 0; i < repeat; i += 1) {
      weighted.push(room);
    }
  }
  return pick(weighted);
}

function chooseTypeForRoom(room) {
  const allowed = room.allowed.filter(canUseTypeToday);
  if (allowed.length === 0) {
    return null;
  }

  if (state.day >= 2) {
    const spicy = allowed.filter((type) => ["fairy_lights", "storage_box", "basket"].includes(type));
    if (spicy.length > 0 && Math.random() < 0.45) {
      return pick(spicy);
    }
  }

  return pick(allowed);
}

function beginPlacementEvent(options = {}) {
  const room = chooseRoomForPlacement();
  const type = chooseTypeForRoom(room);
  if (!type) {
    return false;
  }

  const spot = findFreeSpot(room, type);
  if (!spot) {
    return false;
  }

  const definition = ITEM_DEFS[type];
  const item = {
    id: state.nextItemId,
    type,
    roomId: room.id,
    x: spot.x,
    y: spot.y,
    value: definition.value,
    annoyance: definition.annoyance,
    useful: definition.useful,
    state: "active",
    placedByGirlfriend: true,
    placedAt: state.elapsed
  };

  state.nextItemId += 1;

  const spawnAtDoor = Math.random() < 0.7;
  state.girlfriend.active = true;
  state.girlfriend.phase = "arriving";
  state.girlfriend.pendingItem = item;
  state.girlfriend.line = options.forcedLine || pick(DIALOGUE_LINES);

  if (spawnAtDoor) {
    state.girlfriend.x = WORLD.entrance.x - 58;
    state.girlfriend.y = WORLD.entrance.y;
  } else {
    state.girlfriend.x = randRange(180, 940);
    state.girlfriend.y = -24;
  }

  state.girlfriend.targetX = spot.x - 18;
  state.girlfriend.targetY = spot.y - 14;
  return true;
}

function maybeStartComboRaid() {
  if (state.comboRaid.active) {
    return;
  }
  if (state.elapsed < state.comboRaid.nextEligibleAt) {
    return;
  }

  if (state.day < 2 && state.meters.girlification < 30) {
    return;
  }

  let chance = 0.14 + (state.day - 1) * 0.05 + (state.meters.girlification / 100) * 0.08;
  if (state.moodSwing.active) {
    chance += 0.12;
  }

  if (Math.random() > chance) {
    return;
  }

  state.comboRaid.active = true;
  state.comboRaid.remaining = Math.random() < 0.55 ? 2 : 3;
  state.comboRaid.timer = randRange(1.8, 3.2);
  state.comboRaid.nextEligibleAt = state.elapsed + randRange(65, 95);

  showSubtitle('Combo raid: she brought a few "small practical things" at once.', 3.4);
  playSfx("raid");
}

function updateGirlfriend(dt) {
  if (!state.girlfriend.active) {
    return;
  }

  const g = state.girlfriend;
  const dx = g.targetX - g.x;
  const dy = g.targetY - g.y;
  const distance = Math.hypot(dx, dy);

  if (Math.abs(dx) > Math.abs(dy)) {
    g.facing = dx >= 0 ? "right" : "left";
  } else {
    g.facing = dy >= 0 ? "down" : "up";
  }

  if (distance > 0.001) {
    const speedMultiplier = state.moodSwing.active ? 1.22 : 1;
    const step = Math.min(distance, g.speed * speedMultiplier * dt);
    g.x += (dx / distance) * step;
    g.y += (dy / distance) * step;
  }

  if (distance > 6) {
    return;
  }

  if (g.phase === "arriving" && g.pendingItem) {
    g.pendingItem.placedAt = state.elapsed;
    state.items.push(g.pendingItem);

    showSubtitle(g.line, 5.2, { speaker: "girlfriend" });
    playSfx("place");

    g.phase = "leaving";
    g.pendingItem = null;
    g.targetX = WORLD.entrance.x - 64;
    g.targetY = WORLD.entrance.y;
    return;
  }

  if (g.phase === "leaving") {
    state.girlfriend.active = false;
    state.girlfriend.phase = "idle";
  }
}

function currentSpawnWindow() {
  const pressure = (state.day - 1) * 0.9 + (state.meters.girlification / 100) * 2.2;
  let min = clamp(20 - pressure * 2.7, 10, 20);
  let max = clamp(40 - pressure * 4.1, min + 6, 40);

  if (state.moodSwing.active) {
    min *= 0.72;
    max *= 0.72;
  }

  min = clamp(min, 6, 20);
  max = clamp(max, min + 4, 40);
  return { min, max };
}

function updateSpawnTimer(dt) {
  if (state.gameOver) {
    return;
  }
  if (state.girlfriend.active) {
    return;
  }

  if (state.comboRaid.active) {
    state.comboRaid.timer -= dt;
    if (state.comboRaid.timer <= 0) {
      const didSpawn = beginPlacementEvent();
      if (didSpawn) {
        state.comboRaid.remaining -= 1;
      }

      if (state.comboRaid.remaining <= 0) {
        state.comboRaid.active = false;
      } else {
        state.comboRaid.timer = randRange(1.6, 2.8);
      }
    }
    return;
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    const didSpawn = beginPlacementEvent();
    if (didSpawn) {
      maybeStartComboRaid();
    }
    const window = currentSpawnWindow();
    state.spawnTimer = randRange(window.min, window.max);
  }
}

function shouldTriggerMoodSwing(dayNumber) {
  if (dayNumber < 2) {
    return false;
  }
  if (state.moodSwing.daysTriggered >= 1) {
    return false;
  }
  if (dayNumber < state.moodSwing.lockUntilDay) {
    return false;
  }

  const chance = 0.27 + (dayNumber - 2) * 0.03;
  return Math.random() < chance;
}

function updateDayCycle(dt) {
  state.timeInDay += dt;
  if (state.timeInDay >= state.dayDuration) {
    state.timeInDay -= state.dayDuration;
    state.day += 1;

    if (state.day <= state.targetDays) {
      state.moodSwing.active = false;

      if (shouldTriggerMoodSwing(state.day)) {
        state.moodSwing.active = true;
        state.moodSwing.daysTriggered += 1;
        state.moodSwing.lockUntilDay = state.day + 2;
        showSubtitle("Day " + state.day + ": mood swing day. Everything feels extra sensitive.", 4.1);
        playSfx("danger");
      } else {
        showSubtitle("Day " + state.day + " begins. Domestic pressure escalates.", 3.6);
      }
    }
  }
}

function computeGirlification() {
  const roomTotals = {};
  for (const room of ROOMS) {
    roomTotals[room.id] = 0;
  }

  for (const item of state.items) {
    roomTotals[item.roomId] += computeItemInfluence(item);
  }

  const synergyList = [];
  let synergyBonus = 0;

  for (const room of ROOMS) {
    const visibleInRoom = state.items.filter((item) => item.roomId === room.id && item.state !== "hidden");
    const types = new Set(visibleInRoom.map((item) => item.type));

    if (types.has("candle") && types.has("blanket") && types.has("pillow")) {
      synergyBonus += 7;
      synergyList.push(`${room.name}: Cozy Combo`);
    }

    if (room.id === "bathroom") {
      const bathroomItems = visibleInRoom.filter((item) => ["skincare", "candle", "basket", "plant"].includes(item.type));
      if (bathroomItems.length >= 3) {
        synergyBonus += 8;
        synergyList.push("Bathroom: Established Presence");
      }
    }

    if (room.id === "kitchen") {
      const mugs = visibleInRoom.filter((item) => item.type === "mug").length;
      if (mugs >= 3) {
        synergyBonus += 6;
        synergyList.push("Kitchen: Domestic Drift");
      }
    }
  }

  for (const room of ROOMS) {
    roomTotals[room.id] += state.roomState[room.id].permanentBonus;
  }

  const raw = Object.values(roomTotals).reduce((a, b) => a + b, 0) + synergyBonus;
  state.meters.girlification = clamp(raw * 1.14, 0, 100);
  state.synergies = synergyList;

  for (const room of ROOMS) {
    const previousStatus = state.roomState[room.id].status;
    const score = roomTotals[room.id];
    let nextStatus = "Neutral";

    if (score >= 32) {
      nextStatus = "Girlified";
    } else if (score >= 16) {
      nextStatus = "Contested";
    }

    state.roomState[room.id].score = score;
    state.roomState[room.id].status = nextStatus;

    if (nextStatus === "Girlified" && !state.roomState[room.id].permanentUnlocked) {
      state.roomState[room.id].permanentUnlocked = true;
      state.roomState[room.id].permanentBonus = getRoomById(room.id).permanentBonus;
      state.stats.roomsLost += 1;

      if (state.subtitle.timer < 1.2) {
        showSubtitle(`${room.name} flipped to Girlified: ${state.roomState[room.id].feature}.`, 3.5);
      }
    }

    if (previousStatus !== nextStatus && previousStatus === "Girlified" && nextStatus !== "Girlified") {
      if (state.subtitle.timer < 1.2) {
        showSubtitle(`${room.name} reclaimed to ${nextStatus}.`, 2.5);
      }
    }
  }
}

function decayAnnoyance(dt) {
  let decay = 0.38;
  if (state.elapsed - state.lastActionTime > 10) {
    decay = 1.0;
  }

  if (state.moodSwing.active) {
    decay *= 0.52;
  }
  if (isPowerupActive("calmTalk")) {
    decay += 0.45;
  }

  state.meters.annoyance = clamp(state.meters.annoyance - decay * dt, 0, 100);
}

function checkEndConditions() {
  if (state.gameOver) {
    return;
  }

  if (state.meters.girlification >= 100) {
    state.gameOver = true;
    state.result = "girlified";
    showSubtitle("It is no longer your minimalist era.", 4);
    playSfx("lose");
    return;
  }

  if (state.meters.annoyance >= 100) {
    state.gameOver = true;
    state.result = "annoyed";
    showSubtitle("Relationship tension reached maximum.", 4);
    playSfx("lose");
    return;
  }

  if (state.day > state.targetDays) {
    state.gameOver = true;
    state.result = "win";
    showSubtitle("You survived the week without full takeover.", 4);
    playSfx("win");
  }
}

function update(dt) {
  if (consumePressed("KeyR") && state.gameOver) {
    state = createInitialState();
    return;
  }

  if (state.gameOver) {
    if (state.subtitle.timer > 0) {
      state.subtitle.timer -= dt;
    }
    input.pressed.clear();
    return;
  }

  state.elapsed += dt;

  tryActivatePowerups();
  updatePowerups(dt);
  updatePlayer(dt);
  updateInteraction();
  updateGirlfriend(dt);
  updateSpawnTimer(dt);
  updateDayCycle(dt);

  state.recentRemovals = state.recentRemovals.filter((t) => state.elapsed - t < 25);

  computeGirlification();
  decayAnnoyance(dt);
  checkEndConditions();

  if (state.subtitle.timer > 0) {
    state.subtitle.timer -= dt;
  }

  input.pressed.clear();
}
function drawMeter(x, y, width, height, label, value, fillColor) {
  ctx.fillStyle = "rgba(13, 17, 21, 0.45)";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width * (value / 100), height);

  ctx.strokeStyle = "#1d2329";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = "#111";
  ctx.font = "bold 13px Trebuchet MS";
  ctx.fillText(`${label}: ${value.toFixed(0)}%`, x + 8, y + 16);
}

function drawRooms(warmth) {
  for (const room of ROOMS) {
    const rs = state.roomState[room.id];

    let fill = "#d9e0ea";
    if (rs.status === "Contested") fill = "#e3d6c4";
    if (rs.status === "Girlified") fill = "#e9cbb8";

    const tint = 0.15 + warmth * 0.35;
    ctx.fillStyle = shade(fill, tint);
    ctx.fillRect(room.rect.x, room.rect.y, room.rect.w, room.rect.h);

    ctx.strokeStyle = "#3b4450";
    ctx.lineWidth = 2;
    ctx.strokeRect(room.rect.x, room.rect.y, room.rect.w, room.rect.h);

    ctx.fillStyle = "#1a2128";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText(room.name, room.rect.x + 8, room.rect.y + 19);

    ctx.font = "12px Trebuchet MS";
    ctx.fillText(`${rs.status} (${rs.score.toFixed(0)})`, room.rect.x + 8, room.rect.y + 36);

    if (rs.permanentUnlocked) {
      ctx.fillStyle = "rgba(143, 80, 42, 0.9)";
      ctx.font = "11px Trebuchet MS";
      ctx.fillText("Permanent effect active", room.rect.x + 8, room.rect.y + room.rect.h - 10);
    }
  }

  ctx.fillStyle = "#5f6a76";
  ctx.fillRect(WORLD.entrance.x - 6, WORLD.entrance.y - 34, 12, 70);
  ctx.fillStyle = "#1e262e";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText("Entrance", WORLD.entrance.x + 12, WORLD.entrance.y + 3);
}

function drawStaticLayout() {
  for (const wall of WALLS) {
    ctx.fillStyle = "#454f5a";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  }

  for (const furniture of FURNITURE) {
    ctx.fillStyle = furniture.color;
    ctx.fillRect(furniture.rect.x, furniture.rect.y, furniture.rect.w, furniture.rect.h);

    ctx.strokeStyle = "rgba(16, 18, 22, 0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(furniture.rect.x, furniture.rect.y, furniture.rect.w, furniture.rect.h);

    ctx.fillStyle = "rgba(10, 12, 15, 0.65)";
    ctx.font = "10px Trebuchet MS";
    ctx.fillText(furniture.label, furniture.rect.x + 4, furniture.rect.y + 12);
  }
}

function drawItems() {
  for (const item of state.items) {
    const definition = ITEM_DEFS[item.type];
    const selected = state.actionMenu.open && state.actionMenu.itemId === item.id;
    const near = state.nearestItemId === item.id && !state.actionMenu.open;

    ctx.save();
    if (item.state === "hidden") {
      ctx.globalAlpha = 0.48;
    }

    ctx.fillStyle = definition.color;
    ctx.fillRect(item.x - 10, item.y - 10, 20, 20);

    ctx.strokeStyle = selected ? "#111" : near ? "#2757d6" : "#303642";
    ctx.lineWidth = selected ? 3 : near ? 2.5 : 1.4;
    ctx.strokeRect(item.x - 10, item.y - 10, 20, 20);

    if (item.state === "relocated") {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = "#273547";
      ctx.strokeRect(item.x - 13, item.y - 13, 26, 26);
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#111";
    ctx.font = "bold 10px monospace";
    ctx.fillText(definition.abbr, item.x - 8, item.y + 4);

    ctx.restore();
  }
}

function drawPlayer() {
  ctx.fillStyle = "#4a86dc";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#132741";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px monospace";
  ctx.fillText("YOU", state.player.x - 12, state.player.y + 3);
}

function isLoaded(image) {
  return Boolean(image && image.complete && image.naturalWidth > 0);
}

function drawGirlfriend() {
  if (!state.girlfriend.active) {
    return;
  }

  const sprite = SPRITES.girl[state.girlfriend.facing] || SPRITES.girl.down;
  if (isLoaded(sprite)) {
    ctx.drawImage(sprite, state.girlfriend.x - 18, state.girlfriend.y - 30, 36, 54);
    return;
  }

  ctx.fillStyle = "#ff8faf";
  ctx.beginPath();
  ctx.arc(state.girlfriend.x, state.girlfriend.y, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#72334f";
  ctx.fillRect(state.girlfriend.x - 4, state.girlfriend.y - 18, 8, 6);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px monospace";
  ctx.fillText("G", state.girlfriend.x - 3, state.girlfriend.y + 3);
}

function drawHud() {
  const girl = state.meters.girlification;
  const annoyance = state.meters.annoyance;

  drawMeter(18, 10, 305, 22, "Girlification", girl, "#ec8fa0");
  drawMeter(336, 10, 305, 22, "Annoyance", annoyance, "#e09c59");

  ctx.fillStyle = "#1b2228";
  ctx.font = "bold 13px Trebuchet MS";
  const dayShown = Math.min(state.day, state.targetDays);
  const dayPercent = Math.floor((state.timeInDay / state.dayDuration) * 100);
  ctx.fillText("Day " + dayShown + "/" + state.targetDays + "  (" + dayPercent + "% of current day)", 654, 24);

  const bachelor = Math.max(0, 100 - girl).toFixed(0);
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Bachelor apartment preserved: " + bachelor + "%", 654, 40);

  const moodText = state.moodSwing.active ? "Mood Swing Day: ACTIVE" : "Mood Swing Day: calm";
  ctx.fillStyle = state.moodSwing.active ? "#9c222c" : "#2a3c4f";
  ctx.font = "bold 12px Trebuchet MS";
  ctx.fillText(moodText, 654, 56);

  const qCd = powerupCooldownLeft("closetBlitz");
  const fCd = powerupCooldownLeft("calmTalk");
  const qStatus = isPowerupActive("closetBlitz") ? "ACTIVE" : qCd <= 0 ? "READY" : qCd.toFixed(0) + "s";
  const fStatus = isPowerupActive("calmTalk") ? "ACTIVE" : fCd <= 0 ? "READY" : fCd.toFixed(0) + "s";

  ctx.fillStyle = "#1f2a35";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText("Q Closet Blitz: " + qStatus, 654, 72);
  ctx.fillText("F Calm Talk: " + fStatus, 654, 86);

  if (state.comboRaid.active) {
    ctx.fillStyle = "rgba(116, 18, 24, 0.86)";
    ctx.fillRect(350, 42, 300, 28);
    ctx.strokeStyle = "#f3d7dc";
    ctx.lineWidth = 2;
    ctx.strokeRect(350, 42, 300, 28);
    ctx.fillStyle = "#ffeef1";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText("Combo Raid Incoming: " + state.comboRaid.remaining + " drop(s)", 365, 61);
  }

  const synergies = state.synergies.length > 0 ? state.synergies.join(" | ") : "No active synergy bonuses";
  ctx.fillStyle = "rgba(18, 24, 31, 0.8)";
  ctx.fillRect(18, 604, 964, 24);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Synergies: " + synergies, 24, 620);
}

function drawInteractionPrompt() {
  if (state.actionMenu.open || !state.nearestItemId) {
    return;
  }

  const item = getItemById(state.nearestItemId);
  if (!item) {
    return;
  }

  const definition = ITEM_DEFS[item.type];
  const text = `Press E: ${definition.name}`;
  ctx.font = "11px Trebuchet MS";
  const width = Math.max(140, ctx.measureText(text).width + 20);

  ctx.fillStyle = "rgba(6, 10, 13, 0.75)";
  ctx.fillRect(item.x - width / 2, item.y - 34, width, 20);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, item.x - width / 2 + 10, item.y - 20);
}

function drawActionMenu() {
  if (!state.actionMenu.open) {
    return;
  }

  const item = getItemById(state.actionMenu.itemId);
  if (!item) {
    return;
  }

  const definition = ITEM_DEFS[item.type];

  const panel = { x: 320, y: 472, w: 360, h: 118 };
  ctx.fillStyle = "rgba(18, 22, 29, 0.92)";
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.strokeStyle = "#f3d8cc";
  ctx.lineWidth = 2;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText(`Action: ${definition.name} (${item.state})`, panel.x + 12, panel.y + 22);

  ctx.font = "12px Trebuchet MS";
  ctx.fillText("1) Hide: small Girlification reduction, low annoyance risk", panel.x + 12, panel.y + 46);
  ctx.fillText("2) Relocate: tiny reduction, safest option", panel.x + 12, panel.y + 66);
  ctx.fillText("3) Remove: big reduction, high annoyance risk", panel.x + 12, panel.y + 86);
  ctx.fillText("Esc/E) Cancel", panel.x + 12, panel.y + 106);
}
function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (const word of words) {
    const test = line.length === 0 ? word : `${line} ${word}`;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line.length > 0) {
    lines.push(line);
  }

  const shown = lines.slice(0, maxLines);
  for (let i = 0; i < shown.length; i += 1) {
    ctx.fillText(shown[i], x, y + i * lineHeight);
  }
}

function drawSubtitle() {
  if (state.subtitle.timer <= 0 || !state.subtitle.text) {
    return;
  }

  const text = state.subtitle.text;

  if (state.subtitle.speaker === "girlfriend") {
    const bubble = { x: 22, y: 534, w: 784, h: 56 };
    ctx.fillStyle = "rgba(8, 11, 16, 0.86)";
    ctx.fillRect(bubble.x, bubble.y, bubble.w, bubble.h);
    ctx.strokeStyle = "#f4d6dd";
    ctx.lineWidth = 2;
    ctx.strokeRect(bubble.x, bubble.y, bubble.w, bubble.h);

    ctx.fillStyle = "#ffdce7";
    ctx.font = "bold 12px Trebuchet MS";
    ctx.fillText("Girlfriend", bubble.x + 12, bubble.y + 16);

    ctx.fillStyle = "#f5f1e8";
    ctx.font = "16px Trebuchet MS";
    drawWrappedText(text, bubble.x + 12, bubble.y + 40, bubble.w - 28, 18, 2);

    const panel = { x: 822, y: 474, w: 160, h: 116 };
    ctx.fillStyle = "rgba(10, 13, 18, 0.93)";
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.strokeStyle = "#f3d6df";
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

    if (isLoaded(SPRITES.avatar)) {
      ctx.drawImage(SPRITES.avatar, panel.x + 8, panel.y + 8, 80, 100);
    } else {
      ctx.fillStyle = "#ffb5cb";
      ctx.fillRect(panel.x + 8, panel.y + 8, 80, 100);
      ctx.fillStyle = "#321726";
      ctx.font = "bold 18px monospace";
      ctx.fillText("G", panel.x + 40, panel.y + 62);
    }

    ctx.fillStyle = "#f5f0ea";
    ctx.font = "bold 12px Trebuchet MS";
    ctx.fillText("Practical Logic", panel.x + 94, panel.y + 36);
    ctx.font = "11px Trebuchet MS";
    ctx.fillText("+1 mjuk eskalering", panel.x + 94, panel.y + 58);
    ctx.fillText("ofr\u00e5nkomlig k\u00e4nsla", panel.x + 94, panel.y + 74);
    return;
  }

  ctx.font = "16px Trebuchet MS";
  const measured = Math.min(740, ctx.measureText(text).width + 36);
  const x = (WORLD.width - measured) / 2;
  const y = 552;

  ctx.fillStyle = "rgba(7, 9, 12, 0.82)";
  ctx.fillRect(x, y, measured, 36);
  ctx.strokeStyle = "#e3ddd1";
  ctx.strokeRect(x, y, measured, 36);

  ctx.fillStyle = "#f5f1e8";
  ctx.fillText(text, x + 16, y + 24);
}

function drawEndScreen() {
  if (!state.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(3, 5, 9, 0.72)";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const panel = { x: 250, y: 160, w: 500, h: 320 };
  ctx.fillStyle = "#f9f3eb";
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.strokeStyle = "#2d3741";
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

  ctx.fillStyle = "#1a1f26";
  ctx.font = "bold 34px Trebuchet MS";
  ctx.fillText("Run Over", panel.x + 162, panel.y + 54);

  ctx.font = "bold 24px Trebuchet MS";
  if (state.result === "girlified") {
    ctx.fillText("It's her apartment now.", panel.x + 112, panel.y + 102);
  } else if (state.result === "annoyed") {
    ctx.fillText("You made it weird.", panel.x + 152, panel.y + 102);
  } else {
    const preserved = Math.max(0, 100 - state.meters.girlification).toFixed(0);
    ctx.fillText(`You preserved ${preserved}% of the original apartment.`, panel.x + 26, panel.y + 102);
  }

  ctx.font = "14px Trebuchet MS";
  const lines = [
    `Objects removed: ${state.stats.removed}`,
    `Objects hidden: ${state.stats.hidden}`,
    `Objects relocated: ${state.stats.relocated}`,
    `Rooms lost at least once: ${state.stats.roomsLost}`,
    `Suspicion triggered: ${state.stats.suspicionTriggered}`,
    `Final Girlification: ${state.meters.girlification.toFixed(0)}%`,
    `Final Annoyance: ${state.meters.annoyance.toFixed(0)}%`
  ];

  let y = panel.y + 150;
  for (const line of lines) {
    ctx.fillText(line, panel.x + 54, y);
    y += 24;
  }

  ctx.font = "bold 16px Trebuchet MS";
  ctx.fillText("Press R to restart", panel.x + 175, panel.y + 288);
}

function shade(hex, percent) {
  const p = clamp(percent, -1, 1);
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;

  const target = p < 0 ? 0 : 255;
  const f = Math.abs(p);

  const nr = Math.round((target - r) * f + r);
  const ng = Math.round((target - g) * f + g);
  const nb = Math.round((target - b) * f + b);

  return `rgb(${nr}, ${ng}, ${nb})`;
}

function drawBackground() {
  const warmth = state.meters.girlification / 100;

  const top = shade("#d8e0ea", warmth * 0.45);
  const bottom = shade("#f2e2d3", warmth * 0.55);
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  if (warmth > 0.18) {
    ctx.fillStyle = "rgba(255, 210, 175, " + (0.08 + warmth * 0.16) + ")";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  if (state.moodSwing.active) {
    const pulse = 0.1 + 0.05 * Math.sin(state.elapsed * 3.5);
    ctx.fillStyle = "rgba(168, 26, 36, " + pulse.toFixed(3) + ")";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}

function draw() {
  drawBackground();
  drawRooms(state.meters.girlification / 100);
  drawStaticLayout();
  drawItems();
  drawGirlfriend();
  drawPlayer();
  drawHud();
  drawInteractionPrompt();
  drawActionMenu();
  drawSubtitle();
  drawEndScreen();
}

let previous = performance.now();

function frame(now) {
  const dt = Math.min((now - previous) / 1000, 0.05);
  previous = now;

  update(dt);
  draw();

  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);

/* ==== SVENSK UTOKNING: UI-FIXAR, FLER EVENTS, STORRE FLICKVAN ==== */

const SV_ROOM_NAMES = {
  living: "Vardagsrum",
  kitchen: "Kök",
  bathroom: "Badrum",
  hallway: "Hall",
  bedroom: "Sovrum"
};

const SV_ROOM_FEATURES = {
  living: "Pleddar och ljus känns permanenta",
  kitchen: "Muggkolonin har etablerat sig",
  bathroom: "Hudvårdshyllan är här för att stanna",
  hallway: "Extra skor vid dörren",
  bedroom: "Prydnadskuddar sitter fast emotionellt"
};

const SV_FURNITURE_LABELS = {
  living_sofa: "Soffa",
  living_table: "Soffbord",
  living_tv: "TV",
  living_shelf: "Hylla",
  hall_shoes: "Skor",
  hall_bench: "B\u00e4nk",
  kitchen_counter: "B\u00e4nk",
  kitchen_island: "\u00d6",
  bath_sink: "Handfat",
  bath_tub: "Badkar",
  bed_main: "S\u00e4ng",
  bed_dresser: "Byr\u00e5",
  bed_wardrobe: "Garderob"
};
const SV_ITEM_OVERRIDES = {
  candle: { name: "Ljus", abbr: "LJ" },
  pillow: { name: "Prydnadskudde", abbr: "PK" },
  plant: { name: "Växt", abbr: "VX" },
  blanket: { name: "Filt", abbr: "FL" },
  framed_art: { name: "Tavla", abbr: "TV" },
  fairy_lights: { name: "Ljusslinga", abbr: "LS" },
  basket: { name: "Förvaringskorg", abbr: "FK" },
  storage_box: { name: "Praktisk låda", abbr: "PL" },
  skincare: { name: "Hudvård", abbr: "HV" },
  mug: { name: "Extra mugg", abbr: "MG" },
  bowl: { name: "Snackskål", abbr: "SK" },
  towel: { name: "Handduk", abbr: "HD" },
  hair_item: { name: "Hårgrej", abbr: "HR" },
  charger: { name: "Laddare", abbr: "LD" },
  sweater: { name: "Tröja", abbr: "TR" },
  tray: { name: "Serveringsbricka", abbr: "SB" },
  glass: { name: "Glas", abbr: "GL" },
  napkin: { name: "Servett", abbr: "SV" },
  notebook: { name: "Anteckningsbok", abbr: "AN" },
  bag: { name: "Väska", abbr: "VS" },
  jar: { name: "Burk", abbr: "BK" },
  boss_mirror: { name: "Golvspegel", abbr: "GS" },
  boss_stool: { name: "Praktisk pall", abbr: "PP" },
  boss_basket: { name: "Jättekorg", abbr: "JK" },
  ikea_storage: { name: "Ikea-förvaring", abbr: "IK" },
  skincare_node: { name: "Hudvårdskorg", abbr: "HK" }
};

const EXTRA_ITEM_DEFS = {
  bowl: {
    name: "Snackskål",
    abbr: "SK",
    color: "#e0c0a1",
    value: 3,
    annoyance: 8,
    useful: true,
    preferredTags: ["table", "counter"],
    unlockDay: 1
  },
  towel: {
    name: "Handduk",
    abbr: "HD",
    color: "#d7c9f1",
    value: 4,
    annoyance: 10,
    useful: true,
    preferredTags: ["shelf", "sink", "chair"],
    unlockDay: 1
  },
  hair_item: {
    name: "Hårgrej",
    abbr: "HR",
    color: "#f1b4a0",
    value: 3,
    annoyance: 9,
    useful: true,
    preferredTags: ["sink", "shelf", "counter"],
    unlockDay: 1
  },
  charger: {
    name: "Laddare",
    abbr: "LD",
    color: "#bcc5d5",
    value: 4,
    annoyance: 11,
    useful: true,
    preferredTags: ["table", "counter", "dresser"],
    unlockDay: 1
  },
  sweater: {
    name: "Tröja",
    abbr: "TR",
    color: "#df8fb0",
    value: 4,
    annoyance: 9,
    useful: false,
    preferredTags: ["chair", "bed", "sofa"],
    unlockDay: 1
  },
  tray: {
    name: "Serveringsbricka",
    abbr: "BR",
    color: "#c4ab8a",
    value: 5,
    annoyance: 10,
    useful: true,
    preferredTags: ["table", "counter"],
    unlockDay: 1
  },
  glass: {
    name: "Glas",
    abbr: "GL",
    color: "#cfe2ef",
    value: 3,
    annoyance: 9,
    useful: true,
    preferredTags: ["table", "counter", "shelf"],
    unlockDay: 1
  },
  napkin: {
    name: "Servett",
    abbr: "SV",
    color: "#efe8da",
    value: 2,
    annoyance: 7,
    useful: false,
    preferredTags: ["table", "counter"],
    unlockDay: 1
  },
  notebook: {
    name: "Anteckningsbok",
    abbr: "AN",
    color: "#b6d6a3",
    value: 4,
    annoyance: 10,
    useful: true,
    preferredTags: ["table", "dresser", "counter"],
    unlockDay: 1
  },
  bag: {
    name: "Väska",
    abbr: "VS",
    color: "#9a7f6f",
    value: 6,
    annoyance: 12,
    useful: true,
    preferredTags: ["floor", "chair", "shelf"],
    unlockDay: 1
  },
  jar: {
    name: "Burk",
    abbr: "BK",
    color: "#d2cfb8",
    value: 3,
    annoyance: 8,
    useful: true,
    preferredTags: ["counter", "shelf", "table"],
    unlockDay: 1
  },
  boss_mirror: {
    name: "Golvspegel",
    abbr: "GS",
    color: "#c7cbd5",
    value: 16,
    annoyance: 20,
    useful: true,
    preferredTags: ["wall", "floor"],
    unlockDay: 1,
    isBoss: true,
    heavy: true,
    visualHalf: 18,
    auraBonus: 0.26,
    auraRadius: 135,
    blocksMovement: true,
    blockW: 38,
    blockH: 38
  },
  boss_stool: {
    name: "Praktisk pall",
    abbr: "PP",
    color: "#9f836a",
    value: 14,
    annoyance: 18,
    useful: true,
    preferredTags: ["floor", "table"],
    unlockDay: 1,
    isBoss: true,
    heavy: true,
    visualHalf: 17,
    auraBonus: 0.2,
    auraRadius: 120,
    blocksMovement: true,
    blockW: 34,
    blockH: 34
  },
  boss_basket: {
    name: "Jättekorg",
    abbr: "JK",
    color: "#a88764",
    value: 15,
    annoyance: 19,
    useful: true,
    preferredTags: ["floor", "shelf"],
    unlockDay: 1,
    isBoss: true,
    heavy: true,
    visualHalf: 17,
    auraBonus: 0.24,
    auraRadius: 128,
    blocksMovement: true,
    blockW: 36,
    blockH: 36
  },
  ikea_storage: {
    name: "Ikea-förvaring",
    abbr: "IK",
    color: "#8f98a8",
    value: 18,
    annoyance: 22,
    useful: true,
    preferredTags: ["floor", "shelf"],
    unlockDay: 1,
    isBoss: true,
    heavy: true,
    visualHalf: 19,
    auraBonus: 0.3,
    auraRadius: 142,
    blocksMovement: true,
    blockW: 42,
    blockH: 42,
    permanent: true
  },
  skincare_node: {
    name: "Hudvårdskorg",
    abbr: "HK",
    color: "#f4a7ca",
    value: 8,
    annoyance: 12,
    useful: true,
    preferredTags: ["shelf", "floor"],
    unlockDay: 1,
    isBoss: true,
    heavy: true,
    visualHalf: 16,
    auraBonus: 0.16,
    auraRadius: 110,
    blocksMovement: false,
    spawnNode: true
  }
};

const ROOM_EXTRA_ALLOWED = {
  living: ["bowl", "tray", "glass", "napkin", "sweater", "charger", "notebook", "boss_mirror", "boss_stool", "boss_basket"],
  kitchen: ["bowl", "tray", "glass", "napkin", "jar", "towel", "charger", "notebook", "boss_stool", "boss_basket"],
  bathroom: ["towel", "hair_item", "jar", "skincare_node", "boss_basket"],
  hallway: ["bag", "sweater", "charger", "boss_basket", "ikea_storage"],
  bedroom: ["sweater", "bag", "charger", "notebook", "towel", "boss_mirror", "boss_stool", "ikea_storage"]
};

const TV_ZONE_RECT = { x: 320, y: 188, w: 130, h: 82 };
const SOFFBORD_ZONE_RECT = { x: 88, y: 116, w: 128, h: 88 };
const WINDOW_ZONES = [
  { x: 340, y: 92, w: 110, h: 76 },
  { x: 810, y: 500, w: 150, h: 80 }
];

const SPECIAL_EVENTS_SV = [
  { id: "mello", title: "Nu är det Mello", duration: 34, text: "Mysnivån stiger runt TV:n." },
  { id: "tote_bag", title: "Hon har med en tote bag", duration: 22, text: "Fem småsaker dyker upp i snabb följd." },
  { id: "fresh_bath", title: "Bara fräscha upp badrummet", duration: 28, text: "Badrummet blir en hotzon." },
  { id: "rea_fynd", title: "Superfint på rea", duration: 30, text: "Ett större boss-objekt anländer." },
  { id: "tjejmiddag", title: "Tjejmiddag nämns", duration: 30, text: "Kök + vardagsrum får extra tryck." },
  { id: "we_word", title: "Hon säger 'vi'", duration: 24, text: "Objekten blir lättare att etablera." },
  { id: "two_nights", title: "Övernattning blev två nätter", duration: 30, text: "Hall och badrum blir svårare." },
  { id: "wine_charc", title: "Vin- och charkkväll", duration: 30, text: "Soffbordet blir kritisk zon." },
  { id: "work_from_home", title: "Jobba hemifrån hos dig", duration: 30, text: "Laddare, muggar och anteckningar invaderar." },
  { id: "ikea_box", title: "Mysterisk Ikea-kartong", duration: 34, text: "Efter 30 sek kan permanent förvaring landa." },
  { id: "baking", title: "Hon bakar", duration: 28, text: "Köket fylls av skålar och burkar." },
  { id: "julmys", title: "Julmys i oktober", duration: 26, text: "Textil + ljus får massiv bonus." },
  { id: "selfcare", title: "Self-care Sunday", duration: 28, text: "Badrummet får egen agenda." },
  { id: "girls_trip", title: "Girls' trip-planering", duration: 28, text: "Väskor hotar sovrum och hall." },
  { id: "brunch", title: "Brunch", duration: 27, text: "Kök och matplats blir koncept." },
  { id: "mello_final", title: "Mello-final hemma", duration: 35, text: "Massiv våg i vardagsrummet." },
  { id: "lagerhaus", title: "Hon har varit på Lagerhaus", duration: 26, text: "Många små dekorobjekt med combo-risk." },
  { id: "little_thing", title: "Jag tog med en liten grej", duration: 27, text: "En gratis placering med eftersläpning." },
  { id: "shower_shuffle", title: "Möblerar medan du duschar", duration: 24, text: "Objekt byter plats utan tillstånd." },
  { id: "eurovision", title: "Eurovision-vecka", duration: 36, text: "Flera kvällsevents i rad." },
  { id: "skincare_basket", title: "Hudvårdskorgen råkade bli kvar", duration: 28, text: "En spawn-nod etableras." },
  { id: "photo_wall", title: "Fotovägg-idén föds", duration: 28, text: "Tomma väggar blir hotzoner." },
  { id: "potential", title: "Din lägenhet har potential", duration: 24, text: "Alla dekorobjekt får bonus." },
  { id: "practical_stool", title: "Hon köpte en praktisk pall", duration: 28, text: "Rörelse blockeras och fler ytor öppnas." },
  { id: "matching_towels", title: "Matchande handdukar", duration: 26, text: "Badrummet blir resistent mot återställning." },
  { id: "holiday_prep", title: "Bara några grejer inför semestern", duration: 30, text: "Hallens rörelse blir trång." },
  { id: "pinterest", title: "Hon får Pinterest-feeling", duration: 24, text: "Tre perfekta placeringar på raken." },
  { id: "rainy_sunday", title: "Regnig söndag", duration: 25, text: "Mys-objekt blir starkare." },
  { id: "parents_visit", title: "Föräldrar kanske kommer", duration: 28, text: "Mjuka hemtrevliga saker premieras." },
  { id: "plant_light", title: "Växten behöver ljus", duration: 27, text: "Fönsterzoner prioriteras." }
];

const EVENT_BY_ID = Object.fromEntries(SPECIAL_EVENTS_SV.map((eventDef) => [eventDef.id, eventDef]));

for (const [key, value] of Object.entries(EXTRA_ITEM_DEFS)) {
  ITEM_DEFS[key] = value;
}

for (const room of ROOMS) {
  if (SV_ROOM_NAMES[room.id]) {
    room.name = SV_ROOM_NAMES[room.id];
  }
  if (SV_ROOM_FEATURES[room.id]) {
    room.permanentFeature = SV_ROOM_FEATURES[room.id];
  }
  const extras = ROOM_EXTRA_ALLOWED[room.id] || [];
  for (const type of extras) {
    if (!room.allowed.includes(type)) {
      room.allowed.push(type);
    }
  }
}

for (const furniture of FURNITURE) {
  if (SV_FURNITURE_LABELS[furniture.id]) {
    furniture.label = SV_FURNITURE_LABELS[furniture.id];
  }
}

for (const [key, values] of Object.entries(SV_ITEM_OVERRIDES)) {
  if (ITEM_DEFS[key]) {
    ITEM_DEFS[key].name = values.name;
    ITEM_DEFS[key].abbr = values.abbr;
  }
}

function buildRoomState() {
  const map = {};
  for (const room of ROOMS) {
    map[room.id] = {
      status: "Neutral",
      score: 0,
      permanentUnlocked: false,
      permanentBonus: 0,
      feature: SV_ROOM_FEATURES[room.id] || room.permanentFeature
    };
  }
  return map;
}

function createInitialState() {
  return {
    player: {
      x: 170,
      y: 475,
      radius: 12,
      speed: 190
    },
    items: [],
    nextItemId: 1,
    girlfriend: {
      active: true,
      phase: "roam",
      x: 220,
      y: 430,
      targetX: 250,
      targetY: 380,
      pendingItem: null,
      line: "",
      speed: 132,
      facing: "down",
      roamWait: 0
    },
    meters: {
      girlification: 0,
      annoyance: 0
    },
    synergies: [],
    roomState: buildRoomState(),
    spawnTimer: randRange(16, 30),
    elapsed: 0,
    day: 1,
    dayDuration: 56,
    targetDays: 3,
    timeInDay: 0,
    subtitle: {
      text: "Försvara lägenheten utan att göra det stelt.",
      timer: 5,
      speaker: "narrator"
    },
    actionMenu: {
      open: false,
      itemId: null
    },
    nearestItemId: null,
    recentRemovals: [],
    lastActionTime: -999,
    lastBumpAt: -999,
    moodSwing: {
      active: false,
      daysTriggered: 0,
      lockUntilDay: 2
    },
    comboRaid: {
      active: false,
      remaining: 0,
      timer: 0,
      nextEligibleAt: 35
    },
    powerups: {
      closetBlitz: { cooldown: 28, duration: 6, readyAt: 0, activeFor: 0 },
      calmTalk: { cooldown: 36, duration: 8, readyAt: 0, activeFor: 0 }
    },
    events: {
      activeId: null,
      timeLeft: 0,
      nextIn: randRange(22, 38),
      recent: [],
      ikeaTimer: 0,
      ikeaBlocked: false,
      perfectPlacements: 0,
      eurovisionChains: 0
    },
    gameOver: false,
    result: "",
    stats: {
      removed: 0,
      hidden: 0,
      relocated: 0,
      roomsLost: 0,
      suspicionTriggered: 0
    }
  };
}

function ensureExtendedState(targetState) {
  if (!targetState.events) {
    targetState.events = {
      activeId: null,
      timeLeft: 0,
      nextIn: randRange(22, 38),
      recent: [],
      ikeaTimer: 0,
      ikeaBlocked: false,
      perfectPlacements: 0,
      eurovisionChains: 0
    };
  }
  if (!targetState.girlfriend) {
    targetState.girlfriend = {
      active: true,
      phase: "roam",
      x: 220,
      y: 430,
      targetX: 250,
      targetY: 380,
      pendingItem: null,
      line: "",
      speed: 132,
      facing: "down",
      roamWait: 0
    };
  }
  targetState.girlfriend.active = true;
  if (targetState.girlfriend.phase === "idle") {
    targetState.girlfriend.phase = "roam";
  }
  for (const room of ROOMS) {
    if (targetState.roomState && targetState.roomState[room.id]) {
      targetState.roomState[room.id].feature = SV_ROOM_FEATURES[room.id] || room.permanentFeature;
    }
  }
  return targetState;
}

state = ensureExtendedState(state);

function statusLabelSv(status) {
  if (status === "Contested") return "Omstritt";
  if (status === "Girlified") return "Tjejifierat";
  return "Neutralt";
}

function isInsideRect(pointX, pointY, rect) {
  return pointX >= rect.x && pointX <= rect.x + rect.w && pointY >= rect.y && pointY <= rect.y + rect.h;
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) {
    return items.length > 0 ? items[0].value : null;
  }

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.value;
    }
  }
  return items[items.length - 1].value;
}

function activeEventDef() {
  return state.events.activeId ? EVENT_BY_ID[state.events.activeId] || null : null;
}
function eventModifiers() {
  const defaults = {
    spawnRate: 1,
    roomBoost: {},
    itemBoost: {},
    roomValue: {},
    tvBoost: 1,
    soffbordBoost: 1,
    windowBoost: 1,
    annoyanceScale: 1,
    annoyanceDecayScale: 1,
    removeCostScale: 1,
    globalInfluence: 1,
    extraTypesByRoom: {}
  };

  const active = activeEventDef();
  if (!active) {
    return defaults;
  }

  const mods = defaults;

  function addRoomBoost(roomId, value) {
    mods.roomBoost[roomId] = (mods.roomBoost[roomId] || 1) * value;
  }

  function addItemBoost(itemId, value) {
    mods.itemBoost[itemId] = (mods.itemBoost[itemId] || 1) * value;
  }

  function addRoomValue(roomId, value) {
    mods.roomValue[roomId] = (mods.roomValue[roomId] || 1) * value;
  }

  switch (active.id) {
    case "mello":
      mods.spawnRate = 1.45;
      addRoomBoost("living", 2.4);
      addItemBoost("blanket", 1.45);
      addItemBoost("bowl", 1.5);
      addItemBoost("candle", 1.55);
      addRoomValue("living", 1.2);
      mods.tvBoost = 2;
      break;
    case "tote_bag":
      mods.spawnRate = 1.25;
      break;
    case "fresh_bath":
      mods.spawnRate = 1.35;
      addRoomBoost("bathroom", 3.2);
      addRoomValue("bathroom", 1.35);
      addItemBoost("skincare", 1.55);
      addItemBoost("hair_item", 1.55);
      addItemBoost("towel", 1.45);
      break;
    case "rea_fynd":
      mods.spawnRate = 1.15;
      addItemBoost("boss_mirror", 1.35);
      addItemBoost("boss_basket", 1.35);
      addItemBoost("boss_stool", 1.35);
      break;
    case "tjejmiddag":
      mods.spawnRate = 1.3;
      addRoomBoost("kitchen", 2.1);
      addRoomBoost("living", 2.1);
      addItemBoost("glass", 1.45);
      addItemBoost("candle", 1.4);
      addItemBoost("tray", 1.35);
      break;
    case "we_word":
      mods.globalInfluence = 0.86;
      mods.removeCostScale = 0.8;
      addRoomBoost("living", 1.25);
      addRoomBoost("bedroom", 1.25);
      break;
    case "two_nights":
      mods.spawnRate = 1.3;
      addRoomBoost("hallway", 2.2);
      addRoomBoost("bathroom", 2.4);
      addRoomValue("hallway", 1.2);
      addRoomValue("bathroom", 1.2);
      break;
    case "wine_charc":
      mods.spawnRate = 1.35;
      addRoomBoost("living", 2.6);
      addItemBoost("tray", 1.5);
      addItemBoost("napkin", 1.5);
      addItemBoost("candle", 1.5);
      addItemBoost("bowl", 1.45);
      addItemBoost("blanket", 1.35);
      mods.soffbordBoost = 1.9;
      break;
    case "work_from_home":
      mods.spawnRate = 1.3;
      addRoomBoost("bedroom", 2.2);
      addItemBoost("mug", 1.35);
      addItemBoost("charger", 1.45);
      addItemBoost("notebook", 1.45);
      addItemBoost("boss_stool", 1.35);
      break;
    case "ikea_box":
      mods.spawnRate = 1.25;
      addItemBoost("ikea_storage", 1.5);
      break;
    case "baking":
      mods.spawnRate = 1.35;
      addRoomBoost("kitchen", 2.9);
      addItemBoost("bowl", 1.6);
      addItemBoost("jar", 1.5);
      addItemBoost("towel", 1.35);
      break;
    case "julmys":
      mods.spawnRate = 1.25;
      addItemBoost("candle", 1.85);
      addItemBoost("blanket", 1.8);
      addItemBoost("fairy_lights", 1.95);
      addItemBoost("plant", 1.35);
      mods.removeCostScale = 0.5;
      break;
    case "selfcare":
      mods.spawnRate = 1.5;
      addRoomBoost("bathroom", 3.5);
      addRoomValue("bathroom", 1.45);
      addItemBoost("skincare", 1.9);
      addItemBoost("hair_item", 1.7);
      addItemBoost("towel", 1.5);
      break;
    case "girls_trip":
      mods.spawnRate = 1.3;
      addRoomBoost("bedroom", 2.2);
      addRoomBoost("hallway", 2.3);
      addItemBoost("bag", 1.7);
      addItemBoost("sweater", 1.4);
      break;
    case "brunch":
      mods.spawnRate = 1.38;
      addRoomBoost("kitchen", 2.6);
      addRoomBoost("living", 1.8);
      addItemBoost("mug", 1.45);
      addItemBoost("napkin", 1.5);
      addItemBoost("bowl", 1.45);
      addItemBoost("plant", 1.3);
      break;
    case "mello_final":
      mods.spawnRate = 1.9;
      addRoomBoost("living", 4.1);
      addRoomValue("living", 1.4);
      mods.tvBoost = 2.4;
      break;
    case "lagerhaus":
      mods.spawnRate = 1.45;
      addItemBoost("candle", 1.5);
      addItemBoost("framed_art", 1.45);
      addItemBoost("plant", 1.35);
      addItemBoost("fairy_lights", 1.55);
      break;
    case "little_thing":
      mods.spawnRate = 1.15;
      break;
    case "shower_shuffle":
      mods.spawnRate = 1.15;
      addRoomValue("living", 1.2);
      break;
    case "eurovision":
      mods.spawnRate = 1.75;
      addRoomBoost("living", 2.4);
      addRoomBoost("kitchen", 1.8);
      addItemBoost("fairy_lights", 1.7);
      addItemBoost("tray", 1.45);
      break;
    case "skincare_basket":
      mods.spawnRate = 1.32;
      addRoomBoost("bathroom", 3.1);
      addItemBoost("skincare", 1.65);
      break;
    case "photo_wall":
      mods.spawnRate = 1.22;
      addRoomBoost("living", 1.5);
      addRoomBoost("hallway", 1.5);
      addRoomBoost("bedroom", 1.5);
      addItemBoost("framed_art", 1.95);
      break;
    case "potential":
      mods.spawnRate = 1.25;
      addItemBoost("candle", 1.25);
      addItemBoost("pillow", 1.25);
      addItemBoost("blanket", 1.25);
      addItemBoost("framed_art", 1.25);
      addItemBoost("plant", 1.25);
      break;
    case "practical_stool":
      mods.spawnRate = 1.2;
      addItemBoost("boss_stool", 1.6);
      addRoomBoost("living", 1.5);
      addRoomBoost("kitchen", 1.5);
      break;
    case "matching_towels":
      mods.spawnRate = 1.2;
      addRoomBoost("bathroom", 2.8);
      addRoomValue("bathroom", 1.4);
      addItemBoost("towel", 2);
      break;
    case "holiday_prep":
      mods.spawnRate = 1.45;
      addRoomBoost("hallway", 3.3);
      addItemBoost("bag", 1.8);
      addItemBoost("basket", 1.4);
      break;
    case "pinterest":
      mods.spawnRate = 1.3;
      addItemBoost("framed_art", 1.45);
      addItemBoost("candle", 1.35);
      addItemBoost("fairy_lights", 1.35);
      break;
    case "rainy_sunday":
      mods.spawnRate = 1.35;
      addItemBoost("blanket", 1.6);
      addItemBoost("mug", 1.4);
      addItemBoost("candle", 1.5);
      addItemBoost("bowl", 1.45);
      break;
    case "parents_visit":
      mods.spawnRate = 1.3;
      addItemBoost("basket", 1.45);
      addItemBoost("storage_box", 1.45);
      addItemBoost("plant", 1.35);
      addItemBoost("candle", 1.35);
      addRoomValue("living", 1.2);
      addRoomValue("hallway", 1.2);
      break;
    case "plant_light":
      mods.spawnRate = 1.25;
      addItemBoost("plant", 1.9);
      addItemBoost("candle", 1.2);
      mods.windowBoost = 1.8;
      addRoomBoost("living", 1.5);
      addRoomBoost("bedroom", 1.5);
      break;
    default:
      break;
  }

  return mods;
}

function randomPointInApartment() {
  let attempts = 0;
  while (attempts < 40) {
    const x = randRange(WORLD.bounds.x + 20, WORLD.bounds.x + WORLD.bounds.w - 20);
    const y = randRange(WORLD.bounds.y + 20, WORLD.bounds.y + WORLD.bounds.h - 20);
    if (!collidesWithStatic(x, y, 12)) {
      return { x, y };
    }
    attempts += 1;
  }
  return { x: 220, y: 430 };
}

function makeItem(type, room, spot, options = {}) {
  const def = ITEM_DEFS[type];
  return {
    id: state.nextItemId++,
    type,
    roomId: room.id,
    x: spot.x,
    y: spot.y,
    value: options.value || def.value,
    annoyance: options.annoyance || def.annoyance,
    useful: options.useful !== undefined ? options.useful : def.useful,
    state: options.state || "active",
    placedByGirlfriend: options.placedByGirlfriend !== undefined ? options.placedByGirlfriend : true,
    placedAt: state.elapsed,
    isBoss: options.isBoss !== undefined ? options.isBoss : Boolean(def.isBoss),
    heavy: options.heavy !== undefined ? options.heavy : Boolean(def.heavy),
    visualHalf: options.visualHalf || def.visualHalf || (def.isBoss ? 17 : 10),
    auraBonus: options.auraBonus !== undefined ? options.auraBonus : (def.auraBonus || 0),
    auraRadius: options.auraRadius || def.auraRadius || 120,
    blocksMovement: options.blocksMovement !== undefined ? options.blocksMovement : Boolean(def.blocksMovement),
    blockW: options.blockW || def.blockW || ((options.visualHalf || def.visualHalf || 10) * 2),
    blockH: options.blockH || def.blockH || ((options.visualHalf || def.visualHalf || 10) * 2),
    permanent: options.permanent || Boolean(def.permanent),
    spawnNode: options.spawnNode || Boolean(def.spawnNode),
    nodeTimer: options.spawnNode || def.spawnNode ? randRange(7, 12) : 0,
    giftSeed: options.giftSeed || false,
    giftTriggered: false
  };
}

function spawnItemDirect(options = {}) {
  const room = options.roomId ? getRoomById(options.roomId) : chooseRoomForPlacement();
  if (!room) {
    return null;
  }

  const type = options.type || chooseTypeForRoom(room);
  if (!type || !ITEM_DEFS[type]) {
    return null;
  }

  const spot = options.spot || findFreeSpot(room, type, { strictPreferred: options.strictPreferred || false });
  if (!spot) {
    return null;
  }

  const item = makeItem(type, room, spot, options);
  state.items.push(item);
  return item;
}

function spawnBossObject(type, roomId) {
  const bossType = type || pick(["boss_mirror", "boss_stool", "boss_basket"]);
  const room = roomId ? getRoomById(roomId) : pick([getRoomById("living"), getRoomById("bedroom"), getRoomById("hallway")]);
  if (!room) {
    return null;
  }
  return spawnItemDirect({ type: bossType, roomId: room.id, placedByGirlfriend: false });
}
function chooseRoomForPlacement() {
  const mods = eventModifiers();
  const weighted = [];

  for (const room of ROOMS) {
    const status = state.roomState[room.id].status;
    let repeat = status === "Neutral" ? 3 : status === "Contested" ? 2 : 1;

    const boost = mods.roomBoost[room.id] || 1;
    repeat = Math.max(1, Math.round(repeat * boost));

    for (let i = 0; i < repeat; i += 1) {
      weighted.push(room);
    }
  }

  return pick(weighted);
}

function chooseTypeForRoom(room) {
  const mods = eventModifiers();
  const base = room.allowed.filter(canUseTypeToday).filter((type) => ITEM_DEFS[type]);
  if (base.length === 0) {
    return null;
  }

  const weighted = base.map((type) => {
    const boost = mods.itemBoost[type] || 1;
    return { value: type, weight: Math.max(0.1, boost) };
  });

  return weightedPick(weighted);
}

function findFreeSpot(room, type, options = {}) {
  const definition = ITEM_DEFS[type];
  const preferred = room.spots.filter((spot) => definition.preferredTags.includes(spot.tag));
  const baseCandidates = options.strictPreferred && preferred.length > 0 ? preferred : preferred.length > 0 ? preferred.concat(room.spots) : room.spots;

  const free = baseCandidates.filter((spot) => {
    return !state.items.some((item) => dist(item.x, item.y, spot.x, spot.y) < 28);
  });

  const pool = free.length > 0 ? free : baseCandidates;
  return pool.length > 0 ? pick(pool) : null;
}

function beginPlacementEvent(options = {}) {
  if (state.girlfriend.phase === "arriving") {
    return false;
  }

  const room = options.roomId ? getRoomById(options.roomId) : chooseRoomForPlacement();
  if (!room) {
    return false;
  }

  const type = options.type || chooseTypeForRoom(room);
  if (!type || !ITEM_DEFS[type]) {
    return false;
  }

  const strictPreferred = state.events.perfectPlacements > 0;
  const spot = findFreeSpot(room, type, { strictPreferred });
  if (!spot) {
    return false;
  }

  if (strictPreferred) {
    state.events.perfectPlacements = Math.max(0, state.events.perfectPlacements - 1);
  }

  state.girlfriend.pendingItem = makeItem(type, room, spot, options);
  state.girlfriend.phase = "arriving";
  state.girlfriend.line = options.forcedLine || pick(DIALOGUE_LINES);
  state.girlfriend.targetX = spot.x - 12;
  state.girlfriend.targetY = spot.y - 18;

  return true;
}

function startSpecialEvent(eventId) {
  const def = EVENT_BY_ID[eventId];
  if (!def) {
    return;
  }

  state.events.activeId = def.id;
  state.events.timeLeft = def.duration;
  state.events.recent.push(def.id);
  if (state.events.recent.length > 6) {
    state.events.recent.shift();
  }

  showSubtitle("H\u00e4ndelse: " + def.title + " - " + def.text, 4.5);
  playSfx("raid");

  if (def.id === "tote_bag") {
    state.comboRaid.active = true;
    state.comboRaid.remaining = 5;
    state.comboRaid.timer = 0.8;
  }

  if (def.id === "rea_fynd") {
    spawnBossObject();
  }

  if (def.id === "two_nights") {
    spawnItemDirect({ roomId: "bathroom", type: "skincare", placedByGirlfriend: false });
    spawnItemDirect({ roomId: "hallway", type: "charger", placedByGirlfriend: false });
    spawnItemDirect({ roomId: "bedroom", type: "sweater", placedByGirlfriend: false });
  }

  if (def.id === "ikea_box") {
    state.events.ikeaTimer = 30;
    state.events.ikeaBlocked = false;
  }

  if (def.id === "mello_final") {
    state.comboRaid.active = true;
    state.comboRaid.remaining = 6;
    state.comboRaid.timer = 0.75;
    spawnBossObject("boss_stool", "living");
  }

  if (def.id === "little_thing") {
    const gift = spawnItemDirect({ roomId: pick(["living", "bedroom", "hallway"]), type: pick(["candle", "plant", "basket", "tray"]), placedByGirlfriend: false, giftSeed: true });
    if (gift) {
      showSubtitle("'En liten grej till dig' placerades gratis.", 3.3);
    }
  }

  if (def.id === "shower_shuffle" && state.items.length >= 2) {
    const a = pick(state.items);
    let b = pick(state.items);
    if (state.items.length > 1) {
      while (b.id === a.id) {
        b = pick(state.items);
      }
    }
    const tempX = a.x;
    const tempY = a.y;
    a.x = b.x;
    a.y = b.y;
    b.x = tempX;
    b.y = tempY;
    showSubtitle("Hon möblerade om medan du var i duschen.", 3.5);
  }

  if (def.id === "eurovision") {
    state.events.eurovisionChains = 2;
    state.comboRaid.active = true;
    state.comboRaid.remaining = 4;
    state.comboRaid.timer = 0.9;
  }

  if (def.id === "skincare_basket") {
    spawnItemDirect({ roomId: "bathroom", type: "skincare_node", placedByGirlfriend: false, spawnNode: true });
  }

  if (def.id === "practical_stool") {
    spawnBossObject("boss_stool", pick(["living", "kitchen", "hallway"]));
  }

  if (def.id === "holiday_prep") {
    spawnItemDirect({ roomId: "hallway", type: "bag", placedByGirlfriend: false });
    spawnItemDirect({ roomId: "hallway", type: "bag", placedByGirlfriend: false });
  }

  if (def.id === "pinterest") {
    state.events.perfectPlacements = 3;
  }
}

function endSpecialEvent() {
  const ended = activeEventDef();
  if (ended && ended.id === "eurovision" && state.events.eurovisionChains > 0) {
    state.events.eurovisionChains -= 1;
    state.events.nextIn = randRange(8, 14);
  } else {
    state.events.nextIn = randRange(26, 44);
  }

  state.events.activeId = null;
  state.events.timeLeft = 0;
  state.events.perfectPlacements = 0;

  if (ended) {
    showSubtitle("Event slut: " + ended.title + ".", 2.6);
  }
}

function startRandomSpecialEvent() {
  const recent = new Set(state.events.recent.slice(-4));
  let pool = SPECIAL_EVENTS_SV.filter((eventDef) => !recent.has(eventDef.id));

  if (pool.length === 0) {
    pool = SPECIAL_EVENTS_SV.slice();
  }

  const def = pick(pool);
  startSpecialEvent(def.id);
}

function updateSpecialEvents(dt) {
  if (!state.events) {
    return;
  }

  if (state.events.ikeaTimer > 0) {
    state.events.ikeaTimer -= dt;

    if (state.events.ikeaTimer <= 8 && dist(state.player.x, state.player.y, WORLD.entrance.x, WORLD.entrance.y) < 120) {
      state.events.ikeaBlocked = true;
    }

    if (state.events.ikeaTimer <= 0) {
      if (state.events.ikeaBlocked) {
        showSubtitle("Du hann blockera Ikea-kartongen vid dörren.", 3.2);
      } else {
        spawnItemDirect({ roomId: pick(["hallway", "living", "bedroom"]), type: "ikea_storage", placedByGirlfriend: false, permanent: true });
        showSubtitle("Ikea-objektet blev permanent.", 3.2);
      }
    }
  }

  for (const item of state.items) {
    if (item.spawnNode) {
      item.nodeTimer -= dt;
      if (item.nodeTimer <= 0) {
        const room = getRoomById(item.roomId);
        const spawnType = pick(["skincare", "hair_item", "towel"]);
        const spot = findFreeSpot(room, spawnType);
        if (spot) {
          state.items.push(makeItem(spawnType, room, spot, { placedByGirlfriend: false }));
        }
        item.nodeTimer = randRange(7, 12);
      }
    }

    if (item.giftSeed && !item.giftTriggered && state.elapsed - item.placedAt > 24) {
      const room = getRoomById(item.roomId);
      const type = pick([item.type, "candle", "plant", "tray", "basket"]);
      const spot = findFreeSpot(room, type);
      if (spot) {
        state.items.push(makeItem(type, room, spot, { placedByGirlfriend: false }));
      }
      item.giftTriggered = true;
    }
  }

  if (state.events.activeId) {
    state.events.timeLeft -= dt;
    if (state.events.timeLeft <= 0) {
      endSpecialEvent();
    }
  } else {
    state.events.nextIn -= dt;
    if (state.events.nextIn <= 0) {
      startRandomSpecialEvent();
    }
  }
}
function collidesWithStatic(x, y, radius) {
  const staticHit = COLLIDERS.some((rect) => circleIntersectsRect(x, y, radius, rect));
  if (staticHit) {
    return true;
  }

  for (const item of state.items) {
    if (!item.blocksMovement) {
      continue;
    }

    const rect = {
      x: item.x - item.blockW / 2,
      y: item.y - item.blockH / 2,
      w: item.blockW,
      h: item.blockH
    };

    if (circleIntersectsRect(x, y, radius, rect)) {
      return true;
    }
  }

  return false;
}

function updateGirlfriend(dt) {
  const g = state.girlfriend;
  g.active = true;

  if (g.phase === "arriving") {
    const dx = g.targetX - g.x;
    const dy = g.targetY - g.y;
    const distance = Math.hypot(dx, dy);

    if (Math.abs(dx) > Math.abs(dy)) {
      g.facing = dx >= 0 ? "right" : "left";
    } else {
      g.facing = dy >= 0 ? "down" : "up";
    }

    if (distance > 0.001) {
      const speedMultiplier = state.moodSwing.active ? 1.25 : 1;
      const step = Math.min(distance, g.speed * speedMultiplier * dt);
      g.x += (dx / distance) * step;
      g.y += (dy / distance) * step;
    }

    if (distance <= 6 && g.pendingItem) {
      g.pendingItem.placedAt = state.elapsed;
      state.items.push(g.pendingItem);

      showSubtitle(g.line, 5.2, { speaker: "girlfriend" });
      playSfx("place");

      g.pendingItem = null;
      g.phase = "roam";
      const roam = randomPointInApartment();
      g.targetX = roam.x;
      g.targetY = roam.y;
      g.roamWait = randRange(0.8, 1.7);
    }

    return;
  }

  g.phase = "roam";
  if (g.roamWait > 0) {
    g.roamWait -= dt;
    return;
  }

  const dx = g.targetX - g.x;
  const dy = g.targetY - g.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 10) {
    const roam = randomPointInApartment();
    g.targetX = roam.x;
    g.targetY = roam.y;
    g.roamWait = randRange(0.5, 2.1);
    return;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    g.facing = dx >= 0 ? "right" : "left";
  } else {
    g.facing = dy >= 0 ? "down" : "up";
  }

  const step = Math.min(distance, (70 + Math.sin(state.elapsed * 0.7) * 6) * dt);
  g.x += (dx / distance) * step;
  g.y += (dy / distance) * step;
}

function currentSpawnWindow() {
  const mods = eventModifiers();
  const pressure = (state.day - 1) * 0.95 + (state.meters.girlification / 100) * 2.4;
  let min = clamp(18 - pressure * 2.5, 8, 22);
  let max = clamp(34 - pressure * 3.4, min + 5, 38);

  const moodScale = state.moodSwing.active ? 1.32 : 1;
  const eventScale = mods.spawnRate || 1;
  const totalScale = moodScale * eventScale;

  min = clamp(min / totalScale, 5, 22);
  max = clamp(max / totalScale, min + 3.5, 40);

  return { min, max };
}

function updateSpawnTimer(dt) {
  if (state.gameOver) {
    return;
  }

  if (state.comboRaid.active) {
    state.comboRaid.timer -= dt;
    if (state.comboRaid.timer <= 0) {
      const didSpawn = beginPlacementEvent();
      if (didSpawn) {
        state.comboRaid.remaining -= 1;
      }

      if (state.comboRaid.remaining <= 0) {
        state.comboRaid.active = false;
      } else {
        state.comboRaid.timer = randRange(0.8, 2.2);
      }
    }
    return;
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    const didSpawn = beginPlacementEvent();
    if (didSpawn) {
      maybeStartComboRaid();
    }
    const window = currentSpawnWindow();
    state.spawnTimer = randRange(window.min, window.max);
  }
}

function shouldTriggerMoodSwing(dayNumber) {
  if (dayNumber < 2) {
    return false;
  }
  if (state.moodSwing.daysTriggered >= 2) {
    return false;
  }
  if (dayNumber < state.moodSwing.lockUntilDay) {
    return false;
  }

  const chance = 0.23 + (dayNumber - 2) * 0.03;
  return Math.random() < chance;
}

function updateDayCycle(dt) {
  state.timeInDay += dt;
  if (state.timeInDay >= state.dayDuration) {
    state.timeInDay -= state.dayDuration;
    state.day += 1;

    if (state.day <= state.targetDays) {
      state.moodSwing.active = false;

      if (shouldTriggerMoodSwing(state.day)) {
        state.moodSwing.active = true;
        state.moodSwing.daysTriggered += 1;
        state.moodSwing.lockUntilDay = state.day + 2;
        showSubtitle("Dag " + state.day + ": humörsvängning. Allt blir extra känsligt.", 4.2);
        playSfx("danger");
      } else {
        showSubtitle("Dag " + state.day + " börjar. Mjuk eskalering fortsätter.", 3.4);
      }

      state.events.nextIn = Math.min(state.events.nextIn, randRange(8, 18));
    }
  }
}

function computeItemInfluence(item) {
  let actionFactor = 1;
  if (item.state === "hidden") actionFactor = 0.34;
  if (item.state === "relocated") actionFactor = 0.64;

  const ageSeconds = Math.max(0, state.elapsed - item.placedAt);
  const ageFactor = 1 + Math.min(ageSeconds, 130) / 130 * 0.62;

  let influence = item.value * actionFactor * ageFactor;
  const mods = eventModifiers();

  influence *= mods.globalInfluence;
  influence *= mods.itemBoost[item.type] || 1;
  influence *= mods.roomValue[item.roomId] || 1;

  if (item.roomId === "living" && isInsideRect(item.x, item.y, TV_ZONE_RECT)) {
    influence *= mods.tvBoost;
  }

  if (item.roomId === "living" && isInsideRect(item.x, item.y, SOFFBORD_ZONE_RECT)) {
    influence *= mods.soffbordBoost;
  }

  if (item.type === "plant") {
    const inWindow = WINDOW_ZONES.some((zone) => isInsideRect(item.x, item.y, zone));
    if (inWindow) {
      influence *= mods.windowBoost;
    }
  }

  if (item.isBoss) {
    influence *= 1.18;
  }

  return influence;
}

function computeGirlification() {
  const roomTotals = {};
  for (const room of ROOMS) {
    roomTotals[room.id] = 0;
  }

  for (const item of state.items) {
    roomTotals[item.roomId] += computeItemInfluence(item);
  }

  const synergyList = [];
  let synergyBonus = 0;

  for (const room of ROOMS) {
    const visibleInRoom = state.items.filter((item) => item.roomId === room.id && item.state !== "hidden");
    const types = new Set(visibleInRoom.map((item) => item.type));

    if (types.has("candle") && types.has("blanket") && types.has("pillow")) {
      synergyBonus += 7;
      synergyList.push(room.name + ": Mys-kombo");
    }

    if (room.id === "bathroom") {
      const bathroomItems = visibleInRoom.filter((item) => ["skincare", "candle", "basket", "plant", "towel", "hair_item"].includes(item.type));
      if (bathroomItems.length >= 3) {
        synergyBonus += 8;
        synergyList.push("Badrum: Etablerad närvaro");
      }
    }

    if (room.id === "kitchen") {
      const mugs = visibleInRoom.filter((item) => ["mug", "glass"].includes(item.type)).length;
      if (mugs >= 3) {
        synergyBonus += 6;
        synergyList.push("Kök: Hushållsdrift");
      }
    }
  }

  for (const room of ROOMS) {
    roomTotals[room.id] += state.roomState[room.id].permanentBonus;
  }

  let auraBonus = 0;
  const bosses = state.items.filter((item) => item.isBoss && item.auraBonus > 0);
  for (const boss of bosses) {
    for (const item of state.items) {
      if (item.id === boss.id || item.roomId !== boss.roomId) {
        continue;
      }
      if (dist(item.x, item.y, boss.x, boss.y) <= boss.auraRadius) {
        auraBonus += computeItemInfluence(item) * boss.auraBonus * 0.2;
      }
    }
  }

  const raw = Object.values(roomTotals).reduce((a, b) => a + b, 0) + synergyBonus + auraBonus;
  state.meters.girlification = clamp(raw * 1.14, 0, 100);
  state.synergies = synergyList;

  for (const room of ROOMS) {
    const previousStatus = state.roomState[room.id].status;
    const score = roomTotals[room.id];
    let nextStatus = "Neutral";

    if (score >= 32) {
      nextStatus = "Girlified";
    } else if (score >= 16) {
      nextStatus = "Contested";
    }

    state.roomState[room.id].score = score;
    state.roomState[room.id].status = nextStatus;

    if (nextStatus === "Girlified" && !state.roomState[room.id].permanentUnlocked) {
      state.roomState[room.id].permanentUnlocked = true;
      state.roomState[room.id].permanentBonus = getRoomById(room.id).permanentBonus;
      state.stats.roomsLost += 1;

      if (state.subtitle.timer < 1.2) {
        showSubtitle(room.name + " blev tjejifierat: " + state.roomState[room.id].feature + ".", 3.5);
      }
    }

    if (previousStatus !== nextStatus && previousStatus === "Girlified" && nextStatus !== "Girlified") {
      if (state.subtitle.timer < 1.2) {
        showSubtitle(room.name + " återtogs till " + statusLabelSv(nextStatus).toLowerCase() + ".", 2.5);
      }
    }
  }
}
function raiseAnnoyance(amount) {
  const mods = eventModifiers();
  let adjusted = amount * mods.annoyanceScale;

  if (state.moodSwing.active) {
    adjusted *= 1.28;
  }
  if (isPowerupActive("calmTalk")) {
    adjusted *= 0.58;
  }
  if (isPowerupActive("closetBlitz")) {
    adjusted *= 0.85;
  }

  const before = state.meters.annoyance;
  state.meters.annoyance = clamp(state.meters.annoyance + adjusted, 0, 100);

  if (before < 70 && state.meters.annoyance >= 70) {
    state.stats.suspicionTriggered += 1;
    playSfx("danger");
  }
}

function performAction(item, action) {
  const room = getRoomById(item.roomId);
  const wasRoomScore = computeRoomInfluence(item.roomId);
  const active = activeEventDef();
  const mods = eventModifiers();
  let annoyanceDelta = 0;

  if (item.heavy && action === "hide") {
    showSubtitle("Den är för stor för att gömmas. Du kan bara flytta eller ta bort den.", 3);
    action = "relocate";
  }

  if (action === "hide") {
    const target = pick(room.hideSpots);
    item.x = target.x + randRange(-6, 6);
    item.y = target.y + randRange(-5, 5);
    item.state = "hidden";
    annoyanceDelta += girlfriendNearby(item) ? 3 : 1;
    if (item.isBoss) {
      annoyanceDelta += 3;
    }
    state.stats.hidden += 1;
    showSubtitle("Du gömde den diskret.", 2.4);
    playSfx("hide");
  }

  if (action === "relocate") {
    const target = pick(room.lowImpactSpots);
    item.x = target.x + randRange(-7, 7);
    item.y = target.y + randRange(-6, 6);
    item.state = "relocated";
    annoyanceDelta += girlfriendNearby(item) ? 2 : 0.5;
    if (item.heavy) {
      annoyanceDelta += 2;
    }
    state.stats.relocated += 1;
    showSubtitle("Du flyttade den till en lågprofil-zon.", 2.4);
    playSfx("relocate");
  }

  if (action === "remove") {
    annoyanceDelta += item.annoyance;
    if (item.heavy) {
      annoyanceDelta += 10;
    }

    if (girlfriendNearby(item)) {
      annoyanceDelta += 14;
    }

    const rapidWindow = state.recentRemovals.filter((t) => state.elapsed - t < 18).length;
    if (rapidWindow >= 2) {
      annoyanceDelta += 7;
    }

    if (item.useful) {
      annoyanceDelta += 6;
    }

    const roomStatus = state.roomState[item.roomId].status;
    if (roomStatus === "Girlified") {
      annoyanceDelta += 5;
    }

    if (active && active.id === "matching_towels" && item.roomId === "bathroom") {
      annoyanceDelta += 5;
    }

    annoyanceDelta *= mods.removeCostScale;

    state.items = state.items.filter((entry) => entry.id !== item.id);
    state.recentRemovals.push(state.elapsed);
    state.stats.removed += 1;

    const nowRoomScore = computeRoomInfluence(item.roomId);
    if (wasRoomScore - nowRoomScore > 9) {
      annoyanceDelta += 6;
    }

    showSubtitle("Hård borttagning. Effektivt men riskabelt.", 2.4);
    playSfx("remove");
  }

  if (action === "remove" && item.type === "pillow" && state.roomState.bedroom.permanentUnlocked) {
    annoyanceDelta += 4;
  }

  raiseAnnoyance(annoyanceDelta);
  state.lastActionTime = state.elapsed;
  state.actionMenu.open = false;
  state.actionMenu.itemId = null;
}

function decayAnnoyance(dt) {
  const mods = eventModifiers();
  let decay = 0.38;
  if (state.elapsed - state.lastActionTime > 10) {
    decay = 1.0;
  }

  if (state.moodSwing.active) {
    decay *= 0.52;
  }
  decay *= mods.annoyanceDecayScale;

  if (isPowerupActive("calmTalk")) {
    decay += 0.45;
  }

  state.meters.annoyance = clamp(state.meters.annoyance - decay * dt, 0, 100);
}

function checkEndConditions() {
  if (state.gameOver) {
    return;
  }

  if (state.meters.girlification >= 100) {
    state.gameOver = true;
    state.result = "girlified";
    showSubtitle("Det är hennes lägenhet nu.", 4);
    playSfx("lose");
    return;
  }

  if (state.meters.annoyance >= 100) {
    state.gameOver = true;
    state.result = "annoyed";
    showSubtitle("Du gjorde det stelt.", 4);
    playSfx("lose");
    return;
  }

  if (state.day > state.targetDays) {
    state.gameOver = true;
    state.result = "win";
    showSubtitle("Du överlevde veckan utan total takeover.", 4);
    playSfx("win");
  }
}

function update(dt) {
  if (consumePressed("KeyR") && state.gameOver) {
    state = createInitialState();
    return;
  }

  if (state.gameOver) {
    if (state.subtitle.timer > 0) {
      state.subtitle.timer -= dt;
    }
    input.pressed.clear();
    return;
  }

  state = ensureExtendedState(state);
  state.elapsed += dt;

  tryActivatePowerups();
  updatePowerups(dt);
  updatePlayer(dt);
  updateInteraction();
  updateGirlfriend(dt);
  updateSpawnTimer(dt);
  updateDayCycle(dt);
  updateSpecialEvents(dt);

  state.recentRemovals = state.recentRemovals.filter((t) => state.elapsed - t < 25);

  computeGirlification();
  decayAnnoyance(dt);
  checkEndConditions();

  if (state.subtitle.timer > 0) {
    state.subtitle.timer -= dt;
  }

  input.pressed.clear();
}
function drawRooms(warmth) {
  for (const room of ROOMS) {
    const rs = state.roomState[room.id];

    let fill = "#d9e0ea";
    if (rs.status === "Contested") fill = "#e3d6c4";
    if (rs.status === "Girlified") fill = "#e9cbb8";

    const tint = 0.15 + warmth * 0.35;
    ctx.fillStyle = shade(fill, tint);
    ctx.fillRect(room.rect.x, room.rect.y, room.rect.w, room.rect.h);

    ctx.strokeStyle = "#3b4450";
    ctx.lineWidth = 2;
    ctx.strokeRect(room.rect.x, room.rect.y, room.rect.w, room.rect.h);

    ctx.fillStyle = "#1a2128";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText(room.name, room.rect.x + 8, room.rect.y + 19);

    ctx.font = "12px Trebuchet MS";
    ctx.fillText(statusLabelSv(rs.status) + " (" + rs.score.toFixed(0) + ")", room.rect.x + 8, room.rect.y + 36);

    if (rs.permanentUnlocked) {
      ctx.fillStyle = "rgba(143, 80, 42, 0.9)";
      ctx.font = "11px Trebuchet MS";
      ctx.fillText("Permanent effekt aktiv", room.rect.x + 8, room.rect.y + room.rect.h - 10);
    }
  }

  ctx.fillStyle = "#5f6a76";
  ctx.fillRect(WORLD.entrance.x - 6, WORLD.entrance.y - 34, 12, 70);
  ctx.fillStyle = "#1e262e";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText("Entré", WORLD.entrance.x + 12, WORLD.entrance.y + 3);
}

function drawItems() {
  for (const item of state.items) {
    const definition = ITEM_DEFS[item.type];
    const selected = state.actionMenu.open && state.actionMenu.itemId === item.id;
    const near = state.nearestItemId === item.id && !state.actionMenu.open;
    const half = item.visualHalf || 10;

    ctx.save();
    if (item.state === "hidden") {
      ctx.globalAlpha = 0.48;
    }

    ctx.fillStyle = definition.color;
    ctx.fillRect(item.x - half, item.y - half, half * 2, half * 2);

    ctx.strokeStyle = selected ? "#111" : near ? "#2757d6" : "#303642";
    ctx.lineWidth = selected ? 3 : near ? 2.5 : 1.4;
    ctx.strokeRect(item.x - half, item.y - half, half * 2, half * 2);

    if (item.state === "relocated") {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = "#273547";
      ctx.strokeRect(item.x - half - 3, item.y - half - 3, half * 2 + 6, half * 2 + 6);
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#111";
    ctx.font = item.isBoss ? "bold 11px monospace" : "bold 10px monospace";
    ctx.fillText(definition.abbr, item.x - half + 2, item.y + 4);

    ctx.restore();
  }
}

function drawGirlfriend() {
  if (!state.girlfriend.active) {
    return;
  }

  const sprite = SPRITES.girl[state.girlfriend.facing] || SPRITES.girl.down;
  if (isLoaded(sprite)) {
    ctx.drawImage(sprite, state.girlfriend.x - 36, state.girlfriend.y - 60, 72, 108);
    return;
  }

  ctx.fillStyle = "#ff8faf";
  ctx.beginPath();
  ctx.arc(state.girlfriend.x, state.girlfriend.y, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#72334f";
  ctx.fillRect(state.girlfriend.x - 8, state.girlfriend.y - 32, 16, 10);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px monospace";
  ctx.fillText("G", state.girlfriend.x - 4, state.girlfriend.y + 4);
}

function drawHud() {
  const girl = state.meters.girlification;
  const annoyance = state.meters.annoyance;

  drawMeter(18, 10, 305, 22, "Tjejifiering", girl, "#ec8fa0");
  drawMeter(336, 10, 305, 22, "Irritation", annoyance, "#e09c59");

  ctx.fillStyle = "rgba(8, 12, 17, 0.86)";
  ctx.fillRect(648, 8, 342, 108);
  ctx.strokeStyle = "#f0d8c9";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(648, 8, 342, 108);

  ctx.fillStyle = "#f3f0ea";
  ctx.font = "bold 13px Trebuchet MS";
  const dayShown = Math.min(state.day, state.targetDays);
  const dayPercent = Math.floor((state.timeInDay / state.dayDuration) * 100);
  ctx.fillText("Dag " + dayShown + "/" + state.targetDays + " (" + dayPercent + "%)", 658, 28);

  const bachelor = Math.max(0, 100 - girl).toFixed(0);
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Original-l\u00e4genhet bevarad: " + bachelor + "%", 658, 46);

  const moodText = state.moodSwing.active ? "Humörsvängning: AKTIV" : "Humörsvängning: lugn";
  ctx.fillStyle = state.moodSwing.active ? "#ff9ea5" : "#c9d3df";
  ctx.fillText(moodText, 658, 63);

  const qCd = powerupCooldownLeft("closetBlitz");
  const fCd = powerupCooldownLeft("calmTalk");
  const qStatus = isPowerupActive("closetBlitz") ? "AKTIV" : qCd <= 0 ? "REDO" : qCd.toFixed(0) + "s";
  const fStatus = isPowerupActive("calmTalk") ? "AKTIV" : fCd <= 0 ? "REDO" : fCd.toFixed(0) + "s";

  ctx.fillStyle = "#d7dee7";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText("Q Garderobsrush: " + qStatus, 658, 80);
  ctx.fillText("F Lugn snack: " + fStatus, 658, 94);

  if (state.comboRaid.active) {
    ctx.fillStyle = "rgba(116, 18, 24, 0.86)";
    ctx.fillRect(330, 42, 305, 28);
    ctx.strokeStyle = "#f3d7dc";
    ctx.lineWidth = 2;
    ctx.strokeRect(330, 42, 305, 28);
    ctx.fillStyle = "#ffeef1";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText("Combo-våg: " + state.comboRaid.remaining + " objekt kvar", 342, 61);
  }

  const active = activeEventDef();
  if (active) {
    ctx.fillStyle = "rgba(18, 28, 39, 0.9)";
    ctx.fillRect(18, 42, 304, 56);
    ctx.strokeStyle = "#c9d8e4";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 42, 304, 56);
    ctx.fillStyle = "#edf4fb";
    ctx.font = "bold 12px Trebuchet MS";
    ctx.fillText("H\u00e4ndelse: " + active.title, 26, 60);
    ctx.font = "11px Trebuchet MS";
    ctx.fillText(active.text, 26, 76);
    ctx.fillText("Tid kvar: " + Math.max(0, state.events.timeLeft).toFixed(0) + "s", 26, 92);
  } else {
    ctx.fillStyle = "rgba(18, 28, 39, 0.75)";
    ctx.fillRect(18, 42, 304, 28);
    ctx.fillStyle = "#dce6ef";
    ctx.font = "11px Trebuchet MS";
    ctx.fillText("Nästa event om ca " + Math.max(0, state.events.nextIn).toFixed(0) + "s", 26, 60);
  }

  const synergies = state.synergies.length > 0 ? state.synergies.join(" | ") : "Inga aktiva synergi-bonusar";
  ctx.fillStyle = "rgba(18, 24, 31, 0.84)";
  ctx.fillRect(18, 604, 964, 24);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Synergier: " + synergies, 24, 620);
}
function drawInteractionPrompt() {
  if (state.actionMenu.open || !state.nearestItemId) {
    return;
  }

  const item = getItemById(state.nearestItemId);
  if (!item) {
    return;
  }

  const definition = ITEM_DEFS[item.type];
  const text = "Tryck E: " + definition.name;
  ctx.font = "11px Trebuchet MS";
  const width = Math.max(150, ctx.measureText(text).width + 20);

  ctx.fillStyle = "rgba(6, 10, 13, 0.78)";
  ctx.fillRect(item.x - width / 2, item.y - 36, width, 20);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, item.x - width / 2 + 10, item.y - 22);
}

function drawActionMenu() {
  if (!state.actionMenu.open) {
    return;
  }

  const item = getItemById(state.actionMenu.itemId);
  if (!item) {
    return;
  }

  const definition = ITEM_DEFS[item.type];

  const panel = { x: 288, y: 468, w: 420, h: 126 };
  ctx.fillStyle = "rgba(18, 22, 29, 0.93)";
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.strokeStyle = "#f3d8cc";
  ctx.lineWidth = 2;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Trebuchet MS";
  const stateLabel = item.state === "hidden" ? "g\u00f6md" : item.state === "relocated" ? "flyttad" : "normal";
  ctx.fillText("\u00c5tg\u00e4rd: " + definition.name + " (" + stateLabel + ")", panel.x + 12, panel.y + 22);

  ctx.font = "12px Trebuchet MS";
  ctx.fillText("1) Göm: liten minskning, låg risk", panel.x + 12, panel.y + 48);
  ctx.fillText("2) Flytta: minimal minskning, säkrast", panel.x + 12, panel.y + 68);
  ctx.fillText("3) Ta bort: stor minskning, hög risk", panel.x + 12, panel.y + 88);
  ctx.fillText("Esc/E) Avbryt", panel.x + 12, panel.y + 108);
}

function drawSubtitle() {
  if (state.subtitle.timer <= 0 || !state.subtitle.text) {
    return;
  }

  const text = state.subtitle.text;

  if (state.subtitle.speaker === "girlfriend") {
    const bubble = { x: 16, y: 520, w: 712, h: 70 };
    ctx.fillStyle = "rgba(8, 11, 16, 0.88)";
    ctx.fillRect(bubble.x, bubble.y, bubble.w, bubble.h);
    ctx.strokeStyle = "#f4d6dd";
    ctx.lineWidth = 2;
    ctx.strokeRect(bubble.x, bubble.y, bubble.w, bubble.h);

    ctx.fillStyle = "#ffdce7";
    ctx.font = "bold 12px Trebuchet MS";
    ctx.fillText("Flickvän", bubble.x + 12, bubble.y + 16);

    ctx.fillStyle = "#f5f1e8";
    ctx.font = "16px Trebuchet MS";
    drawWrappedText(text, bubble.x + 12, bubble.y + 42, bubble.w - 24, 18, 2);

    const panel = { x: 736, y: 456, w: 252, h: 136 };
    ctx.fillStyle = "rgba(10, 13, 18, 0.94)";
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.strokeStyle = "#f3d6df";
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

    if (isLoaded(SPRITES.avatar)) {
      ctx.drawImage(SPRITES.avatar, panel.x + 8, panel.y + 8, 96, 120);
    } else {
      ctx.fillStyle = "#ffb5cb";
      ctx.fillRect(panel.x + 8, panel.y + 8, 96, 120);
      ctx.fillStyle = "#321726";
      ctx.font = "bold 18px monospace";
      ctx.fillText("G", panel.x + 48, panel.y + 70);
    }

    ctx.fillStyle = "#f5f0ea";
    ctx.font = "bold 12px Trebuchet MS";
    ctx.fillText("Praktisk logik", panel.x + 112, panel.y + 34);
    ctx.font = "11px Trebuchet MS";
    ctx.fillText("+1 mjuk eskalering", panel.x + 112, panel.y + 54);
    ctx.fillText("ofr\u00e5nkomlig k\u00e4nsla", panel.x + 112, panel.y + 74);
    ctx.fillText("alltid rimligt", panel.x + 112, panel.y + 90);
    return;
  }

  ctx.font = "16px Trebuchet MS";
  const measured = Math.min(760, ctx.measureText(text).width + 36);
  const x = (WORLD.width - measured) / 2;
  const y = 552;

  ctx.fillStyle = "rgba(7, 9, 12, 0.82)";
  ctx.fillRect(x, y, measured, 36);
  ctx.strokeStyle = "#e3ddd1";
  ctx.strokeRect(x, y, measured, 36);

  ctx.fillStyle = "#f5f1e8";
  ctx.fillText(text, x + 16, y + 24);
}

function drawEndScreen() {
  if (!state.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(3, 5, 9, 0.74)";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const panel = { x: 230, y: 150, w: 540, h: 340 };
  ctx.fillStyle = "#f9f3eb";
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.strokeStyle = "#2d3741";
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

  ctx.fillStyle = "#1a1f26";
  ctx.font = "bold 34px Trebuchet MS";
  ctx.fillText("Rundan är slut", panel.x + 148, panel.y + 54);

  ctx.font = "bold 24px Trebuchet MS";
  if (state.result === "girlified") {
    ctx.fillText("Det är hennes lägenhet nu.", panel.x + 124, panel.y + 102);
  } else if (state.result === "annoyed") {
    ctx.fillText("Du gjorde det stelt.", panel.x + 170, panel.y + 102);
  } else {
    const preserved = Math.max(0, 100 - state.meters.girlification).toFixed(0);
    ctx.fillText("Du bevarade " + preserved + "% av originallägenheten.", panel.x + 62, panel.y + 102);
  }

  ctx.font = "14px Trebuchet MS";
  const lines = [
    "Objekt borttagna: " + state.stats.removed,
    "Objekt gömda: " + state.stats.hidden,
    "Objekt flyttade: " + state.stats.relocated,
    "Rum förlorade minst en gång: " + state.stats.roomsLost,
    "Misstanke-triggers: " + state.stats.suspicionTriggered,
    "Slutlig tjejifiering: " + state.meters.girlification.toFixed(0) + "%",
    "Slutlig irritation: " + state.meters.annoyance.toFixed(0) + "%"
  ];

  let y = panel.y + 150;
  for (const line of lines) {
    ctx.fillText(line, panel.x + 54, y);
    y += 24;
  }

  ctx.font = "bold 16px Trebuchet MS";
  ctx.fillText("Tryck R för att starta om", panel.x + 176, panel.y + 304);
}

function drawBackground() {
  const warmth = state.meters.girlification / 100;

  const top = shade("#d8e0ea", warmth * 0.45);
  const bottom = shade("#f2e2d3", warmth * 0.55);
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  if (warmth > 0.18) {
    ctx.fillStyle = "rgba(255, 210, 175, " + (0.08 + warmth * 0.16) + ")";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  if (state.moodSwing.active) {
    const pulse = 0.1 + 0.06 * Math.sin(state.elapsed * 3.6);
    ctx.fillStyle = "rgba(180, 24, 36, " + pulse.toFixed(3) + ")";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}

function buildRoomState() {
  const featureMap = {
    living: "Pleddar och ljus känns permanenta",
    kitchen: "Muggkolonin har etablerat sig",
    bathroom: "Hudvårdshyllan är här för att stanna",
    hallway: "Extra skor vid dörren",
    bedroom: "Prydnadskuddar sitter fast emotionellt"
  };

  const map = {};
  for (const room of ROOMS) {
    map[room.id] = {
      status: "Neutral",
      score: 0,
      permanentUnlocked: false,
      permanentBonus: 0,
      feature: featureMap[room.id] || room.permanentFeature
    };
  }
  return map;
}

function createInitialState() {
  return {
    player: { x: 170, y: 475, radius: 12, speed: 190 },
    items: [],
    nextItemId: 1,
    girlfriend: {
      active: true,
      phase: "roam",
      x: 220,
      y: 430,
      targetX: 250,
      targetY: 380,
      pendingItem: null,
      line: "",
      speed: 132,
      facing: "down",
      roamWait: 0
    },
    meters: { girlification: 0, annoyance: 0 },
    synergies: [],
    roomState: buildRoomState(),
    spawnTimer: randRange(16, 30),
    elapsed: 0,
    day: 1,
    dayDuration: 56,
    targetDays: 3,
    timeInDay: 0,
    subtitle: { text: "Försvara lägenheten utan att göra det stelt.", timer: 5, speaker: "narrator" },
    actionMenu: { open: false, itemId: null },
    nearestItemId: null,
    recentRemovals: [],
    lastActionTime: -999,
    lastBumpAt: -999,
    moodSwing: { active: false, daysTriggered: 0, lockUntilDay: 2 },
    comboRaid: { active: false, remaining: 0, timer: 0, nextEligibleAt: 35 },
    powerups: {
      closetBlitz: { cooldown: 28, duration: 6, readyAt: 0, activeFor: 0 },
      calmTalk: { cooldown: 36, duration: 8, readyAt: 0, activeFor: 0 }
    },
    events: {
      activeId: null,
      timeLeft: 0,
      nextIn: randRange(22, 38),
      recent: [],
      ikeaTimer: 0,
      ikeaBlocked: false,
      perfectPlacements: 0,
      eurovisionChains: 0
    },
    gameOver: false,
    result: "",
    stats: { removed: 0, hidden: 0, relocated: 0, roomsLost: 0, suspicionTriggered: 0 }
  };
}

function activateClosetBlitz() {
  const power = state.powerups.closetBlitz;
  if (state.elapsed < power.readyAt) {
    return;
  }

  power.readyAt = state.elapsed + power.cooldown;
  power.activeFor = power.duration;

  const candidates = state.items
    .filter((item) => item.state !== "hidden")
    .sort((a, b) => dist(state.player.x, state.player.y, a.x, a.y) - dist(state.player.x, state.player.y, b.x, b.y));

  let moved = 0;
  for (const item of candidates) {
    if (dist(state.player.x, state.player.y, item.x, item.y) > 150) {
      continue;
    }

    const room = getRoomById(item.roomId);
    const target = pick(room.hideSpots);
    item.x = target.x + randRange(-5, 5);
    item.y = target.y + randRange(-4, 4);
    item.state = "hidden";
    moved += 1;

    if (moved >= 3) {
      break;
    }
  }

  const noun = moved === 1 ? "objekt" : "objekt";
  if (moved > 0) {
    showSubtitle("Garderobsrush: gömde " + moved + " " + noun + " direkt.", 2.8);
  } else {
    showSubtitle("Garderobsrush aktiv, men inget låg nära.", 2.8);
  }
  playSfx("powerup");
}

function activateCalmTalk() {
  const power = state.powerups.calmTalk;
  if (state.elapsed < power.readyAt) {
    return;
  }

  power.readyAt = state.elapsed + power.cooldown;
  power.activeFor = power.duration;
  state.meters.annoyance = clamp(state.meters.annoyance - 14, 0, 100);

  showSubtitle("Lugn snack aktiv: spänningen sjunker en stund.", 2.8);
  playSfx("powerup");
}

function tryActivatePowerups() {
  if (consumePressed("KeyQ")) {
    activateClosetBlitz();
  }
  if (consumePressed("KeyF")) {
    activateCalmTalk();
  }
}

function updatePowerups(dt) {
  for (const key of Object.keys(state.powerups)) {
    state.powerups[key].activeFor = Math.max(0, state.powerups[key].activeFor - dt);
  }
}

function maybeStartComboRaid() {
  if (state.comboRaid.active) {
    return;
  }
  if (state.elapsed < state.comboRaid.nextEligibleAt) {
    return;
  }

  if (state.day < 2 && state.meters.girlification < 30) {
    return;
  }

  let chance = 0.14 + (state.day - 1) * 0.05 + (state.meters.girlification / 100) * 0.08;
  if (state.moodSwing.active) {
    chance += 0.12;
  }

  if (Math.random() > chance) {
    return;
  }

  state.comboRaid.active = true;
  state.comboRaid.remaining = Math.random() < 0.55 ? 2 : 3;
  state.comboRaid.timer = randRange(1.8, 3.2);
  state.comboRaid.nextEligibleAt = state.elapsed + randRange(65, 95);

  showSubtitle("Combo-våg: hon tog med flera 'små praktiska' saker på en gång.", 3.4);
  playSfx("raid");
}

