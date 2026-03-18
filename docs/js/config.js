// ============================================================
// config.js - 게임 설정 상수 및 데이터 테이블
// 모든 게임 데이터를 한 곳에서 관리
// ============================================================

// ========== 게임 설정 상수 ==========

const CONFIG = {
  // 게임 논리 해상도 (내부 좌표계)
  BASE_WIDTH: 480,  // 경로 데이터 기준 원본 너비 (스케일링 기준)
  WIDTH: 480,
  HEIGHT: 800,
  FPS: 60,
  // 경제
  START_GOLD: 300,
  START_LIVES: 20,
  WAVE_CLEAR_BONUS: 40,  // 웨이브 클리어 보너스 골드
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
    hp: 300,              // 타워 체력
    awakenHp: 450,        // 각성 시 체력
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
    hp: 500,              // 근접 타워라 튼튼
    awakenHp: 750,
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
    hp: 250,
    awakenHp: 380,
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
    hp: 280,
    awakenHp: 420,
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
    hp: 80,            // 구슬이 1개로 ~3초 처치
    speed: 40,         // 느린 편 (여유 있게)
    gold: 15,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame',
    // 타워 공격 스탯
    towerAttackDamage: 15,
    towerAttackRange: 45,
    towerAttackCooldown: 1500
  },
  fastZombie: {
    name: '빠른좀비',
    hp: 100,           // 약하지만 빠름
    speed: 70,
    gold: 20,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame',
    towerAttackDamage: 12,
    towerAttackRange: 40,
    towerAttackCooldown: 1200
  },
  bossZombie: {
    name: '보스좀비',
    hp: 800,           // 타워 여러 개로 처리 가능
    speed: 20,
    gold: 150,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame',
    towerAttackDamage: 40,
    towerAttackRange: 50,
    towerAttackCooldown: 2000
  },
  // 방패좀비 — 데미지 50% 감소, 방패 내구력 80
  shieldZombie: {
    name: '방패좀비',
    hp: 200,
    speed: 25,
    gold: 35,
    imageKey: 'villain_zombie',
    cardImageKey: 'villain_zombie',
    ingameImageKey: 'villain_zombie_ingame',
    shieldHp: 80,
    damageReduction: 0.5,
    towerAttackDamage: 20,
    towerAttackRange: 45,
    towerAttackCooldown: 2000
  },
  // 햄토리 — 손톱 투척, 순간이동, 타워 마비
  hamtori: {
    name: '햄토리',
    hp: 300,
    speed: 55,
    gold: 80,
    imageKey: 'hamtaro',
    cardImageKey: 'hamtaro',
    ingameImageKey: 'hamtaro_ingame',
    nailThrowRange: 200,
    nailThrowCooldown: 6000,   // 쿨타임 넉넉히
    knifeRange: 60,
    knifeCooldown: 5000,
    paralyzeDuration: 2000,    // 마비 2초 (3초→2초)
    towerAttackDamage: 25,
    towerAttackRange: 50,
    towerAttackCooldown: 1800
  }
};

// ========== 웨이브 데이터 (5레벨, 점진적 난이도) ==========
const LEVEL_DATA = [
  // 레벨 1: 튜토리얼 — 적 소수, 느린 간격
  { waves: [
    { enemies: [{ type: 'zombie', count: 3, interval: 2000 }] },
    { enemies: [{ type: 'zombie', count: 5, interval: 1800 }] },
    { enemies: [{ type: 'zombie', count: 6, interval: 1500 }] }
  ]},
  // 레벨 2: 쉬움 — 빠른좀비 소수 등장
  { waves: [
    { enemies: [{ type: 'zombie', count: 6, interval: 1500 }] },
    { enemies: [{ type: 'zombie', count: 7, interval: 1300 }] },
    { enemies: [{ type: 'zombie', count: 6, interval: 1200 }, { type: 'fastZombie', count: 2, interval: 1500 }] },
    { enemies: [{ type: 'zombie', count: 8, interval: 1100 }, { type: 'fastZombie', count: 3, interval: 1200 }] }
  ]},
  // 레벨 3: 보통 — 방패좀비 등장, 햄토리 1마리
  { waves: [
    { enemies: [{ type: 'zombie', count: 8, interval: 1200 }] },
    { enemies: [{ type: 'zombie', count: 6, interval: 1100 }, { type: 'fastZombie', count: 3, interval: 1000 }] },
    { enemies: [{ type: 'zombie', count: 8, interval: 1000 }, { type: 'shieldZombie', count: 1, interval: 2000 }] },
    { enemies: [{ type: 'fastZombie', count: 5, interval: 900 }, { type: 'shieldZombie', count: 2, interval: 1500 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 900 }, { type: 'hamtori', count: 1, interval: 3000 }] }
  ]},
  // 레벨 4: 어려움 — 햄토리 다수 + 보스좀비
  { waves: [
    { enemies: [{ type: 'zombie', count: 10, interval: 1000 }] },
    { enemies: [{ type: 'fastZombie', count: 5, interval: 800 }, { type: 'shieldZombie', count: 2, interval: 1200 }] },
    { enemies: [{ type: 'zombie', count: 8, interval: 900 }, { type: 'hamtori', count: 1, interval: 3000 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 800 }, { type: 'fastZombie', count: 4, interval: 700 }] },
    { enemies: [{ type: 'shieldZombie', count: 3, interval: 1000 }, { type: 'hamtori', count: 2, interval: 2500 }] },
    { enemies: [{ type: 'zombie', count: 12, interval: 700 }, { type: 'fastZombie', count: 5, interval: 600 }] },
    { enemies: [{ type: 'bossZombie', count: 1, interval: 1000 }, { type: 'zombie', count: 8, interval: 800 }] }
  ]},
  // 레벨 5: 매우 어려움 — 모든 적 등장
  { waves: [
    { enemies: [{ type: 'zombie', count: 12, interval: 900 }] },
    { enemies: [{ type: 'fastZombie', count: 8, interval: 700 }, { type: 'shieldZombie', count: 2, interval: 1000 }] },
    { enemies: [{ type: 'zombie', count: 10, interval: 800 }, { type: 'hamtori', count: 2, interval: 2500 }] },
    { enemies: [{ type: 'shieldZombie', count: 4, interval: 900 }, { type: 'fastZombie', count: 6, interval: 700 }] },
    { enemies: [{ type: 'zombie', count: 15, interval: 700 }, { type: 'hamtori', count: 3, interval: 2000 }] },
    { enemies: [{ type: 'fastZombie', count: 10, interval: 600 }, { type: 'shieldZombie', count: 3, interval: 800 }] },
    { enemies: [{ type: 'bossZombie', count: 1, interval: 1000 }, { type: 'zombie', count: 12, interval: 600 }] },
    { enemies: [{ type: 'zombie', count: 15, interval: 600 }, { type: 'hamtori', count: 4, interval: 2000 }, { type: 'shieldZombie', count: 3, interval: 1000 }] },
    { enemies: [{ type: 'bossZombie', count: 1, interval: 1000 }, { type: 'fastZombie', count: 8, interval: 500 }, { type: 'hamtori', count: 3, interval: 2000 }] },
    { enemies: [{ type: 'bossZombie', count: 2, interval: 5000 }, { type: 'zombie', count: 15, interval: 500 }, { type: 'hamtori', count: 3, interval: 2000 }] }
  ]}
];

// ========== 맵 데이터 (5종 맵 테마) ==========

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

// ========== 맵 선택 로직 ==========

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
