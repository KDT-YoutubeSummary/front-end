// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 임포트
import LibraryPage from './pages/LibraryPage.jsx'; // LibraryPage가 이미 구현되었다고 가정
import MyPage from './pages/MyPage'; // MyPage 컴포넌트 임포트

// MyPageModals에서 내보낸 모든 모달 컴포넌트들을 임포트합니다.
// App.jsx에서 직접 사용하는 MessageModal도 여기서 임포트하여 중복 정의를 피합니다.
// PasswordChangeModal, EmailChangeModal 대신 ProfileEditModal을 임포트합니다.
import { ProfileEditModal, DeleteAccountModal, ReauthModal, MessageModal } from './components/MyPageModals.jsx';

// App.jsx에서 직접 사용하는 Lucide React 아이콘들을 임포트합니다.
import { Home, Library, Bell, User, Search, Play, Eye, Calendar, Hash, Settings, X, Clock, Repeat, LogOut, Trash2, Edit, Mail, Lock, Lightbulb } from 'lucide-react';


function App() {
    // --- UI and Modal States ---
    const [currentPage, setCurrentPage] = useState('mypage'); // 마이페이지를 바로 확인하도록 'mypage'로 시작 페이지 설정
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 더미 데이터이므로 항상 로그인 상태로 가정
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 요약 기능 로딩 (더미)
    const [showSummary, setShowSummary] = useState(false); // 요약 결과 표시 (더미)
    const [showReminderModal, setShowReminderModal] = useState(false); // 리마인더 설정 모달 (더미)
    const [showMessageModal, setShowMessageModal] = useState(false); // 전역 메시지 모달
    const [messageModalContent, setMessageModalContent] = useState('');
    const [showReauthModal, setShowReauthModal] = useState(false); // 재인증 모달
    const [reauthCallback, setReauthCallback] = useState(null); // 재인증 후 실행될 콜백 함수

    // 마이페이지 통합 수정 모달 상태
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);


    // --- Form States (메인 페이지 요약 기능용, 더미) ---
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // --- Reminder States (더미) ---
    const [reminderTime, setReminderTime] = useState('1시간 후');
    const [reminderInterval, setReminderInterval] = useState('1일마다');

    // --- 인증 관련 States (더미) ---
    const [userId, setUserId] = useState('mock-user-id-123'); // 마이페이지에 표시될 더미 ID
    const [userEmail, setUserEmail] = useState('mockuser@example.com'); // 마이페이지에 표시될 더미 이메일
    const [isAuthReady, setIsAuthReady] = useState(true); // 인증 준비 완료 상태 (더미)

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

    // MyPage의 '사용자 활동 로그'에 표시될 더미 데이터입니다.
    // LibraryPage에서 관리하는 실제 데이터와는 별개입니다.
    const [dummyLibraryItemsForMyPage, setDummyLibraryItemsForMyPage] = useState([
        { id: 'mylog1', title: '더미 활동 로그 1', date: '2023.05.20', hashtags: ['#더미로그'] },
        { id: 'mylog2', title: '더미 활동 로그 2: AI 영상 시청', date: '2023.05.22', hashtags: ['#AI'] },
        { id: 'mylog3', title: '더미 활동 로그 3: React 학습 요약', date: '2023.05.25', hashtags: ['#React'] },
        { id: 'mylog4', title: '더미 활동 로그 4', date: '2023.05.28', hashtags: ['#더미로그'] },
        { id: 'mylog5', title: '더미 활동 로그 5', date: '2023.06.01', hashtags: ['#더미로그'] },
        { id: 'mylog6', title: '더미 활동 로그 6: 클라우드 컴퓨팅 개요', date: '2023.06.05', hashtags: ['#Cloud'] },
    ]);


    // --- 더미 핸들러 함수들 ---
    const handleSubmit = async () => {
        setMessageModalContent('요약 기능은 실제 LLM 연동이 필요합니다. 현재는 더미 데이터를 생성합니다.');
        setShowMessageModal(true);
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

    const handleLoginSubmit = (email, password) => {
        setMessageModalContent('로그인 기능은 실제 Firebase 연동이 필요합니다. 더미 로그인 성공.');
        setShowMessageModal(true);
        setIsLoggedIn(true);
        setShowLogin(false);
        setUserId('mock-user-id-' + Math.random().toString(36).substring(7));
        setUserEmail(email);
    };

    const handleSignupSubmit = (id, password, email) => {
        setMessageModalContent('회원가입 기능은 실제 Firebase 연동이 필요합니다. 더미 회원가입 성공.');
        setShowMessageModal(true);
        setIsLoggedIn(true);
        setShowSignup(false);
        setUserId('mock-user-id-' + Math.random().toString(36).substring(7));
        setUserEmail(email);
    };

    const handleGoogleLogin = () => {
        setMessageModalContent('구글 로그인 기능은 현재 준비 중입니다. (더미)');
        setShowMessageModal(true);
    };

    const handleKakaoLogin = () => {
        setMessageModalContent('카카오 로그인 기능은 현재 준비 중입니다. (더미)');
        setShowMessageModal(true);
    };

    const handleLogout = () => {
        setMessageModalContent('로그아웃 되었습니다. 실제 Firebase 연동 시 로그아웃 처리됩니다.');
        setShowMessageModal(true);
        setIsLoggedIn(false);
        setUserId(null);
        setUserEmail('');
        setCurrentPage('main');
    };

    const resetToInitial = () => {
        setShowSummary(false);
        setCurrentSummaryData(null);
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryType('기본 요약');
    };

    // --- 통합 프로필 수정 함수 (MyPage로 전달) ---
    // ProfileEditModal에서 currentPassword, newEmail, newPassword, newId를 받습니다.
    const handleSaveProfile = (currentPassword, newEmail, newPassword, newId, closeCallback) => {
        // 실제 Firebase 연동 시, 여기에 재인증 및 ID/이메일/비밀번호 업데이트 로직이 들어갑니다.
        // 현재는 더미 메시지를 표시하고, 상태를 업데이트합니다.
        setMessageModalContent(`프로필 수정 시도 (더미):\n현재 비밀번호: ${currentPassword}\n새 ID: ${newId}\n새 이메일: ${newEmail}\n새 비밀번호: ${newPassword || '변경 없음'}`);
        setShowMessageModal(true);
        setUserId(newId);    // 더미 ID 업데이트
        setUserEmail(newEmail); // 더미 이메일 업데이트
        closeCallback(); // 모달 닫기
    };

    const handleDeleteAccount = (password) => {
        setMessageModalContent(`회원 탈퇴 시도 (더미): 비밀번호 ${password}`);
        setShowMessageModal(true);
        setShowReauthModal(false); // 재인증 모달 닫기
        handleLogout(); // 더미 로그아웃 처리
    };


    const handleGenerateRecommendation = async () => {
        setMessageModalContent('추천을 위한 요약본이 없습니다. 먼저 영상을 요약해주세요. (더미)');
        setShowMessageModal(true);

        setIsGeneratingRecommendation(true);
        setRecommendedVideo(null); // Reset previous recommendation

        setTimeout(() => {
            const dummyRecommendation = {
                title: "LLM을 활용한 애플리케이션 개발",
                reason: "사용자 라이브러리의 'AI요약', '영상학습' 태그와 관련하여 LLM 활용 분야의 심화 학습에 도움이 될 것입니다.",
                youtubeUrl: "https://www.youtube.com/watch?v=dummy_video_id_123"
            };
            setRecommendedVideo(dummyRecommendation);
            setIsGeneratingRecommendation(false);
            setMessageModalContent('추천 영상이 생성되었습니다. (더미 기능)');
            setShowMessageModal(true);
        }, 2000);
    };


    // 메뉴 아이템 (MyPage를 포함)
    const menuItems = [
        { id: 'main', icon: Home, label: '메인페이지' },
        { id: 'library', icon: Library, label: '사용자 라이브러리' },
        { id: 'reminder', icon: Bell, label: '리마인더 페이지' },
        { id: 'recommendation', icon: Lightbulb, label: '추천 페이지' },
        { id: 'mypage', icon: User, label: '마이페이지' }
    ];

    return (
        // 반응형 레이아웃을 위한 flex 설정 및 min-h-screen
        // md:flex-row는 중간 화면 크기부터 가로 배치, flex-col은 작은 화면에서 세로 배치
        // h-screen은 뷰포트 전체 높이를 사용, overflow-hidden은 불필요한 스크롤 방지
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-inter overflow-hidden">
            {/* Sidebar */}
            {/* flex-none으로 고정 폭을 유지하고, md:w-64와 같은 반응형 너비를 적용.
                sm:w-20은 작은 화면에서 아이콘만 보이도록 폭을 줄임.
                hidden md:block은 작은 화면에서 로고 텍스트/메뉴 텍스트를 숨김. */}
            <div className="w-full sm:w-20 md:w-64 flex-none bg-white shadow-lg border-r border-gray-200 rounded-tr-xl rounded-br-xl flex flex-col">
                {/* 로고 영역 */}
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2 justify-center md:justify-start">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                            <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
                        </div>
                        {/* md 화면 크기 이상에서만 LearnClip 텍스트 표시 */}
                        <h1 className="hidden md:block text-xl md:text-2xl font-extrabold text-gray-800">LearnClip</h1>
                    </div>
                </div>

                {/* 메뉴 항목 */}
                {/* flex-grow는 남은 공간을 채우고, overflow-y-auto로 스크롤 가능하게 함 */}
                <nav className="mt-4 flex-grow overflow-y-auto flex flex-col"> {/* flex-col 추가 */}
                    {menuItems.map((item) => {
                        const IconComponentMap = {
                            'main': Home, 'library': Library, 'reminder': Bell,
                            'recommendation': Lightbulb, 'mypage': User,
                        };
                        const Icon = IconComponentMap[item.id];

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    setRecommendedVideo(null); // 추천 영상 상태 초기화
                                }}
                                // 작은 화면에서는 아이콘만 중앙 정렬, 중간 화면 이상에서는 텍스트와 함께 좌측 정렬
                                className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-4 text-left hover:bg-red-50 hover:text-red-600 transition-all duration-200 ease-in-out ${
                                    currentPage === item.id ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700'
                                }`}
                            >
                                {Icon && <Icon className="h-5 w-5 md:h-5 md:w-5" />}
                                {/* md 화면 크기 이상에서만 메뉴 라벨 텍스트 표시 */}
                                <span className="hidden md:block text-sm md:text-base">{item.label}</span>
                            </button>
                        );
                    })}
                    {/* 로그아웃 버튼을 메뉴 안에, flex-col의 가장 아래에 위치 */}
                    {isLoggedIn && (
                        // mt-auto를 사용하여 남은 공간을 밀어내어 가장 아래에 배치
                        <div className="mt-auto pb-4">
                            <button
                                onClick={handleLogout}
                                // 작은 화면에서는 아이콘만 중앙 정렬, 중간 화면 이상에서는 텍스트와 함께 좌측 정렬
                                className="w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5 md:h-5 md:w-5" />
                                {/* md 화면 크기 이상에서만 로그아웃 텍스트 표시 */}
                                <span className="hidden md:block font-medium text-sm md:text-base">로그아웃</span>
                            </button>
                        </div>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            {/* flex-1로 남은 공간을 모두 차지하고, flex-col로 내부 요소들을 세로로 정렬
                overflow-hidden으로 메인 컨텐츠 영역의 스크롤을 방지 (내부 div가 스크롤 처리) */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                {/* flex-shrink-0로 헤더가 공간을 줄이지 않도록 함 */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-8 md:py-4 flex items-center justify-between rounded-bl-xl flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                        {menuItems.find(item => item.id === currentPage)?.label}
                    </h2>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* 작은 화면에서 이메일 숨김 */}
                        <span className="text-xs md:text-sm text-gray-600 hidden sm:block">
                            {isLoggedIn ? `로그인됨 (ID: ${userEmail})` : '로그인 필요'}
                        </span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs md:text-sm font-medium">
                            {userEmail ? userEmail.substring(0,2).toUpperCase() : <User />}
                        </div>
                    </div>
                </div>

                {/* Content Area - 반응형 패딩 적용 */}
                {/* flex-1로 남은 공간을 모두 차지하고, overflow-y-auto로 이 영역만 스크롤 가능하게 함
                    p-4 md:p-8로 화면 크기에 따라 패딩 조정 */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
                    {/* Main Page Content */}
                    {currentPage === 'main' && (
                        <div className="max-w-full md:max-w-4xl mx-auto"> {/* 작은 화면에서 꽉 채우고, 중간 화면 이상에서 중앙 정렬 */}
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
                                            disabled={isLoading || !isAuthReady}
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

                    {/* Library Page Content */}
                    {currentPage === 'library' && <LibraryPage />}

                    {/* Reminder Page Content (더미) */}
                    {currentPage === 'reminder' && (
                        <div className="max-w-full md:max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">리마인더 페이지 (더미)</h3>
                            <p className="text-gray-600 text-sm md:text-base">리마인더 목록을 표시할 페이지입니다.</p>
                            {/* 여기에 실제 ReminderPage 컴포넌트를 렌더링 */}
                        </div>
                    )}

                    {/* Recommendation Page Content (더미) */}
                    {currentPage === 'recommendation' && (
                        <div className="max-w-full md:max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">추천 페이지 (더미)</h3>
                            <p className="text-gray-600 text-sm md:text-base">추천 영상을 표시할 페이지입니다.</p>
                            {/* 여기에 실제 RecommendationPage 컴포넌트를 렌더링 */}
                        </div>
                    )}

                    {/* MyPage Content (여기에 MyPage 컴포넌트를 렌더링) */}
                    {currentPage === 'mypage' && (
                        <MyPage
                            userEmail={userEmail}
                            userId={userId}
                            handleSaveProfile={handleSaveProfile} // 통합된 함수 전달
                            handleDeleteAccount={() => setReauthCallback(() => handleDeleteAccount) || setShowReauthModal(true)}
                            libraryItems={dummyLibraryItemsForMyPage} // 마이페이지용 더미 활동 로그 전달
                        />
                    )}
                </div>
            </div>

            {/* Login Modal (MyPageModals에서 임포트한 MessageModal로 대체) */}
            {showLogin && (
                <MessageModal
                    message="로그인 모달 (실제 구현 필요)"
                    onClose={() => setShowLogin(false)}
                />
            )}

            {/* Signup Modal (MyPageModals에서 임포트한 MessageModal로 대체) */}
            {showSignup && (
                <MessageModal
                    message="회원가입 모달 (실제 구현 필요)"
                    onClose={() => setShowSignup(false)}
                />
            )}

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
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            {/* Re-authentication Modal (MyPageModals에서 임포트한 ReauthModal 사용) */}
            {showReauthModal && (
                <ReauthModal
                    onClose={() => setShowReauthModal(false)}
                    onReauthenticate={reauthCallback}
                />
            )}
        </div>
    );
}

export default App;
