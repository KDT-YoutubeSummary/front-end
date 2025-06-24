import React, { useState, useEffect, useRef } from 'react';

// 난이도별 키워드 분류 (총 1000개 이상)
const KEYWORD_LEVELS = {
  // 레벨 1: 기본 키워드 (0-9번째 정답)
  beginner: [
    "AI", "요약", "학습", "영상", "분석", "키워드", "자동화", "추천", "검색", "저장",
    "공유", "댓글", "좋아요", "구독", "재생", "시청", "업로드", "다운로드", "스트리밍", "라이브",
    "채널", "플레이리스트", "알림", "설정", "프로필", "계정", "로그인", "회원가입", "비밀번호", "이메일",
    "모바일", "데스크톱", "앱", "웹", "브라우저", "인터넷", "와이파이", "데이터", "속도", "연결",
    "화면", "소리", "음성", "텍스트", "이미지", "사진", "동영상", "파일", "폴더", "문서"
  ],
  
  // 레벨 2: 중급 키워드 (10-29번째 정답)
  intermediate: [
    "Whisper", "GPT", "타임라인", "자막", "리마인드", "문제풀이", "정제", "알고리즘", "머신러닝", "딥러닝",
    "자연어처리", "컴퓨터비전", "빅데이터", "클라우드", "서버", "데이터베이스", "API", "프레임워크", "라이브러리", "SDK",
    "개발자", "프로그래밍", "코딩", "디버깅", "테스팅", "배포", "버전관리", "깃허브", "오픈소스", "라이센스",
    "사용자경험", "사용자인터페이스", "디자인", "프로토타입", "와이어프레임", "반응형", "접근성", "최적화", "성능", "보안",
    "암호화", "인증", "권한", "세션", "쿠키", "캐시", "로드밸런싱", "스케일링", "마이크로서비스", "컨테이너",
    "도커", "쿠버네티스", "DevOps", "CI/CD", "자동배포", "모니터링", "로깅", "메트릭", "알람", "백업"
  ],
  
  // 레벨 3: 고급 키워드 (30번째 이후)
  advanced: [
    "Transformer", "BERT", "GPT-4", "LLaMA", "ChatGPT", "Anthropic", "Claude", "Gemini", "PaLM", "LaMDA",
    "신경망", "역전파", "그래디언트", "옵티마이저", "하이퍼파라미터", "정규화", "드롭아웃", "배치정규화", "어텐션", "셀프어텐션",
    "인코더", "디코더", "시퀀스투시퀀스", "순환신경망", "LSTM", "GRU", "합성곱", "풀링", "활성화함수", "손실함수",
    "교차엔트로피", "평균제곱오차", "정확도", "정밀도", "재현율", "F1스코어", "AUC", "ROC", "혼동행렬", "과적합",
    "언더피팅", "교차검증", "앙상블", "배깅", "부스팅", "랜덤포레스트", "서포트벡터머신", "k-평균", "주성분분석", "t-SNE",
    "강화학습", "Q-러닝", "정책경사", "액터-크리틱", "몬테카를로", "템포럴디퍼런스", "마르코프", "벨만방정식", "탐욕정책", "엡실론그리디",
    "컨볼루션", "풀링레이어", "ResNet", "VGG", "AlexNet", "YOLO", "객체탐지", "세그멘테이션", "생성모델", "GAN",
    "VAE", "디퓨전", "CLIP", "DALL-E", "Stable Diffusion", "멀티모달", "크로스모달", "임베딩", "벡터화", "토크나이제이션",
    "BPE", "SentencePiece", "WordPiece", "어휘집", "언어모델", "생성형AI", "프롬프트엔지니어링", "퓨샷러닝", "제로샷러닝", "파인튜닝",
    "전이학습", "도메인적응", "지식증류", "모델압축", "양자화", "프루닝", "경량화", "엣지컴퓨팅", "온디바이스", "페더레이티드러닝",
    
    // 추가 고급 키워드들 (기술, 비즈니스, 학술 용어)
    "블록체인", "암호화폐", "NFT", "디파이", "스마트컨트랙트", "이더리움", "비트코인", "합의알고리즘", "작업증명", "지분증명",
    "메타버스", "가상현실", "증강현실", "혼합현실", "디지털트윈", "IoT", "5G", "6G", "엣지컴퓨팅", "양자컴퓨팅",
    "바이오인포매틱스", "컴퓨터그래픽스", "렌더링", "셰이더", "물리엔진", "게임엔진", "유니티", "언리얼", "WebGL", "Vulkan",
    "CUDA", "OpenCL", "GPU가속", "병렬처리", "분산컴퓨팅", "클러스터", "그리드컴퓨팅", "슈퍼컴퓨터", "HPC", "빅데이터처리",
    "스파크", "하둡", "맵리듀스", "NoSQL", "MongoDB", "카산드라", "Redis", "Elasticsearch", "데이터웨어하우스", "데이터레이크",
    "ETL", "데이터파이프라인", "스트리밍처리", "실시간분석", "A/B테스팅", "통계분석", "회귀분석", "시계열분석", "예측모델", "추천시스템",
    "협업필터링", "콘텐츠기반", "매트릭스분해", "차원축소", "클러스터링", "이상탐지", "자동화", "RPA", "워크플로우", "오케스트레이션",
    "서비스메시", "Istio", "Envoy", "프록시", "게이트웨이", "로드밸런서", "CDN", "캐싱전략", "성능최적화", "지연시간",
    "처리량", "확장성", "가용성", "내결함성", "재해복구", "백업전략", "모니터링", "옵저빌리티", "추적", "로깅",
    "메트릭수집", "알림시스템", "대시보드", "시각화", "비즈니스인텔리전스", "데이터시각화", "인포그래픽", "대화형시각화", "D3.js", "차트",
    "그래프이론", "네트워크분석", "소셜네트워크", "복잡계", "시뮬레이션", "몬테카를로시뮬레이션", "최적화알고리즘", "유전알고리즘", "PSO", "담금질",
    "휴리스틱", "메타휴리스틱", "선형계획법", "정수계획법", "제약만족", "탐색알고리즘", "BFS", "DFS", "다익스트라", "A스타",
    "동적계획법", "그리디알고리즘", "분할정복", "백트래킹", "브랜치앤바운드", "근사알고리즘", "확률알고리즘", "라스베이거스", "몬테카를로", "양자알고리즘",
    
    // 더 많은 전문 용어들 추가
    "사이버보안", "침투테스팅", "취약점분석", "악성코드", "랜섬웨어", "피싱", "소셜엔지니어링", "방화벽", "침입탐지", "침입방지",
    "제로데이", "패치관리", "위험평가", "보안감사", "컴플라이언스", "GDPR", "개인정보보호", "데이터거버넌스", "정보보안", "네트워크보안",
    "클라우드보안", "엔드포인트보안", "모바일보안", "웹보안", "애플리케이션보안", "데브섹옵스", "시프트레프트", "보안테스팅", "코드분석", "SAST",
    "DAST", "IAST", "SCA", "펜테스팅", "레드팀", "블루팀", "퍼플팀", "CTF", "해킹", "화이트햇",
    "블랙햇", "그레이햇", "버그바운티", "제로트러스트", "권한최소화", "심층방어", "보안운영센터", "SOC", "SIEM",
    "로그분석", "포렌식", "디지털포렌식", "인시던트대응", "위기관리", "비즈니스연속성", "재해복구계획", "백업검증", "복구테스트", "RTO",
    "RPO", "고가용성", "부하분산", "페일오버", "클러스터링", "리플리케이션", "샤딩", "파티셔닝", "인덱싱", "쿼리최적화",
    "데이터베이스튜닝", "트랜잭션", "ACID", "격리수준", "동시성제어", "데드락", "락킹", "버전관리", "스키마마이그레이션", "ORM",
    "ActiveRecord", "Hibernate", "Sequelize", "Prisma", "TypeORM", "Django", "Rails", "Spring", "Express", "FastAPI",
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js", "Gatsby", "웹팩", "Vite", "번들러",
    "트랜스파일러", "Babel", "TypeScript", "ESLint", "Prettier", "Jest", "Cypress", "Selenium", "Playwright", "테스트자동화",
    "단위테스트", "통합테스트", "E2E테스트", "성능테스트", "부하테스트", "스트레스테스트", "보안테스트", "접근성테스트", "사용성테스트", "A/B테스트",
    
    // 비즈니스 및 마케팅 용어
    "디지털마케팅", "퍼포먼스마케팅", "그로스해킹", "전환율최적화", "CRO", "SEO", "SEM", "소셜미디어마케팅", "콘텐츠마케팅", "이메일마케팅",
    "인플루언서마케팅", "바이럴마케팅", "버즈마케팅", "게릴라마케팅", "옴니채널", "고객여정", "터치포인트", "리텐션", "LTV", "CAC",
    "퍼넬최적화", "리드제너레이션", "리드너처링", "마케팅오토메이션", "CRM", "CDP", "DMP", "어트리뷰션", "마지막클릭", "퍼스트클릭",
    "멀티터치", "크로스디바이스", "개인화", "세그멘테이션", "타겟팅", "리타겟팅", "룩어라이크", "코호트분석", "RFM분석", "고객세분화",
    "NPS", "CSAT", "CES", "고객만족도", "고객경험", "사용자경험", "디자인씽킹", "린스타트업", "MVP", "PMF",
    "피벗", "스케일업", "유니콘", "디유니콘", "IPO", "시리즈A", "시드펀딩", "엔젤투자", "벤처캐피털", "사모펀드",
    "기업가치평가", "밸류에이션", "DCF", "멀티플", "EBITDA", "ROI", "ROE", "ROA", "재무제표", "손익계산서",
    "대차대조표", "현금흐름표", "자본조달", "부채비율", "유동비율", "자기자본비율", "매출총이익률", "영업이익률", "순이익률", "EPS",
    
    // 최신 기술 트렌드
    "Web3", "탈중앙화", "DAO", "DeFi", "GameFi", "Play2Earn", "Move2Earn", "Learn2Earn", "크리에이터이코노미", "NFT마켓플레이스",
    "메타버스플랫폼", "가상자산", "디지털자산", "토큰이코노미", "거버넌스토큰", "유틸리티토큰", "스테이킹", "일드파밍", "리퀴디티풀", "DEX",
    "CEX", "크로스체인", "브릿지", "인터오퍼러빌리티", "레이어2", "롤업", "사이드체인", "플라즈마", "샤딩", "합의메커니즘",
    "노드", "밸리데이터", "채굴", "마이닝풀", "해시레이트", "트랜잭션수수료", "가스비", "Gwei", "Wei", "스마트컨트랙트감사",
    "보안감사", "코드리뷰", "페어프로그래밍", "클린코드", "리팩토링", "기술부채", "레거시시스템", "마이그레이션", "시스템통합", "API통합",
    "서드파티", "벤더", "SaaS", "PaaS", "IaaS", "하이브리드클라우드", "멀티클라우드", "클라우드네이티브", "서버리스", "FaaS",
    "마이크로프론트엔드", "잼스택", "헤드리스CMS", "정적사이트생성", "SSG", "SSR", "CSR", "하이드레이션", "코드스플리팅", "레이지로딩",
    "트리셰이킹", "번들최적화", "이미지최적화", "WebP", "AVIF", "프로그레시브웹앱", "PWA", "서비스워커", "웹어셈블리", "WASM"
  ]
};

