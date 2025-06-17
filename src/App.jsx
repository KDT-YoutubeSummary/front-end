// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// CSS 및 아이콘 임포트
import './App.css';
import { Home, Library, Bell, User, Play, LogOut, Lightbulb } from 'lucide-react';

// 페이지 및 모달 컴포넌트 임포트
import LibraryPage from './pages/LibraryPage.jsx';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage.jsx';
import { MessageModal, ReauthModal } from './components/MyPageModals.jsx';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';

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

    // 메인 페이지(요약) 상태
    const [isLoading, setIsLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [currentSummaryData, setCurrentSummaryData] = useState(null);
    const summaryTypesOptions = ['기본 요약', '3줄 요약', '키워드 요약', '타임라인 요약'];

    // --- 핸들러 함수들 ---
    const handleLoginSubmit = async (userName, password) => {
        try {
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
            await axios.post('http://localhost:8080/api/auth/signup', { userName, email, password });
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

    const handleMainSubmit = () => {
        if (!isLoggedIn) {
            handleAppShowMessage("요약 기능을 사용하려면 로그인이 필요합니다.");
            navigate('/login');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const generatedSummary = {
                thumbnail: `https://i.ytimg.com/vi/${youtubeUrl.split('v=')[1]?.substring(0, 11) || 'dQw4w9WgXcQ'}/mqdefault.jpg`,
                title: `[자동 생성] ${youtubeUrl} 요약`, uploader: 'LearnClip AI', views: 'N/A',
                date: new Date().toLocaleDateString('ko-KR'), hashtags: ['#AI요약', '#더미데이터'],
                summary: `제공된 YouTube URL (${youtubeUrl})에 대한 ${summaryType} 결과입니다. 사용자 목적: "${userPurpose}".`
            };
            setCurrentSummaryData(generatedSummary);
            setIsLoading(false);
            setShowSummary(true);
        }, 1500);
    };

    const resetToInitial = () => {
        setShowSummary(false);
        setCurrentSummaryData(null);
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryType('기본 요약');
    };

    // 페이지 이동 시마다 로그인 상태를 다시 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            setGlobalUserName(localStorage.getItem('username') || 'User');
        } else {
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
        }
    }, [location.key]);

    // ✨ 2. 소셜 로그인 성공 메시지를 표시하기 위한 useEffect를 추가합니다.
    useEffect(() => {
        // 페이지 이동 후 전달받은 상태(state)에 loginSuccess가 true로 설정되어 있는지 확인합니다.
        if (location.state?.loginSuccess) {
            handleAppShowMessage("로그인이 완료되었습니다!");
            // 메시지를 표시한 후에는, 페이지를 새로고침해도 메시지가 다시 뜨지 않도록 state를 초기화합니다.
            // 현재 경로를 유지하되 state만 비우고, 이 변경은 브라우저 히스토리에 남기지 않습니다 (replace: true).
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]); // location.state가 변경될 때마다 이 효과를 실행합니다.

    // 페이지 이동 시마다 로그인 상태를 다시 확인하는 useEffect (기존과 동일)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            setGlobalUserName(localStorage.getItem('username') || 'User');
        } else {
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
        }
    }, [location.key]);

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
                        <Route path="/" element={
                            !showSummary ? (
                                <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                                    <div><label className="block font-semibold text-gray-700 mb-2">요약 타입</label><select value={summaryType} onChange={(e) => setSummaryType(e.target.value)} className="w-full p-3 border rounded-lg">{summaryTypesOptions.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                                    <div><label className="block font-semibold text-gray-700 mb-2">사용자 목적 (선택사항)</label><textarea value={userPurpose} onChange={(e) => setUserPurpose(e.target.value)} placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요?" className="w-full p-3 border rounded-lg" rows="3"/></div>
                                    <div><label className="block font-semibold text-gray-700 mb-2">유튜브 URL <span className="text-red-500">*</span></label><input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-3 border rounded-lg" /></div>
                                    <button onClick={handleMainSubmit} disabled={isLoading} className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50">{isLoading ? '요약 중...' : '요약 시작'}</button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-8"><h3 className="text-xl font-bold mb-4">{currentSummaryData.title}</h3><p>{currentSummaryData.summary}</p><button onClick={resetToInitial} className="mt-6 bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-bold hover:bg-gray-300">새로운 요약하기</button></div>
                            )
                        } />
                        <Route path="/library" element={isLoggedIn ? <LibraryPage /> : <AuthRedirect />} />
                        <Route path="/reminders" element={isLoggedIn ? <div>리마인더 페이지 (구현 예정)</div> : <AuthRedirect />} />
                        <Route path="/recommendation" element={isLoggedIn ? <div>추천 페이지 (구현 예정)</div> : <AuthRedirect />} />

                        {/* ✨✨✨ 문제 해결 부분 ✨✨✨ */}
                        {/* MyPage에 `isLoggedIn` prop을 명시적으로 전달합니다. */}
                        <Route path="/mypage" element={isLoggedIn ? <MyPage isLoggedIn={isLoggedIn} onUpdateGlobalUserDisplay={setGlobalUserName} onShowMessage={handleAppShowMessage} onShowReauthModal={setShowReauthModal} onSetReauthCallback={setReauthCallback} onUserLoggedOut={handleLogout} /> : <AuthRedirect />} />

                        <Route path="/login" element={<AuthPage onLogin={handleLoginSubmit} onSignup={handleSignupSubmit} onMessage={handleAppShowMessage} />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                    </Routes>
                </main>
            </div>

            {/* 전역 모달들 */}
            {isLoading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div><p>요약 중입니다...</p></div></div>}
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

