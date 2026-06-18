# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 정보 AI 학습 플랫폼 — 목업 제작 프로젝트

## 프로젝트 핵심 원칙
**이 플랫폼은 정보 교과(중·고등) 특화 AI 코스웨어다.**
**실습(코딩) 기능이 핵심 차별점이며 최우선 순위다.**
모든 화면 설계·구현에서 실습 관련 UI를 가장 눈에 띄고 접근하기 쉽게 처리할 것.

---

## 참고 문서

| 파일 | 용도 |
|------|------|
| `정보AI학습플랫폼_서비스기획_통합_v3.pptx` | 전체 기획 (MVP → 기능명세 요약 → IA → 와이어프레임 14장) |
| `기능_명세서_v1_1 (1).docx` | 기능별 상세 명세 (사용자/여정단계/Pain Point/동작흐름/입출력/비고) |
| `기능_명세_표_v1_1 (1).xlsx` | 기능 목록 + **F열: 노출 화면 위치** + G열: 수정 메모 |

### PPT 슬라이드 구성 (총 14장)
```
S01  핵심 기능 MVP      — 교사 T-01~10 / 학생 S-01~10
S02  기능 명세 요약     — 교사 수업 준비 (T-01~04)
S03  기능 명세 요약     — 교사 수업운영·평가분석 (T-05~10)
S04  기능 명세 요약     — 학생 전체 (S-01~10)
S05  교사 IA            — 화면 구성도 (메뉴 트리 + 핵심 화면 흐름)
S06  WF-01              — 교사 홈 (대시보드)
S07  WF-02              — 수업 설계·교과서 재구성
S08  WF-03              — 실시간 모니터링 (튜터링)
S09  WF-04              — AI 채점·루브릭
S10  WF-05              — 학습 결과 대시보드
S11  학생 IA            — 화면 구성도
S12  WF-S02             — 학생 마이 대시보드 (홈)
S13  WF-S03a            — 실습 화면: 엔트리 (블록 코딩, 중등)
S14  WF-S03b            — 실습 화면: 파이썬 (텍스트 코딩, 고등)
```

---

## 제작 범위

### 목업 대상: 교사용 화면 5개 (HTML)
```
wf01_dashboard.html     WF-01  교사 홈 (대시보드)
wf02_lesson.html        WF-02  수업 설계·교과서 재구성
wf03_monitoring.html    WF-03  실시간 모니터링 (튜터링)
wf04_scoring.html       WF-04  AI 채점·루브릭
wf05_result.html        WF-05  학습 결과 대시보드
```

### 학생용: 와이어프레임까지만 (PPT). 목업 제작 제외.

---

## 디자인 시스템

### 색상 (CSS Custom Properties)
```css
:root {
  /* 여정 단계별 Primary */
  --color-pre:    #0D9488;   /* 수업 전 — 틸 */
  --color-mid:    #065A82;   /* 수업 중 — 블루 */
  --color-post:   #1E2761;   /* 수업 후 — 네이비 */

  /* 중립 */
  --color-ink:    #1E293B;   /* 기본 텍스트 */
  --color-gray:   #64748B;   /* 보조 텍스트 */
  --color-light:  #F1F5F9;   /* 카드 배경 */
  --color-border: #E2E8F0;   /* 테두리 */
  --color-white:  #FFFFFF;

  /* 상태 */
  --color-warn:   #D97706;   /* 경고·관심 필요 */
  --color-ok:     #0D9488;   /* 완료·성공 */
  --color-danger: #EF4444;   /* 오류 */

  /* 실습 에디터 (WF-S03) */
  --color-entry:  #4CAF50;   /* 엔트리 녹색 */
  --color-python: #3776AB;   /* 파이썬 파란색 */
  --color-dark:   #1A1A2E;   /* 코드 에디터 배경 */
}
```

