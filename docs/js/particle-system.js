// ============================================================
// particle-system.js - 파티클 시스템
// 범용 파티클 물리 시뮬레이션 (독립 모듈)
// ============================================================

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
