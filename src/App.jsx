// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// axios 임포트
import axios from 'axios';

// API 서비스 임포트
import { reminderApi, recommendationApi, setAuthToken } from './services/api.jsx';

// 페이지 컴포넌트 임포트
// import LibraryPage from './pages/LibraryPage.jsx'; // 새로 생성한 페이지 임포트
import { ReminderPage, ReminderEditModal } from './pages/ReminderPage.jsx'; // 리마인더 페이지 임포트
import RecommendationPage from './pages/RecommendationPage.jsx'; // 추천 페이지 임포트

// App.jsx에서 직접 사용하는 Lucide React 아이콘들을 임포트합니다.
import { Home, Library, Bell, User, Search, Play, Eye, Calendar, Hash, Settings, X, Clock, Repeat, LogOut, Trash2, Edit, Mail, Lock, Lightbulb } from 'lucide-react';

// 임시 MessageModal (App.jsx에서 여전히 사용될 수 있으므로 유지)
const MessageModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4">알림</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                >
                    확인
                </button>
            </div>
        </div>
    );
};


function App() {
    // --- UI and Modal States ---
    const [currentPage, setCurrentPage] = useState('main');
    const [isLoggedIn, setIsLoggedIn] = useState(true); // false에서 true로 변경
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 요약 기능 로딩
    const [showSummary, setShowSummary] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState('');
    const [showReauthModal, setShowReauthModal] = useState(false);
    const [reauthCallback, setReauthCallback] = useState(null);

    // --- Form States ---
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // --- Firebase Related States (더미) ---
    const [userId, setUserId] = useState('1');
    const [userEmail, setUserEmail] = useState('test@example.com');
    const [isAuthReady, setIsAuthReady] = useState(true);

    // --- Recommendation Page States ---
    const [recommendedVideo, setRecommendedVideo] = useState(null);
    const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);

    // --- Data and Constants ---
    const [currentSummaryData, setCurrentSummaryData] = useState(null);

    const summaryTypesOptions = ['기본 요약', '3줄 요약', '키워드 요약', '타임라인 요약'];


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
        setUserEmail(email);
    };

    const handleSignupSubmit = (id, password, email) => {
        setMessageModalContent('회원가입 기능은 실제 Firebase 연동이 필요합니다. 더미 회원가입 성공.');
        setShowMessageModal(true);
        setIsLoggedIn(true);
        setShowSignup(false);
        setUserId(id);
        setUserEmail(email);
    };

    const handleGoogleLogin = () => {
        setMessageModalContent('구글 로그인 기능은 현재 준비 중입니다.');
        setShowMessageModal(true);
    };

    const handleKakaoLogin = () => {
        setMessageModalContent('카카오 로그인 기능은 현재 준비 중입니다.');
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

    // LibraryPage로 이동된 함수들은 여기에서 제거합니다.
    // const handleSaveUserNotes = ...
    // const handleDeleteLibraryItem = ...
    // const handleAddReminder = ...
    // const handleDeleteReminder = ...
    // const handleUpdateReminder = ...

    const handleChangePassword = (currentPassword, newPassword, callback) => {
        setMessageModalContent('비밀번호 변경 기능은 실제 Firebase 연동이 필요합니다. (더미 기능)');
        setShowMessageModal(true);
        callback();
    };

    const handleChangeEmail = (currentPassword, newEmail, callback) => {
        setMessageModalContent('이메일 변경 기능은 실제 Firebase 연동이 필요합니다. (더미 기능)');
        setShowMessageModal(true);
        setUserEmail(newEmail);
        callback();
    };

    const handleDeleteAccount = (currentPassword) => {
        setMessageModalContent('회원 탈퇴 기능은 실제 Firebase 연동이 필요합니다. (더미 기능)');
        setShowMessageModal(true);
        handleLogout(); // 더미 로그아웃 처리
    };

    const handleGenerateRecommendation = async () => {
        // libraryItems는 이제 LibraryPage에 있으므로, App.jsx에서는 직접 접근 불가
        // 추천 로직을 위한 데이터는 LibraryPage로부터 props로 받거나 별도의 컨텍스트로 관리해야 합니다.
        // 현재는 더미 로직으로 그대로 둡니다.
        // if (libraryItems.length === 0) { // 이 부분은 이제 LibraryPage에서 전달받은 데이터가 필요
        setMessageModalContent('추천을 위한 요약본이 없습니다. 먼저 영상을 요약해주세요. (더미)');
        setShowMessageModal(true);
        //    return;
        //}

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

    // App.jsx에는 더 이상 libraryItems, filteredLibraryItems, tagStatistics, tagChartData가 없습니다.
    // 이들은 LibraryPage에서 관리됩니다.
    // const filteredLibraryItems = ...
    // const tagStatistics = ...
    // const tagChartData = ...


    const menuItems = [
        { id: 'main', icon: Home, label: '메인페이지' },
        { id: 'library', icon: Library, label: '사용자 라이브러리' },
        { id: 'reminder', icon: Bell, label: '리마인더 페이지' },
        { id: 'recommendation', icon: Lightbulb, label: '추천 페이지' },
        { id: 'mypage', icon: User, label: '마이페이지' }
    ];

    // App.jsx에서는 라이브러리 관련 useEffect를 제거합니다.
    // useEffect(() => { /* fetchLibraryItems, fetchLibraryDetail ... */ }, [...]);


    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-inter">
            {/* Sidebar - 모바일에서는 토글 가능하도록 수정 */}
            <div className="hidden md:block md:w-64 bg-white shadow-lg border-r border-gray-200 rounded-tr-xl rounded-br-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                            <Play className="h-6 w-6 text-white fill-current" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-800">LearnClip</h1>
                    </div>
                </div>

                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const IconComponentMap = {
                            'main': Home, 'library': Library, 'reminder': Bell,
                            'recommendation': Lightbulb, 'mypage': User,
                            'Search': Search, 'Play': Play, 'Eye': Eye, 'Calendar': Calendar,
                            'Hash': Hash, 'Settings': Settings, 'X': X, 'Clock': Clock,
                            'Repeat': Repeat, 'LogOut': LogOut, 'Trash2': Trash2, 'Edit': Edit,
                            'Mail': Mail, 'Lock': Lock, 'UserIcon': User,
                        };
                        const Icon = IconComponentMap[item.id];

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    // LibraryPage에서 selectedLibraryItem을 관리하므로 여기서는 null 처리 필요 없음
                                    // setSelectedLibraryItem(null);
                                    setRecommendedVideo(null);
                                }}
                                className={`w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-red-50 hover:text-red-600 transition-all duration-200 ease-in-out ${
                                    currentPage === item.id ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700'
                                }`}
                            >
                                {Icon && <Icon className="h-5 w-5" />}
                                <span className="text-base">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {isLoggedIn && (
                    <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-6 py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 모바일 사이드바 토글 버튼 */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}
                    className="bg-white p-2 rounded-lg shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* 모바일 사이드바 메뉴 */}
            <div id="mobile-menu" className="hidden md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
                <div className="w-64 h-full bg-white shadow-lg overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                <Play className="h-6 w-6 text-white fill-current" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-800">LearnClip</h1>
                        </div>
                        <button
                            onClick={() => document.getElementById('mobile-menu').classList.add('hidden')}
                            className="text-gray-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="mt-6">
                        {menuItems.map((item) => {
                            const IconComponentMap = {
                                'main': Home, 'library': Library, 'reminder': Bell,
                                'recommendation': Lightbulb, 'mypage': User,
                                'Search': Search, 'Play': Play, 'Eye': Eye, 'Calendar': Calendar,
                                'Hash': Hash, 'Settings': Settings, 'X': X, 'Clock': Clock,
                                'Repeat': Repeat, 'LogOut': LogOut, 'Trash2': Trash2, 'Edit': Edit,
                                'Mail': Mail, 'Lock': Lock, 'UserIcon': User,
                            };
                            const Icon = IconComponentMap[item.id];

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCurrentPage(item.id);
                                        document.getElementById('mobile-menu').classList.add('hidden');
                                        setRecommendedVideo(null);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-red-50 hover:text-red-600 transition-all duration-200 ease-in-out ${
                                        currentPage === item.id ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700'
                                    }`}
                                >
                                    {Icon && <Icon className="h-5 w-5" />}
                                    <span className="text-base">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {isLoggedIn && (
                        <div className="fixed bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-6 py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">로그아웃</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between rounded-bl-xl">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {menuItems.find(item => item.id === currentPage)?.label}
                    </h2>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="hidden sm:inline text-sm text-gray-600">
                            {isLoggedIn ? `로그인됨 (ID: ${userEmail})` : '로그인 필요'}
                        </span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                            {userEmail ? userEmail.substring(0,2).toUpperCase() : <User />}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100">
                    {/* Main Page Content */}
                    {currentPage === 'main' && (
                        <div className="max-w-4xl mx-auto">
                            {!showSummary ? (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-8">
                                    <div className="space-y-4 md:space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                요약 타입
                                            </label>
                                            <select
                                                value={summaryType}
                                                onChange={(e) => setSummaryType(e.target.value)}
                                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                                            >
                                                {summaryTypesOptions.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                사용자 목적 (선택사항)
                                            </label>
                                            <textarea
                                                value={userPurpose}
                                                onChange={(e) => setUserPurpose(e.target.value)}
                                                placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요?"
                                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y min-h-[80px] text-gray-700"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                유튜브 URL <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading || !isAuthReady}
                                            className="w-full bg-red-500 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                                        >
                                            {isLoading ? '요약 중...' : '요약 시작'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                        <div className="p-4 md:p-6 border-b border-gray-200">
                                            <div className="flex flex-col md:flex-row md:space-x-4 items-center md:items-start">
                                                <img
                                                    src={currentSummaryData?.thumbnail || 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                                    alt="썸네일"
                                                    className="w-32 h-20 object-cover rounded-lg shadow-md mb-4 md:mb-0"
                                                    onError={(e) => e.target.src = 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                                />
                                                <div className="flex-1 text-center md:text-left">
                                                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                                                        {currentSummaryData?.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">{currentSummaryData?.uploader}</p>
                                                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1 justify-center md:justify-start mb-2 md:mb-0">
                                                            <Eye className="h-4 w-4" />
                                                            <span>{currentSummaryData?.views} 조회수</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 justify-center md:justify-start">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{currentSummaryData?.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                                            <div className="flex flex-wrap items-center space-x-2">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                <div className="flex flex-wrap gap-2">
                                                    {currentSummaryData?.hashtags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 text-xs md:text-sm rounded-full font-medium"
                                                        >
                                                          {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 md:p-6">
                                            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
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
                                            className="bg-gray-200 text-gray-800 py-2 md:py-3 px-6 md:px-8 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105"
                                        >
                                            새로운 요약하기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Library Page Content */}
                    {currentPage === 'library' && (
                        // <LibraryPage /> // LibraryPage 컴포넌트 렌더링 - 현재 주석 처리됨
                        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">사용자 라이브러리 (더미)</h3>
                            <p className="text-gray-600">라이브러리 페이지 구현 중입니다. LibraryPage 컴포넌트가 필요합니다.</p>
                        </div>
                    )}

                    {/* Reminder Page Content (더미) */}
                    {currentPage === 'reminder' && (
                        <ReminderPage
                            userId={userId}
                            isLoggedIn={isLoggedIn}
                            setMessageModalContent={setMessageModalContent}
                            setShowMessageModal={setShowMessageModal}
                        />
                    )}

                    {/* Recommendation Page Content (더미) */}
                    {currentPage === 'recommendation' && (
                        <RecommendationPage
                            recommendedVideo={recommendedVideo}
                            isGeneratingRecommendation={isGeneratingRecommendation}
                            onGenerateRecommendation={handleGenerateRecommendation}
                            libraryItemsCount={3} // 더미 데이터 - 실제로는 LibraryPage에서 전달받아야 함
                        />
                    )}

                    {/* MyPage Content (더미) */}
                    {currentPage === 'mypage' && (
                        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">마이페이지 (더미)</h3>
                            <p className="text-gray-600">사용자 프로필과 설정을 표시할 페이지입니다.</p>
                            {/* 여기에 실제 MyPage 컴포넌트를 렌더링 */}
                        </div>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            {showLogin && (
                <MessageModal
                    message="로그인 모달 (실제 구현 필요)"
                    onClose={() => setShowLogin(false)}
                />
            )}

            {/* Signup Modal */}
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

            {/* Generic Message Modal */}
            {showMessageModal && (
                <MessageModal
                    message={messageModalContent}
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            {/* Re-authentication Modal */}
            {showReauthModal && (
                <MessageModal
                    message="재인증 모달 (실제 구현 필요)"
                    onClose={() => setShowReauthModal(false)}
                />
            )}
        </div>
    );
}

export default App;