### 폰트
```css
font-family: 'Pretendard', 'Apple SD Gothic Neo', '맑은 고딕', sans-serif;
```
- Pretendard CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`

### 레이아웃
- 기준 해상도: **1440px** (데스크탑)
- 최소 지원: 1280px
- GNB 높이: 56px (고정)
- 좌측 사이드바: 200px (교사용 화면 공통)
- 콘텐츠 영역: 나머지 (flex-grow)

### 간격 단위
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### 컴포넌트 패턴
```css
/* 카드 */
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-lg);
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* 버튼 Primary */
.btn-primary {
  background: var(--color-mid);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
}

/* 상태 배지 */
.badge-ok     { background: var(--color-ok);   color: white; }
.badge-warn   { background: var(--color-warn); color: white; }
.badge-mid    { background: var(--color-mid);  color: white; }
```

---

## 화면별 핵심 요소 & 주의사항

### WF-01 교사 홈 (대시보드)
- GNB: 로고 + 학급 선택 드롭다운(`1학년 3반 ▾`) + 알림 아이콘
- 좌측 메뉴: 홈(활성) / 교과서 / 대시보드 / 평가 / 게시판
- 카드 1: **오늘의 수업** — 차시명, 진행률 바, [수업 시작] 버튼(primary) + [자료 점검] 버튼
- 카드 2: **오늘의 기분** — 좋음/보통/관심 수평 바 차트, "⚠ 관심 필요 학생 2명" 알림
- 카드 3: **학습 현황 요약** — 진행률/실습 점수/테스트 3개 수치 카드
- 카드 4: **게시판·알림** — 최근 글 목록
- 클릭 인터랙션: [수업 시작] → `wf03_monitoring.html`로 이동

### WF-02 수업 설계·교과서 재구성
- 상단 툴바: 차시명 + [AI 퀴즈 생성] + [수정 저장] + [배포](primary)
- 좌측: 단원·차시 목차 트리 (아코디언, 선택된 항목 강조)
- 중앙(넓게): 자료 편집 영역 — [설명] 텍스트박스 + 이미지/영상 업로드 플레이스홀더 + [지시사항] 텍스트박스
- 우측(좁게): 수준별 배포 — 상/중/하 그룹별 자료 설정 + [그룹별 배포 실행](primary)

### WF-03 실시간 모니터링 ⭐ (핵심 화면)
- 상단: 차시명·접속 학생 수 + 완료/진행/도움 요청 집계 칩
- 메인: **학생 화면 그리드** (4열 × N행 썸네일) — 도움 요청 학생 강조(주황 테두리)
- 우측 패널: 선택 학생 화면 확대 + [코드 첨삭](primary) + [점수 수정] + AI 챗봇 질문 로그
- JS 인터랙션: 썸네일 클릭 → 우측 패널 갱신

### WF-04 AI 채점·루브릭 ⭐ (핵심 화면 — 실습 채점)
- 상단: 활동 선택 드롭다운 + [전체 자동 채점](primary)
- 좌측: **루브릭 기준표** — 기준/배점 테이블 + [기준 추가] + [기준표 저장]
- 우측 상단: **학생별 채점 결과** — 이름/점수/상태 목록 (선택 시 하단 패널 갱신)
- 우측 하단: **AI 피드백** + 최종 점수 수정 입력 + [확정](primary)
- 비고: T-10 명세 기준 — 객관식 자동채점 + 서술형 AI초안 + **실습 코드 루브릭 AI채점** 모두 포함

### WF-05 학습 결과 대시보드
- 상단: 과목/단원/학생 필터 드롭다운 3개
- 좌상: AI 분석 결과 (총평 텍스트 + 강점/보완 태그)
- 우상: 학급 학습 현황 (진행률/실습/테스트 수치 + 막대 차트)
- 하단: **학생별 성취도 테이블** (이름/진행률/실습/테스트/AI추천) + [추천 학습 일괄 배포](primary)

---

## 공통 파일 구조
```
project/
├── CLAUDE.md                  ← 이 파일
├── styles.css                 ← 공통 CSS (디자인 시스템 변수 + 컴포넌트)
├── wf01_dashboard.html
├── wf02_lesson.html
├── wf03_monitoring.html
├── wf04_scoring.html
├── wf05_result.html
└── assets/
    └── (아이콘, 더미 이미지 등)
