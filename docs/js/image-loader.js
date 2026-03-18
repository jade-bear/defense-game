// ============================================================
// image-loader.js - 이미지 로딩 시스템
// 이미지 프리로드, 폴백 처리, 그리기 헬퍼
// ============================================================

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
      img.src = 'docs/images/' + filename;
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

// ========== 이미지 폴백 헬퍼 함수 ==========

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
