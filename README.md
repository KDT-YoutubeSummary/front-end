# 🎬 YouSum Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> **능동적 학습자를 위한 AI 기반 유튜브 영상 요약 및 학습 지원 플랫폼**  
> YouTube 영상을 AI로 요약하고, 퀴즈를 생성하며, 개인 학습 라이브러리를 관리할 수 있는 웹 애플리케이션의 프론트엔드입니다.

---

## 📋 프로젝트 개요 (Overview)

YouSum은 **Whisper STT**와 **GPT API**를 활용하여 YouTube 영상을 자동으로 요약하고, 학습자의 능동적 학습을 지원하는 플랫폼입니다. 이 리포지토리는 React 기반의 프론트엔드 애플리케이션을 담고 있습니다.

### 🎯 주요 목표
- 📺 YouTube 영상의 효율적인 학습 콘텐츠 변환
- 🧠 AI 기반 자동 요약 및 퀴즈 생성
- 📚 개인 맞춤형 학습 라이브러리 관리
- 🔔 스마트 리마인더 및 추천 시스템

---

## ✨ 주요 기능 (Frontend Features)

### 🎬 영상 요약 기능
- YouTube URL 입력을 통한 영상 요약 요청
- 실시간 요약 진행 상황 표시 (로딩 애니메이션)
- 요약 타이핑 게임으로 대기 시간 활용
- 3줄 요약, 키워드, 타임라인 형식 지원

### 📚 개인 라이브러리
- 요약된 영상 저장 및 관리
- 해시태그 기반 분류 및 검색
- 개인 메모 추가 및 편집
- 태그별 통계 시각화 (파이차트)

### 🎮 학습 지원 도구
- 요약 기반 자동 퀴즈 생성
- 타자 연습 미니게임 (1000+ 키워드)
- 최고기록 시스템 및 성과 추적

### 🔔 스마트 알림
- 리마인더 설정 (일간/주간/맞춤)
- AI 기반 관련 영상 추천
- 이메일 알림 연동

### 👤 사용자 관리
- JWT 기반 인증 시스템
- Google OAuth2 소셜 로그인
- 마이페이지 및 계정 관리

---

## 🛠 기술 스택 & 뱃지 (Frontend Tech Stack)

### Core Framework
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=vite)

