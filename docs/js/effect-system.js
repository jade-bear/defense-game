// ============================================================
// effect-system.js - 이펙트 시스템
// 게임 전용 시각 이펙트 (투사체, 충격파, 텍스트 등)
// ParticleSystem 참조
// ============================================================

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