const TIME_LIMITS = [30, 25, 20, 15, 10, 7, 5];

export default function SummaryTypingGame({ onComplete, summaryComplete = false, onBack, onSwitchGame }) {
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver', 'completed', 'summaryComplete'
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [keywordTimeLimit, setKeywordTimeLimit] = useState(30);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [countdown, setCountdown] = useState(null);
  const [bestRecord, setBestRecord] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [maxConsecutive, setMaxConsecutive] = useState(0);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // 현재 레벨에 따른 키워드 풀 선택
  const getCurrentKeywordPool = () => {
    if (correctCount < 10) return KEYWORD_LEVELS.beginner;
    if (correctCount < 30) return KEYWORD_LEVELS.intermediate;
    return KEYWORD_LEVELS.advanced;
  };

  // 새로운 키워드 생성
  const generateNewKeyword = () => {
    const keywordPool = getCurrentKeywordPool();
    const availableKeywords = keywordPool.filter(keyword => !usedKeywords.includes(keyword));
    
    if (availableKeywords.length === 0 || correctCount >= 100) {
      setGameState('completed');
      // 게임 완료 시 최고기록 체크
      setTimeout(() => checkAndUpdateRecord(), 100);
      return;
    }
    
    const randomKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
    setCurrentKeyword(randomKeyword);
    setUsedKeywords(prev => [...prev, randomKeyword]);
    
    // 레벨 업데이트
    if (correctCount >= 30) setCurrentLevel('advanced');
    else if (correctCount >= 10) setCurrentLevel('intermediate');
    else setCurrentLevel('beginner');
    
    // 시간 제한 계산
    const timeLimitIndex = Math.min(Math.floor(correctCount / 2), TIME_LIMITS.length - 1);
    const newTimeLimit = TIME_LIMITS[timeLimitIndex];
    setKeywordTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
  };

  // 타이머 시작
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          clearInterval(timerRef.current);
          // 게임 오버 시 최고기록 체크
          setTimeout(() => checkAndUpdateRecord(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 게임 초기화
  const initializeGame = () => {
    setGameState('playing');
    setCorrectCount(0);
    setTotalAttempts(0);
    setUsedKeywords([]);
    setUserInput('');
    setCurrentLevel('beginner');
    setIsNewRecord(false);
    setConsecutiveCorrect(0);
    setMaxConsecutive(0);
    generateNewKeyword();
  };

  // 입력 처리
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // 키 입력 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // 정답 체크
  const handleSubmit = () => {
    setTotalAttempts(prev => prev + 1);
    
    if (userInput.trim() === currentKeyword) {
      setCorrectCount(prev => prev + 1);
      setConsecutiveCorrect(prev => prev + 1);
      setMaxConsecutive(prev => Math.max(prev, consecutiveCorrect + 1));
      setUserInput('');
      generateNewKeyword();
    } else {
      // 오답 시 연속 정답 초기화 및 입력창 초기화
      setConsecutiveCorrect(0);
      setUserInput('');
    }
  };

  // 다시하기
  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    initializeGame();
  };

  // 요약 완료 카운트다운 시작
  const startSummaryCompleteCountdown = () => {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 정확도 계산
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  // 최고기록 관련 함수들
  const loadBestRecord = () => {
    try {
      const savedRecord = localStorage.getItem('typingGameBestRecord');
      if (savedRecord) {
        const record = JSON.parse(savedRecord);
        setBestRecord(record);
        return record;
      }
    } catch (error) {
      console.error('최고기록 불러오기 실패:', error);
    }
    return null;
  };

  const saveBestRecord = (newRecord) => {
    try {
      localStorage.setItem('typingGameBestRecord', JSON.stringify(newRecord));
      setBestRecord(newRecord);
    } catch (error) {
      console.error('최고기록 저장 실패:', error);
    }
  };

  const checkAndUpdateRecord = () => {
    const currentRecord = {
      correctCount,
      accuracy,
      level: currentLevel,
      maxConsecutive,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    const existingRecord = bestRecord || loadBestRecord();
    
    let isNewBest = false;
    
    if (!existingRecord) {
      // 첫 번째 기록
      isNewBest = true;
    } else {
      // 기록 비교 (정답 수 > 정확도 > 연속 정답 순으로 우선순위)
      if (correctCount > existingRecord.correctCount) {
        isNewBest = true;
      } else if (correctCount === existingRecord.correctCount) {
        if (accuracy > existingRecord.accuracy) {
          isNewBest = true;
        } else if (accuracy === existingRecord.accuracy && maxConsecutive > existingRecord.maxConsecutive) {
          isNewBest = true;
        }
      }
    }

    if (isNewBest) {
      saveBestRecord(currentRecord);
      setIsNewRecord(true);
      console.log('🏆 새로운 최고기록 달성!', currentRecord);
    }

    return isNewBest;
  };

  // 최고기록 초기화 (개발용)
  const resetBestRecord = () => {
    try {
      localStorage.removeItem('typingGameBestRecord');
      setBestRecord(null);
      setIsNewRecord(false);
      console.log('🔄 최고기록이 초기화되었습니다.');
    } catch (error) {
      console.error('최고기록 초기화 실패:', error);
    }
  };

  // 개발자 도구용 전역 함수 등록
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resetTypingGameRecord = resetBestRecord;
      console.log('🎮 타자게임 최고기록 초기화: window.resetTypingGameRecord()');
    }
  }, []);

  // 게임 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    loadBestRecord(); // 최고기록 불러오기
    initializeGame();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // 요약 완료 감지
  useEffect(() => {
    if (summaryComplete && gameState === 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('summaryComplete');
      startSummaryCompleteCountdown();
    }
  }, [summaryComplete, gameState]);

  // 키워드 변경 시 타이머 시작
  useEffect(() => {
    if (gameState === 'playing' && currentKeyword) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentKeyword, gameState]);

  // 입력창 포커스
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentKeyword]);

  // 요약 완료 화면
  if (gameState === 'summaryComplete') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 min-h-[450px] max-w-md mx-auto">
        <div className="text-center space-y-5 w-full">
          {/* 애니메이션 체크마크 */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 text-2xl animate-spin">✨</div>
            <div className="absolute -bottom-1 -left-1 text-xl animate-pulse">🎉</div>
          </div>

          {/* 완료 메시지 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-green-700 animate-pulse">요약 완료!</h2>
            <p className="text-base text-green-600">AI가 똑똑하게 요약했어요!</p>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
              <p className="text-sm text-gray-700 font-medium">🤖 "모든 분석 완료! 요약 정리 끝났어요!"</p>
              <p className="text-xs text-gray-500 mt-1">✨ 영상 내용을 잘 정리했습니다!</p>
            </div>
          </div>

          {/* 게임 성과 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 w-full">
            <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">🎮 게임 결과</h3>
            
            {bestRecord ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center bg-gray-50 rounded-lg p-3">
                  <div className="font-bold text-gray-700 mb-2">현재 기록</div>
                  <div className="space-y-1">
                    <div><span className="text-lg font-bold text-green-600">{correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold text-blue-600">{accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold text-orange-600">{maxConsecutive}</span><br/>최대연속</div>
                    <div className="text-purple-600 font-semibold text-xs">
                      {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-3">
                  <div className="font-bold text-yellow-700 mb-2">🏆 최고기록</div>
                  <div className="space-y-1 text-yellow-700">
                    <div><span className="text-lg font-bold">{bestRecord.correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold">{bestRecord.accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold">{bestRecord.maxConsecutive}</span><br/>최대연속</div>
                    <div className="font-semibold text-xs">
                      {bestRecord.level === 'advanced' ? '고수' : bestRecord.level === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div><span className="text-2xl font-bold text-green-600">{correctCount}</span> 정답</div>
                  <div><span className="text-xl font-bold text-blue-600">{accuracy}%</span> 정확도</div>
                  <div><span className="text-lg font-bold text-orange-600">{maxConsecutive}</span> 최대연속</div>
                  <div className="text-purple-600 font-semibold">
                    {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 카운트다운 */}
          {countdown > 0 ? (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-500 animate-bounce">{countdown}</div>
              <p className="text-sm text-gray-600">초 후 요약 확인하기...</p>
            </div>
                      ) : (
              <button
                onClick={() => onComplete && onComplete()}
                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                지금 바로 확인해보세요! 🚀
              </button>
            )}
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 min-h-[400px] max-w-md mx-auto">
        <div className="text-center space-y-4 w-full">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-green-700">축하합니다!</h2>
          
          {isNewRecord && (
            <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg animate-pulse">
              <div className="text-base font-bold text-yellow-700 flex items-center justify-center gap-2">
                🏆 새로운 최고기록 달성! 🏆
              </div>
            </div>
          )}
          
          <p className="text-base text-gray-700">요약이 곧 도착합니다...</p>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 w-full">
            {bestRecord ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center bg-gray-50 rounded-lg p-3">
                  <div className="font-bold text-gray-700 mb-2">현재 기록</div>
                  <div className="space-y-1">
                    <div><span className="text-lg font-bold text-green-600">{correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold text-blue-600">{accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold text-orange-600">{maxConsecutive}</span><br/>연속</div>
                    <div className="text-purple-600 font-semibold text-xs">
                      {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-3">
                  <div className="font-bold text-yellow-700 mb-2">🏆 최고기록</div>
                  <div className="space-y-1 text-yellow-700">
                    <div><span className="text-lg font-bold">{bestRecord.correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold">{bestRecord.accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold">{bestRecord.maxConsecutive}</span><br/>연속</div>
                    <div className="font-semibold text-xs">
                      {bestRecord.level === 'advanced' ? '고수' : bestRecord.level === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div><span className="text-2xl font-bold text-green-600">{correctCount}</span> 정답</div>
                  <div><span className="text-xl font-bold text-blue-600">{accuracy}%</span> 정확도</div>
                  <div><span className="text-lg font-bold text-orange-600">{maxConsecutive}</span> 연속</div>
                  <div className="text-purple-600 font-semibold">
                    {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 min-h-[400px] max-w-md mx-auto">
        <div className="text-center space-y-4 w-full">
          <div className="text-5xl mb-3">💥</div>
          <h2 className="text-xl font-bold text-red-700">Game Over!</h2>
          
          {isNewRecord && (
            <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg animate-pulse">
              <div className="text-base font-bold text-yellow-700 flex items-center justify-center gap-2">
                🏆 새로운 최고기록 달성! 🏆
              </div>
            </div>
          )}
          
          <p className="text-base text-gray-700">시간이 다 되었습니다</p>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100 w-full">
            {bestRecord ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center bg-gray-50 rounded-lg p-3">
                  <div className="font-bold text-gray-700 mb-2">현재 기록</div>
                  <div className="space-y-1">
                    <div><span className="text-lg font-bold text-green-600">{correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold text-blue-600">{accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold text-orange-600">{maxConsecutive}</span><br/>연속</div>
                    <div className="text-purple-600 font-semibold text-xs">
                      {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-3">
                  <div className="font-bold text-yellow-700 mb-2">🏆 최고기록</div>
                  <div className="space-y-1 text-yellow-700">
                    <div><span className="text-lg font-bold">{bestRecord.correctCount}</span><br/>정답</div>
                    <div><span className="text-base font-bold">{bestRecord.accuracy}%</span><br/>정확도</div>
                    <div><span className="text-base font-bold">{bestRecord.maxConsecutive}</span><br/>연속</div>
                    <div className="font-semibold text-xs">
                      {bestRecord.level === 'advanced' ? '고수' : bestRecord.level === 'intermediate' ? '중급' : '초급'} 레벨
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div><span className="text-2xl font-bold text-green-600">{correctCount}</span> 정답</div>
                  <div><span className="text-xl font-bold text-blue-600">{accuracy}%</span> 정확도</div>
                  <div><span className="text-lg font-bold text-orange-600">{maxConsecutive}</span> 연속</div>
                  <div className="text-purple-600 font-semibold">
                    {currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'} 레벨
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            다시하기
          </button>
        </div>
      </div>
    );
  }

  // 레벨별 색상 및 메시지
  const getLevelInfo = () => {
    switch (currentLevel) {
      case 'advanced':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          message: '🔥 고수 레벨! 전문가 키워드',
          progressColor: 'from-red-400 to-orange-500'
        };
      case 'intermediate':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          message: '⚡ 중급 레벨! 기술 키워드',
          progressColor: 'from-orange-400 to-yellow-500'
        };
      default:
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          message: '🌟 초급 레벨! 기본 키워드',
          progressColor: 'from-blue-400 to-purple-500'
        };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className={`flex flex-col items-center p-6 bg-gradient-to-br ${levelInfo.bgColor} to-purple-50 rounded-2xl border-2 ${levelInfo.borderColor} max-w-md mx-auto`}>
      {/* 상단 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-blue-800 mb-2">
          요약 생성 중... AI 요약을 도와주세요! 🤖
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm mb-2">
          <span className="text-gray-600">남은 시간:</span>
          <span className={`font-bold px-2 py-1 rounded-full ${
            timeLeft <= 5 
              ? 'bg-red-100 text-red-600' 
              : timeLeft <= 10 
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-blue-100 text-blue-600'
          }`}>
            {timeLeft}초
          </span>
        </div>
        <div className={`text-xs font-semibold ${levelInfo.color}`}>
          {levelInfo.message}
        </div>
      </div>

      {/* 중앙 키워드 및 입력 */}
      <div className="text-center mb-6 w-full">
        <div className="mb-4">
          <div className={`text-3xl font-bold ${levelInfo.color} bg-white px-6 py-3 rounded-2xl shadow-md border-2 ${levelInfo.borderColor} inline-block`}>
            {currentKeyword}
          </div>
        </div>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="키워드를 입력하세요"
            className="w-full px-4 py-3 text-lg text-center rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors duration-200"
            disabled={gameState !== 'playing'}
          />
          <button
            onClick={handleSubmit}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors duration-200"
            disabled={gameState !== 'playing'}
          >
            확인
          </button>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-green-600">✅</span>
            <span className="font-semibold">{correctCount}개</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-600">🎯</span>
            <span className="font-semibold">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-600">🔥</span>
            <span className="font-semibold">{consecutiveCorrect}연속</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-600">⭐</span>
            <span className="font-semibold">{currentLevel === 'advanced' ? '고수' : currentLevel === 'intermediate' ? '중급' : '초급'}</span>
          </div>
        </div>
        
        {/* 최고기록 표시 */}
        {bestRecord && (
          <div className="text-xs text-gray-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            🏆 최고기록: {bestRecord.correctCount}개 ({bestRecord.accuracy}%) 연속{bestRecord.maxConsecutive}개
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {correctCount >= 30 && (
            <span className="text-red-600 font-semibold">🔥 고수 모드! 전문 키워드 도전!</span>
          )}
          {correctCount >= 10 && correctCount < 30 && (
            <span className="text-orange-600 font-semibold">⚡ 중급 모드! 기술 키워드!</span>
          )}
          {correctCount < 10 && (
            <span>정답 10개 이상 시 중급 모드로!</span>
          )}
        </div>
      </div>



      {/* 뒤로가기 및 공룡게임하기 버튼 */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => onBack && onBack()}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition-colors"
        >
          뒤로가기
        </button>
        <button
          onClick={() => onSwitchGame('dino')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <span>🦖</span>
          <span>공룡 게임하기</span>
        </button>
      </div>
    </div>
  );
} 