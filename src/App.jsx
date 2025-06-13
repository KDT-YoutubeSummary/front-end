// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CSS 파일 임포트
import './App.css';

// 페이지 컴포넌트 임포트
import LibraryPage from './pages/LibraryPage.jsx'; // LibraryPage가 이미 구현되었다고 가정
import MyPage from './pages/MyPage'; // MyPage 컴포넌트 임포트
import AuthPage from './pages/AuthPage.jsx'; // AuthPage 임포트

// MyPageModals에서 내보낸 모달 컴포넌트들을 임포트합니다.
import { ProfileEditModal, DeleteAccountModal, ReauthModal, MessageModal } from './components/MyPageModals.jsx';

// App.jsx에서 직접 사용하는 Lucide React 아이콘들을 임포트합니다.
import { Home, Library, Bell, User, Search, Play, Eye, Calendar, Hash, Settings, X, Clock, Repeat, LogOut, Trash2, Edit, Mail, Lock, Lightbulb } from 'lucide-react';


function App() {
    // --- UI and Modal States ---
    const [currentPage, setCurrentPage] = useState('main'); // 초기 페이지를 'main'으로 설정
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 실제 로그인 상태 (초기에는 false)
    const [showAuthPage, setShowAuthPage] = useState(false); // AuthPage를 띄울지 여부 (모달이 아니라 페이지 전환용)
    const [isLoading, setIsLoading] = useState(false); // 요약 기능 로딩 (더미)
    const [showSummary, setShowSummary] = useState(false); // 요약 결과 표시 (더미)
    const [showReminderModal, setShowReminderModal] = useState(false); // 리마인더 설정 모달 (더미)
    const [showMessageModal, setShowMessageModal] = useState(false); // 전역 메시지 모달
    const [messageModalContent, setMessageModalContent] = useState('');
    const [showReauthModal, setShowReauthModal] = useState(false); // 재인증 모달
    const [reauthCallback, setReauthCallback] = useState(null); // 재인증 후 실행될 콜백 함수

    // --- Form States (메인 페이지 요약 기능용, 더미) ---
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // --- Reminder States (더미) ---
    const [reminderTime, setReminderTime] = useState('1시간 후');
    const [reminderInterval, setReminderInterval] = useState('1일마다');

    // --- 인증 관련 States (MyPage에서 조회하여 App.jsx 전역 상태를 업데이트함) ---
    const [globalUserName, setGlobalUserName] = useState('Guest'); // 전역 사용자 이름 (헤더 표시용)
    const [globalUserEmail, setGlobalUserEmail] = useState('guest@example.com'); // 전역 사용자 이메일 (헤더 표시용)


    // --- Reminder Page States (더미) ---
    const [reminders, setReminders] = useState([]); // 리마인더 목록 (더미)
    const [showReminderEditModal, setShowReminderEditModal] = useState(false); // 리마인더 수정 모달 (더미)
    const [editingReminder, setEditingReminder] = useState(null); // 수정 중인 리마인더 (더미)

    // --- Recommendation Page States (더미) ---
    const [recommendedVideo, setRecommendedVideo] = useState(null);
    const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);

    // --- Data and Constants ---
    const [currentSummaryData, setCurrentSummaryData] = useState(null); // 메인 페이지 요약 결과 (더미)

    const summaryTypesOptions = ['기본 요약', '3줄 요약', '키워드 요약', '타임라인 요약'];
    const reminderTimesOptions = ['30분 후', '1시간 후', '2시간 후', '내일 같은 시간'];
    const reminderIntervalsOptions = ['1일마다', '3일마다', '1주마다', '1달마다'];


    // --- MyPage에서 호출할 App.jsx의 콜백 함수들 ---
    const handleUpdateGlobalUserDisplay = (userName, userEmail) => {
        setGlobalUserName(userName);
        setGlobalUserEmail(userEmail);
    };

    // MessageModal을 띄우는 함수 (confirm 여부, 콜백 함수를 포함)
    const handleAppShowMessage = (message, isConfirm = false, onConfirm = null) => {
        setMessageModalContent(message);
        setShowMessageModal(true);
        if (isConfirm && onConfirm) {
            setReauthCallback(() => () => {
                if (onConfirm) onConfirm();
                setShowMessageModal(false);
                setReauthCallback(null);
            });
        } else {
            setReauthCallback(null);
        }
    };

    const handleAppShowReauthModal = (show) => {
        setShowReauthModal(show);
    };

    const handleAppSetReauthCallback = (callback) => {
        setReauthCallback(() => callback);
    };

    const handleAppUserLoggedOut = () => {
        // 실제 로그아웃 API 호출은 MyPage가 아닌 App.jsx의 handleLogout에서 처리
        handleAppShowMessage('로그아웃 되었습니다.');
        setIsLoggedIn(false);
        setGlobalUserName('Guest');
        setGlobalUserEmail('guest@example.com');
        setCurrentPage('main');
    };
    // ---


    // --- 인증 관련 API 함수들 (App.jsx에서 직접 호출) ---
    // 로그인 시 userName과 Password를 받도록 수정
    const handleLoginSubmit = async (userName, password) => { // AuthPage에서 받은 userName 사용
        console.log("App: handleLoginSubmit 시도 중", { userName, password });
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 백엔드 LoginRequestDTO의 'userName' 필드를 사용
                body: JSON.stringify({ userName: userName, password }), // 유저 아이디를 'userName' 필드에 담아 전송
            });

            // 응답이 성공(2xx) 범위가 아니거나, JSON 파싱 오류가 발생할 수 있으므로
            // response.text()로 먼저 응답을 받고 JSON 파싱을 시도하는 것이 더 안전합니다.
            let responseBody = await response.text();
            let result;
            try {
                result = JSON.parse(responseBody); // JSON으로 파싱 시도
            } catch (e) {
                // 백엔드에서 JSON이 아닌 응답(예: 빈 응답, HTML)을 보낼 경우
                console.error("App: 로그인 응답 JSON 파싱 실패:", e, "응답 본문:", responseBody);
                throw new Error(`서버 응답 오류 (JSON 형식 아님): ${responseBody || response.statusText}`);
            }

            console.log("App: 로그인 API 응답 상태:", response.status, "결과:", result);

            // 로그인 성공 여부를 HTTP 상태 코드 (response.ok)와 응답 본문의 accessToken 존재 여부로 판단
            if (response.ok && result.accessToken) { // 백엔드 성공 응답에 code 필드가 없으므로 accessToken 존재 여부로 판단
                // 로그인 성공 시 백엔드에서 받은 토큰, userId, username 저장
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('userId', result.userId); // userId도 저장
                localStorage.setItem('username', result.username); // username도 저장

                handleAppShowMessage('로그인 성공!');
                setIsLoggedIn(true);
                setShowAuthPage(false); // 로그인 성공 시 AuthPage 닫기
                setCurrentPage('main'); // 로그인 후 메인 페이지로 이동

            } else {
                // response.ok는 true지만 accessToken이 없거나, response.ok가 false인 경우 (논리적 실패)
                // 백엔드에서 에러 메시지를 result.message에 담아 보낼 것으로 가정. 없다면 일반적인 실패 메시지.
                // 백엔드가 code 필드를 실패 응답에서만 보낼 수도 있으므로 result.message를 우선 사용
                throw new Error(result.message || `로그인 실패: ${result.code || response.status} ${response.statusText}`);
            }

        } catch (error) {
            console.error("App: 로그인 오류 캐치:", error);
            handleAppShowMessage(`로그인 오류: ${error.message}`);
            setIsLoggedIn(false);
        }
    };

    // 회원가입 시 ID, Email, Password 모두 받도록 수정
    const handleSignupSubmit = async (userName, password, email) => {
        console.log("App: handleSignupSubmit 시도 중", { userName, password, email });
        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, email, password }), // 회원가입은 userName, email, password 사용
            });

            let responseBody = await response.text();
            let result;
            try {
                result = JSON.parse(responseBody);
            } catch (e) {
                console.error("App: 회원가입 응답 JSON 파싱 실패:", e, "응답 본문:", responseBody);
                throw new Error(`서버 응답 오류 (JSON 형식 아님): ${responseBody || response.statusText}`);
            }

            console.log("App: 회원가입 API 응답 상태:", response.status, "결과:", result);

            // 회원가입 성공 여부를 HTTP 상태 코드 (response.ok)와 result.code (있다면)로 판단
            if (response.ok && (result.code === undefined || result.code === 200)) { // code가 없거나 200인 경우 성공
                handleAppShowMessage('회원가입 성공! 이제 로그인해주세요.');
            } else {
                // 백엔드에서 에러 메시지를 result.message에 담아 보낼 것으로 가정. 없다면 일반적인 실패 메시지.
                throw new Error(result.message || `회회원가입 실패: ${result.code || response.status} ${response.statusText}`);
            }

        } catch (error) {
            console.error("App: 회원가입 오류 캐치:", error);
            handleAppShowMessage(`회원가입 오류: ${error.message}`);
        }
    };

    const handleLogout = () => {
        // TODO: 실제 로그아웃 API 연동 필요 (백엔드 세션 무효화 등)
        localStorage.removeItem('accessToken'); // 클라이언트 측 토큰 삭제
        localStorage.removeItem('userId'); // 저장된 userId도 삭제
        localStorage.removeItem('username'); // 저장된 username도 삭제
        handleAppShowMessage('로그아웃 되었습니다.');
        setIsLoggedIn(false);
        setGlobalUserName('Guest');
        setGlobalUserEmail('guest@example.com');
        setCurrentPage('main'); // 로그아웃 후 메인 페이지로 이동
        setShowAuthPage(false); // 로그아웃 시 AuthPage 숨김
    };

    // --- 메인 페이지 요약 기능 (로그인 확인) ---
    const handleSubmit = async () => {
        if (!isLoggedIn) {
            handleAppShowMessage("요약 기능을 사용하려면 로그인이 필요합니다.");
            setCurrentPage('auth'); // AuthPage로 전환
            setShowAuthPage(true); // AuthPage 렌더링 활성화
            return;
        }
        handleAppShowMessage('요약 기능은 실제 LLM 연동이 필요합니다. 현재는 더미 데이터를 생성합니다.');
        setIsLoading(true);

        setTimeout(() => {
            const generatedSummary = {
                thumbnail: `https://i.ytimg.com/vi/${youtubeUrl.split('v=')[1]?.substring(0, 11) || 'dQw4w9WgXcQ'}/mqdefault.jpg`,
                title: `[자동 생성] ${youtubeUrl} 요약`,
                uploader: 'LearnClip AI',
                views: 'N/A',
                date: new Date().toLocaleDateString('ko-KR'),
                hashtags: ['#AI요약', '#더미데이터'],
                summary: `제공된 YouTube URL (${youtubeUrl})에 대한 ${summaryType} 결과입니다. 사용자 목적: "${userPurpose}".
이것은 실제 LLM 호출을 대체하는 목업 요약입니다.
이 영상은 React의 기초부터 고급 개념까지 단계별로 설명하는 완벽한 가이드입니다.`,
            };
            setCurrentSummaryData(generatedSummary);
            setIsLoading(false);
            setShowSummary(true);
        }, 2000);
    };

    const resetToInitial = () => {
        setShowSummary(false);
        setCurrentSummaryData(null);
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryType('기본 요약');
    };


    const handleGenerateRecommendation = async () => {
        if (!isLoggedIn) {
            handleAppShowMessage("추천 기능을 사용하려면 로그인이 필요합니다.");
            setCurrentPage('auth');
            setShowAuthPage(true);
            return;
        }
        handleAppShowMessage('추천을 위한 요약본이 없습니다. 먼저 영상을 요약해주세요. (더미)');

        setIsGeneratingRecommendation(true);
        setRecommendedVideo(null);

        setTimeout(() => {
            const dummyRecommendation = {
                title: "LLM을 활용한 애플리케이션 개발",
                reason: "사용자 라이브러리의 'AI요약', '영상학습' 태그와 관련하여 LLM 활용 분야의 심화 학습에 도움이 될 것입니다.",
                youtubeUrl: "https://www.youtube.com/watch?v=dummy_video_id_123"
            };
            setRecommendedVideo(dummyRecommendation);
            setIsGeneratingRecommendation(false);
            handleAppShowMessage('추천 영상이 생성되었습니다. (더미 기능)');
        }, 2000);
    };


    // 메뉴 아이템
    const menuItems = [
        { id: 'main', icon: Home, label: '메인페이지' },
        { id: 'library', icon: Library, label: '사용자 라이브러리' },
        { id: 'reminder', icon: Bell, label: '리마인더 페이지' },
        { id: 'recommendation', icon: Lightbulb, label: '추천 페이지' },
        { id: 'mypage', icon: User, label: '마이페이지' }
    ];

    // --- 메뉴 클릭 시 로그인 확인 로직 ---
    const handleMenuItemClick = (itemId) => {
        const protectedPages = ['library', 'reminder', 'recommendation', 'mypage'];

        if (protectedPages.includes(itemId) && !isLoggedIn) {
            handleAppShowMessage("이 페이지를 보려면 로그인이 필요합니다.");
            setCurrentPage('auth');
            setShowAuthPage(true);
            return;
        }
        setShowAuthPage(false); // 인증 페이지가 아닌 다른 메뉴 클릭 시 AuthPage 숨김
        setCurrentPage(itemId);
        setRecommendedVideo(null);
    };

    // 초기 로드 시 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUsername = localStorage.getItem('username');
        const storedUserEmail = localStorage.getItem('userEmail');

        if (token) {
            setIsLoggedIn(true);
            if (storedUsername) setGlobalUserName(storedUsername);
            if (storedUserEmail) setGlobalUserEmail(storedUserEmail);
            // 만약 로그인된 상태라면 메인 페이지로 바로 이동
            setCurrentPage('main');
            setShowAuthPage(false); // AuthPage가 보이면 안 됨
        } else {
            // 로그인되어 있지 않다면 AuthPage를 보여줌
            setCurrentPage('auth');
            setShowAuthPage(true);
        }
    }, []);


    return (
        // 전체 레이아웃 컨테이너: flex-col (모바일) -> md:flex-row (데스크탑), h-screen으로 높이 고정
        <div className="flex min-h-screen w-full bg-gray-50 font-inter">
            {/* Sidebar */}
            {/* w-full sm:w-20 md:w-64: 모바일에서 전체 너비, sm에서 20px, md에서 64px 고정 너비 */}
            <div className="w-full sm:w-20 md:w-64 flex-none bg-white shadow-lg border-r border-gray-200 rounded-tr-xl rounded-br-xl flex flex-col">
                {/* 로고 영역 */}
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2 justify-center md:justify-start">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                            <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
                        </div>
                        <h1 className="hidden md:block text-xl md:text-2xl font-extrabold text-gray-800">LearnClip</h1>
                    </div>
                </div>

                {/* 메뉴 항목 */}
                {/* flex-grow: 남은 공간 채우기, overflow-y-auto: 메뉴 스크롤 가능 */}
                <nav className="mt-4 flex-grow overflow-y-auto flex flex-col">
                    {menuItems.map((item) => {
                        const IconComponentMap = {
                            'main': Home, 'library': Library, 'reminder': Bell,
                            'recommendation': Lightbulb, 'mypage': User,
                        };
                        const Icon = IconComponentMap[item.id];

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuItemClick(item.id)}
                                className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-4 text-left hover:bg-red-50 hover:text-red-600 transition-all duration-200 ease-in-out ${
                                    currentPage === item.id ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700'
                                }`}
                            >
                                {Icon && <Icon className="h-5 w-5 md:h-5 md:w-5" />}
                                <span className="hidden md:block text-sm md:text-base">{item.label}</span>
                            </button>
                        );
                    })}
                    {/* 로그인 상태에 따라 로그아웃 또는 로그인/회원가입 버튼 표시 */}
                    {isLoggedIn ? (
                        <div className="mt-auto pb-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5 md:h-5 md:w-5" />
                                <span className="hidden md:block font-medium text-sm md:text-base">로그아웃</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-auto pb-4">
                            <button
                                onClick={() => handleMenuItemClick('auth')}
                                className="w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-3 text-left text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <User className="h-5 w-5 md:h-5 md:w-5" />
                                <span className="hidden md:block font-medium text-sm md:text-base">로그인/회원가입</span>
                            </button>
                        </div>
                    )}
                </nav>
            </div>

            {/* Main Content Area */}
            {/* flex-1: 남은 공간 채우기, flex-col: 내부 요소 세로 정렬, w-full: 항상 너비 100% */}
            <div className="flex-1 flex flex-col w-full">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-8 md:py-4 flex items-center justify-between rounded-bl-xl flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                        {showAuthPage ? '로그인 / 회원가입' : menuItems.find(item => item.id === currentPage)?.label}
                    </h2>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="text-xs md:text-sm text-gray-600 hidden sm:block">
                            {isLoggedIn ? `로그인됨 (ID: ${globalUserName})` : '로그인 필요'}
                        </span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs md:text-sm font-medium">
                            {globalUserName ? globalUserName.substring(0,2).toUpperCase() : <User />}
                        </div>
                    </div>
                </div>

                {/* Content Area - 실제 페이지가 렌더링되는 스크롤 가능한 영역 */}
                {/* flex-1: 남은 공간 채우기, overflow-y-auto: 세로 스크롤 가능, w-full: 항상 너비 100% */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100 w-full">
                    {/* AuthPage 렌더링 */}
                    {showAuthPage && (
                        <AuthPage
                            onLogin={handleLoginSubmit}
                            onSignup={handleSignupSubmit}
                            onMessage={handleAppShowMessage}
                        />
                    )}

                    {/* 나머지 페이지 렌더링 (AuthPage가 띄워지지 않을 때만) */}
                    {!showAuthPage && (
                        <>
                            {currentPage === 'main' && (
                                <div className="max-w-none w-full">
                                {/* mx-auto는 max-w 있을때만 작동 */}
                                    {!showSummary ? (
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                                            <div className="space-y-4 md:space-y-6">
                                                <div>
                                                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                                                        요약 타입
                                                    </label>
                                                    <select
                                                        value={summaryType}
                                                        onChange={(e) => setSummaryType(e.target.value)}
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 text-sm md:text-base"
                                                    >
                                                        {summaryTypesOptions.map((type) => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                                                        사용자 목적 (선택사항)
                                                    </label>
                                                    <textarea
                                                        value={userPurpose}
                                                        onChange={(e) => setUserPurpose(e.target.value)}
                                                        placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요?"
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y min-h-[60px] md:min-h-[80px] text-gray-700 text-sm md:text-base"
                                                        rows="3"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                                                        유튜브 URL <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={youtubeUrl}
                                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 text-sm md:text-base"
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isLoading}
                                                    className="w-full bg-red-500 text-white py-2 px-4 md:py-3 md:px-6 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-base md:text-lg"
                                                >
                                                    {isLoading ? '요약 중...' : '요약 시작'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                                <div className="p-4 md:p-6 border-b border-gray-200">
                                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-start">
                                                        <img
                                                            src={currentSummaryData?.thumbnail || 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                                            alt="썸네일"
                                                            className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg shadow-md"
                                                            onError={(e) => e.target.src = 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
                                                                {currentSummaryData?.title}
                                                            </h3>
                                                            <p className="text-gray-600 text-xs md:text-sm mb-2">{currentSummaryData?.uploader}</p>
                                                            <div className="flex flex-wrap items-center space-x-2 text-xs md:text-sm text-gray-500">
                                                                <div className="flex items-center space-x-1">
                                                                    <Eye className="h-3 w-3 md:h-4 md:w-4" />
                                                                    <span>{currentSummaryData?.views} 조회수</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                                                    <span>{currentSummaryData?.date}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                                                    <div className="flex items-center space-x-2">
                                                        <Hash className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                                                        <div className="flex flex-wrap gap-1">
                                                            {currentSummaryData?.hashtags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-6">
                                                    <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
                                                        {summaryType} 결과
                                                    </h4>
                                                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                                                        {currentSummaryData?.summary}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mt-4 md:mt-6">
                                                <button
                                                    onClick={resetToInitial}
                                                    className="bg-gray-200 text-gray-800 py-2 px-6 md:py-3 md:px-8 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105 text-base md:text-lg"
                                                >
                                                    새로운 요약하기
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentPage === 'library' && <LibraryPage />}

                            {currentPage === 'reminder' && (
                                <div className="max-w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center"> {/* md:max-w-4xl 제거 */}
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">리마인더 페이지 (더미)</h3>
                                    <p className="text-gray-600 text-sm md:text-base">리마인더 목록을 표시할 페이지입니다.</p>
                                </div>
                            )}

                            {currentPage === 'recommendation' && (
                                <div className="max-w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center"> {/* md:max-w-4xl 제거 */}
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">추천 페이지 (더미)</h3>
                                    <p className="text-gray-600 text-sm md:text-base">추천 영상을 표시할 페이지입니다.</p>
                                </div>
                            )}

                            {currentPage === 'mypage' && (
                                <MyPage
                                    isLoggedIn={isLoggedIn}
                                    onUpdateGlobalUserDisplay={handleUpdateGlobalUserDisplay}
                                    onShowMessage={handleAppShowMessage}
                                    onShowReauthModal={handleAppShowReauthModal}
                                    onSetReauthCallback={handleAppSetReauthCallback}
                                    onUserLoggedOut={handleAppUserLoggedOut}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Loading Modal */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto text-center animate-fade-in-up">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">요약 중입니다</h3>
                        <p className="text-gray-600">잠시만 기다려주세요...</p>
                    </div>
                </div>
            )}

            {/* Reminder Settings Modal (더미 MessageModal로 대체) */}
            {showReminderModal && (
                <MessageModal
                    message="리마인더 설정 모달 (실제 구현 필요)"
                    onClose={() => setShowReminderModal(false)}
                />
            )}

            {/* Reminder Edit Modal (더미 MessageModal로 대체) */}
            {showReminderEditModal && editingReminder && (
                <MessageModal
                    message="리마인더 수정 모달 (실제 구현 필요)"
                    onClose={() => setShowReminderEditModal(false)}
                />
            )}

            {/* Generic Message Modal (MyPageModals에서 임포트한 MessageModal 사용) */}
            {showMessageModal && (
                <MessageModal
                    message={messageModalContent}
                    onClose={() => {
                        if (reauthCallback && typeof reauthCallback === 'function' && reauthCallback.hasOwnProperty('isConfirmCallback')) {
                            reauthCallback();
                        }
                        setShowMessageModal(false);
                        setReauthCallback(null);
                    }}
                    onConfirm={reauthCallback}
                    isConfirm={reauthCallback !== null}
                />
            )}

            {/* Re-authentication Modal (MyPageModals에서 임포트한 ReauthModal 사용) */}
            {showReauthModal && (
                <ReauthModal
                    onClose={() => setShowReauthModal(false)}
                    onReauthenticate={(password, modalCloseCallback) => {
                        if (reauthCallback) {
                            reauthCallback(password, modalCloseCallback);
                        }
                        setShowReauthModal(false);
                    }}
                />
            )}
        </div>
    );
}

export default App;
