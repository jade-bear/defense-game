// ============================================================
// tower.js - 타워 클래스
// 타워 생성, 타겟 탐색, 공격 로직, 렌더링
// ============================================================

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

    // 타워 마비 (햄토리 칼 공격으로 인한)
    this.paralyzed = false;
    this.paralyzeTimer = 0;

    // === PvZ 이펙트용 상태 ===
    this.idleTime = Math.random() * Math.PI * 2; // Idle 바운스 위상 (랜덤 시작)
    this.squashTimer = 0;    // Squash & Stretch 타이머
    this.squashType = 'none'; // 'attack', 'place'
    this.placeTimer = 500;   // 배치 바운스 애니메이션 (500ms)
    this.awakenAuraTime = 0; // 각성 오라 펄스 타이머
  }

  // 현재 대미지 (각성 + 먹방이 스택 반영)
  getDamage() {
    let dmg = this.awakened
      ? TOWER_DATA[this.type].awakenDamage
      : this.baseDamage;
    // 먹방이 성장 스택: +10/스택, 최대 5스택
    if (this.type === 'meokbang') {
      dmg += Math.min(this.eatCount, 5) * 10;
    }
    return dmg * this.buffMultiplier;
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
    // 타워 마비 처리 (햄토리 칼 공격)
    if (this.paralyzed) {
      this.paralyzeTimer -= dt;
      if (this.paralyzeTimer <= 0) {
        this.paralyzed = false;
        this.paralyzeTimer = 0;
      }
      this.idleTime += dt * 0.003;
      return; // 마비 중에는 공격 불가
    }

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

    // === 6. 타워 마비 표시 ===
    if (this.paralyzed) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x - 10, this.y - 10);
      ctx.lineTo(this.x + 10, this.y + 10);
      ctx.moveTo(this.x + 10, this.y - 10);
      ctx.lineTo(this.x - 10, this.y + 10);
      ctx.stroke();
      ctx.restore();
    }

    // === 6.5 먹방이 스택 표시 ===
    if (this.type === 'meokbang' && this.eatCount > 0) {
      const stacks = Math.min(this.eatCount, 5);
      ctx.save();
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText('x' + stacks, this.x, this.y - this.size / 2 - 5);
      ctx.fillText('x' + stacks, this.x, this.y - this.size / 2 - 5);
      ctx.restore();
    }

    // === 7. 버프 표시 (반짝이는 테두리) ===
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
