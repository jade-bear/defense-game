# 3D 캐릭터 디자인 명세서

> 작성일: 2026-02-18
> 작성자: 디자이너 에이전트
> 목적: 아이가 직접 만든 원본 캐릭터 이미지를 3D 게임 스타일로 재디자인하기 위한 상세 가이드

---

## 목차
1. [공통 디자인 방향](#1-공통-디자인-방향)
2. [구슬이 (일반)](#2-구슬이-일반)
3. [각성 구슬이](#3-각성-구슬이)
4. [먹방이 (일반)](#4-먹방이-일반)
5. [각성 먹방이](#5-각성-먹방이)
6. [불검이 (일반)](#6-불검이-일반)
7. [각성 불검이](#7-각성-불검이)
8. [총검이](#8-총검이)
9. [악당좀비 (적 유닛)](#9-악당좀비-적-유닛)
10. [각성 카드 디자인](#10-각성-카드-디자인)
11. [누락 캐릭터: 각성 총검이](#11-누락-캐릭터-각성-총검이)

---

## 1. 공통 디자인 방향

### 레퍼런스 스타일
- **클래시 로얄 / 브롤스타즈** 수준의 귀엽고 볼륨감 있는 3D 렌더링
- 머리가 크고 몸이 작은 **치비(chibi) 2.5~3등신** 비율
- 서브서피스 스캐터링이 적용된 부드러운 피부/재질감
- 선명한 외곽선(rim light)으로 실루엣 강조

### 공통 기술 사양
| 항목 | 사양 |
|------|------|
| 렌더링 스타일 | Stylized 3D, hand-painted 질감 |
| 등신 비율 | 2.5~3등신 (머리 크게) |
| 폴리곤 목표 | 로우폴리 (3,000~5,000 tri) |
| 텍스처 해상도 | 512x512 (디퓨즈 + 노멀 + 이미시브) |
| 배경 | 투명 (PNG) |
| 출력 해상도 | 512x512 (원본), 128x128 (UI), 64x64 (게임 내) |
| 라이팅 | 3점 조명 (키, 필, 림), 따뜻한 톤 |
| 카메라 앵글 | 약간 위에서 내려다보는 3/4뷰 (isometric 느낌) |

### 색상 팔레트 통일 규칙
- 불/화염 계열: #FF4400 ~ #FFD700 (주황-노랑 그라데이션)
- 마법/오라 계열: #8B00FF ~ #FF00FF (보라-핑크)
- 어둠/적 계열: #1A1A2E ~ #4A0E0E (짙은 남색-암적색)
- 강조색: #00BFFF (파란 구슬), #FFD700 (금색 하이라이트)

---

## 2. 구슬이 (일반)

### 원본 분석
- **몸체**: 불꽃 형태의 머리/상체, 노란색-주황색 화염이 타오르는 형상
- **코어**: 중앙에 하트 모양의 붉은 코어(얼굴 역할), 화난 듯한 눈매
- **구슬**: 주변에 6개의 구슬이 궤도를 그리며 떠다님 (파란색 3개 + 주황/빨간색 3개)
- **다리**: 보라색의 각진 다리 4개 (크리스탈/광물 질감)
- **이펙트**: 불꽃 파티클이 사방으로 흩날림, 바닥에 용암/화염 웅덩이
- **전체 색감**: 따뜻한 오렌지-레드 톤, 어두운 배경 대비 강렬한 발광

### 3D 변환 시 유지할 핵심 요소
1. 불꽃 형태의 상체 실루엣 (둥글게 타오르는 형태)
2. 중앙의 하트형 붉은 코어 (이미시브 발광 처리)
3. 주변을 도는 파란/주황 구슬 6개 (각각 유리 재질, 반투명)
4. 보라색 크리스탈 다리 (각진 기하학적 형태)
5. 불꽃 파티클 이펙트

### 3D 모델링 상세 명세

#### 메시 구조
- **상체(불꽃)**: 스무딩된 구체 기반, 위로 갈수록 뾰족한 불꽃 실루엣. 셰이더로 화염 애니메이션 표현
- **코어(하트)**: 하트 형태의 별도 메시, 이미시브 맵으로 붉은 발광. 눈은 검은색으로 조각
- **구슬(6개)**: 완전한 구체, 유리/크리스탈 재질. 파란색 3개(#0066FF 계열), 주황색 3개(#FF6600 계열). 각 구슬 주변에 작은 에너지 궤적 이펙트
- **다리(4개)**: 사각 기둥 기반, 보라색(#6B2FA0) 크리스탈 텍스처. 바닥으로 갈수록 넓어지는 형태

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 불꽃 상체 | 반투명 이미시브 | #FF8800 -> #FFD700 | 화염 셰이더, 흔들림 애니메이션 |
| 하트 코어 | 이미시브 글로우 | #FF0033 | 맥박처럼 밝기 변동 |
| 파란 구슬 | 유리/크리스탈 | #0055FF | 프레넬 반사, 내부 소용돌이 |
| 주황 구슬 | 유리/크리스탈 | #FF6600 | 프레넬 반사, 내부 화염 |
| 보라 다리 | 크리스탈/광물 | #6B2FA0 | 표면 반짝임, 각진 반사 |

### AI 이미지 생성 프롬프트

#### Midjourney / DALL-E 프롬프트
```
3D rendered chibi game character, "Guseuli" fire elemental tower unit,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

Main body is a blazing flame shape (orange-yellow fire) with a glowing red
heart-shaped core in the center acting as the face with angry small eyes,

6 magical orbs floating in orbit around the body - 3 blue crystal orbs and
3 orange fire orbs, each with energy trails,

4 angular purple crystal legs supporting the body,

Fire particle effects scattered around, warm orange-red color palette,
emissive glow effects on the core and orbs,

Isometric 3/4 view from slightly above, transparent background,
game asset style, clean render, soft rim lighting,

--ar 1:1 --s 750 --q 2
```

---

## 3. 각성 구슬이

### 원본 분석
- **몸체**: 일반 구슬이보다 더 크고 강렬한 화염 몸체, 전체적으로 붉은색 톤이 강해짐
- **코어**: 하트 코어가 더 크고 밝은 빨간색, 흰색 발광점이 중앙에 있음
- **구슬**: 빨간색 구슬 3개 + 보라색 구슬 3개로 변경, 각 구슬에 번개/전기 이펙트 추가
- **다리**: 금색으로 변경, 번개 형태의 날카로운 다리
- **이펙트**: 전체적으로 더 격렬한 화염, 배경 전체가 붉은 불바다, 구슬 주변에 전기 아크
- **색감 변화**: 오렌지 -> 딥레드+골드 톤으로 격상

### 3D 변환 시 유지할 핵심 요소
1. 더 강렬하고 큰 화염 상체 (빨간색 톤 강화)
2. 더 크고 밝게 발광하는 하트 코어 (흰색 중심점)
3. 빨간+보라색 구슬 조합 (전기 이펙트 추가)
4. 금색 번개 형태 다리 (각성 진화 표현)
5. 전체적으로 더 화려한 파티클 이펙트

### 3D 모델링 상세 명세

#### 메시 구조
- **상체(화염)**: 일반 구슬이 대비 1.3배 크기, 더 격렬한 화염 실루엣. 불꽃 끝부분이 더 높이 치솟음
- **코어(하트)**: 1.5배 크기, 중앙에 화이트 글로우 포인트 추가. 맥박 애니메이션 더 빠르게
- **구슬(6개)**: 빨간색 3개(#CC0000) + 보라색 3개(#7700CC). 각 구슬 주변에 전기 아크 이펙트
- **다리(4개)**: 금색(#FFD700) 번개 형태, 날카롭고 역동적인 지그재그 실루엣

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 화염 상체 | 강한 이미시브 | #CC0000 -> #FF4400 | 더 격렬한 화염 셰이더 |
| 하트 코어 | 초강도 이미시브 | #FF0000 (중심 #FFFFFF) | 강한 블룸, 빠른 맥박 |
| 빨간 구슬 | 이미시브 크리스탈 | #CC0000 | 전기 아크 + 내부 화염 |
| 보라 구슬 | 이미시브 크리스탈 | #7700CC | 전기 아크 + 마법 소용돌이 |
| 금색 다리 | 금속(골드) | #FFD700 | 표면 번개 텍스처, 발광 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Awakened Guseuli" evolved fire elemental,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

EVOLVED VERSION - larger and more intense than base form,
Main body is a massive blazing flame (deep red to crimson fire),
Glowing enlarged red heart core in center with bright white glow point,
Angry powerful eyes,

6 magical orbs in orbit - 3 crimson red orbs and 3 deep purple orbs,
each surrounded by electric arc effects and lightning trails,

4 golden lightning-bolt shaped legs, jagged and dynamic,

Intense fire particle effects everywhere, electric sparks,
deep red and gold color palette, powerful aura,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 4. 먹방이 (일반)

### 원본 분석
- **몸체**: 검정색의 크고 둥근 구 형태, 매우 단순한 실루엣
- **얼굴**: 작은 노란 눈 2개, 거대한 입(이빨이 날카로움, 위아래 삼각형 이빨)
- **팔**: 짧고 두꺼운 검은 팔 2개, 음식을 움켜쥐고 있음
- **음식**: 양손과 주변에 햄버거, 피자 조각, 도넛, 치킨, 미트볼 등 다양한 음식이 떠다님
- **이펙트**: 음식 주변에 따뜻한 갈색/주황 빛, 바닥에 약한 화염
- **색감**: 검은 몸체 + 다채로운 음식 색상이 대비를 이룸

### 3D 변환 시 유지할 핵심 요소
1. 검정색 둥근 구 형태의 몸체 (심플한 실루엣이 핵심)
2. 거대한 입과 날카로운 삼각형 이빨
3. 주변에 떠다니는 다양한 음식 아이템들
4. 짧고 두꺼운 팔
5. 귀엽지만 약간 무서운 이중적 느낌

### 3D 모델링 상세 명세

#### 메시 구조
- **몸체**: 완전한 구체 기반, 검은색 매트 재질. 약간 찌그러진(squash) 형태로 무게감 표현
- **입**: 몸체 전면 하단 1/3을 차지하는 거대한 입. 위아래로 뾰족한 삼각형 이빨 다수. 입 안은 어두운 빨간색
- **눈**: 작은 노란 원형 2개, 약간 화난/탐욕스러운 표정. 동공은 검은 세로선
- **팔(2개)**: 짧고 통통한 원통형, 3개의 손가락으로 음식을 움켜쥠
- **음식(5~7개)**: 햄버거, 피자, 도넛, 치킨 등 개별 미니 모델. 몸체 주변 궤도에 떠다님

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 몸체 | 매트 고무 질감 | #1A1A1A (진한 검정) | 약간의 서브서피스, 부드러운 반사 |
| 이빨 | 광택 에나멜 | #F5F5DC (상아색) | 날카로운 하이라이트 |
| 입 안쪽 | 매트 | #8B0000 (암적색) | 깊이감 있는 어둠 |
| 눈 | 이미시브 | #FFD700 (노란색) | 약한 발광 |
| 음식들 | 핸드페인트 | 각 음식 고유 색상 | 따뜻한 조명, 맛있어 보이게 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Mukbangi" food monster tower unit,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

Round black sphere body with matte rubber texture,
Huge mouth taking up bottom third of face with sharp triangular teeth
(top and bottom rows), dark red inside mouth,
Two small glowing yellow eyes with greedy expression,

Short stubby black arms grabbing food items,
Multiple food items floating around the body in orbit -
hamburger, pizza slice, donut, fried chicken, meatball,

Warm brown-orange ambient glow around food items,
cute but slightly menacing vibe,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 5. 각성 먹방이

### 원본 분석
- **몸체**: 일반 먹방이보다 훨씬 거대화, 검은 몸체가 화면 대부분을 차지
- **얼굴**: 빨간색으로 변한 눈(분노 표현), 입이 더 크게 벌어짐
- **분출**: 입에서 금빛 액체/에너지를 강력하게 분출 중 (폭포처럼 쏟아짐)
- **팔**: 더 크고 근육질로 변화, 위로 들어올린 위협적 포즈
- **이펙트**: 보라색 오라/에너지 링이 몸체를 감싸고 있음, 바닥에 금빛 액체 웅덩이
- **추가 요소**: 바닥 양쪽에 기절한(x눈) 이모지 얼굴들 (피해를 입은 적 표현)
- **색감 변화**: 검정+금색+보라색의 강렬한 조합

### 3D 변환 시 유지할 핵심 요소
1. 거대화된 몸체 (일반 대비 1.5배)
2. 빨간 눈으로 변한 분노 표정
3. 입에서 분출하는 금빛 에너지 브레스
4. 보라색 오라 링 이펙트
5. 위협적으로 팔을 올린 포즈

### 3D 모델링 상세 명세

#### 메시 구조
- **몸체**: 일반 먹방이의 1.5배 크기 구체, 더 위협적인 실루엣. 어깨 부분이 더 넓어짐
- **입**: 더 크게 벌어진 입, 이빨이 더 날카롭고 많아짐. 입에서 금색 에너지 빔 분출
- **눈**: 빨간색(#FF0000)으로 변경, 더 크고 분노에 찬 표정
- **팔(2개)**: 더 크고 근육질, 위로 치켜든 위협적 포즈. 주먹을 쥔 상태
- **오라**: 보라색 에너지 링 2~3개가 몸체를 감싸며 회전
- **브레스 이펙트**: 입에서 나오는 금색 액체/에너지 폭포

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 몸체 | 매트 고무 + 근육 질감 | #0D0D0D (더 진한 검정) | 보라색 림라이트 강조 |
| 빨간 눈 | 강한 이미시브 | #FF0000 | 밝은 블룸 이펙트 |
| 금빛 브레스 | 반투명 이미시브 | #FFD700 -> #FFA500 | 유체 애니메이션, 강한 발광 |
| 보라 오라 | 반투명 이미시브 | #9B30FF | 회전 애니메이션, 펄스 |
| 이빨 | 광택 에나멜 | #FFFFF0 | 더 날카로운 형태 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Awakened Mukbangi" evolved food monster,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

EVOLVED VERSION - 1.5x larger than base form, more menacing,
Massive round black body with muscular shoulders,
Huge gaping mouth with many sharp teeth,
BRIGHT RED GLOWING EYES with furious expression,

Pouring golden energy beam/liquid from mouth like a waterfall,
Arms raised up in threatening pose with clenched fists,

Purple magical aura rings orbiting around the body,
Golden liquid pooling at the base,
Dark and powerful atmosphere,

Black + gold + purple color palette, intense glow effects,
Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 6. 불검이 (일반)

### 원본 분석
- **머리**: 해골(스켈레톤) 얼굴, 둥근 두개골에 빈 눈구멍(빨간 빛), 이빨 드러남
- **귀/뿔**: 머리 위에 뼈로 된 뿔/귀 같은 돌기 2개
- **날개**: 등 뒤에 핑크/연분홍색 나비 날개 2장 (뼈 해골과 대비되는 귀여운 요소)
- **몸체**: 어두운 갈색/검은색 망토 또는 로브를 입고 있음
- **무기**: 오른손에 거대한 불타는 검(화염검), 금색-주황색 화염이 칼날을 감싸고 있음
- **손**: 붕대/천으로 감싼 듯한 손
- **이펙트**: 칼에서 화염 이펙트, 바닥에 불꽃과 돌 파편
- **색감**: 뼈 베이지 + 검은 로브 + 주황 화염 + 핑크 날개

### 3D 변환 시 유지할 핵심 요소
1. 해골 얼굴 + 빨간 눈빛 (캐릭터 정체성의 핵심)
2. 핑크색 나비 날개 (해골과의 갭 모에가 매력 포인트)
3. 불타는 거대한 검 (주 무기)
4. 어두운 망토/로브
5. 머리 위 뼈 돌기 2개

### 3D 모델링 상세 명세

#### 메시 구조
- **머리**: 둥근 해골 형태, 큰 빈 눈구멍(빨간 발광), 작은 코 구멍, 이빨이 드러난 입. 머리 위 뼈 돌기 2개
- **날개**: 등 뒤 핑크색 나비 날개 2장, 반투명 막 질감. 약간 펄럭이는 애니메이션
- **몸체**: 어두운 로브/망토, 천 시뮬레이션 느낌의 주름. 앞이 열린 형태
- **팔/손**: 로브 소매에서 나온 붕대 감긴 손, 오른손에 화염검을 단단히 쥐고 있음
- **화염검**: 크고 곡선형 칼날, 전체가 불에 타고 있음. 칼자루는 뼈/금속

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 해골 머리 | 뼈 질감 (SSS) | #F5E6C8 (밝은 베이지) | 서브서피스 스캐터링 |
| 눈구멍 | 이미시브 | #FF0000 (빨강) | 불길한 발광, 연기 파티클 |
| 나비 날개 | 반투명 막 | #FFB6C1 (라이트 핑크) | 프레넬, 펄럭임 애니메이션 |
| 로브/망토 | 천 재질 | #2C1810 (다크 브라운) | 주름 노멀맵, 바람 시뮬레이션 |
| 화염검 칼날 | 금속 + 이미시브 | #FF6600 -> #FFD700 | 화염 셰이더, 이미시브 |
| 칼자루 | 뼈/금속 | #8B7355 | 낡은 금속 질감 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Bulgummi" skeleton fire swordsman,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

Cute round skeleton head with empty eye sockets glowing red,
teeth showing in a grin, two bone horn protrusions on top of head,

PINK BUTTERFLY WINGS on the back - translucent and delicate
(contrast with the skeleton is the charm point),

Wearing dark brown tattered robe/cloak,
Bandage-wrapped hands wielding a MASSIVE FLAMING SWORD
in the right hand - golden-orange fire engulfing the curved blade,

Fire particles around the sword, stone debris on ground,
bone beige + dark brown + orange fire + pink wings color palette,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 7. 각성 불검이

### 원본 분석
- **머리**: 붉은색 악마/가면 형태로 변화, 더 사악하고 날카로운 표정. 노란 발광 눈
- **날개**: 핑크 나비날개에서 짙은 적갈색/검은색 불꽃 날개로 진화 (여러 겹의 큰 날개)
- **몸체**: 더 어둡고 날렵한 실루엣, 갑옷 느낌 추가
- **무기**: 더 크고 강력한 불검, 화염이 더 격렬하게 타오름
- **이펙트**: 전체 화면이 화염으로 가득, 배경 전체가 불바다
- **색감 변화**: 핑크 날개 -> 적갈색 화염 날개, 전체적으로 더 어둡고 강렬

### 3D 변환 시 유지할 핵심 요소
1. 붉은 악마/가면 형태의 머리 (해골에서 진화)
2. 거대한 화염 날개 (나비날개에서 진화한 형태)
3. 더 크고 강력한 불검
4. 노란 발광 눈
5. 전체적으로 더 어둡고 위협적인 분위기

### 3D 모델링 상세 명세

#### 메시 구조
- **머리**: 붉은 가면/악마 형태. 뾰족한 귀/뿔이 더 크게 성장. 노란 발광 눈, 사악한 이빨
- **날개**: 크고 여러 겹의 화염 날개. 나비 형태 유지하되 불꽃 이펙트로 변환. 적갈색+검은색
- **몸체**: 날렵하고 갑옷 느낌이 추가된 로브, 검은색+붉은색 포인트
- **무기**: 1.5배 크기의 불검, 칼날 전체가 백열 수준으로 타오름. 화염 트레일 추가
- **이펙트**: 발밑에서 솟아오르는 화염 기둥, 전신에서 불꽃 파티클

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 악마 머리 | 매트+이미시브 | #8B0000 (다크 레드) | 표면에 균열 발광 패턴 |
| 노란 눈 | 강한 이미시브 | #FFD700 | 블룸, 눈에서 불꽃 트레일 |
| 화염 날개 | 반투명 이미시브 | #CC3300 -> #000000 | 화염 애니메이션, 큰 스케일 |
| 갑옷 로브 | 금속+천 | #1A0505 + #CC0000 포인트 | 날렵한 실루엣, 금속 반사 |
| 강화 불검 | 백열 금속+이미시브 | #FFFFFF -> #FF4400 | 극강 화염 셰이더, 열기 왜곡 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Awakened Bulgummi" evolved demon fire knight,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

EVOLVED VERSION - darker and more powerful,
Red demon mask/face head with sharp horns grown larger,
Bright yellow glowing eyes with menacing expression, sharp fangs,

MASSIVE FLAME WINGS replacing the butterfly wings - multi-layered,
dark crimson and black fire wing spread wide,

Sleek dark armor-robe hybrid, black with red accents,
Wielding an ENORMOUS WHITE-HOT FLAMING SWORD 1.5x bigger than base,
Blade glowing white to orange with intense fire trail,

Fire pillars rising from below, fire particles everywhere,
dark red + black + yellow eyes color palette, overwhelming power,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 8. 총검이

### 원본 분석
- **머리**: 빨간색 뾰족한 머리카락/불꽃 머리 (화난 표정의 빨간 눈, 인상 쓴 표정)
- **몸체**: 노란색/금색의 작고 둥근 몸체, 조끼 또는 상의를 입고 있음
- **무기 (이중)**: 오른손에 검은색 권총, 왼손에 전투용 나이프/단검
- **다리**: 짧고 튼튼한 다리
- **이펙트**: 총에서 발사 이펙트(섬광+탄피), 칼에서 금속 광택, 주변에 탄피가 날아다님
- **전체 느낌**: 작지만 화력이 센 전투형 캐릭터, 액션 영웅 느낌
- **색감**: 빨간 머리 + 노란 몸체 + 검은 무기

### 3D 변환 시 유지할 핵심 요소
1. 빨간색 뾰족한 스파이크 머리 (가장 눈에 띄는 특징)
2. 이중 무기: 한 손에 총 + 한 손에 칼 (캐릭터 이름의 유래)
3. 노란/금색 몸체
4. 빨간 눈의 화난 표정
5. 총 발사 이펙트와 날아다니는 탄피

### 3D 모델링 상세 명세

#### 메시 구조
- **머리**: 둥근 얼굴 위에 빨간색 뾰족한 스파이크 헤어(5~7개 뾰족). 화난 빨간 눈, 인상 쓴 입
- **몸체**: 노란색 둥글고 작은 몸체, 위에 조끼/전투복 느낌의 의상
- **오른팔+총**: 검은색 반자동 권총을 쥔 오른손, 총구에서 발사 섬광
- **왼팔+칼**: 전투용 나이프를 역수로 쥔 왼손, 칼날에 금속 광택
- **다리**: 짧고 튼튼한 다리, 전투 부츠
- **이펙트**: 탄피 5~6개 공중에 흩날림, 총구 화염

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 스파이크 머리 | 매트+광택 | #CC0000 (선홍) | 끝부분 밝은 주황 그라데이션 |
| 빨간 눈 | 이미시브 | #FF0000 | 약한 발광 |
| 몸체/의상 | 천+가죽 | #FFD700 (금색) | 전투복 디테일, 벨트 |
| 권총 | 금속(건메탈) | #2C2C2C (다크 그레이) | 금속 반사, 총구 발광 |
| 나이프 | 금속(스틸) | #C0C0C0 (은색) | 날카로운 엣지 하이라이트 |
| 탄피 | 금속(브라스) | #B8860B (황동) | 공중에 흩날리는 파티클 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Chonggummi" dual-wielding gunblade fighter,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

Round face with RED SPIKY HAIR (5-7 sharp spikes pointing up and outward),
Angry red glowing eyes with fierce frowning expression,

Small round GOLDEN/YELLOW body wearing a combat vest,
Short sturdy legs with combat boots,

RIGHT HAND holding a black semi-automatic pistol with muzzle flash,
LEFT HAND holding a combat knife in reverse grip with metallic shine,

Brass bullet casings flying through the air around the character,
gun smoke and flash effects,

Red hair + yellow body + black weapons color palette,
action hero energy, small but powerful vibe,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 9. 악당좀비 (적 유닛)

### 원본 분석
- **전체 스타일**: 아이가 크레용/색연필로 직접 그린 듯한 독특한 그림체 (다른 캐릭터와 톤이 다름)
- **머리**: 둥근 해골 얼굴, 빨간 빛나는 눈, 이빨 드러남. 머리 위에 뼈 돌기 2개
- **날개**: 등 뒤에 작은 나비/곤충 날개 (핑크빛, 불검이의 날개와 유사)
- **몸체**: 갈색/누런색의 낡은 옷(갑옷?), 불검이와 비슷한 실루엣
- **무기**: 한 손에 도끼를 들고 있음 (금속 회색 날 + 나무 자루)
- **배경**: 붉은색/주황색 소용돌이 배경 (크레용 터치)
- **관계**: 불검이와 매우 유사한 디자인 -> 불검이의 적 버전/타락 버전으로 보임

### 3D 변환 시 유지할 핵심 요소
1. 해골 얼굴 (불검이와 유사하지만 더 거칠고 사악함)
2. 작은 나비 날개 (찢어지거나 손상된 느낌으로 차별화)
3. 도끼 무기 (불검이의 검과 대비)
4. 크레용 느낌의 거친 질감을 3D에서는 '낡고 부패한' 느낌으로 해석
5. 불검이의 적 버전이라는 관계성 유지

### 3D 모델링 상세 명세

#### 메시 구조
- **머리**: 불검이와 비슷한 해골이지만 더 거칠고 울퉁불퉁. 금이 간 두개골, 빨간 눈, 이빨이 더 불규칙. 머리 위 뼈 돌기 2개(부러진 느낌)
- **날개**: 불검이 나비날개의 손상된 버전, 찢어지고 색이 바랜 날개. 어두운 핑크/회색
- **몸체**: 낡고 찢어진 갈색 갑옷/옷, 부패한 느낌. 불검이 로브의 타락 버전
- **무기(도끼)**: 무겁고 투박한 전투 도끼. 녹슬고 핏자국이 묻은 금속 날, 거친 나무 자루
- **다리**: 짧고 불규칙한 형태, 뼈가 드러난 부분 있음

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 해골 머리 | 낡은 뼈 | #D4C5A0 (탁한 베이지) | 균열 텍스처, 때 묻은 느낌 |
| 빨간 눈 | 이미시브 | #FF0000 | 불안정한 깜빡임 |
| 손상된 날개 | 반투명 막 | #9E7E7E (바랜 핑크) | 찢어진 구멍, 탈색 |
| 낡은 갑옷 | 낡은 천+가죽 | #8B7355 (갈색) | 찢어짐, 얼룩, 부패 |
| 도끼 날 | 녹슨 금속 | #6B4C3B (녹슨 갈색) | 녹 텍스처, 핏자국 |
| 도끼 자루 | 거친 나무 | #5C4033 (다크 브라운) | 나무결, 갈라짐 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Villain Zombie" enemy unit,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

Round cracked SKELETON HEAD similar to Bulgummi but rougher and more evil,
Red glowing eyes, irregular sharp teeth, two broken bone protrusions on head,

DAMAGED TATTERED BUTTERFLY WINGS on back - torn holes, faded dark pink/grey,
(corrupted version of Bulgummi's wings),

Wearing OLD TATTERED BROWN ARMOR/CLOTHING, decayed and ripped,
Bones partially visible through torn fabric,

Wielding a HEAVY RUSTY BATTLE AXE - corroded metal blade with
blood stains, rough wooden handle,

Dirty and menacing appearance, undead zombie warrior vibe,
muted brown + faded pink + rust color palette,

Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 10. 각성 카드 디자인

각성 카드는 캐릭터를 각성시키기 위한 재료 아이템으로, UI에서 아이콘으로 사용됩니다.

### 10-1. 구슬카드
- **원본**: 보라색 에너지 배경, 금속 프레임 카드 위에 반투명 보라색 구슬 다수(10개 이상)가 빛나고 있음
- **핵심 요소**: 보라색 마법 구슬들, 전기/에너지 이펙트, 고풍스러운 금속 카드 프레임
- **3D 프롬프트**:
```
3D rendered magical card item, purple crystal orbs card,
Ornate metal frame card floating at an angle,
Multiple glowing purple crystal spheres on the card surface,
Purple lightning and energy effects surrounding the card,
Magical aura, fantasy RPG item style,
Transparent background, 128x128 game UI icon,
--ar 1:1 --s 750
```

### 10-2. 입카드 (먹방이 각성)
- **원본**: 금색 에너지 배경, 카드 중앙에 거대한 입(이빨+혀)이 있는 원형 심볼, 금빛 액체 분출
- **핵심 요소**: 거대한 입 심볼, 금색 에너지, 나무/금속 카드 프레임
- **3D 프롬프트**:
```
3D rendered magical card item, golden mouth card,
Ornate wooden-metal frame card floating at an angle,
Central emblem showing a large mouth with sharp teeth and tongue,
Golden energy and liquid bursting from the card,
Hungry powerful aura, fantasy RPG item style,
Transparent background, 128x128 game UI icon,
--ar 1:1 --s 750
```

### 10-3. 불카드 (불검이 각성)
- **원본**: 화염 배경, 카드 중앙에 붉은 불꽃 검/삼지창 심볼, 카드 프레임에서 화염 분출
- **핵심 요소**: 불꽃 무기 심볼, 화염 이펙트, 타는 듯한 카드 프레임
- **3D 프롬프트**:
```
3D rendered magical card item, fire blade card,
Burning wooden frame card floating at an angle,
Central emblem showing a red flame sword/trident symbol,
Fire and embers erupting from the card edges,
Fiery powerful aura, fantasy RPG item style,
Transparent background, 128x128 game UI icon,
--ar 1:1 --s 750
```

### 10-4. 총칼카드 (총검이 각성)
- **원본**: 화염 배경, 카드 중앙에 권총+전투 나이프가 X자로 교차된 심볼
- **핵심 요소**: 총+칼 교차 심볼, 화염 이펙트, 전투적 분위기
- **3D 프롬프트**:
```
3D rendered magical card item, gun and blade card,
Burning metal frame card floating at an angle,
Central emblem showing a crossed pistol and combat knife,
Fire and sparks erupting from the card,
Fierce combat aura, fantasy RPG item style,
Transparent background, 128x128 game UI icon,
--ar 1:1 --s 750
```

---

## 11. 각성 총검이

### 원본 분석
- **머리**: 빨간 스파이크 머리가 더 크고 격렬하게 타오름, 불꽃처럼 활활 번지는 형태. 빨간 발광 눈, 더욱 사나운 표정
- **몸체**: 노란색에서 **검은색/다크그레이 중장갑 전투 아머**로 완전히 변경. 무겁고 단단한 느낌
- **무기 (대폭 강화)**:
  - 오른손: 권총에서 **거대한 개틀링건(미니건, 다중 회전 총열)**으로 업그레이드! 몸체보다 큰 사이즈
  - 왼손: 나이프에서 **대형 마체테/전투도**로 업그레이드, 날이 넓고 길어짐
- **이펙트**: 개틀링건 총구에서 불꽃 발사, 탄피가 대량으로 날아다님, 뒤쪽에 폭발 이펙트
- **색감 변화**: 노란 몸체 → 검은 중장갑, 무기가 압도적으로 거대해짐
- **전체 느낌**: 작은 몸에 거대한 중화기를 든 미니건 병사, 압도적 화력의 최종 형태

### 3D 변환 시 유지할 핵심 요소
1. 더 크고 격렬하게 타오르는 빨간 스파이크 머리
2. 검은색 중장갑 전투 아머 (노란색에서 완전히 변신)
3. **거대한 개틀링건/미니건** (캐릭터 몸체보다 큰 사이즈 - 핵심 포인트!)
4. 대형 마체테/전투도 (나이프에서 대폭 업그레이드)
5. 대량의 탄피와 총구 화염 이펙트

### 3D 모델링 상세 명세

#### 메시 구조
- **머리**: 일반 총검이보다 1.5배 큰 스파이크 헤어, 끝부분이 실제 불꽃처럼 흔들림. 빨간 발광 눈이 더 강렬해짐
- **몸체**: 검은색/다크 그레이 중장갑 전투 아머. 어깨 장갑, 가슴판, 벨트 등 디테일 추가. 무거운 느낌
- **오른팔+개틀링건**: 6개 총열의 회전식 미니건, 몸체 크기와 맞먹는 거대한 사이즈. 총열 회전 표현, 총구에서 발사 화염
- **왼팔+마체테**: 넓고 긴 전투용 마체테, 날에 약간의 톱니 디테일. 일반 나이프의 3배 크기
- **다리**: 무거운 전투 부츠, 장갑이 달린 형태
- **이펙트**: 탄피 10개 이상 공중에 흩날림, 총구 화염, 배경 폭발 이펙트

#### 재질/텍스처
| 파트 | 재질 | 색상 | 특수 효과 |
|------|------|------|-----------|
| 스파이크 머리 | 이미시브+매트 | #CC0000 -> #FF4400 | 끝부분 화염 애니메이션, 더 격렬 |
| 빨간 눈 | 강한 이미시브 | #FF0000 | 강한 블룸, 눈에서 빛 트레일 |
| 중장갑 아머 | 금속+매트 | #2C2C2C (다크 그레이) | 금속 반사, 스크래치 흔적, 어깨 장갑 |
| 개틀링건 | 금속(건메탈) | #3A3A3A + #1A1A1A | 총열 회전 애니메이션, 총구 발광 |
| 마체테 | 금속(스틸) | #A0A0A0 (밝은 은색) | 날카로운 엣지 하이라이트, 넓은 날 |
| 탄피 | 금속(브라스) | #B8860B (황동) | 대량 파티클, 회전하며 흩날림 |
| 전투 부츠 | 가죽+금속 | #1A1A1A | 무거운 질감, 금속 보호대 |

### AI 이미지 생성 프롬프트
```
3D rendered chibi game character, "Awakened Chonggummi" evolved heavy gunner,
2.5 head-to-body ratio, cute stylized 3D like Clash Royale / Brawl Stars,

EVOLVED VERSION - massively upgraded firepower,
RED FLAME-LIKE SPIKY HAIR grown much larger and literally blazing like fire,
Bright red glowing eyes with fierce battle-hardened expression,

Body completely changed from yellow to DARK GREY/BLACK HEAVY COMBAT ARMOR,
shoulder pads, chest plate, armored boots - heavy soldier look,

RIGHT HAND wielding a MASSIVE GATLING GUN / MINIGUN with 6 rotating barrels,
the gun is as big as the character's body, muzzle flash firing,

LEFT HAND holding a LARGE MACHETE / COMBAT CLEAVER,
wide heavy blade 3x bigger than the original knife,

Massive amount of brass bullet casings flying through the air,
muzzle fire, explosion effects in background,
overwhelming firepower from a tiny body,

Red hair + black armor + gunmetal weapons color palette,
Isometric 3/4 view, transparent background, game asset,
--ar 1:1 --s 750 --q 2
```

---

## 부록: 애니메이션 가이드

### 공통 애니메이션 (모든 캐릭터)
| 상태 | 애니메이션 | 프레임 수 |
|------|-----------|-----------|
| 대기(Idle) | 가볍게 위아래 부유/호흡 | 30fps, 2초 루프 |
| 공격(Attack) | 무기/능력 사용 모션 | 30fps, 0.5초 |
| 각성(Awaken) | 빛남 -> 변신 이펙트 | 30fps, 1.5초 |
| 배치(Place) | 위에서 착지 + 먼지 이펙트 | 30fps, 0.5초 |

### 캐릭터별 고유 애니메이션
| 캐릭터 | Idle 특징 | Attack 특징 |
|--------|-----------|-------------|
| 구슬이 | 구슬들이 천천히 궤도 회전 | 구슬 발사 (한 개씩) |
| 먹방이 | 입을 오물오물 | 거대한 입으로 물어뜯기 |
| 불검이 | 날개 펄럭 + 검 화염 흔들림 | 검 크게 휘두르기 |
| 총검이 | 총 돌리기(건스핀) | 총 발사 + 칼 베기 콤보 |
| 악당좀비 | 도끼를 질질 끌며 서성임 | 도끼 크게 내려치기 |

---

## 부록: 파일 명명 규칙

### 3D 결과물 파일명
```
05._image/3d/3d_구슬이.png
05._image/3d/3d_각성구슬이.png
05._image/3d/3d_먹방이.png
05._image/3d/3d_각성먹방이.png
05._image/3d/3d_불검이.png
05._image/3d/3d_각성불검이.png
05._image/3d/3d_총검이.png
05._image/3d/3d_각성총검이.png
05._image/3d/3d_악당좀비.png
05._image/3d/3d_구슬카드.png
05._image/3d/3d_입카드.png
05._image/3d/3d_불카드.png
05._image/3d/3d_총칼카드.png
```

### 사이즈별 폴더 구조
```
05._image/3d/512/    ← 고해상도 원본 (512x512)
05._image/3d/128/    ← UI/카드용 (128x128)
05._image/3d/64/     ← 게임 내 배치용 (64x64)
05._image/3d/48/     ← 적 유닛/카드 아이콘용 (48x48)
```
