// ============================================================
// enemy.js - 적 클래스
// 적 생성, 이동, 상태이상, 렌더링
// ============================================================

class Enemy {
  constructor(type) {
    const data = ENEMY_DATA[type];
    this.type = type;
    this.name = data.name;
    // 현재 레벨에 따른 체력/속도 스케일링
    const level = (Game.state && Game.state.level !== undefined) ? Game.state.level : 0;
    const hpScale = CONFIG.LEVEL_HP_SCALE[level] || 1.0;
    const speedScale = CONFIG.LEVEL_SPEED_SCALE[level] || 1.0;
    this.maxHp = Math.round(data.hp * hpScale);
    this.hp = this.maxHp;
    this.speed = Math.round(data.speed * speedScale);
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

    // 방패좀비 전용
    this.shieldHp = data.shieldHp || 0;
    this.damageReduction = data.damageReduction || 0;
    this.hasShield = this.shieldHp > 0;

    // 햄토리 전용
    this.isHamtori = (type === 'hamtori');
    this.nailCooldown = 0;
    this.knifeCooldown = 0;
    this.nailProjectile = null;
    this.canTeleport = false;
    this.teleportDelay = 0;

    // 타워 공격 관련
    this.towerAttackTimer = 0;

    // 보스좀비 소환 전용
    this.summonTimer = 0;
    this.summonInterval = 10000;

    // 크기 (보스는 크게, 햄토리는 중간)
    this.size = type === 'bossZombie' ? 52 : type === 'hamtori' ? 44 : 38;

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

    // 햄토리 특수 행동
    if (this.isHamtori && this.alive) {
      this.updateHamtori(dt);
    }

    // 타워 공격 (근접한 타워를 때림)
    this.updateTowerAttack(dt);

    // 보스좀비 소환
    if (this.type === 'bossZombie' && this.alive) {
      this.summonTimer += dt;
      if (this.summonTimer >= this.summonInterval) {
        this.summonTimer = 0;
        for (let i = 0; i < 2; i++) {
          const minion = new Enemy('zombie');
          minion.progress = Math.max(0, this.progress - 0.05);
          minion.updatePosition();
          Game.state.enemies.push(minion);
        }
        EffectSystem.addTextPop(this.x, this.y - 30, '소환!', '#ff0000');
        EffectSystem.addShockwave(this.x, this.y, 60, 'rgba(255, 0, 0, 0.3)');
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

  // 대미지 적용 (방패 감소 + 피격 플래시)
  takeDamage(dmg) {
    // 방패가 있으면 데미지 감소 + 방패 내구력 차감
    if (this.hasShield && this.shieldHp > 0) {
      this.shieldHp -= dmg * 0.5;
      dmg = dmg * (1 - this.damageReduction);
      if (this.shieldHp <= 0) {
        this.shieldHp = 0;
        this.hasShield = false;
        this.damageReduction = 0;
        EffectSystem.addTextPop(this.x, this.y - 20, '방패 파괴!', '#6688ff');
      }
    }
    this.hp -= dmg;
    this.hitFlashTimer = 150;
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

  // 햄토리 AI: 손톱 투척, 순간이동, 칼 공격
  updateHamtori(dt) {
    const data = ENEMY_DATA.hamtori;

    // 쿨타임 감소
    if (this.nailCooldown > 0) this.nailCooldown -= dt;
    if (this.knifeCooldown > 0) this.knifeCooldown -= dt;
    if (this.teleportDelay > 0) this.teleportDelay -= dt;

    // 1. 순간이동 실행 (손톱 투척 후 딜레이)
    if (this.canTeleport && this.nailProjectile && this.teleportDelay <= 0) {
      this.progress = this.nailProjectile.targetProgress;
      this.updatePosition();
      this.canTeleport = false;
      EffectSystem.addShockwave(this.x, this.y, 40, 'rgba(255, 136, 0, 0.5)');
      ParticleSystem.burst(this.x, this.y, 8, {
        speed: 60, size: 3, color: '#ff8800',
        maxLife: 300, gravity: 20
      });
      this.nailProjectile = null;
    }

    // 2. 손톱 투척 → 순간이동 준비
    if (this.nailCooldown <= 0 && !this.canTeleport) {
      const teleportProgress = Math.min(this.progress + 0.15, 0.95);
      const targetPos = PathSystem.getPositionAt(teleportProgress);

      this.nailProjectile = {
        x: targetPos.x, y: targetPos.y,
        targetProgress: teleportProgress
      };
      this.canTeleport = true;
      this.teleportDelay = 600; // 0.6초 후 순간이동
      this.nailCooldown = data.nailThrowCooldown;

      EffectSystem.addProjectile(
        this.x, this.y, targetPos.x, targetPos.y,
        '#ff8800', 400, 0
      );
      EffectSystem.addTextPop(this.x, this.y - 20, '손톱!', '#ff8800');
    }

    // 3. 칼 공격 (근처 타워 마비)
    if (this.knifeCooldown <= 0) {
      const towers = Game.state.towers;
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        if (Utils.dist(this.x, this.y, t.x, t.y) <= data.knifeRange) {
          t.paralyzed = true;
          t.paralyzeTimer = data.paralyzeDuration;
          this.knifeCooldown = data.knifeCooldown;
          EffectSystem.addTextPop(t.x, t.y - 20, '마비!', '#ff4444');
          EffectSystem.addShockwave(t.x, t.y, 30, 'rgba(255, 50, 50, 0.4)');
          break;
        }
      }
    }
  }

  // 타워 공격 AI: 가까운 타워를 때려서 파괴
  updateTowerAttack(dt) {
    const data = ENEMY_DATA[this.type];
    if (!data.towerAttackDamage) return;

    if (this.towerAttackTimer > 0) {
      this.towerAttackTimer -= dt;
      return;
    }

    const towers = Game.state.towers;
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      if (!t.alive) continue;
      const d = Utils.dist(this.x, this.y, t.x, t.y);
      if (d <= data.towerAttackRange) {
        t.takeDamage(data.towerAttackDamage);
        this.towerAttackTimer = data.towerAttackCooldown;
        EffectSystem.addShockwave(t.x, t.y, 25, 'rgba(255, 80, 80, 0.4)');
        break;
      }
    }
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

    // 방패 시각 효과
    if (this.hasShield && this.shieldHp > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(100, 150, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, s / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 햄토리 주황색 테두리
    if (this.isHamtori) {
      const pulse = 1 + Math.sin(this.wobbleTime * 2) * 0.05;
      ctx.save();
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 6;
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

    // 방패 HP 바 (파란색, HP 바 아래)
    if (this.hasShield && this.shieldHp > 0) {
      const maxShield = ENEMY_DATA[this.type].shieldHp || 1;
      const shieldRatio = this.shieldHp / maxShield;
      const sby = by + barH + 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(bx, sby, barW, 4, 2);
      ctx.fill();
      ctx.fillStyle = '#6688ff';
      ctx.beginPath();
      ctx.roundRect(bx + 1, sby + 1, (barW - 2) * shieldRatio, 2, 1);
      ctx.fill();
    }
  }
}
