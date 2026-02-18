// ============================================================
// 타워 디펜스 게임 - game.js
// 9살 아이와 아빠가 함께 즐기는 모바일 타워 디펜스
// PvZ 스타일 코드 이펙트 적용 버전
// ============================================================

// ========== 1. 게임 설정 상수 ==========

const CONFIG = {
  // 게임 논리 해상도 (내부 좌표계)
  WIDTH: 480,
  HEIGHT: 800,
  FPS: 60,
  // 경제
  START_GOLD: 200,
  START_LIVES: 20,
  SELL_REFUND: 0.7,
  // 타워 설치 불가 영역 (경로 위)
  PATH_BLOCK_DIST: 30,
  // 하단 UI 높이 (카드 슬롯 스타일로 확대)
  UI_BAR_HEIGHT: 100,
  // 상단 HUD 높이
  HUD_HEIGHT: 50,
  // 파티클 최대 수 (성능 보호)
  MAX_PARTICLES: 100
};

// ========== 타워 데이터 (확장 가능 구조 - 새 타워 추가 시 객체 하나만 추가) ==========
const TOWER_DATA = {
  guseul: {
    name: '구슬이',
    cost: 100,
    damage: 25,
    range: 150,
    attackInterval: 1000, // ms
    // 이미지 이원화: 카드(UI)용 / 인게임(맵)용
    cardImageKey: 'guseul',
    ingameImageKey: 'guseul_ingame',
    awakenedCardImageKey: 'awakened_guseul',
    awakenedIngameImageKey: 'awakened_guseul_ingame',
    // 하위 호환용 (기존 코드 참조)
    imageKey: 'guseul',
    awakenedImageKey: 'awakened_guseul',
    // 각성 관련
    awakenCard: 'guseul_card',
    awakenCost: 300,
    awakenDamage: 50,
    awakenRange: 180,
    awakenAttackInterval: 500,
    // 공격 이펙트 타입 (데이터 기반 이펙트 분기)
    attackEffectType: 'projectile',
    projectileColor: '#ff6600',
    projectileSpeed: 350
  },
  meokbang: {
    name: '먹방이',
    cost: 150,
    damage: 40,
    range: 80,
    attackInterval: 2000,
    cardImageKey: 'meokbang',
    ingameImageKey: 'meokbang_ingame',
    awakenedCardImageKey: 'awakened_meokbang',
    awakenedIngameImageKey: 'awakened_meokbang_ingame',
    imageKey: 'meokbang',
    awakenedImageKey: 'awakened_meokbang',
    awakenCard: 'meokbang_card',
    awakenCost: 400,
    awakenDamage: 80,
    awakenRange: 100,
    awakenAttackInterval: 1400,
    attackEffectType: 'melee',
    projectileColor: '#222222',
    projectileSpeed: 200
  },
  bulgeom: {
    name: '불검이',
    cost: 120,
    damage: 35,
    range: 70,
    attackInterval: 670,
    cardImageKey: 'bulgeom',
    ingameImageKey: 'bulgeom_ingame',
    awakenedCardImageKey: 'awakened_bulgeom',
    awakenedIngameImageKey: 'awakened_bulgeom_ingame',
    imageKey: 'bulgeom',
    awakenedImageKey: 'awakened_bulgeom',
    awakenCard: 'bulgeom_card',
    awakenCost: 350,
    awakenDamage: 70,
    awakenRange: 90,
    awakenAttackInterval: 500,
    attackEffectType: 'flame',
    projectileColor: '#ff4400',
    projectileSpeed: 0
  },
  chonggeom: {
    name: '총검이',
    cost: 130,
    damage: 30,
    range: 200,
    attackInterval: 830,
    cardImageKey: 'chonggeom',
    ingameImageKey: 'chonggeom_ingame',
    awakenedCardImageKey: 'awakened_chonggeom',
    awakenedIngameImageKey: 'awakened_chonggeom_ingame',
    imageKey: 'chonggeom',
    awakenedImageKey: 'awakened_chonggeom',
    awakenCard: 'chonggeom_card',
    awakenCost: 380,
    awakenDamage: 60,
    awakenRange: 250,
    awakenAttackInterval: 670,
    attackEffectType: 'bullet',
    projectileColor: '#ffdd44',
    projectileSpeed: 500
  }
};

// ========== 적 데이터 (이미지 이원화 적용) ==========
const ENEMY_DATA = {
  zombie: {
    name: '악당좀비',
    hp: 100,
    speed: 40, // px/초
    gold: 15,
    imageKey: 'villain_zombie',            // 하위 호환
    cardImageKey: 'villain_zombie',        // UI 카드용
    ingameImageKey: 'villain_zombie_ingame' // 인게임 맵용
  },
  fastZombie: {
    name: '빠른좀비',
    hp: 70,
    speed: 70,
    gold: 20,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame'
  },
  bossZombie: {
    name: '보스좀비',
    hp: 800,
    speed: 25,
    gold: 100,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame'
  }
};

// ========== 웨이브 데이터 (5레벨) ==========
const LEVEL_DATA = [
  // 레벨 1: 쉬움
  { waves: [
    { enemies: [{ type: 'zombie', count: 5, interval: 1200 }] },
    { enemies: [{ type: 'zombie', count: 7, interval: 1100 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 1000 }] }
  ]},
  // 레벨 2: 쉬움
  { waves: [
    { enemies: [{ type: 'zombie', count: 10, interval: 1000 }] },
    { enemies: [{ type: 'zombie', count: 12, interval: 900 }] },
    { enemies: [{ type: 'zombie', count: 13, interval: 900 }] },
    { enemies: [{ type: 'zombie', count: 15, interval: 800 }] }
  ]},
  // 레벨 3: 보통
  { waves: [
    { enemies: [{ type: 'zombie', count: 12, interval: 900 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 800 }, { type: 'fastZombie', count: 3, interval: 700 }] },
    { enemies: [{ type: 'zombie', count: 14, interval: 800 }] },
    { enemies: [{ type: 'fastZombie', count: 6, interval: 700 }] },
    { enemies: [{ type: 'zombie', count: 18, interval: 700 }] }
  ]},
  // 레벨 4: 어려움
  { waves: [
    { enemies: [{ type: 'zombie', count: 15, interval: 800 }] },
    { enemies: [{ type: 'fastZombie', count: 8, interval: 600 }] },
    { enemies: [{ type: 'zombie', count: 18, interval: 700 }, { type: 'fastZombie', count: 5, interval: 600 }] },
    { enemies: [{ type: 'zombie', count: 20, interval: 600 }] },
    { enemies: [{ type: 'fastZombie', count: 12, interval: 500 }] },
    { enemies: [{ type: 'zombie', count: 25, interval: 500 }] }
  ]},
  // 레벨 5: 매우 어려움
  { waves: [
    { enemies: [{ type: 'zombie', count: 18, interval: 700 }] },
    { enemies: [{ type: 'fastZombie', count: 10, interval: 500 }] },
    { enemies: [{ type: 'zombie', count: 20, interval: 600 }, { type: 'fastZombie', count: 8, interval: 500 }] },
    { enemies: [{ type: 'zombie', count: 22, interval: 500 }] },
    { enemies: [{ type: 'fastZombie', count: 15, interval: 450 }] },
    { enemies: [{ type: 'zombie', count: 25, interval: 450 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 600 }, { type: 'fastZombie', count: 10, interval: 500 }] },
    { enemies: [{ type: 'bossZombie', count: 1, interval: 1000 }, { type: 'zombie', count: 20, interval: 500 }] }
  ]}
];

// ========== 1-2. 맵 데이터 (5종 맵 테마) ==========

const MAP_DATA = {
  grassland: {
    name: '초원',
    bgColor: '#4CAF50',
    pathColor: '#8B4513',
    pathBorderColor: '#6B3410',
    decorColor: '#66BB6A',
    particleEffect: null,
    // 난이도별 경로 (waypoint 좌표 배열, 480x800 기준)
    paths: {
      easy: [
        [{ x: -30, y: 200 }, { x: 160, y: 200 }, { x: 160, y: 400 }, { x: 320, y: 400 }, { x: 320, y: 600 }, { x: 510, y: 600 }]
      ],
      normal: [
        [{ x: -30, y: 150 }, { x: 120, y: 150 }, { x: 120, y: 300 }, { x: 360, y: 300 }, { x: 360, y: 500 }, { x: 200, y: 500 }, { x: 200, y: 650 }, { x: 510, y: 650 }]
      ]
    }
  },
  lava: {
    name: '용암',
    bgColor: '#2C1810',
    pathColor: '#FF4500',
    pathBorderColor: '#CC3700',
    decorColor: '#FF6347',
    particleEffect: 'fire',
    paths: {
      hard: [
        [{ x: -30, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 250 }, { x: 380, y: 250 }, { x: 380, y: 400 }, { x: 50, y: 400 }, { x: 50, y: 550 }, { x: 300, y: 550 }, { x: 300, y: 700 }, { x: 510, y: 700 }]
      ],
      veryhard: [
        [{ x: -30, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 250 }, { x: 80, y: 250 }, { x: 80, y: 400 }, { x: 400, y: 400 }, { x: 400, y: 550 }, { x: 80, y: 550 }, { x: 80, y: 700 }, { x: 510, y: 700 }]
      ]
    }
  },
  cave: {
    name: '동굴',
    bgColor: '#1A1A2E',
    pathColor: '#696969',
    pathBorderColor: '#505050',
    decorColor: '#4682B4',
    particleEffect: 'glow',
    paths: {
      normal: [
        [{ x: -30, y: 120 }, { x: 200, y: 120 }, { x: 200, y: 300 }, { x: 400, y: 300 }, { x: 400, y: 480 }, { x: 100, y: 480 }, { x: 100, y: 650 }, { x: 510, y: 650 }]
      ],
      hard: [
        [{ x: -30, y: 100 }, { x: 150, y: 100 }, { x: 150, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 370 }, { x: 80, y: 370 }, { x: 80, y: 520 }, { x: 400, y: 520 }, { x: 400, y: 680 }, { x: 510, y: 680 }]
      ],
      veryhard: [
        [{ x: -30, y: 80 }, { x: 420, y: 80 }, { x: 420, y: 200 }, { x: 60, y: 200 }, { x: 60, y: 330 }, { x: 420, y: 330 }, { x: 420, y: 460 }, { x: 60, y: 460 }, { x: 60, y: 590 }, { x: 350, y: 590 }, { x: 350, y: 700 }, { x: 510, y: 700 }]
      ]
    }
  },
  desert: {
    name: '사막',
    bgColor: '#F4D03F',
    pathColor: '#DAA520',
    pathBorderColor: '#B8860B',
    decorColor: '#228B22',
    particleEffect: null,
    paths: {
      easy: [
        [{ x: -30, y: 180 }, { x: 350, y: 180 }, { x: 350, y: 380 }, { x: 130, y: 380 }, { x: 130, y: 580 }, { x: 510, y: 580 }]
      ],
      normal: [
        [{ x: -30, y: 130 }, { x: 300, y: 130 }, { x: 300, y: 280 }, { x: 80, y: 280 }, { x: 80, y: 440 }, { x: 380, y: 440 }, { x: 380, y: 620 }, { x: 510, y: 620 }]
      ]
    }
  },
  ice: {
    name: '얼음',
    bgColor: '#E0F7FA',
    pathColor: '#B0C4DE',
    pathBorderColor: '#8FA8C8',
    decorColor: '#FFFFFF',
    particleEffect: 'snow',
    paths: {
      hard: [
        [{ x: -30, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 250 }, { x: 400, y: 250 }, { x: 400, y: 400 }, { x: 100, y: 400 }, { x: 100, y: 560 }, { x: 350, y: 560 }, { x: 350, y: 700 }, { x: 510, y: 700 }]
      ],
      veryhard: [
        [{ x: -30, y: 90 }, { x: 380, y: 90 }, { x: 380, y: 210 }, { x: 100, y: 210 }, { x: 100, y: 340 }, { x: 380, y: 340 }, { x: 380, y: 470 }, { x: 100, y: 470 }, { x: 100, y: 600 }, { x: 400, y: 600 }, { x: 400, y: 710 }, { x: 510, y: 710 }]
      ]
    }
  }
};

