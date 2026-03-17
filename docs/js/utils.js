// ============================================================
// utils.js - 유틸리티 함수 모음
// 순수 계산 함수만 포함 (의존성 없음)
// ============================================================

const Utils = {
  // 두 점 사이 거리
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 점에서 선분까지 최소 거리
  pointToSegmentDist(px, py, ax, ay, bx, by) {
    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));
    return this.dist(px, py, ax + t * abx, ay + t * aby);
  },

  // 경로 위인지 체크 (타워 설치 불가 영역)
  isOnPath(x, y, waypoints) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = this.pointToSegmentDist(
        x, y,
        waypoints[i].x, waypoints[i].y,
        waypoints[i + 1].x, waypoints[i + 1].y
      );
      if (d < CONFIG.PATH_BLOCK_DIST) return true;
    }
    return false;
  },

  // UI 영역인지 체크
  isInUIArea(y) {
    return y < CONFIG.HUD_HEIGHT || y > CONFIG.HEIGHT - CONFIG.UI_BAR_HEIGHT;
  }
};
