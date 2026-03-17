// ============================================================
// map-renderer.js - 맵 렌더링
// 맵별 배경, 장식, 파티클 효과 렌더링
// ============================================================

const MapRenderer = {
  // 맵 전용 파티클 (ParticleSystem과 별도 관리)
  mapParticles: [],

  // 맵별 배경 그리기
  renderBackground(bgCtx, mapId, mapData) {
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
  renderDecorations(bgCtx, mapId, mapData) {
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
  renderParticles(ctx) {
    const currentMap = PathSystem.currentMap;
    if (!currentMap || !currentMap.mapData.particleEffect) return;

    const effect = currentMap.mapData.particleEffect;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;
    const maxMapParticles = 30; // 맵 파티클 최대 수 (성능 보호)

    // 새 파티클 생성 (프레임당 확률적)
    if (this.mapParticles.length < maxMapParticles && Math.random() < 0.15) {
      switch (effect) {
        case 'fire': {
          // 경로 위에서 작은 불꽃이 위로 올라감
          const wp = PathSystem.waypoints;
          const idx = Math.floor(Math.random() * (wp.length - 1));
          const t = Math.random();
          const px = wp[idx].x + (wp[idx + 1].x - wp[idx].x) * t;
          const py = wp[idx].y + (wp[idx + 1].y - wp[idx].y) * t;
          this.mapParticles.push({
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
          this.mapParticles.push({
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
          this.mapParticles.push({
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
    this.mapParticles = this.mapParticles.filter(p => {
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
  }
};