// ========== 1-3. 맵 선택 로직 ==========

// 레벨 → 난이도 매핑
function getDifficulty(level) {
  if (level <= 1) return 'easy';      // 레벨 1~2
  if (level === 2) return 'normal';   // 레벨 3
  if (level === 3) return 'hard';     // 레벨 4
  return 'veryhard';                  // 레벨 5
}

// 레벨 시작 시 맵 랜덤 선택
function selectMap(level) {
  const difficulty = getDifficulty(level);
  // 해당 난이도 경로를 가진 맵 필터링
  const availableMaps = Object.entries(MAP_DATA)
    .filter(([id, data]) => data.paths[difficulty] && data.paths[difficulty].length > 0)
    .map(([id]) => id);

  if (availableMaps.length === 0) {
    // 폴백: 초원 맵의 easy 경로 사용
    return {
      mapId: 'grassland',
      mapData: MAP_DATA.grassland,
      path: MAP_DATA.grassland.paths.easy[0]
    };
  }

  const selectedMapId = availableMaps[Math.floor(Math.random() * availableMaps.length)];
  const selectedMap = MAP_DATA[selectedMapId];
  const paths = selectedMap.paths[difficulty];
  const selectedPath = paths[Math.floor(Math.random() * paths.length)];
  return { mapId: selectedMapId, mapData: selectedMap, path: selectedPath };
}

// ========== 2. 유틸리티 ==========

const Utils = {
  // 두 점 사이 거리
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 점에서 선분까지 최소 거리
  pointToSegmentDist(px, py, ax, ay, bx, by) {
    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));
    return this.dist(px, py, ax + t * abx, ay + t * aby);
  },

  // 경로 위인지 체크 (타워 설치 불가 영역)
  isOnPath(x, y, waypoints) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = this.pointToSegmentDist(
        x, y,
        waypoints[i].x, waypoints[i].y,
        waypoints[i + 1].x, waypoints[i + 1].y
      );
      if (d < CONFIG.PATH_BLOCK_DIST) return true;
    }
    return false;
  },

  // UI 영역인지 체크
  isInUIArea(y) {
    return y < CONFIG.HUD_HEIGHT || y > CONFIG.HEIGHT - CONFIG.UI_BAR_HEIGHT;
  }
};

// ========== 3. 이미지 로더 (이미지 이원화 대응) ==========

// 이미지 소스 매핑 (키 → 파일 경로)
const IMAGE_SOURCES = {
  // === 카드/선택 UI 이미지 (아이 원본 그림) ===
  guseul: 'guseul.png',
  awakened_guseul: 'awakened_guseul.png',
  meokbang: 'meokbang.png',
  awakened_meokbang: 'awakened_meokbang.png',
  bulgeom: 'bulgeom.png',
  awakened_bulgeom: 'awakened_bulgeom.png',
  chonggeom: 'chonggeom.png',
  awakened_chonggeom: 'awakened_chonggeom.png',
  villain_zombie: 'villain_zombie.png',
  guseul_card: 'guseul_card.png',
  meokbang_card: 'meokbang_card.png',
  bulgeom_card: 'bulgeom_card.png',
  chonggeom_card: 'chonggeom_card.png',

  // === 인게임 이미지 (맵 위 타워/적 렌더링용, 아직 파일 없음 → onerror 폴백) ===
  guseul_ingame: 'ingame_guseul.png',
  awakened_guseul_ingame: 'ingame_awakened_guseul.png',
  meokbang_ingame: 'ingame_meokbang.png',
  awakened_meokbang_ingame: 'ingame_awakened_meokbang.png',
  bulgeom_ingame: 'ingame_bulgeom.png',
  awakened_bulgeom_ingame: 'ingame_awakened_bulgeom.png',
  chonggeom_ingame: 'ingame_chonggeom.png',
  awakened_chonggeom_ingame: 'ingame_awakened_chonggeom.png',
  villain_zombie_ingame: 'ingame_villain_zombie.png'
};

