// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// API 서비스 임포트
import { reminderApi, recommendationApi, setAuthToken } from './services/api.jsx';

// CSS 및 아이콘 임포트
import './App.css';
import { Home, Library, Bell, User, Play, LogOut, Lightbulb } from 'lucide-react';

// 페이지 및 모달 컴포넌트 임포트
import LibraryPage from './pages/LibraryPage.jsx';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage.jsx';
import SummaryPage from "./pages/SummaryPage.jsx"; // SummaryPage 임포트 확인
import { MessageModal, ReauthModal } from './components/MyPageModals.jsx';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import { ReminderPage, ReminderEditModal } from './pages/ReminderPage.jsx'; // 리마인더 페이지 임포트
import RecommendationPage from './pages/RecommendationPage.jsx'; // 추천 페이지 임포트

// 앱의 핵심 로직을 담는 내부 컴포넌트
function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    // --- 상태(State) 관리 ---
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [globalUserName, setGlobalUserName] = useState(localStorage.getItem('username') || 'Guest');

    // 모달 상태
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState('');
    const [showReauthModal, setShowReauthModal] = useState(false);
    const [reauthCallback, setReauthCallback] = useState(null);

    // --- 핸들러 함수들 ---
    const handleLoginSubmit = async (userName, password) => {
        try {
            // ✅ 로그인 API 경로 확인 (주석처리된 부분)
            const response = await axios.post('http://localhost:8080/api/auth/login', { userName, password });
            if (response.data && response.data.accessToken) {
                const { accessToken, userId, username } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userId', userId);
                localStorage.setItem('username', username);

                setIsLoggedIn(true);
                setGlobalUserName(username);
                handleAppShowMessage('로그인 성공!');
                navigate('/');
            }
        } catch (error) {
            handleAppShowMessage(error.response?.data?.message || '로그인 오류가 발생했습니다.');
        }
    };

    const handleSignupSubmit = async (userName, password, email) => {
        try {
            // ✅ 회원가입 API 경로 확인 (주석처리된 부분)
            await axios.post('http://localhost:8080/api/auth/register', { userName, email, password });
            handleAppShowMessage('회원가입 성공! 이제 로그인해주세요.');
            navigate('/login');
        } catch (error) {
            handleAppShowMessage(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setGlobalUserName('Guest');
        handleAppShowMessage('로그아웃 되었습니다.');
        navigate('/');
    };

    const handleAppShowMessage = (message) => {
        setMessageModalContent(message);
        setShowMessageModal(true);
    };

    // --- useEffects ---
    // 페이지 이동 시마다 로그인 상태를 다시 확인 (소셜 로그인 리다이렉트 포함)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            setGlobalUserName(localStorage.getItem('username') || 'User');
        } else {
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
        }

        // 소셜 로그인 성공 메시지 처리
        if (location.state?.loginSuccess) {
            handleAppShowMessage("로그인이 완료되었습니다!");
            // 메시지를 표시한 후에는, 페이지를 새로고침해도 메시지가 다시 뜨지 않도록 state를 초기화합니다.
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.key, location.state, navigate]); // location.key, location.state, navigate가 변경될 때마다 실행

    const menuItems = [
        { id: 'main', path: '/', icon: Home, label: '요약 페이지' },
        { id: 'library', path: '/library', icon: Library, label: '라이브러리' },
        { id: 'reminder', path: '/reminders', icon: Bell, label: '리마인더 페이지' },
        { id: 'recommendation', path: '/recommendation', icon: Lightbulb, label: '추천 페이지' },
        { id: 'mypage', path: '/mypage', icon: User, label: '마이페이지' }
    ];

    const getCurrentPageLabel = () => {
        if (location.pathname === '/login') return '로그인 / 회원가입';
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.label : 'LearnClip';
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-50 font-inter">
            {/* Sidebar */}
            <nav className="w-20 md:w-64 flex-none bg-white shadow-lg border-r border-gray-200 flex flex-col">
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2 justify-center md:justify-start">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                            <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
                        </div>
                        <h1 className="hidden md:block text-xl md:text-2xl font-extrabold text-gray-800">LearnClip</h1>
                    </Link>
                </div>
                <div className="mt-4 flex-grow">
                    {menuItems.map((item) => (
                        <Link key={item.id} to={item.path} className={`w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 md:px-6 md:py-4 text-left transition-all duration-200 ease-in-out ${location.pathname === item.path ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700 hover:bg-red-50'}`}>
                            <item.icon className="h-5 w-5" />
                            <span className="hidden md:block">{item.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="mt-auto p-4">
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                            <LogOut className="h-5 w-5" />
                            <span className="hidden md:block font-medium">로그아웃</span>
                        </button>
                    ) : (
                        <Link to="/login" className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-red-500 hover:bg-red-50 rounded-lg">
                            <User className="h-5 w-5" />
                            <span className="hidden md:block font-medium">로그인/회원가입</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full">
                <header className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{getCurrentPageLabel()}</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden sm:block">{isLoggedIn ? `로그인됨 (ID: ${globalUserName})` : '로그인 필요'}</span>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">{globalUserName?.[0]?.toUpperCase()}</div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
                    <Routes>
                        {/* ✅ SummaryPage 컴포넌트를 직접 라우팅하여 백엔드 통신 로직이 실행되도록 합니다. */}
                        <Route path="/" element={<SummaryPage />} />

                        <Route path="/library" element={isLoggedIn ? <LibraryPage /> : <AuthRedirect />} />
                        <Route path="/reminders" element={isLoggedIn ? <div>리마인더 페이지 (구현 예정)</div> : <AuthRedirect />} />
                        <Route path="/recommendation" element={isLoggedIn ? <div>추천 페이지 (구현 예정)</div> : <AuthRedirect />} />

                        <Route path="/mypage" element={isLoggedIn ? <MyPage isLoggedIn={isLoggedIn} onUpdateGlobalUserDisplay={setGlobalUserName} onShowMessage={handleAppShowMessage} onShowReauthModal={setShowReauthModal} onSetReauthCallback={setReauthCallback} onUserLoggedOut={handleLogout} /> : <AuthRedirect />} />

                        <Route path="/login" element={<AuthPage onLogin={handleLoginSubmit} onSignup={handleSignupSubmit} onMessage={handleAppShowMessage} />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                    </Routes>
                </main>
            </div>

            {/* 전역 모달들 */}
            {/* isLoading 상태는 이제 SummaryPage 내부에서만 관리하므로 AppContent에서는 제거합니다. */}
            {showMessageModal && (<MessageModal message={messageModalContent} onClose={() => setShowMessageModal(false)} />)}
            {showReauthModal && (<ReauthModal onClose={() => setShowReauthModal(false)} onReauthenticate={(password, cb) => { if (reauthCallback) reauthCallback(password, cb); setShowReauthModal(false); }} />)}
        </div>
    );
}

function AuthRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        alert("이 서비스를 이용하려면 로그인이 필요합니다.");
        navigate('/login');
    }, [navigate]);
    return null;
}

// 최종 App 컴포넌트
function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;