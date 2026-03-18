// ============================================================
// main.js - 게임 메인
// 게임 초기화, 루프, 레벨/웨이브 관리, 모듈 연결
// ============================================================

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
    levelTransitioning: false,
    // 게임 통계
    totalKills: 0,
    totalGoldEarned: 0,
    startTime: 0,
    totalTowersPlaced: 0,
    totalAwakenings: 0,
    // 레벨 오버레이
    levelOverlay: null
  },

  // ===== 초기화 =====
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    // visualViewport 이벤트 (모바일 주소창 토글, 키보드 등)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.resizeCanvas());
    }

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

  // 캔버스 리사이즈 (모바일/폴더블 대응)
  resizeCanvas() {
    // visualViewport API: 모바일 브라우저 주소창/키보드 제외한 실제 보이는 영역
    const vp = window.visualViewport;
    const containerW = vp ? vp.width : window.innerWidth;
    const containerH = vp ? vp.height : window.innerHeight;

    // 화면 비율에 따라 게임 가로 동적 조절 (폴더블/태블릿 대응)
    // 일반 폰: ~0.45-0.55, 폴드 커버: ~0.39, 폴드 내부: ~0.75-0.85
    const screenRatio = containerW / containerH;
    const dynamicWidth = Math.round(CONFIG.HEIGHT * Math.max(0.5, Math.min(0.75, screenRatio)));
    CONFIG.WIDTH = Math.max(480, dynamicWidth);

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
    this.state.startTime = Date.now();
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

    // 레벨 시작 오버레이 (2초간 큰 안내)
    const mapName = mapResult.mapData.name;
    this.state.levelOverlay = {
      text: '레벨 ' + (levelIdx + 1) + ' 시작!',
      subText: mapName,
      timer: 2000
    };

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
    this.state.totalTowersPlaced++;
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
    tower.awaken();
    this.state.totalAwakenings++;
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
    this.state.totalKills = 0;
    this.state.totalGoldEarned = 0;
    this.state.startTime = Date.now();
    this.state.totalTowersPlaced = 0;
    this.state.totalAwakenings = 0;
    this.state.levelOverlay = null;
    UIManager.selectedTower = null;
    UIManager.selectedTowerType = null;
    EffectSystem.effects = [];
    ParticleSystem.particles = [];
    MapRenderer.mapParticles = [];

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

    // 파괴된 타워 제거
    this.processDestroyedTowers();

    // 죽은 적 처리 + 골드 획득
    this.processDeadEnemies();

    // 이펙트 업데이트
    EffectSystem.update(dt);

    // 웨이브 완료 체크
    this.checkWaveComplete();

    // 게임 오버 체크
    if (this.state.lives <= 0) {
      this.state.gameOver = true;
      const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      document.getElementById('gameOverMsg').textContent =
        '레벨 ' + (this.state.level + 1) + '에서 패배했습니다!';
      const statsEl = document.getElementById('gameOverStats');
      if (statsEl) statsEl.textContent =
        '처치: ' + this.state.totalKills + '마리 | 골드: ' + this.state.totalGoldEarned + 'G | 시간: ' + mins + '분 ' + secs + '초';
      document.getElementById('gameOverScreen').style.display = 'flex';
    }
  },

  // 파괴된 타워 제거
  processDestroyedTowers() {
    this.state.towers = this.state.towers.filter(t => {
      if (!t.alive) {
        // 선택 해제
        if (UIManager.selectedTower === t) {
          UIManager.selectedTower = null;
        }
        return false;
      }
      return true;
    });
  },

  // 죽은 적 처리 (처치 파티클 추가)
  processDeadEnemies() {
    this.state.enemies = this.state.enemies.filter(e => {
      if (!e.alive) {
        if (e.reached) {
          this.state.lives--;
        } else {
          // 처치 시 골드 + 통계 + 사라지는 파티클
          this.state.gold += e.gold;
          this.state.totalKills++;
          this.state.totalGoldEarned += e.gold;
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

    // 웨이브 클리어 보너스 골드
    const bonus = CONFIG.WAVE_CLEAR_BONUS || 0;
    if (bonus > 0) {
      this.state.gold += bonus;
      this.state.totalGoldEarned += bonus;
      EffectSystem.addTextPop(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50, '웨이브 클리어! +' + bonus + 'G', '#ffd700');
    }

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
          // === 타워 자동 회수 (100% 환급 + 각성 카드 반환) ===
          let refundGold = 0;
          this.state.towers.forEach(t => {
            refundGold += t.cost;
            if (t.awakened) {
              const data = TOWER_DATA[t.type];
              refundGold += data.awakenCost;
              const cardKey = data.awakenCard;
              this.state.cards[cardKey] = (this.state.cards[cardKey] || 0) + 1;
            }
          });
          this.state.gold += refundGold;
          this.state.towers = [];
          UIManager.selectedTower = null;
          UIManager.selectedTowerType = null;

          // 다음 레벨 설정
          this.state.level++;
          this.state.waveNum = 0;
          this.state.totalWaves = LEVEL_DATA[this.state.level].waves.length;
          this.state.waveActive = false;
          this.state.levelTransitioning = false;

          const mapResult = selectMap(this.state.level);
          PathSystem.setPath(mapResult);
          this.bgCanvas = null;
          MapRenderer.mapParticles = [];

          // 레벨 시작 오버레이
          const mapName = mapResult.mapData.name;
          this.state.levelOverlay = {
            text: '레벨 ' + (this.state.level + 1) + ' 시작!',
            subText: mapName + (refundGold > 0 ? ' | 회수 +' + refundGold + 'G' : ''),
            timer: 2500
          };
        }, 2000);
      } else {
        // 최종 승리
        this.state.victory = true;
        const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const stars = this.state.lives >= 15 ? 3 : this.state.lives >= 8 ? 2 : 1;
        document.getElementById('victoryMsg').textContent = '모든 웨이브를 막아냈습니다!';
        const statsEl = document.getElementById('victoryStats');
        if (statsEl) statsEl.textContent = '처치: ' + this.state.totalKills + '마리 | 골드: ' + this.state.totalGoldEarned + 'G | 시간: ' + mins + '분 ' + secs + '초';
        const starsEl = document.getElementById('victoryStars');
        if (starsEl) starsEl.textContent = '⭐'.repeat(stars);
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

    // 레벨 시작 오버레이 (2초간 큰 안내)
    if (this.state.levelOverlay && this.state.levelOverlay.timer > 0) {
      this.renderLevelOverlay(ctx, rawDt);
    }
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

      // === 맵 배경 그리기 (MapRenderer 사용) ===
      MapRenderer.renderBackground(bgCtx, mapId, mapData);

      // === 장식 그리기 (MapRenderer 사용) ===
      MapRenderer.renderDecorations(bgCtx, mapId, mapData);

      // === 경로 그리기 ===
      PathSystem.draw(bgCtx);
    }
    ctx.drawImage(this.bgCanvas, 0, 0);

    // === 맵 파티클 효과 (MapRenderer 사용) ===
    MapRenderer.renderParticles(ctx);
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

  // 레벨 시작 오버레이 (큰 안내 텍스트)
  renderLevelOverlay(ctx, dt) {
    const ov = this.state.levelOverlay;
    ov.timer -= dt;
    if (ov.timer <= 0) {
      this.state.levelOverlay = null;
      return;
    }

    const alpha = Math.min(1, ov.timer / 400);
    ctx.save();
    ctx.globalAlpha = alpha;

    // 반투명 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, CONFIG.HEIGHT / 2 - 60, CONFIG.WIDTH, 120);

    // 메인 텍스트
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(ov.text, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(ov.text, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);

    // 서브 텍스트 (맵 이름)
    if (ov.subText) {
      ctx.font = 'bold 20px Arial';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText('- ' + ov.subText + ' -', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 35);
      ctx.fillStyle = '#fff';
      ctx.fillText('- ' + ov.subText + ' -', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 35);
    }

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

// ========== 게임 시작 ==========
window.addEventListener('load', () => Game.init());
