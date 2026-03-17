// ============================================================
// path-system.js - 경로 시스템
// 적 이동 경로 관리, 렌더링, 위치 계산
// ============================================================

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