```

---

## 구현 규칙

### HTML/CSS
- 프레임워크 없이 Vanilla HTML + CSS + JS
- CSS Custom Properties 필수 사용 (하드코딩 금지)
- 각 파일 상단에 화면 간 이동 네비게이션 포함
  ```html
  <!-- nav 예시 -->
  <nav class="wf-nav">
    <a href="wf01_dashboard.html" class="active">WF-01 홈</a>
    <a href="wf02_lesson.html">WF-02 수업설계</a>
    <a href="wf03_monitoring.html">WF-03 모니터링</a>
    <a href="wf04_scoring.html">WF-04 AI채점</a>
    <a href="wf05_result.html">WF-05 결과</a>
  </nav>
  ```

### 더미 데이터
- 실제처럼 보이는 값 사용 (00%, ○○○ 등 placeholder 금지)
- 학생 이름: 김민준, 이서연, 박지호, 정다은, 최우진, 한수아 등
- 교사: 김지현 (1학년 3반 담당)
- 단원: `Ⅲ-2-01 프로그래밍 시작하기`, `Ⅲ-2-02 두 수 사칙연산`
- 수치: 진행률 68%, 실습 점수 82점, 완료 9명/진행 15명/도움 2명

### JavaScript
- 탭 전환, 드롭다운, 모달, 그리드 클릭 인터랙션: Vanilla JS
- 상태 관리: 전역 변수 또는 data-* 속성 활용
- 애니메이션: CSS transition 우선, JS는 최소화

### 접근성
- 모든 버튼에 `aria-label` 또는 텍스트 포함
- 색상만으로 상태 구분 금지 (아이콘/텍스트 병행)

---

## 세션 작업 순서 및 완료 현황

| 세션 | 파일 | 상태 |
|------|------|------|
| 세션 1 | `styles.css` + `wf01_dashboard.html` | ✅ 완료 |
| 세션 2 | `wf02_lesson.html` | ✅ 완료 |
| 세션 3 | `wf03_monitoring.html` ⭐ | ✅ 완료 |
| 세션 4 | `wf04_scoring.html` ⭐ | ✅ 완료 |
| 세션 5 | `wf05_result.html` | ✅ 완료 |
| 세션 6 | `index.html` 신규 생성 — 담당 학급 선택 홈 (2×2 카드 그리드) | ✅ 완료 |
| 세션 7 | `index.html` 옵션C 레이아웃 — 탭(내 학급/자료실/공지/설정) + 상단 타임라인·비교 테이블 2열 + 하단 컴팩트 카드 4개 | ✅ 완료 |
| 세션 8 | `teacher_textbook.html` 신규 생성 — 교사 수업 중 교과서 뷰어 (좌측 TOC + 우측 콘텐츠 2단 레이아웃, JS 배열 기반 하단 네비게이션 바) + `wf01_dashboard.html` [수업 시작] 버튼 연결 변경 | ✅ 완료 |
| 세션 9 | `teacher_textbook.html` 세부 수정 — 파이썬 실습 좌측 패널 wfs03b 동일 구조로 교체 / TOC 토글·스크롤바 / 하단 nav 점 네비게이션·버튼명·위치 / 교사 도구 FAB(타이머·퀵뷰·잠금·공유·모니터링) / FAB 드래그 이동 / TOC 하단 색상 수정 | ✅ 완료 |
| 세션 10 | `index.html` 자료실 탭 — 과목별 2단계 구조(내가 만든 과목/공유받은 과목 카드 그리드 → 자료 목록 테이블) + 과목 CRUD + 공유 권한 분기 | ✅ 완료 |
| 세션 11~ | 기타 화면 세부 수정 또는 신규 기능 | - |

각 세션 시작 시: "CLAUDE.md와 이전 세션의 styles.css를 읽고 [WF-XX]를 만들어줘" 형태로 지시.
세션 완료 후 위 표의 상태를 `✅ 완료`로 업데이트할 것.

---

## 다음 단계 (목업 완성 후)
- HTML 목업 → Figma 또는 프로토타이핑 툴로 이관
- `informationlms.vercel.app` 기존 프로토타입과 병합
- 학생용 화면 목업 추가 (WF-S02, WF-S03a/b)