const ImageLoader = {
  images: {},
  loaded: 0,
  total: 0,
  // 로드 실패한 이미지 키 추적 (폴백 판단용)
  failedKeys: new Set(),

  // 모든 이미지 프리로드
  preload(onProgress, onComplete) {
    const entries = Object.entries(IMAGE_SOURCES);
    this.total = entries.length;
    this.loaded = 0;

    entries.forEach(([key, filename]) => {
      const img = new Image();
      img.onload = () => {
        this.loaded++;
        onProgress(Math.floor(this.loaded / this.total * 100));
        if (this.loaded >= this.total) onComplete();
      };
      img.onerror = () => {
        // 로드 실패 추적 (인게임 이미지 등 아직 없는 파일)
        this.failedKeys.add(key);
        this.loaded++;
        onProgress(Math.floor(this.loaded / this.total * 100));
        if (this.loaded >= this.total) onComplete();
      };
      img.src = 'images/' + filename;
      this.images[key] = img;
    });
  },

  // 이미지가 사용 가능한지 확인
  isAvailable(key) {
    if (this.failedKeys.has(key)) return false;
    const img = this.images[key];
    return img && img.complete && img.naturalWidth > 0;
  },

  // 이미지 그리기 (중앙 기준, 변환 지원)
  draw(ctx, key, cx, cy, w, h) {
    const img = this.images[key];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else {
      // 이미지 없을 때 대체 원
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(cx, cy, w / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // Squash & Stretch 적용 이미지 그리기
  drawSquashed(ctx, key, cx, cy, w, h, scaleX, scaleY) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);
    this.draw(ctx, key, 0, 0, w, h);
    ctx.restore();
  }
};

// ========== 3-2. 이미지 폴백 헬퍼 함수 ==========

// 타워의 인게임 이미지 키 결정 (폴백 로직 포함)
// 1순위: ingameImageKey → 2순위: cardImageKey → 3순위: 기존 imageKey → 4순위: null(도형)
function getTowerIngameImageKey(towerType, isAwakened) {
  const data = TOWER_DATA[towerType];
  if (isAwakened) {
    if (ImageLoader.isAvailable(data.awakenedIngameImageKey)) return data.awakenedIngameImageKey;
    if (ImageLoader.isAvailable(data.awakenedCardImageKey)) return data.awakenedCardImageKey;
    if (ImageLoader.isAvailable(data.awakenedImageKey)) return data.awakenedImageKey;
  } else {
    if (ImageLoader.isAvailable(data.ingameImageKey)) return data.ingameImageKey;
    if (ImageLoader.isAvailable(data.cardImageKey)) return data.cardImageKey;
    if (ImageLoader.isAvailable(data.imageKey)) return data.imageKey;
  }
  return null;
}

// 타워의 카드(UI) 이미지 키 결정 (폴백 로직 포함)
function getTowerCardImageKey(towerType, isAwakened) {
  const data = TOWER_DATA[towerType];
  if (isAwakened) {
    if (ImageLoader.isAvailable(data.awakenedCardImageKey)) return data.awakenedCardImageKey;
    if (ImageLoader.isAvailable(data.awakenedImageKey)) return data.awakenedImageKey;
  } else {
    if (ImageLoader.isAvailable(data.cardImageKey)) return data.cardImageKey;
    if (ImageLoader.isAvailable(data.imageKey)) return data.imageKey;
  }
  return null;
}

// 적의 인게임 이미지 키 결정 (폴백 로직 포함)
function getEnemyIngameImageKey(enemyType) {
  const data = ENEMY_DATA[enemyType];
  if (data.ingameImageKey && ImageLoader.isAvailable(data.ingameImageKey)) return data.ingameImageKey;
  if (data.cardImageKey && ImageLoader.isAvailable(data.cardImageKey)) return data.cardImageKey;
  if (ImageLoader.isAvailable(data.imageKey)) return data.imageKey;
  return null;
}

// 폴백 도형 그리기 (이미지 없을 때 원으로 타워 표시)
function drawFallbackTower(ctx, x, y, towerType, isAwakened) {
  const colors = {
    guseul: '#9C27B0',
    meokbang: '#212121',
    bulgeom: '#F44336',
    chonggeom: '#E53935'
  };
  const radius = isAwakened ? 22 : 18;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[towerType] || '#666';
  ctx.fill();
  if (isAwakened) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ========== 4. 경로 시스템 (맵별 경로 지원) ==========

const PathSystem = {
  waypoints: [],
  // 현재 선택된 맵 정보 저장
  currentMap: null,

  // 맵 기반 경로 설정 (selectMap 결과로 호출)
  setPath(mapResult) {
    this.currentMap = mapResult;
    this.waypoints = mapResult.path.slice(); // 경로 복사
    this._cachedLength = null;
  },

  // S자 경로 생성 (폴백용 - 맵 선택 실패 시)
  generate() {
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;
    const top = CONFIG.HUD_HEIGHT + 20;
    const bot = H - CONFIG.UI_BAR_HEIGHT - 20;
    const mid = (top + bot) / 2;

    this.waypoints = [
      { x: -30, y: top + 60 },
      { x: W * 0.8, y: top + 60 },
      { x: W * 0.8, y: top + 160 },
      { x: W * 0.2, y: top + 160 },
      { x: W * 0.2, y: mid },
      { x: W * 0.8, y: mid },
      { x: W * 0.8, y: bot - 80 },
      { x: W * 0.2, y: bot - 80 },
      { x: W * 0.2, y: bot },
      { x: W + 30, y: bot }
    ];

    // 폴백 맵 (초원 기본)
    this.currentMap = {
      mapId: 'grassland',
      mapData: MAP_DATA.grassland,
      path: this.waypoints
    };

    this._cachedLength = null;
  },

  // 경로 그리기 (맵 테마 색상 적용)
  draw(ctx) {
    if (this.waypoints.length < 2) return;
    ctx.save();

    // 맵 테마에 따른 경로 색상
    const mapData = this.currentMap ? this.currentMap.mapData : null;
    const pathColor = mapData ? mapData.pathColor : '#C4A265';
    const borderColor = mapData ? mapData.pathBorderColor : '#8B6914';

    // 메인 경로
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.stroke();

    // 경로 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 48;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.stroke();

    // 경로 내부 점선 (질감)
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(160, 120, 60, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  },

  // 전체 경로 길이 계산 (캐시 사용으로 성능 최적화)
  getTotalLength() {
    if (this._cachedLength !== null) return this._cachedLength;
    let len = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      len += Utils.dist(
        this.waypoints[i].x, this.waypoints[i].y,
        this.waypoints[i + 1].x, this.waypoints[i + 1].y
      );
    }
    this._cachedLength = len;
    return len;
  },

  // 진행도(0~1)에 따른 좌표 반환
  getPositionAt(progress) {
    if (progress <= 0) return { ...this.waypoints[0] };
    if (progress >= 1) return { ...this.waypoints[this.waypoints.length - 1] };

    const totalLen = this.getTotalLength();
    let target = progress * totalLen;
    let accumulated = 0;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const segLen = Utils.dist(
        this.waypoints[i].x, this.waypoints[i].y,
        this.waypoints[i + 1].x, this.waypoints[i + 1].y
      );
      if (accumulated + segLen >= target) {
        const t = (target - accumulated) / segLen;
        return {
          x: this.waypoints[i].x + (this.waypoints[i + 1].x - this.waypoints[i].x) * t,
          y: this.waypoints[i].y + (this.waypoints[i + 1].y - this.waypoints[i].y) * t
        };
      }
      accumulated += segLen;
    }
    return { ...this.waypoints[this.waypoints.length - 1] };
  }
};

// ========== 5. 파티클 시스템 (성능 최적화) ==========

const ParticleSystem = {
  particles: [],

  // 파티클 추가 (최대 수 제한)
  add(config) {
    if (this.particles.length >= CONFIG.MAX_PARTICLES) {
      // 가장 오래된 파티클 제거
      this.particles.shift();
    }
    this.particles.push({
      x: config.x || 0,
      y: config.y || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      size: config.size || 4,
      color: config.color || '#fff',
      life: 0,
      maxLife: config.maxLife || 500,
      gravity: config.gravity || 0,
      shrink: config.shrink !== false, // 기본 true: 시간 지남에 따라 축소
      glow: config.glow || false
    });
  },

  // 폭발형 파티클 다수 생성
  burst(x, y, count, config) {
    const available = CONFIG.MAX_PARTICLES - this.particles.length;
    const actualCount = Math.min(count, Math.max(0, available));
    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.5;
      const speed = (config.speed || 80) * (0.5 + Math.random() * 0.5);
      this.add({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: config.size || 4,
        color: config.color || '#ffcc00',
        maxLife: config.maxLife || 600,
        gravity: config.gravity || 50,
        shrink: config.shrink !== false,
        glow: config.glow || false
      });
    }
  },

  // 업데이트
  update(dt) {
    const dtSec = dt / 1000;
    this.particles = this.particles.filter(p => {
      p.life += dt;
      if (p.life >= p.maxLife) return false;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vy += p.gravity * dtSec;
      return true;
    });
  },

  // 렌더링
  render(ctx) {
    this.particles.forEach(p => {
      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;
      const size = p.shrink ? p.size * (1 - progress * 0.7) : p.size;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 글로우 효과
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
};

// ========== 5-2. 이펙트 시스템 (기존 호환 + 강화) ==========

const EffectSystem = {
  effects: [],

  // 화면 플래시 (각성 연출용)
  screenFlash: null,

  // 투사체 생성 (구슬이 전용 - 구슬 파티클 트레일 추가)
  addProjectile(sx, sy, tx, ty, color, speed, damage) {
    this.effects.push({
      type: 'projectile', x: sx, y: sy,
      tx, ty, color, speed: speed || 300,
      damage, life: 0, maxLife: 1500,
      trail: true // 꼬리 효과 활성화
    });
  },

  // 총알 투사체 (총검이 전용 - 총구 섬광 + 탄피)
  addBullet(sx, sy, tx, ty, speed) {
    // 총구 섬광 (muzzle flash)
    this.effects.push({
      type: 'muzzleFlash', x: sx, y: sy,
      life: 0, maxLife: 120
    });
    // 총알 본체
    this.effects.push({
      type: 'bullet', x: sx, y: sy,
      tx, ty, speed: speed || 500,
      life: 0, maxLife: 1000
    });
    // 탄피 파티클
    ParticleSystem.add({
      x: sx, y: sy,
      vx: (Math.random() - 0.5) * 60,
      vy: -40 - Math.random() * 30,
      size: 2, color: '#DAA520',
      maxLife: 400, gravity: 120
    });
  },

  // 불꽃 궤적 (불검이 전용)
  addFlameTrail(sx, sy, tx, ty) {
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.min(8, Math.floor(dist / 10));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      ParticleSystem.add({
        x: sx + dx * t + (Math.random() - 0.5) * 8,
        y: sy + dy * t + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 20,
        vy: -20 - Math.random() * 30,
        size: 5 + Math.random() * 4,
        color: Math.random() < 0.5 ? '#ff4400' : '#ffcc00',
        maxLife: 300 + Math.random() * 200,
        gravity: -10, // 불꽃은 위로
        glow: true
      });
    }
  },

  // 먹방이 물어뜯기 파동
  addBiteWave(cx, cy) {
    this.effects.push({
      type: 'biteWave', x: cx, y: cy,
      life: 0, maxLife: 300,
      radius: 0, maxRadius: 40
    });
  },

  // 충격파 생성
  addShockwave(cx, cy, radius, color) {
    this.effects.push({
      type: 'shockwave', x: cx, y: cy,
      radius: 0, maxRadius: radius,
      color: color || 'rgba(255,165,0,0.5)',
      life: 0, maxLife: 500
    });
  },

  // 텍스트 팝업 (대미지 표시 등) - PvZ 스타일 스케일 애니메이션
  addTextPop(cx, cy, text, color) {
    this.effects.push({
      type: 'text', x: cx, y: cy,
      text, color: color || '#fff',
      life: 0, maxLife: 900,
      scale: 0 // 팝업 스케일 애니메이션
    });
  },

  // 화염 이펙트 (파티클 기반으로 강화)
  addFlame(cx, cy) {
    // 기존 이펙트 대신 파티클 사용
    for (let i = 0; i < 3; i++) {
      ParticleSystem.add({
        x: cx + (Math.random() - 0.5) * 10,
        y: cy + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 15,
        vy: -30 - Math.random() * 20,
        size: 4 + Math.random() * 3,
        color: ['#ff4400', '#ff6600', '#ffcc00', '#ff8800'][Math.floor(Math.random() * 4)],
        maxLife: 300 + Math.random() * 150,
        gravity: -15,
        glow: true
      });
    }
  },

  // 화면 플래시 시작 (각성 시)
  startScreenFlash(color, duration) {
    this.screenFlash = {
      color: color || 'rgba(255, 255, 255, 0.8)',
      life: 0,
      maxLife: duration || 400
    };
  },

  // 각성 폭발 파티클
  addAwakenBurst(cx, cy) {
    // 화면 플래시
    this.startScreenFlash('rgba(255, 215, 0, 0.6)', 500);
    // 폭발 파티클 (금색 + 흰색)
    ParticleSystem.burst(cx, cy, 20, {
      speed: 120, size: 6,
      color: '#ffd700', maxLife: 800,
      gravity: 30, glow: true
    });
    ParticleSystem.burst(cx, cy, 10, {
      speed: 80, size: 4,
      color: '#ffffff', maxLife: 600,
      gravity: 20, glow: true
    });
    // 충격파
    this.addShockwave(cx, cy, 100, 'rgba(255,215,0,0.6)');
  },

  // 적 처치 파티클
  addDeathBurst(cx, cy) {
    ParticleSystem.burst(cx, cy, 8, {
      speed: 60, size: 4,
      color: '#aa88ff', maxLife: 500,
      gravity: 40
    });
  },

  // 업데이트
  update(dt) {
    // 이펙트 업데이트
    this.effects.forEach(e => {
      e.life += dt;
      if (e.type === 'projectile' || e.type === 'bullet') {
        this.updateProjectile(e, dt);
      } else if (e.type === 'shockwave' || e.type === 'biteWave') {
        e.radius = e.maxRadius * (e.life / e.maxLife);
      } else if (e.type === 'text') {
        e.y -= dt * 0.035;
        // 팝업 스케일 (빠르게 커졌다가 유지)
        const t = Math.min(1, e.life / 150);
        e.scale = t < 1 ? 0.5 + t * 0.8 : 1.3 - (e.life - 150) / e.maxLife * 0.3;
      }
    });

    // 투사체 트레일 파티클
    this.effects.forEach(e => {
      if (e.type === 'projectile' && e.trail && e.life < e.maxLife) {
        ParticleSystem.add({
          x: e.x, y: e.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: 3, color: e.color,
          maxLife: 200, glow: true
        });
      }
    });

    this.effects = this.effects.filter(e => e.life < e.maxLife);

    // 화면 플래시 업데이트
    if (this.screenFlash) {
      this.screenFlash.life += dt;
      if (this.screenFlash.life >= this.screenFlash.maxLife) {
        this.screenFlash = null;
      }
    }

    // 파티클 업데이트
    ParticleSystem.update(dt);
  },

  // 투사체 이동
  updateProjectile(e, dt) {
    const dx = e.tx - e.x;
    const dy = e.ty - e.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 5) {
      e.life = e.maxLife;
      return;
    }
    const move = e.speed * dt / 1000;
    e.x += (dx / d) * move;
    e.y += (dy / d) * move;
  },

  // 렌더링
  render(ctx) {
    // 파티클 먼저 (뒤에)
    ParticleSystem.render(ctx);

    this.effects.forEach(e => {
      const alpha = 1 - e.life / e.maxLife;
      if (e.type === 'projectile') {
        this.renderProjectile(ctx, e);
      } else if (e.type === 'bullet') {
        this.renderBullet(ctx, e);
      } else if (e.type === 'muzzleFlash') {
        this.renderMuzzleFlash(ctx, e, alpha);
      } else if (e.type === 'shockwave') {
        this.renderShockwave(ctx, e, alpha);
      } else if (e.type === 'biteWave') {
        this.renderBiteWave(ctx, e, alpha);
      } else if (e.type === 'text') {
        this.renderText(ctx, e, alpha);
      }
    });

    // 화면 플래시 (최상단)
    if (this.screenFlash) {
      const progress = this.screenFlash.life / this.screenFlash.maxLife;
      const flashAlpha = 1 - progress;
      ctx.save();
      ctx.globalAlpha = flashAlpha * 0.6;
      ctx.fillStyle = this.screenFlash.color;
      ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
      ctx.restore();
    }
  },

  // 구슬 투사체 (글로우 + 트레일)
  renderProjectile(ctx, e) {
    ctx.save();
    ctx.shadowColor = e.color || '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = e.color || '#ffaa00';
    ctx.beginPath();
    ctx.arc(e.x, e.y, 6, 0, Math.PI * 2);
    ctx.fill();
    // 내부 밝은 핵
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // 총알 렌더링
  renderBullet(ctx, e) {
    ctx.save();
    ctx.fillStyle = '#ffdd44';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 5;
    // 총알 방향 계산
    const dx = e.tx - e.x;
    const dy = e.ty - e.y;
    const angle = Math.atan2(dy, dx);
    ctx.translate(e.x, e.y);
    ctx.rotate(angle);
    // 길쭉한 총알 모양
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // 총구 섬광
  renderMuzzleFlash(ctx, e, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const size = 15 * alpha;
    // 밝은 원
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(e.x, e.y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // 외곽 글로우
    ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.beginPath();
    ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // 충격파
  renderShockwave(ctx, e, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 3 + (1 - alpha) * 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  // 먹방이 물어뜯기 파동
  renderBiteWave(ctx, e, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    // 이빨 모양 파동 (톱니 원)
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * 2 * i) / segments;
      const r = e.radius * (i % 2 === 0 ? 1 : 0.7);
      const px = e.x + Math.cos(angle) * r;
      const py = e.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },

  // 텍스트 팝업 (PvZ 스타일 스케일 + 외곽선)
  renderText(ctx, e, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * 1.5);
    const scale = e.scale || 1;
    ctx.translate(e.x, e.y);
    ctx.scale(scale, scale);
    // 외곽선 텍스트
    ctx.font = 'bold 17px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(e.text, 0, 0);
    ctx.fillStyle = e.color;
    ctx.fillText(e.text, 0, 0);
    ctx.restore();
  }
};

// ========== 6. 적 클래스 ==========

class Enemy {
  constructor(type) {
    const data = ENEMY_DATA[type];
    this.type = type;
    this.name = data.name;
    this.maxHp = data.hp;
    this.hp = data.hp;
    this.speed = data.speed;
    this.gold = data.gold;
    this.imageKey = data.imageKey;
    // 이미지 이원화: 인게임용 이미지 키 (폴백 포함)
    this.ingameImageKey = getEnemyIngameImageKey(type);
    this.progress = 0; // 경로 진행도 (0~1)
    this.x = 0;
    this.y = 0;
    this.alive = true;
    this.reached = false; // 골인 여부

    // 상태이상
    this.burning = false;
    this.burnDamage = 0;
    this.burnTimer = 0;
    this.paralyzed = false;
    this.paralyzeTimer = 0;
    this.fireSpread = false;
    this.fireSpreadTimer = 0;
    this.fireSpreadDamage = 0;

    // 크기 (보스는 크게)
    this.size = type === 'bossZombie' ? 52 : 38;

    // === PvZ 이펙트용 상태 ===
    this.wobbleTime = Math.random() * Math.PI * 2; // 흔들림 위상
    this.hitFlashTimer = 0; // 피격 빨간 플래시 타이머
    this.spawnBounce = 1.0; // 스폰 시 바운스 효과

    this.updatePosition();
  }

  // 위치 갱신
  updatePosition() {
    const pos = PathSystem.getPositionAt(this.progress);
    this.x = pos.x;
    this.y = pos.y;
  }

  // 매 프레임 업데이트
  update(dt) {
    if (!this.alive) return;

    // 흔들림 타이머 증가
    this.wobbleTime += dt * 0.005;

    // 피격 플래시 감소
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    // 스폰 바운스 감쇠
    if (this.spawnBounce > 0) {
      this.spawnBounce -= dt * 0.003;
      if (this.spawnBounce < 0) this.spawnBounce = 0;
    }

    // 마비 처리
    if (this.paralyzed) {
      this.paralyzeTimer -= dt;
      if (this.paralyzeTimer <= 0) this.paralyzed = false;
    }

    // 이동 (마비 아닐 때만)
    if (!this.paralyzed) {
      const totalLen = PathSystem.getTotalLength();
      this.progress += (this.speed * dt / 1000) / totalLen;
      this.updatePosition();
    }

    // 화염 대미지
    if (this.burning) {
      this.burnTimer -= dt;
      this.hp -= this.burnDamage * dt / 1000;
      if (this.burnTimer <= 0) this.burning = false;
    }

    // 불 전이 대미지
    if (this.fireSpread) {
      this.fireSpreadTimer -= dt;
      this.hp -= this.fireSpreadDamage * dt / 1000;
      if (this.fireSpreadTimer <= 0) this.fireSpread = false;
    }

    // 화염 파티클 생성 (100ms마다 제한, render에서 분리)
    if (this.burning || this.fireSpread) {
      this._flameTimer = (this._flameTimer || 0) + dt;
      if (this._flameTimer > 100) {
        this._flameTimer = 0;
        this._needsFlameEffect = true;
      }
    }

    // 골인 체크
    if (this.progress >= 1) {
      this.reached = true;
      this.alive = false;
    }

    // 사망 체크
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  // 대미지 적용 (피격 플래시 추가)
  takeDamage(dmg) {
    this.hp -= dmg;
    this.hitFlashTimer = 150; // 150ms 빨간 플래시
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  // 화염 상태이상 적용
  applyBurn(dps, durationMs) {
    this.burning = true;
    this.burnDamage = dps;
    this.burnTimer = durationMs;
  }

  // 마비 상태이상 적용
  applyParalyze(durationMs) {
    this.paralyzed = true;
    this.paralyzeTimer = durationMs;
  }

  // 불 전이 적용
  applyFireSpread(dps, durationMs) {
    this.fireSpread = true;
    this.fireSpreadDamage = dps;
    this.fireSpreadTimer = durationMs;
  }

  // 렌더링 (PvZ 스타일 이펙트 적용)
  render(ctx) {
    if (!this.alive) return;
    const s = this.size;

    // === 1. 타원형 바닥 그림자 ===
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + s / 2 - 2, s / 2.5, s / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === 2. 흔들림(wobble) + 스폰 바운스 애니메이션 ===
    ctx.save();
    const wobbleAngle = Math.sin(this.wobbleTime) * 0.08; // 좌우 미세 흔들림
    const bounceY = this.spawnBounce > 0 ? Math.sin(this.spawnBounce * 10) * 8 * this.spawnBounce : 0;

    ctx.translate(this.x, this.y + bounceY);
    ctx.rotate(wobbleAngle);

    // === 3. 피격 빨간 플래시 ===
    if (this.hitFlashTimer > 0) {
      // 빨간색 틴트 효과를 위해 밝기 조절
      ctx.filter = 'brightness(2) saturate(3) hue-rotate(-30deg)';
    }

    // 적 이미지 (인게임 이미지 우선, 폴백 적용)
    const enemyImgKey = this.ingameImageKey || this.imageKey;
    ImageLoader.draw(ctx, enemyImgKey, 0, 0, s, s);

    // 필터 리셋
    if (this.hitFlashTimer > 0) {
      ctx.filter = 'none';
    }

    ctx.restore();

    // 보스 크기 표시 (빨간 테두리 + 펄스)
    if (this.type === 'bossZombie') {
      const pulse = 1 + Math.sin(this.wobbleTime * 3) * 0.05;
      ctx.save();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, (s / 2 + 3) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // HP 바
    this.renderHpBar(ctx, s);

    // 상태이상 화염 표시 (update에서 설정한 플래그 기반)
    if ((this.burning || this.fireSpread) && this._needsFlameEffect) {
      EffectSystem.addFlame(
        this.x + (Math.random() - 0.5) * 10,
        this.y - s / 2 - 5
      );
      this._needsFlameEffect = false;
    }
    if (this.paralyzed) {
      ctx.save();
      ctx.fillStyle = 'rgba(100, 100, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, s / 2, 0, Math.PI * 2);
      ctx.fill();
      // 마비 전기 파티클
      if (Math.random() < 0.3) {
        ParticleSystem.add({
          x: this.x + (Math.random() - 0.5) * s,
          y: this.y + (Math.random() - 0.5) * s,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          size: 2, color: '#aabbff',
          maxLife: 150, glow: true
        });
      }
      ctx.restore();
    }
  }

  // HP 바 그리기 (PvZ 스타일 둥근 모서리)
  renderHpBar(ctx, s) {
    const barW = s + 4;
    const barH = 6;
    const bx = this.x - barW / 2;
    const by = this.y - s / 2 - 12;
    const ratio = this.hp / this.maxHp;

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 3);
    ctx.fill();

    // HP (색 그라데이션)
    if (ratio > 0) {
      ctx.fillStyle = ratio > 0.5 ? '#44dd44' : ratio > 0.25 ? '#dddd00' : '#dd2222';
      ctx.beginPath();
      ctx.roundRect(bx + 1, by + 1, (barW - 2) * ratio, barH - 2, 2);
      ctx.fill();
    }
  }
}

// ========== 7. 타워 클래스 ==========

class Tower {
  constructor(x, y, type) {
    const data = TOWER_DATA[type];
    this.x = x;
    this.y = y;
    this.type = type;
    this.name = data.name;
    this.baseDamage = data.damage;
    this.baseRange = data.range;
    this.baseAttackInterval = data.attackInterval;
    this.imageKey = data.imageKey;
    this.cost = data.cost;

    this.awakened = false;
    this.selected = false;
    this.target = null;
    this.attackTimer = 0;
    this.size = 54;

    // 먹방이 전용
    this.eatCount = 0;
    this.ultimateCooldown = 0;

    // 불검이 전용
    this.rageCombo = 0;

    // 총검이 전용
    this.weaponMode = 'gun';
    this.comboStage = 0;

    // 버프 관련
    this.buffMultiplier = 1.0;

    // === PvZ 이펙트용 상태 ===
    this.idleTime = Math.random() * Math.PI * 2; // Idle 바운스 위상 (랜덤 시작)
    this.squashTimer = 0;    // Squash & Stretch 타이머
    this.squashType = 'none'; // 'attack', 'place'
    this.placeTimer = 500;   // 배치 바운스 애니메이션 (500ms)
    this.awakenAuraTime = 0; // 각성 오라 펄스 타이머
  }

  // 현재 대미지 (각성 여부 반영)
  getDamage() {
    if (this.awakened) {
      return TOWER_DATA[this.type].awakenDamage * this.buffMultiplier;
    }
    return this.baseDamage * this.buffMultiplier;
  }

  // 현재 사거리
  getRange() {
    return this.awakened ? TOWER_DATA[this.type].awakenRange : this.baseRange;
  }

  // 현재 공격 간격
  getAttackInterval() {
    return this.awakened ? TOWER_DATA[this.type].awakenAttackInterval : this.baseAttackInterval;
  }

  // 현재 인게임(맵 위) 이미지 키 (폴백 포함)
  getImageKey() {
    const key = getTowerIngameImageKey(this.type, this.awakened);
    if (key) return key;
    // 최종 폴백: 기존 imageKey
    if (this.awakened && TOWER_DATA[this.type].awakenedImageKey) {
      return TOWER_DATA[this.type].awakenedImageKey;
    }
    return this.imageKey;
  }

  // 카드(UI) 이미지 키 (폴백 포함)
  getCardImageKey() {
    const key = getTowerCardImageKey(this.type, this.awakened);
    if (key) return key;
    // 최종 폴백: 기존 imageKey
    return this.imageKey;
  }

  // 타겟 찾기 (가장 진행도 높은 적 우선)
  findTarget(enemies) {
    let best = null;
    let bestProgress = -1;
    enemies.forEach(e => {
      if (!e.alive) return;
      const d = Utils.dist(this.x, this.y, e.x, e.y);
      if (d <= this.getRange() && e.progress > bestProgress) {
        best = e;
        bestProgress = e.progress;
      }
    });
    this.target = best;
  }

  // 업데이트
  update(dt, enemies, towers) {
    this.attackTimer -= dt;
    this.buffMultiplier = 1.0;
    this.findTarget(enemies);

    // Idle 타이머 증가
    this.idleTime += dt * 0.003;

    // Squash 타이머 감소
    if (this.squashTimer > 0) {
      this.squashTimer -= dt;
      if (this.squashTimer < 0) this.squashTimer = 0;
    }

    // 배치 타이머 감소
    if (this.placeTimer > 0) {
      this.placeTimer -= dt;
      if (this.placeTimer < 0) this.placeTimer = 0;
    }

    // 각성 오라 타이머
    if (this.awakened) {
      this.awakenAuraTime += dt * 0.004;
    }

    // 궁극기 쿨타임
    if (this.ultimateCooldown > 0) {
      this.ultimateCooldown -= dt;
    }

    // 구슬이 각성 타워 버프
    if (this.type === 'guseul' && this.awakened) {
      this.applyTowerBuff(towers);
    }

    // 공격
    if (this.target && this.attackTimer <= 0) {
      this.attack(enemies);
      this.attackTimer = this.getAttackInterval();
      // 공격 시 Squash & Stretch 트리거
      this.squashTimer = 200;
      this.squashType = 'attack';
    }
  }

  // 타입별 공격 분기
  attack(enemies) {
    switch (this.type) {
      case 'guseul': this.attackGuseul(); break;
      case 'meokbang': this.attackMeokbang(enemies); break;
      case 'bulgeom': this.attackBulgeom(enemies); break;
      case 'chonggeom': this.attackChonggeom(enemies); break;
    }
  }

  // ===== 구슬이 공격 (파란/주황 구슬 파티클) =====
  attackGuseul() {
    if (!this.target || !this.target.alive) return;
    const isFlame = Math.random() < 0.5;
    const color = isFlame ? '#ff6600' : '#8844ff';
    const dmg = this.getDamage();

    // 구슬 투사체 (글로우 트레일 포함)
    EffectSystem.addProjectile(
      this.x, this.y, this.target.x, this.target.y, color, 350, dmg
    );
    this.target.takeDamage(dmg);

    if (isFlame) {
      this.target.applyBurn(5, 3000);
      EffectSystem.addTextPop(this.target.x, this.target.y - 20, '화염!', '#ff6600');
    } else {
      this.target.applyParalyze(1500);
      EffectSystem.addTextPop(this.target.x, this.target.y - 20, '마비!', '#8844ff');
    }
  }

  // ===== 먹방이 공격 (입 벌리기 + 물어뜯기 파동) =====
  attackMeokbang(enemies) {
    if (!this.target || !this.target.alive) return;
    const dmg = this.getDamage();

    // 체력 100 이하 적 즉사 (먹기)
    if (this.target.hp <= 100) {
      this.target.takeDamage(99999);
      this.eatCount++;
      EffectSystem.addTextPop(this.target.x, this.target.y - 20, '냠냠!', '#ffcc00');
      // 물어뜯기 파동 이펙트
      EffectSystem.addBiteWave(this.x, this.y);

      // 5마리 먹으면 파동 준비
      if (this.eatCount >= 5) {
        this.unleashWave(enemies);
        this.eatCount = 0;
      }
    } else {
      this.target.takeDamage(dmg);
      EffectSystem.addProjectile(
        this.x, this.y, this.target.x, this.target.y, '#222', 200, 0
      );
    }

    // 각성 궁극기
    if (this.awakened && this.ultimateCooldown <= 0 && enemies.length >= 8) {
      this.vomitAttack(enemies);
    }
  }

  // 먹방이 파동
  unleashWave(enemies) {
    const range = this.awakened ? 200 : 120;
    const dmg = this.awakened ? 100 : 60;
    enemies.forEach(e => {
      if (e.alive && Utils.dist(this.x, this.y, e.x, e.y) <= range) {
        e.takeDamage(dmg);
      }
    });
    EffectSystem.addShockwave(this.x, this.y, range, 'rgba(255,165,0,0.5)');
    EffectSystem.addTextPop(this.x, this.y - 30, '파동!', '#ff8800');
    // 파동 파티클
    ParticleSystem.burst(this.x, this.y, 12, {
      speed: 100, size: 5,
      color: '#ff8800', maxLife: 500,
      gravity: 30
    });
  }

  // 먹방이 토(위액) 궁극기
  vomitAttack(enemies) {
    enemies.forEach(e => {
      if (e.alive) e.takeDamage(150);
    });
    EffectSystem.addShockwave(this.x, this.y, 300, 'rgba(200,255,0,0.6)');
    EffectSystem.addTextPop(this.x, this.y - 40, '토 공격!!', '#ccff00');
    // 위액 파티클
    ParticleSystem.burst(this.x, this.y, 15, {
      speed: 150, size: 6,
      color: '#aaff00', maxLife: 700,
      gravity: 50, glow: true
    });
    this.ultimateCooldown = 30000;
  }

  // ===== 불검이 공격 (불꽃 궤적) =====
  attackBulgeom(enemies) {
    if (!this.target || !this.target.alive) return;
    const dmg = this.getDamage();
    this.target.takeDamage(dmg);
    this.target.applyBurn(8, 2000);

    // 불꽃 궤적 이펙트
    EffectSystem.addFlameTrail(this.x, this.y, this.target.x, this.target.y);
    EffectSystem.addFlame(this.target.x, this.target.y);

    // 분노 콤보 (체력 높은 적)
    if (this.target.hp > 150) {
      this.rageCombo++;
      if (this.rageCombo >= 3) {
        this.bulgeomRageCombo(enemies);
        this.rageCombo = 0;
      }
    }

    // 각성 불 전이
    if (this.awakened && Math.random() < 0.3) {
      this.fireSpreadAttack(enemies);
    }
  }

  // 불검이 분노 콤보
  bulgeomRageCombo(enemies) {
    if (!this.target || !this.target.alive) return;
    const hits = this.awakened ? 5 : 3;
    const totalDmg = this.getDamage() * (this.awakened ? 4 : 2.5);

    this.target.takeDamage(totalDmg);
    EffectSystem.addTextPop(this.target.x, this.target.y - 25, `${hits}연타!`, '#ff2200');
    // 연타 화염 폭발
    ParticleSystem.burst(this.target.x, this.target.y, 10, {
      speed: 80, size: 5,
      color: '#ff4400', maxLife: 400,
      gravity: -10, glow: true
    });
  }

  // 불검이 불 전이
  fireSpreadAttack(enemies) {
    if (!this.target) return;
    enemies.forEach(e => {
      if (e.alive && e !== this.target) {
        if (Utils.dist(this.target.x, this.target.y, e.x, e.y) < 60) {
          e.applyFireSpread(30, 5000);
          EffectSystem.addTextPop(e.x, e.y - 20, '불 전이!', '#ff4400');
        }
      }
    });
  }

  // ===== 총검이 공격 (총알 궤적 + 총구 섬광 + 탄피) =====
  attackChonggeom(enemies) {
    if (!this.target || !this.target.alive) return;
    const d = Utils.dist(this.x, this.y, this.target.x, this.target.y);

    if (d <= 70) {
      // 근거리 칼 공격
      this.weaponMode = 'sword';
      const dmg = this.awakened ? 60 : 30;
      this.target.takeDamage(dmg * this.buffMultiplier);
      this.comboStage++;
      // 칼 슬래시 이펙트
      EffectSystem.addShockwave(this.target.x, this.target.y, 30, 'rgba(255,255,255,0.4)');
    } else {
      // 원거리 총 공격
      this.weaponMode = 'gun';
      const bullets = this.awakened ? 5 : 1;
      const dmg = (this.awakened ? 40 : 20) * this.buffMultiplier;
      for (let i = 0; i < bullets; i++) {
        EffectSystem.addBullet(
          this.x, this.y,
          this.target.x + (Math.random() - 0.5) * 15,
          this.target.y + (Math.random() - 0.5) * 15,
          500
        );
      }
      this.target.takeDamage(dmg);
    }

    // 분노 콤보
    if (this.comboStage >= 5) {
      this.chonggeomCombo(enemies);
      this.comboStage = 0;
    }
  }

  // 총검이 분노 콤보
  chonggeomCombo(enemies) {
    const multiplier = this.awakened ? 3 : 2;
    const dmg = this.getDamage() * multiplier;

    // 주변 적 모두 공격
    enemies.forEach(e => {
      if (e.alive && Utils.dist(this.x, this.y, e.x, e.y) <= this.getRange()) {
        e.takeDamage(dmg / 2);
      }
    });

    EffectSystem.addShockwave(this.x, this.y, this.getRange(), 'rgba(255,200,0,0.4)');
    EffectSystem.addTextPop(this.x, this.y - 30, '분노 콤보!', '#ff0000');
    // 분노 콤보 파티클 폭발
    ParticleSystem.burst(this.x, this.y, 15, {
      speed: 100, size: 4,
      color: '#ffcc00', maxLife: 500,
      gravity: 40, glow: true
    });
  }

  // 구슬이 각성 타워 버프
  applyTowerBuff(towers) {
    const awakenedGuseuls = towers.filter(
      t => t.type === 'guseul' && t.awakened
    );
    if (awakenedGuseuls.length >= 2) {
      towers.forEach(t => {
        if (Utils.dist(this.x, this.y, t.x, t.y) < 200) {
          t.buffMultiplier = Math.max(t.buffMultiplier, 1.2);
        }
      });
    }
  }

  // 각성 (폭발 이펙트 추가)
  awaken() {
    this.awakened = true;
    // 각성 폭발 연출
    EffectSystem.addAwakenBurst(this.x, this.y);
  }

  // 렌더링 (PvZ 스타일 이펙트 적용)
  render(ctx) {
    // === 1. 타원형 바닥 그림자 ===
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.size / 2 - 2, this.size / 2.5, this.size / 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === 2. 선택 시 범위 표시 ===
    if (this.selected) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.getRange(), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 255, 100, 0.05)';
      ctx.fill();
      ctx.restore();
    }

    // === 3. Idle 바운스 + Squash & Stretch 계산 ===
    let bounceY = Math.sin(this.idleTime) * 3; // 위아래 3px 바운스
    let scaleX = 1, scaleY = 1;

    // 배치 바운스
    if (this.placeTimer > 0) {
      const t = this.placeTimer / 500;
      bounceY = Math.sin(t * Math.PI * 3) * 15 * t; // 점점 줄어드는 바운스
      scaleX = 1 + Math.sin(t * Math.PI * 4) * 0.15 * t;
      scaleY = 1 - Math.sin(t * Math.PI * 4) * 0.15 * t;
    }

    // 공격 시 Squash & Stretch
    if (this.squashTimer > 0 && this.squashType === 'attack') {
      const t = this.squashTimer / 200;
      if (t > 0.5) {
        // 찌그러짐 (앞부분)
        scaleX = 1 + (t - 0.5) * 0.5;
        scaleY = 1 - (t - 0.5) * 0.4;
      } else {
        // 늘어남 (뒷부분)
        scaleX = 1 - t * 0.3;
        scaleY = 1 + t * 0.3;
      }
    }

    // === 4. 각성 오라/글로우 이펙트 ===
    if (this.awakened) {
      const auraPulse = 0.7 + Math.sin(this.awakenAuraTime) * 0.3;
      const auraSize = this.size / 2 + 12 + Math.sin(this.awakenAuraTime * 1.5) * 4;

      ctx.save();
      // 외곽 글로우 원
      const gradient = ctx.createRadialGradient(
        this.x, this.y + bounceY, this.size / 3,
        this.x, this.y + bounceY, auraSize
      );
      gradient.addColorStop(0, `rgba(255, 200, 50, ${auraPulse * 0.2})`);
      gradient.addColorStop(0.6, `rgba(255, 150, 0, ${auraPulse * 0.1})`);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y + bounceY, auraSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // === 5. 캐릭터 이미지 (변환 적용) ===
    ctx.save();
    ctx.translate(this.x, this.y + bounceY);
    ctx.scale(scaleX, scaleY);

    if (this.awakened) {
      // 각성 시 shadowBlur 글로우
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12;
    }

    // 인게임 이미지 그리기 (폴백: 도형)
    const ingameKey = this.getImageKey();
    if (ingameKey && ImageLoader.isAvailable(ingameKey)) {
      ImageLoader.draw(ctx, ingameKey, 0, 0, this.size, this.size);
    } else {
      // 이미지 없을 때 폴백 도형
      drawFallbackTower(ctx, 0, 0, this.type, this.awakened);
    }
    ctx.restore();

    // === 6. 버프 표시 (반짝이는 테두리) ===
    if (this.buffMultiplier > 1.0) {
      ctx.save();
      const buffPulse = 0.5 + Math.sin(this.idleTime * 3) * 0.3;
      ctx.strokeStyle = `rgba(0, 255, 200, ${buffPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y + bounceY, this.size / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ========== 8. UI 매니저 (PvZ 카드 슬롯 스타일) ==========

const UIManager = {
  selectedTowerType: null,
  selectedTower: null,
  // 타워 타입 목록 (TOWER_DATA에서 자동 생성 - 새 타워 추가 시 자동 반영)
  towerTypes: Object.keys(TOWER_DATA),
  cardNames: {
    guseul_card: '구슬카드',
    meokbang_card: '입카드',
    bulgeom_card: '불카드',
    chonggeom_card: '총칼카드'
  },
  cardImageKeys: {
    guseul_card: 'guseul_card',
    meokbang_card: 'meokbang_card',
    bulgeom_card: 'bulgeom_card',
    chonggeom_card: 'chonggeom_card'
  },
  showAwakeningUI: false,
  message: null,
  messageTimer: 0,

  // 메시지 표시
  showMessage(text, duration) {
    this.message = text;
    this.messageTimer = duration || 2000;
  },

  // 상단 HUD 그리기 (PvZ 스타일)
  renderHUD(ctx, state) {
    // 나무 질감 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.HUD_HEIGHT);
    gradient.addColorStop(0, 'rgba(60, 30, 10, 0.9)');
    gradient.addColorStop(1, 'rgba(40, 20, 5, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HUD_HEIGHT);

    // 하단 테두리선
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.HUD_HEIGHT);
    ctx.lineTo(CONFIG.WIDTH, CONFIG.HUD_HEIGHT);
    ctx.stroke();

    // 골드 (코인 아이콘 모사)
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(22, 28, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('G', 22, 33);
    ctx.restore();

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText('' + state.gold, 38, 34);

    // 웨이브
    ctx.fillStyle = '#88ccff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('WAVE ' + state.waveNum + '/' + state.totalWaves, CONFIG.WIDTH / 2, 34);

    // 라이프 (하트 아이콘 모사)
    ctx.save();
    // 하트 그리기
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    const hx = CONFIG.WIDTH - 45;
    const hy = 25;
    ctx.moveTo(hx, hy + 4);
    ctx.bezierCurveTo(hx, hy, hx - 7, hy - 3, hx - 7, hy + 3);
    ctx.bezierCurveTo(hx - 7, hy + 8, hx, hy + 12, hx, hy + 14);
    ctx.bezierCurveTo(hx, hy + 12, hx + 7, hy + 8, hx + 7, hy + 3);
    ctx.bezierCurveTo(hx + 7, hy - 3, hx, hy, hx, hy + 4);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ff5555';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('' + state.lives, CONFIG.WIDTH - 55, 34);
  },

  // 하단 타워 선택 바 (PvZ 카드 슬롯 스타일, 타워 수에 따라 자동 조절)
  renderTowerBar(ctx, state) {
    const barY = CONFIG.HEIGHT - CONFIG.UI_BAR_HEIGHT;

    // 배경 (나무 질감)
    const gradient = ctx.createLinearGradient(0, barY, 0, CONFIG.HEIGHT);
    gradient.addColorStop(0, 'rgba(40, 20, 5, 0.95)');
    gradient.addColorStop(1, 'rgba(60, 30, 10, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, barY, CONFIG.WIDTH, CONFIG.UI_BAR_HEIGHT);

    // 상단 테두리선
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(CONFIG.WIDTH, barY);
    ctx.stroke();

    // 타워 수에 따라 슬롯 크기 자동 조절
    const towerCount = this.towerTypes.length;
    const slotW = CONFIG.WIDTH / towerCount;
    const cardW = Math.min(slotW - 12, 108); // 최대 카드 너비 제한
    const cardH = CONFIG.UI_BAR_HEIGHT - 20;

    this.towerTypes.forEach((type, i) => {
      const data = TOWER_DATA[type];
      const cx = slotW * i + slotW / 2;
      const cardX = cx - cardW / 2;
      const cardY = barY + 8;
      const canAfford = state.gold >= data.cost;

      // 카드 배경
      ctx.save();
      if (this.selectedTowerType === type) {
        ctx.shadowColor = '#44ff88';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(50, 100, 50, 0.8)';
      } else if (!canAfford) {
        ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(60, 40, 20, 0.8)';
      }
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();

      // 카드 테두리
      ctx.strokeStyle = this.selectedTowerType === type ? '#44ff88' :
                         canAfford ? '#aa8844' : '#555';
      ctx.lineWidth = this.selectedTowerType === type ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.stroke();
      ctx.restore();

      // 카드 이미지: cardImageKey 사용 (이미지 이원화)
      const cardImgKey = getTowerCardImageKey(type, false) || this.cardImageKeys[data.awakenCard];
      const iconSize = Math.min(44, cardW - 8);
      if (!canAfford) {
        ctx.save();
        ctx.globalAlpha = 0.4;
      }
      ImageLoader.draw(ctx, cardImgKey, cx, cardY + cardH / 2 - 5, iconSize, iconSize);
      if (!canAfford) {
        ctx.restore();
      }

      // 가격
      ctx.fillStyle = canAfford ? '#88ff88' : '#ff4444';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.cost + 'G', cx, cardY + cardH - 4);
    });
  },

  // 선택된 타워 정보 + 판매/각성 버튼
  renderSelectedInfo(ctx, state) {
    const t = this.selectedTower;
    if (!t) return;

    const panelW = 210;
    const panelH = 105;
    let px = t.x - panelW / 2;
    let py = t.y - t.size / 2 - panelH - 15;

    // 화면 밖으로 나가지 않게
    px = Math.max(5, Math.min(CONFIG.WIDTH - panelW - 5, px));
    py = Math.max(CONFIG.HUD_HEIGHT + 5, py);

    // 패널 배경 (PvZ 나무판 느낌)
    ctx.save();
    ctx.fillStyle = 'rgba(50, 25, 10, 0.92)';
    ctx.strokeStyle = '#aa8844';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'left';
    const nameStr = t.name + (t.awakened ? ' (각성)' : '');
    ctx.fillText(nameStr, px + 10, py + 22);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#ddd';
    ctx.fillText('공격력: ' + Math.floor(t.getDamage()), px + 10, py + 42);
    ctx.fillText('사거리: ' + t.getRange(), px + 115, py + 42);

    // 판매 버튼
    const sellGold = Math.floor(t.cost * CONFIG.SELL_REFUND);
    const btnY = py + 58;
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.roundRect(px + 10, btnY, 85, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('판매 ' + sellGold + 'G', px + 52, btnY + 22);

    // 각성 버튼
    if (!t.awakened) {
      const cardKey = TOWER_DATA[t.type].awakenCard;
      const hasCard = state.cards[cardKey] > 0;
      const awakenCost = TOWER_DATA[t.type].awakenCost;
      const canAwaken = hasCard && state.gold >= awakenCost;

      ctx.fillStyle = canAwaken ? '#cc9900' : '#444';
      ctx.beginPath();
      ctx.roundRect(px + 110, btnY, 90, 32, 6);
      ctx.fill();
      ctx.fillStyle = canAwaken ? '#fff' : '#777';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('각성 ' + awakenCost + 'G', px + 155, btnY + 22);
    }

    // 클릭 영역 저장
    this._sellBtn = { x: px + 10, y: btnY, w: 85, h: 32 };
    this._awakenBtn = t.awakened ? null : { x: px + 110, y: btnY, w: 90, h: 32 };
    this._infoPanel = { x: px, y: py, w: panelW, h: panelH };
  },

  // 보유 카드 표시
  renderCards(ctx, state) {
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    let cx = 8;
    const cy = CONFIG.HUD_HEIGHT - 3;

    Object.keys(state.cards).forEach(key => {
      if (state.cards[key] > 0) {
        const imgKey = this.cardImageKeys[key];
        // 작은 카드 배경
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.roundRect(cx, cy - 18, 42, 18, 3);
        ctx.fill();
        ImageLoader.draw(ctx, imgKey, cx + 10, cy - 9, 16, 16);
        ctx.fillStyle = '#ffd700';
        ctx.fillText('x' + state.cards[key], cx + 22, cy - 4);
        cx += 48;
      }
    });
  },

  // 메시지 렌더링 (PvZ 스타일 큰 텍스트)
  renderMessage(ctx, dt) {
    if (!this.message) return;
    this.messageTimer -= dt;
    if (this.messageTimer <= 0) {
      this.message = null;
      return;
    }
    ctx.save();
    const fadeAlpha = Math.min(1, this.messageTimer / 400);
    ctx.globalAlpha = fadeAlpha;

    // 배경 (둥근 나무판 느낌)
    ctx.fillStyle = 'rgba(50, 25, 10, 0.85)';
    ctx.strokeStyle = '#aa8844';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CONFIG.WIDTH / 2 - 130, CONFIG.HEIGHT / 2 - 28, 260, 56, 12);
    ctx.fill();
    ctx.stroke();

    // 텍스트 (외곽선 포함)
    ctx.font = 'bold 19px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.message, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 7);
    ctx.fillStyle = '#fff';
    ctx.fillText(this.message, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 7);
    ctx.restore();
  },

  // 속도/일시정지 버튼 렌더링
  renderControls(ctx, state) {
    const bx = CONFIG.WIDTH - 95;
    const by = CONFIG.HUD_HEIGHT + 8;

    // 속도 버튼
    ctx.fillStyle = 'rgba(50, 25, 10, 0.7)';
    ctx.strokeStyle = '#aa8844';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, 38, 30, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('x' + state.gameSpeed, bx + 19, by + 21);

    // 일시정지
    ctx.fillStyle = state.paused ? 'rgba(180,50,50,0.7)' : 'rgba(50,25,10,0.7)';
    ctx.beginPath();
    ctx.roundRect(bx + 44, by, 38, 30, 5);
    ctx.fill();
    ctx.strokeStyle = state.paused ? '#ff6666' : '#aa8844';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText(state.paused ? '>' : '||', bx + 63, by + 21);

    // 클릭 영역 저장
    this._speedBtn = { x: bx, y: by, w: 38, h: 30 };
    this._pauseBtn = { x: bx + 44, y: by, w: 38, h: 30 };
  },

  // 웨이브 시작 버튼 (PvZ 스타일)
  renderWaveStartBtn(ctx, state) {
    if (state.waveActive || state.gameOver || state.victory) return;

    const bx = CONFIG.WIDTH / 2 - 65;
    const by = CONFIG.HEIGHT / 2 - 22;

    ctx.save();
    // 버튼 그림자
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // 녹색 버튼 배경
    const grad = ctx.createLinearGradient(bx, by, bx, by + 44);
    grad.addColorStop(0, '#5cb85c');
    grad.addColorStop(1, '#3a8a3a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bx, by, 130, 44, 10);
    ctx.fill();

    // 테두리
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#2d6b2d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 텍스트
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeText('웨이브 시작!', CONFIG.WIDTH / 2, by + 28);
    ctx.fillText('웨이브 시작!', CONFIG.WIDTH / 2, by + 28);
    ctx.restore();

    this._waveStartBtn = { x: bx, y: by, w: 130, h: 44 };
  },

  // 터치/클릭 처리 (기존 로직 유지)
  handleTouch(x, y, state) {
    const barY = CONFIG.HEIGHT - CONFIG.UI_BAR_HEIGHT;

    // 1. 웨이브 시작 버튼
    if (this._waveStartBtn && !state.waveActive && this.hitTest(x, y, this._waveStartBtn)) {
      Game.startWave();
      return;
    }

    // 2. 속도/일시정지
    if (this._speedBtn && this.hitTest(x, y, this._speedBtn)) {
      state.gameSpeed = state.gameSpeed === 1 ? 2 : state.gameSpeed === 2 ? 3 : 1;
      return;
    }
    if (this._pauseBtn && this.hitTest(x, y, this._pauseBtn)) {
      state.paused = !state.paused;
      return;
    }

    // 3. 선택된 타워 패널 버튼
    if (this.selectedTower) {
      if (this._sellBtn && this.hitTest(x, y, this._sellBtn)) {
        Game.sellTower(this.selectedTower);
        this.selectedTower = null;
        return;
      }
      if (this._awakenBtn && this.hitTest(x, y, this._awakenBtn)) {
        Game.awakenTower(this.selectedTower);
        return;
      }
      if (this._infoPanel && this.hitTest(x, y, this._infoPanel)) {
        return;
      }
    }

    // 4. 하단 타워바 클릭
    if (y >= barY) {
      this.handleTowerBarClick(x, state);
      return;
    }

    // 5. HUD 영역 무시
    if (y < CONFIG.HUD_HEIGHT) return;

    // 6. 맵 영역 클릭
    if (this.selectedTowerType) {
      Game.placeTower(x, y, this.selectedTowerType);
      this.selectedTowerType = null;
    } else {
      this.selectTowerAt(x, y, state);
    }
  },

  // 타워바 클릭 처리 (타워 수에 따라 동적 슬롯 계산)
  handleTowerBarClick(x, state) {
    const slotW = CONFIG.WIDTH / this.towerTypes.length;
    const idx = Math.floor(x / slotW);
    if (idx >= 0 && idx < this.towerTypes.length) {
      const type = this.towerTypes[idx];
      if (state.gold >= TOWER_DATA[type].cost) {
        if (this.selectedTowerType === type) {
          this.selectedTowerType = null;
        } else {
          this.selectedTowerType = type;
          this.selectedTower = null;
        }
      } else {
        this.showMessage('골드가 부족합니다!', 1500);
      }
    }
  },

  // 맵에서 타워 선택
  selectTowerAt(x, y, state) {
    if (this.selectedTower) {
      this.selectedTower.selected = false;
    }
    this.selectedTower = null;

    state.towers.forEach(t => {
      t.selected = false;
      if (Utils.dist(x, y, t.x, t.y) < t.size / 2 + 10) {
        this.selectedTower = t;
        t.selected = true;
      }
    });
  },

  // 히트 테스트
  hitTest(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w &&
           y >= rect.y && y <= rect.y + rect.h;
  }
};

// ========== 9. 메인 Game 객체 ==========

const Game = {
  canvas: null,
  ctx: null,
  lastTime: 0,
  bgCanvas: null, // 오프스크린 캔버스 (배경+경로)
  gameTime: 0,    // 총 게임 시간 (ms)

  // 게임 상태
  state: {
    gold: CONFIG.START_GOLD,
    lives: CONFIG.START_LIVES,
    level: 0,
    waveNum: 0,
    totalWaves: 0,
    waveActive: false,
    towers: [],
    enemies: [],
    cards: {
      guseul_card: 0,
      meokbang_card: 0,
      bulgeom_card: 0,
      chonggeom_card: 0
    },
    gameSpeed: 1,
    paused: false,
    gameOver: false,
    victory: false,
    spawning: false,
    spawnQueue: [],
    levelTransitioning: false
  },

  // ===== 초기화 =====
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // 이미지 로딩 시작
    ImageLoader.preload(
      (pct) => this.updateLoading(pct),
      () => this.onLoadComplete()
    );

    // 이벤트 설정
    this.setupInput();

    // 재시작 버튼
    document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    document.getElementById('restartBtnV').addEventListener('click', () => this.restart());
  },

  // 캔버스 리사이즈 (모바일 대응)
  resizeCanvas() {
    const containerW = window.innerWidth;
    const containerH = window.innerHeight;
    const ratio = CONFIG.WIDTH / CONFIG.HEIGHT;

    let w, h;
    if (containerW / containerH > ratio) {
      h = containerH;
      w = h * ratio;
    } else {
      w = containerW;
      h = w / ratio;
    }

    this.canvas.width = CONFIG.WIDTH;
    this.canvas.height = CONFIG.HEIGHT;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    // 배경 캐시 무효화
    this.bgCanvas = null;
  },

  // 입력 설정 (터치 + 마우스, 중복 방지)
  setupInput() {
    let touchHandled = false;

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchHandled = true;
      const pos = this.getInputPos(e.touches[0]);
      UIManager.handleTouch(pos.x, pos.y, this.state);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      // 터치 이벤트가 먼저 처리된 경우 클릭 무시 (모바일 중복 방지)
      if (touchHandled) {
        touchHandled = false;
        return;
      }
      const pos = this.getInputPos(e);
      UIManager.handleTouch(pos.x, pos.y, this.state);
    });
  },

  // 입력 좌표 변환
  getInputPos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (CONFIG.WIDTH / rect.width),
      y: (event.clientY - rect.top) * (CONFIG.HEIGHT / rect.height)
    };
  },

  // 로딩 진행 업데이트
  updateLoading(pct) {
    const bar = document.getElementById('progressBarInner');
    const text = document.getElementById('progressText');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
  },

  // 로딩 완료
  onLoadComplete() {
    document.getElementById('loadingScreen').style.display = 'none';
    this.startLevel(0);
  },

  // 레벨 시작 (맵 랜덤 선택 적용)
  startLevel(levelIdx) {
    this.state.level = levelIdx;
    this.state.waveNum = 0;
    this.state.totalWaves = LEVEL_DATA[levelIdx].waves.length;
    this.state.waveActive = false;
    this.state.enemies = [];
    this.state.spawning = false;
    this.state.spawnQueue = [];
    this.state.gameOver = false;
    this.state.victory = false;

    // 맵 랜덤 선택 후 경로 설정
    const mapResult = selectMap(levelIdx);
    PathSystem.setPath(mapResult);

    this.bgCanvas = null;
    this.lastTime = performance.now();

    // 맵 이름 포함 레벨 시작 메시지
    const mapName = mapResult.mapData.name;
    UIManager.showMessage('레벨 ' + (levelIdx + 1) + ' 시작! - ' + mapName, 2500);

    this.loop();
  },

  // 웨이브 시작
  startWave() {
    if (this.state.waveActive) return;
    if (this.state.waveNum >= this.state.totalWaves) return;
    if (this.state.levelTransitioning) return;

    this.state.waveActive = true;
    const wave = LEVEL_DATA[this.state.level].waves[this.state.waveNum];

    this.state.spawnQueue = [];
    wave.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.state.spawnQueue.push({
          type: group.type,
          delay: i * group.interval
        });
      }
    });

    this.state.spawning = true;
    this._spawnElapsed = 0; // 게임 시간 기반 누적 dt 사용
    this._spawnIdx = 0;
    this.state.waveNum++;
  },

  // 스폰 업데이트 (게임 시간 기반 - gameSpeed 반영)
  updateSpawning(dt) {
    if (!this.state.spawning) return;
    this._spawnElapsed += dt;
    const elapsed = this._spawnElapsed;

    while (this._spawnIdx < this.state.spawnQueue.length) {
      const item = this.state.spawnQueue[this._spawnIdx];
      if (elapsed >= item.delay) {
        this.state.enemies.push(new Enemy(item.type));
        this._spawnIdx++;
      } else {
        break;
      }
    }

    if (this._spawnIdx >= this.state.spawnQueue.length) {
      this.state.spawning = false;
    }
  },

  // 타워 설치
  placeTower(x, y, type) {
    const data = TOWER_DATA[type];
    if (this.state.gold < data.cost) {
      UIManager.showMessage('골드가 부족합니다!', 1500);
      return;
    }

    if (Utils.isOnPath(x, y, PathSystem.waypoints)) {
      UIManager.showMessage('경로 위에 설치할 수 없습니다!', 1500);
      return;
    }

    if (Utils.isInUIArea(y)) return;

    const overlap = this.state.towers.some(t => Utils.dist(x, y, t.x, t.y) < 50);
    if (overlap) {
      UIManager.showMessage('다른 타워와 너무 가깝습니다!', 1500);
      return;
    }

    this.state.gold -= data.cost;
    const tower = new Tower(x, y, type);
    this.state.towers.push(tower);
    UIManager.showMessage(data.name + ' 배치!', 1000);
  },

  // 타워 판매
  sellTower(tower) {
    const refund = Math.floor(tower.cost * CONFIG.SELL_REFUND);
    this.state.gold += refund;
    this.state.towers = this.state.towers.filter(t => t !== tower);
    UIManager.showMessage(refund + 'G 환급!', 1200);
    UIManager.selectedTower = null;
  },

  // 타워 각성 (각성 폭발 연출 추가)
  awakenTower(tower) {
    const data = TOWER_DATA[tower.type];
    const cardKey = data.awakenCard;

    if (tower.awakened) {
      UIManager.showMessage('이미 각성했습니다!', 1500);
      return;
    }
    if (this.state.cards[cardKey] <= 0) {
      UIManager.showMessage('각성 카드가 없습니다!', 1500);
      return;
    }
    if (this.state.gold < data.awakenCost) {
      UIManager.showMessage('골드가 부족합니다!', 1500);
      return;
    }

    this.state.cards[cardKey]--;
    this.state.gold -= data.awakenCost;
    tower.awaken(); // 내부에서 각성 이펙트 트리거
    UIManager.showMessage(tower.name + ' 각성!!', 2000);
  },

  // 각성 카드 드롭
  dropCard() {
    const cardKeys = ['guseul_card', 'meokbang_card', 'bulgeom_card', 'chonggeom_card'];
    const chosen = cardKeys[Math.floor(Math.random() * cardKeys.length)];
    this.state.cards[chosen]++;
    const name = UIManager.cardNames[chosen];
    UIManager.showMessage(name + ' 획득!', 2500);
  },

  // 재시작
  restart() {
    this.state.gold = CONFIG.START_GOLD;
    this.state.lives = CONFIG.START_LIVES;
    this.state.towers = [];
    this.state.enemies = [];
    this.state.cards = {
      guseul_card: 0, meokbang_card: 0,
      bulgeom_card: 0, chonggeom_card: 0
    };
    this.state.gameSpeed = 1;
    this.state.paused = false;
    this.state.levelTransitioning = false;
    UIManager.selectedTower = null;
    UIManager.selectedTowerType = null;
    EffectSystem.effects = [];
    ParticleSystem.particles = [];
    this._mapParticles = []; // 맵 파티클 초기화

    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';

    this.startLevel(0);
  },

  // ===== 게임 루프 =====
  loop(now) {
    if (!now) now = performance.now();
    const rawDt = now - this.lastTime;
    this.lastTime = now;

    const dt = Math.min(rawDt, 100) * this.state.gameSpeed;
    this.gameTime += dt;

    if (!this.state.paused && !this.state.gameOver && !this.state.victory) {
      this.update(dt);
    } else if (!this.state.paused) {
      // 게임 종료 후에도 이펙트/파티클은 정리
      EffectSystem.update(dt);
    }

    this.render(rawDt);
    requestAnimationFrame((t) => this.loop(t));
  },

  // ===== 업데이트 =====
  update(dt) {
    this.updateSpawning(dt);

    // 타워 업데이트
    this.state.towers.forEach(t => {
      t.update(dt, this.state.enemies, this.state.towers);
    });

    // 적 업데이트
    this.state.enemies.forEach(e => e.update(dt));

    // 죽은 적 처리 + 골드 획득
    this.processDeadEnemies();

    // 이펙트 업데이트
    EffectSystem.update(dt);

    // 웨이브 완료 체크
    this.checkWaveComplete();

    // 게임 오버 체크
    if (this.state.lives <= 0) {
      this.state.gameOver = true;
      document.getElementById('gameOverScreen').style.display = 'flex';
    }
  },

  // 죽은 적 처리 (처치 파티클 추가)
  processDeadEnemies() {
    this.state.enemies = this.state.enemies.filter(e => {
      if (!e.alive) {
        if (e.reached) {
          this.state.lives--;
        } else {
          // 처치 시 골드 + 사라지는 파티클
          this.state.gold += e.gold;
          EffectSystem.addTextPop(e.x, e.y, '+' + e.gold + 'G', '#ffd700');
          EffectSystem.addDeathBurst(e.x, e.y);
        }
        return false;
      }
      return true;
    });
  },

  // 웨이브 완료 체크
  checkWaveComplete() {
    if (!this.state.waveActive) return;
    if (this.state.spawning) return;
    if (this.state.enemies.length > 0) return;

    this.state.waveActive = false;

    // 카드 드롭 (30% 확률)
    if (Math.random() < 0.3) {
      this.dropCard();
    }

    // 모든 웨이브 클리어
    if (this.state.waveNum >= this.state.totalWaves) {
      if (this.state.level < LEVEL_DATA.length - 1) {
        this.state.levelTransitioning = true;
        UIManager.showMessage('레벨 클리어! 다음 레벨로!', 2500);
        setTimeout(() => {
          this.state.level++;
          this.state.waveNum = 0;
          this.state.totalWaves = LEVEL_DATA[this.state.level].waves.length;
          this.state.waveActive = false;
          this.state.levelTransitioning = false;

          // 다음 레벨 맵 랜덤 선택
          const mapResult = selectMap(this.state.level);
          PathSystem.setPath(mapResult);
          this.bgCanvas = null;
          this._mapParticles = []; // 맵 파티클 초기화

          const mapName = mapResult.mapData.name;
          UIManager.showMessage('레벨 ' + (this.state.level + 1) + ' 시작! - ' + mapName, 2500);
        }, 2000);
      } else {
        this.state.victory = true;
        document.getElementById('victoryScreen').style.display = 'flex';
      }
    }
  },

  // ===== 렌더링 =====
  render(rawDt) {
    const ctx = this.ctx;

    // 배경 + 경로
    this.renderBackground(ctx);

    // 타워
    this.state.towers.forEach(t => t.render(ctx));

    // 적
    this.state.enemies.forEach(e => e.render(ctx));

    // 이펙트 (파티클 포함)
    EffectSystem.render(ctx);

    // UI
    UIManager.renderHUD(ctx, this.state);
    UIManager.renderTowerBar(ctx, this.state);
    UIManager.renderControls(ctx, this.state);
    UIManager.renderCards(ctx, this.state);
    UIManager.renderSelectedInfo(ctx, this.state);
    UIManager.renderWaveStartBtn(ctx, this.state);
    // rawDt 사용: 메시지 페이드는 게임 속도와 무관하게 실제 시간 기준으로 동작 (의도적)
    UIManager.renderMessage(ctx, rawDt);

    // 설치 모드 안내
    if (UIManager.selectedTowerType) {
      this.renderPlacementGuide(ctx);
    }

    // 일시정지 표시
    if (this.state.paused) {
      this.renderPauseOverlay(ctx);
    }

    // 레벨 표시
    this.renderLevelInfo(ctx);
  },

  // 배경 렌더링 (맵 테마별 Canvas 배경)
  renderBackground(ctx) {
    if (!this.bgCanvas) {
      this.bgCanvas = document.createElement('canvas');
      this.bgCanvas.width = CONFIG.WIDTH;
      this.bgCanvas.height = CONFIG.HEIGHT;
      const bgCtx = this.bgCanvas.getContext('2d');

      const currentMap = PathSystem.currentMap;
      const mapData = currentMap ? currentMap.mapData : MAP_DATA.grassland;
      const mapId = currentMap ? currentMap.mapId : 'grassland';

      // === 맵 배경 그리기 ===
      this.renderMapBackground(bgCtx, mapId, mapData);

      // === 장식 그리기 ===
      this.renderMapDecorations(bgCtx, mapId, mapData);

      // === 경로 그리기 ===
      PathSystem.draw(bgCtx);
    }
    ctx.drawImage(this.bgCanvas, 0, 0);

    // === 맵 파티클 효과 (매 프레임, bgCanvas 위에 직접 그림) ===
    this.renderMapParticles(ctx);
  },

  // 맵별 배경 그리기
  renderMapBackground(bgCtx, mapId, mapData) {
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;

    switch (mapId) {
      case 'grassland': {
        // 밝은 잔디 배경 (PvZ 스타일)
        const grassGrad = bgCtx.createLinearGradient(0, 0, 0, H);
        grassGrad.addColorStop(0, '#4a8c2a');
        grassGrad.addColorStop(0.5, '#3d7a22');
        grassGrad.addColorStop(1, '#356e1e');
        bgCtx.fillStyle = grassGrad;
        bgCtx.fillRect(0, 0, W, H);
        // 체커보드 잔디 패턴
        const tileSize = 40;
        for (let gy = 0; gy < H; gy += tileSize) {
          for (let gx = 0; gx < W; gx += tileSize) {
            if (((gx / tileSize) + (gy / tileSize)) % 2 === 0) {
              bgCtx.fillStyle = 'rgba(80, 160, 40, 0.15)';
              bgCtx.fillRect(gx, gy, tileSize, tileSize);
            }
          }
        }
        break;
      }
      case 'lava': {
        // 어두운 화산 배경
        const lavaGrad = bgCtx.createLinearGradient(0, 0, 0, H);
        lavaGrad.addColorStop(0, '#1a0e08');
        lavaGrad.addColorStop(0.5, '#2C1810');
        lavaGrad.addColorStop(1, '#3a1510');
        bgCtx.fillStyle = lavaGrad;
        bgCtx.fillRect(0, 0, W, H);
        // 용암 균열 텍스처
        bgCtx.strokeStyle = 'rgba(255, 69, 0, 0.15)';
        bgCtx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
          bgCtx.beginPath();
          const sx = Math.random() * W;
          const sy = Math.random() * H;
          bgCtx.moveTo(sx, sy);
          bgCtx.lineTo(sx + (Math.random() - 0.5) * 60, sy + (Math.random() - 0.5) * 60);
          bgCtx.stroke();
        }
        break;
      }
      case 'cave': {
        // 어두운 동굴 배경
        const caveGrad = bgCtx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, H);
        caveGrad.addColorStop(0, '#2a2a4e');
        caveGrad.addColorStop(1, '#0e0e1a');
        bgCtx.fillStyle = caveGrad;
        bgCtx.fillRect(0, 0, W, H);
        // 돌 텍스처
        bgCtx.fillStyle = 'rgba(100, 100, 120, 0.08)';
        for (let i = 0; i < 40; i++) {
          bgCtx.beginPath();
          bgCtx.arc(Math.random() * W, Math.random() * H, 10 + Math.random() * 25, 0, Math.PI * 2);
          bgCtx.fill();
        }
        break;
      }
      case 'desert': {
        // 모래 배경
        const desertGrad = bgCtx.createLinearGradient(0, 0, 0, H);
        desertGrad.addColorStop(0, '#F4D03F');
        desertGrad.addColorStop(0.5, '#E8C430');
        desertGrad.addColorStop(1, '#D4A820');
        bgCtx.fillStyle = desertGrad;
        bgCtx.fillRect(0, 0, W, H);
        // 모래 물결 텍스처
        bgCtx.strokeStyle = 'rgba(180, 140, 30, 0.2)';
        bgCtx.lineWidth = 1;
        for (let gy = 0; gy < H; gy += 20) {
          bgCtx.beginPath();
          bgCtx.moveTo(0, gy);
          for (let gx = 0; gx < W; gx += 10) {
            bgCtx.lineTo(gx, gy + Math.sin(gx * 0.05) * 3);
          }
          bgCtx.stroke();
        }
        break;
      }
      case 'ice': {
        // 얼음 배경
        const iceGrad = bgCtx.createLinearGradient(0, 0, 0, H);
        iceGrad.addColorStop(0, '#E0F7FA');
        iceGrad.addColorStop(0.5, '#B2EBF2');
        iceGrad.addColorStop(1, '#80DEEA');
        bgCtx.fillStyle = iceGrad;
        bgCtx.fillRect(0, 0, W, H);
        // 빙결 패턴
        bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        bgCtx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
          const cx = Math.random() * W;
          const cy = Math.random() * H;
          bgCtx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (Math.PI * 2 / 6) * a;
            bgCtx.moveTo(cx, cy);
            bgCtx.lineTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20);
          }
          bgCtx.stroke();
        }
        break;
      }
      default: {
        // 기본 배경
        bgCtx.fillStyle = mapData.bgColor;
        bgCtx.fillRect(0, 0, W, H);
      }
    }
  },

  // 맵별 장식 그리기
  renderMapDecorations(bgCtx, mapId, mapData) {
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;
    const decorColor = mapData.decorColor;

    switch (mapId) {
      case 'grassland': {
        // 풀 + 꽃
        bgCtx.fillStyle = 'rgba(60, 120, 30, 0.3)';
        for (let i = 0; i < 150; i++) {
          const gx = Math.random() * W;
          const gy = Math.random() * H;
          bgCtx.fillRect(gx, gy, 1 + Math.random() * 2, 3 + Math.random() * 3);
        }
        // 작은 꽃
        const flowerColors = ['#ff6b6b', '#ffd93d', '#fff', '#ff9ff3'];
        for (let i = 0; i < 25; i++) {
          bgCtx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
          bgCtx.beginPath();
          bgCtx.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 2, 0, Math.PI * 2);
          bgCtx.fill();
        }
        break;
      }
      case 'lava': {
        // 바위 (어두운 원)
        for (let i = 0; i < 15; i++) {
          bgCtx.fillStyle = 'rgba(50, 30, 20, 0.4)';
          bgCtx.beginPath();
          bgCtx.arc(Math.random() * W, Math.random() * H, 8 + Math.random() * 15, 0, Math.PI * 2);
          bgCtx.fill();
        }
        // 용암 웅덩이 (붉은 원)
        for (let i = 0; i < 8; i++) {
          bgCtx.fillStyle = 'rgba(255, 69, 0, 0.12)';
          bgCtx.beginPath();
          bgCtx.arc(Math.random() * W, Math.random() * H, 15 + Math.random() * 20, 0, Math.PI * 2);
          bgCtx.fill();
        }
        break;
      }
      case 'cave': {
        // 보석 반짝임
        const gemColors = ['#4682B4', '#9370DB', '#20B2AA', '#4169E1'];
        for (let i = 0; i < 20; i++) {
          bgCtx.fillStyle = gemColors[Math.floor(Math.random() * gemColors.length)];
          bgCtx.globalAlpha = 0.3 + Math.random() * 0.3;
          bgCtx.beginPath();
          const gx = Math.random() * W;
          const gy = Math.random() * H;
          // 다이아몬드 모양
          bgCtx.moveTo(gx, gy - 4);
          bgCtx.lineTo(gx + 3, gy);
          bgCtx.lineTo(gx, gy + 4);
          bgCtx.lineTo(gx - 3, gy);
          bgCtx.closePath();
          bgCtx.fill();
        }
        bgCtx.globalAlpha = 1;
        break;
      }
      case 'desert': {
        // 선인장
        for (let i = 0; i < 12; i++) {
          const cx = Math.random() * W;
          const cy = Math.random() * H;
          bgCtx.fillStyle = decorColor;
          // 선인장 줄기
          bgCtx.fillRect(cx - 3, cy - 12, 6, 18);
          // 선인장 팔
          bgCtx.fillRect(cx - 8, cy - 6, 5, 4);
          bgCtx.fillRect(cx + 3, cy - 8, 5, 4);
        }
        break;
      }
      case 'ice': {
        // 눈 결정체
        bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        bgCtx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
          const cx = Math.random() * W;
          const cy = Math.random() * H;
          const size = 3 + Math.random() * 5;
          bgCtx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (Math.PI / 3) * a;
            bgCtx.moveTo(cx, cy);
            bgCtx.lineTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
          }
          bgCtx.stroke();
        }
        break;
      }
    }
  },

  // 맵 파티클 효과 (매 프레임 렌더링)
  renderMapParticles(ctx) {
    const currentMap = PathSystem.currentMap;
    if (!currentMap || !currentMap.mapData.particleEffect) return;

    const effect = currentMap.mapData.particleEffect;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;

    // 맵 파티클은 별도 관리 (ParticleSystem 오버플로 방지)
    if (!this._mapParticles) this._mapParticles = [];
    const maxMapParticles = 30; // 맵 파티클 최대 수 (성능 보호)

    // 새 파티클 생성 (프레임당 확률적)
    if (this._mapParticles.length < maxMapParticles && Math.random() < 0.15) {
      switch (effect) {
        case 'fire': {
          // 경로 위에서 작은 불꽃이 위로 올라감
          const wp = PathSystem.waypoints;
          const idx = Math.floor(Math.random() * (wp.length - 1));
          const t = Math.random();
          const px = wp[idx].x + (wp[idx + 1].x - wp[idx].x) * t;
          const py = wp[idx].y + (wp[idx + 1].y - wp[idx].y) * t;
          this._mapParticles.push({
            x: px + (Math.random() - 0.5) * 30,
            y: py,
            vy: -15 - Math.random() * 10,
            size: 2 + Math.random() * 3,
            color: Math.random() < 0.5 ? '#ff4400' : '#ff8800',
            life: 0, maxLife: 800 + Math.random() * 400
          });
          break;
        }
        case 'snow': {
          // 눈 내리기
          this._mapParticles.push({
            x: Math.random() * W,
            y: -5,
            vx: (Math.random() - 0.5) * 10,
            vy: 12 + Math.random() * 8,
            size: 1.5 + Math.random() * 2,
            color: '#ffffff',
            life: 0, maxLife: 3000 + Math.random() * 2000
          });
          break;
        }
        case 'glow': {
          // 동굴 반짝임
          this._mapParticles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: 2 + Math.random() * 3,
            color: ['#4682B4', '#9370DB', '#20B2AA'][Math.floor(Math.random() * 3)],
            life: 0, maxLife: 1500 + Math.random() * 1000,
            pulse: true
          });
          break;
        }
      }
    }

    // 파티클 업데이트 및 렌더링
    ctx.save();
    this._mapParticles = this._mapParticles.filter(p => {
      p.life += 16; // ~60fps 기준 약 16ms
      if (p.life >= p.maxLife) return false;

      const progress = p.life / p.maxLife;
      const alpha = effect === 'glow' && p.pulse
        ? 0.3 + Math.sin(p.life * 0.005) * 0.3
        : (1 - progress) * 0.6;

      p.x += (p.vx || 0) * 0.016;
      p.y += (p.vy || 0) * 0.016;

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
      ctx.fill();

      return true;
    });
    ctx.restore();
  },

  // 설치 모드 안내 (타워 실루엣)
  renderPlacementGuide(ctx) {
    ctx.fillStyle = 'rgba(100, 255, 100, 0.1)';
    ctx.fillRect(0, CONFIG.HUD_HEIGHT, CONFIG.WIDTH, CONFIG.HEIGHT - CONFIG.HUD_HEIGHT - CONFIG.UI_BAR_HEIGHT);

    // 안내 텍스트 (외곽선 포함)
    ctx.save();
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText('맵을 터치하여 타워를 배치하세요!', CONFIG.WIDTH / 2, CONFIG.HUD_HEIGHT + 22);
    ctx.fillStyle = '#88ff88';
    ctx.fillText('맵을 터치하여 타워를 배치하세요!', CONFIG.WIDTH / 2, CONFIG.HUD_HEIGHT + 22);
    ctx.restore();
  },

  // 일시정지 오버레이
  renderPauseOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    ctx.save();
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('일시정지', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('일시정지', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    ctx.restore();
  },

  // 레벨 정보 + 맵 이름 (PvZ 스타일 뱃지)
  renderLevelInfo(ctx) {
    const lx = 8;
    const ly = CONFIG.HUD_HEIGHT + 8;
    const currentMap = PathSystem.currentMap;
    const mapName = currentMap ? currentMap.mapData.name : '';
    const labelText = 'Lv.' + (this.state.level + 1) + (mapName ? ' ' + mapName : '');
    const labelWidth = Math.max(56, ctx.measureText ? 20 + labelText.length * 10 : 80);

    ctx.save();
    ctx.fillStyle = 'rgba(50, 25, 10, 0.6)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, labelWidth, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(labelText, lx + 6, ly + 15);
    ctx.restore();
  }
};

// ========== 10. 게임 시작 ==========

window.addEventListener('load', () => Game.init());
