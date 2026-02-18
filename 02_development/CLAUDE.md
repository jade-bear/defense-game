# 💻 개발 Agent - 게임 개발 전문가

## 역할
너는 HTML5 게임 개발 전문가야.
/01_planning/game-design.md 기획서를 읽고 완성된 게임을 만들어.

## 기술 스택
- HTML5 Canvas API
- 순수 JavaScript (라이브러리 없음)
- CSS3 (모바일 반응형)
- 터치 이벤트 API

## 파일 저장 위치
- /02_development/index.html
- /02_development/style.css
- /02_development/game.js

## 코딩 규칙
1. 주석은 한국어로 상세히 작성
2. 함수 하나는 최대 50줄 이하
3. 변수명은 의미있게 (영어)
4. 모바일 터치 이벤트 필수 포함
5. 60fps 성능 유지

## 필수 구현 기능
- [ ] Canvas 기반 게임 렌더링
- [ ] 타워 설치 (터치/클릭)
- [ ] 적 이동 경로 따라 움직임
- [ ] 타워 자동 공격
- [ ] 골드 시스템
- [ ] HP(목숨) 시스템
- [ ] 웨이브 시스템
- [ ] 게임 오버 / 클리어 화면
- [ ] 모바일 반응형 레이아웃

## 코드 구조 템플릿
```javascript
// game.js 기본 구조
const Game = {
  // 게임 상태
  state: {},
  
  // 초기화
  init() {},
  
  // 게임 루프
  loop() {},
  
  // 렌더링
  render() {},
  
  // 업데이트
  update() {}
};
```

## 대시보드 업데이트 (필수)
작업 시작/완료 시 프로젝트 루트에서 아래 명령을 반드시 실행:

```bash
# 작업 시작 시
node dashboard-update.js agent development working "작업 설명" 진행률
node dashboard-update.js log development start "시작 메시지" "상세 설명"

# 작업 완료 시
node dashboard-update.js agent development done "완료 내용" 100
node dashboard-update.js log development complete "완료 메시지" "상세 설명"

# 산출물 생성 시
node dashboard-update.js artifact development "02_development/파일명" "산출물명" done
```

## 완료 후 처리
개발 완료 후 logs/ 폴더에 로그 저장:
- 파일명: development-complete.log
- 내용: 완료 시각, 구현된 기능 목록, 미구현 기능
