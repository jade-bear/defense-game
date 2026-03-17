// ============================================================
// ui-manager.js - UI 매니저
// HUD, 타워 카드바, 정보 패널, 입력 처리
// ============================================================

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
    const panelH = 125;
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

    // 공격 속도 + DPS 표시
    const atkSpeed = (1000 / t.getAttackInterval()).toFixed(1);
    const dps = Math.floor(t.getDamage() / (t.getAttackInterval() / 1000));
    ctx.fillText('공속: ' + atkSpeed + '회/초', px + 10, py + 56);
    ctx.fillText('DPS: ' + dps, px + 115, py + 56);

    // 판매 버튼
    const sellGold = Math.floor(t.cost * CONFIG.SELL_REFUND);
    const btnY = py + 72;
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.roundRect(px + 10, btnY, 85, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('판매 ' + sellGold + 'G', px + 52, btnY + 22);

    // 각성 버튼 + 카드 정보
    if (!t.awakened) {
      const cardKey = TOWER_DATA[t.type].awakenCard;
      const cardCount = state.cards[cardKey] || 0;
      const hasCard = cardCount > 0;
      const awakenCost = TOWER_DATA[t.type].awakenCost;
      const canAwaken = hasCard && state.gold >= awakenCost;

      // 카드 상태 텍스트 (버튼 위에)
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      if (hasCard) {
        ctx.fillStyle = '#88ff88';
        ctx.fillText(this.cardNames[cardKey] + ' x' + cardCount, px + 155, btnY - 4);
      } else {
        ctx.fillStyle = '#ff6666';
        ctx.fillText('카드 없음', px + 155, btnY - 4);
      }

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

  // 터치/클릭 처리 (Game 객체의 메서드를 직접 호출)
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