### Styling & UI
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)
![Lucide React](https://img.shields.io/badge/Lucide_React-0.263.1-000000?style=flat-square&logo=lucide)

### HTTP Client & Data Visualization
![Axios](https://img.shields.io/badge/Axios-1.6.0-5A29E4?style=flat-square&logo=axios)
![Recharts](https://img.shields.io/badge/Recharts-2.8.0-8884D8?style=flat-square)

### Utilities & Markdown
![React Markdown](https://img.shields.io/badge/React_Markdown-9.0.0-000000?style=flat-square&logo=markdown)
![Date-fns](https://img.shields.io/badge/Date_fns-2.30.0-770C56?style=flat-square)

---

## 📁 폴더 구조 (Directory Structure)

```
src/
├── 📁 components/          # 재사용 가능한 UI 컴포넌트
│   ├── AuthModal.jsx       # 로그인/회원가입 모달
│   ├── OAuth2RedirectHandler.jsx  # OAuth2 리다이렉트 처리
│   ├── UserLibrary.jsx     # 라이브러리 메인 컴포넌트
│   ├── Recommendation.jsx  # 추천 영상 컴포넌트
│   ├── Reminder.jsx        # 리마인더 목록
│   ├── ReminderEditModal.jsx  # 리마인더 편집 모달
│   ├── MyPageModals.jsx    # 마이페이지 모달들
│   └── 📁 game/            # 게임 관련 컴포넌트
│       └── SummaryTypingGame.jsx  # 타자 게임
├── 📁 pages/              # 페이지 컴포넌트
│   ├── AuthPage.jsx       # 인증 페이지
│   ├── SummaryPage.jsx    # 요약 메인 페이지
│   ├── LibraryPage.jsx    # 라이브러리 페이지
│   ├── RecommendationPage.jsx  # 추천 페이지
│   ├── ReminderPage.jsx   # 리마인더 페이지
│   └── MyPage.jsx         # 마이페이지
├── 📁 services/           # API 통신 로직
│   └── api.jsx            # Axios 설정 및 API 함수들
```

---

## 🚀 설치 및 실행 방법 (Getting Started)

### 📋 사전 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 🔧 설치
```bash
# 리포지토리 클론
git clone https://github.com/your-team/yousum-frontend.git
cd yousum-frontend

# 의존성 설치
npm install
# 또는
yarn install
```

### 🌍 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8080

VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### ▶️ 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 `http://localhost:8080`으로 접속하세요.

### 🏗️ 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 🧩 주요 컴포넌트 소개 (Component Overview)

### 📺 SummaryPage
YouTube 영상 요약의 핵심 페이지입니다.

```jsx
// 주요 기능
- URL 입력 및 검증
- 실시간 요약 진행 상황 표시
- 타자 게임으로 대기 시간 활용
- 에러 처리 및 사용자 피드백
```

### 🎮 SummaryTypingGame
요약 생성 중 사용자가 즐길 수 있는 타자 게임입니다.

```jsx
// 게임 특징
- 1000+ 개의 난이도별 키워드
- 실시간 정확도 및 속도 측정
- 최고기록 시스템 (localStorage)
- 애니메이션 효과 및 피드백
```

### 📚 UserLibrary
개인 학습 라이브러리를 관리하는 컴포넌트입니다.

```jsx
// 주요 기능
- 요약 영상 목록 및 상세 보기
- 해시태그 기반 검색 및 필터링
- 개인 메모 추가 및 편집
- 태그별 통계 시각화 (Recharts)
```

### 🔐 AuthModal
로그인 및 회원가입을 처리하는 모달 컴포넌트입니다.

```jsx
// 인증 방식
- 일반 로그인/회원가입
- Google OAuth2 소셜 로그인
- JWT 토큰 기반 인증
- 폼 검증 및 에러 처리
```

---

## 🔌 API 연동 예시 (API Integration Sample)

### Axios 설정
```jsx
// src/services/api.jsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 요청 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API 호출 예시
```jsx
// 영상 요약 요청
export const requestSummary = async (youtubeUrl, summaryType) => {
  try {
    const response = await apiClient.post('/api/youtube/upload', {
      youtubeUrl,
      summaryType
    });
    return response.data;
  } catch (error) {
    console.error('요약 요청 실패:', error);
    throw error;
  }
};

// 라이브러리 조회
export const fetchLibraryItems = async (searchTerm = '', filterTag = '') => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filterTag) params.append('tag', filterTag);
  
  const response = await apiClient.get(`/api/libraries?${params}`);
  return response.data;
};
```

---

## 🎣 커스텀 훅/유틸 정리 (Hooks/Utils)

### 🎣 주요 커스텀 훅 (예정)
```jsx
// useAuth - 인증 상태 관리
// useLocalStorage - localStorage 관리
// useDebounce - 검색 입력 디바운싱
// useModal - 모달 상태 관리
```

### 🛠 유틸리티 함수들
```jsx
// YouTube URL 검증
export const isValidYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

// JWT 토큰 검증
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

---

## 🎨 UI/UX 스타일 가이드 (Style Guide)

### 🎨 디자인 시스템
```css
/* 주요 색상 팔레트 */
:root {
  --primary-red: #EF4444;      /* 메인 브랜드 컬러 */
  --primary-blue: #3B82F6;     /* 보조 컬러 */
  --success-green: #10B981;    /* 성공 상태 */
  --warning-yellow: #F59E0B;   /* 경고 상태 */
  --gray-50: #F9FAFB;          /* 배경색 */
  --gray-800: #1F2937;         /* 텍스트 */
}
```

### 📱 반응형 디자인
- **Mobile First** 접근 방식
- Tailwind CSS의 브레이크포인트 활용
- `sm:`, `md:`, `lg:`, `xl:` 접두사 사용

### 🎭 애니메이션 가이드
```css
/* 주요 애니메이션 클래스 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.hover:scale-105 {
  transition: transform 0.2s ease-in-out;
}
```

---

## 🤝 협업

### 🌿 브랜치 전략
```
main: 배포 가능한 안정 버전
dev: 개발 중인 기능들의 통합 브랜치
feature/기능명: 새로운 기능 개발
hotfix/이슈명: 긴급 버그 수정
```

---

## 🚀 향후 개선 방향 (Todo / Roadmap)

### 📋 단기 목표 (1-2개월)
- [ ] **성능 최적화**
  - [ ] React.memo 및 useMemo 적용
  - [ ] 이미지 lazy loading 구현
  - [ ] 번들 크기 최적화

- [ ] **접근성 개선**
  - [ ] ARIA 라벨 추가
  - [ ] 키보드 네비게이션 지원
  - [ ] 색상 대비 개선

### 🎯 중기 목표 (3-6개월)
- [ ] **PWA 지원**
  - [ ] Service Worker 구현
  - [ ] 오프라인 기능 지원
  - [ ] 앱 설치 지원

- [ ] **다국어 지원**
  - [ ] i18n 라이브러리 도입
  - [ ] 영어/한국어 지원

### 🌟 장기 목표 (6개월+)
- [ ] **고급 기능**
  - [ ] 실시간 협업 기능
  - [ ] 소셜 공유 기능
  - [ ] 고급 통계 대시보드

- [ ] **모바일 앱**
  - [ ] React Native 포팅 검토
  - [ ] 네이티브 앱 기능 활용

---

## 📞 문의 및 지원

### 👥 개발팀
- **팀 리더**: 석예은
- **프론트엔드 개발**: 석예은, 김지원, 정준호
- **백엔드 연동**: 전체 팀원

### 🐛 이슈 리포팅
버그 발견이나 기능 제안이 있으시면 [Issues](https://github.com/your-team/yousum-frontend/issues)에 등록해 주세요.

### 📚 관련 문서
- [백엔드 API 문서](https://github.com/your-team/yousum-backend)
- [프로젝트 전체 문서](https://github.com/your-team/yousum-docs)

---

<div align="center">

**🎬 YouSum Frontend** - *능동적 학습을 위한 AI 기반 영상 학습 플랫폼*

Made with ❤️ by YouSum Team

</div>
