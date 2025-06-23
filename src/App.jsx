    import React, { useState, useEffect } from 'react';
    import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
    import axios from 'axios';

    import './App.css';
    import { Archive, Bell, User, Play, LogOut, Lightbulb, FileText } from 'lucide-react';

    import SummaryArchivePage from './pages/SummaryArchivePage.jsx';
    import MyPage from './pages/MyPage';
    import SummaryPage from "./pages/SummaryPage.jsx";
    import AuthModal from './components/AuthModal.jsx';
    import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
    import { ReminderPage } from './pages/ReminderPage.jsx';
    import RecommendationPage from './pages/RecommendationPage.jsx';
    import { MessageModal } from './components/MyPageModals.jsx';

    const BASE_URL = "/api";

    function AppContent() {
        const navigate = useNavigate();
        const location = useLocation();

        const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
        const [globalUserName, setGlobalUserName] = useState(localStorage.getItem('username') || 'Guest');
        const [globalUserId, setGlobalUserId] = useState(localStorage.getItem('userId') || null);

        // 모달 상태
        const [showMessageModal, setShowMessageModal] = useState(false);
        const [messageModalContent, setMessageModalContent] = useState('');
        const [messageModalConfirm, setMessageModalConfirm] = useState(null);
        const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
        const [showAuthModal, setShowAuthModal] = useState(false);

        // 메시지 모달 띄우기 함수 (여기에 없으면 에러 발생)
        const handleAppShowMessage = (message, onConfirm = null) => {
            setMessageModalContent(message);
            setMessageModalConfirm(() => onConfirm);
            setShowMessageModal(true);
        };

        const handleLoginSubmit = async (userName, password) => {
            try {
                const response = await axios.post(`${BASE_URL}/auth/login`, { userName, password });
                if (response.data && response.data.accessToken) {
                    const { accessToken, userId, username } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('username', username);
                    setIsLoggedIn(true);
                    setGlobalUserName(username);
                    setGlobalUserId(userId);
                    setShowAuthModal(false);
                    handleAppShowMessage('로그인 성공!');
                    navigate('/', { replace: true });
                }
            } catch (error) {
                let errorMessage = '로그인 오류';
                if (error.response) {
                    const { status, data } = error.response;
                    if (status === 401) {
                        errorMessage = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
                    } else if (status === 400) {
                        errorMessage = data.message || '입력을 확인해주세요.';
                    } else {
                        errorMessage = data.message || '서버 오류';
                    }
                }
                throw new Error(errorMessage);
            }
        };

        const handleSignupSubmit = async (userName, password, email) => {
            try {
                await axios.post(`${BASE_URL}/auth/register`, { userName, email, password });
                handleAppShowMessage('회원가입 성공! 로그인 해주세요.');
            } catch (error) {
                let errorMessage = '회원가입 오류';
                if (error.response) {
                    const { status, data } = error.response;
                    if (status === 400 || status === 409) {
                        errorMessage = data.message || '이미 존재하는 사용자';
                    } else {
                        errorMessage = data.message || '서버 오류';
                    }
                }
                handleAppShowMessage(errorMessage);
                throw new Error(errorMessage);
            }
        };

        const handleLogout = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
            setGlobalUserId(null);
            handleAppShowMessage('로그아웃 되었습니다.');
            navigate('/', { replace: true });
        };

        const setupAxiosInterceptors = () => {
            axios.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );
            axios.interceptors.response.use(
                (response) => response,
                (error) => {
                    const { response: err } = error;
                    if (err && err.status === 401) {
                        handleLogout();
                    }
                    return Promise.reject(error);
                }
            );
        };

        useEffect(() => {
            setupAxiosInterceptors();
        }, []);

        useEffect(() => {
            const token = localStorage.getItem('accessToken');
            const userId = localStorage.getItem('userId');
            const username = localStorage.getItem('username');
            if (token && userId && username) {
                setIsLoggedIn(true);
                setGlobalUserName(username);
                setGlobalUserId(userId);
            } else {
                setIsLoggedIn(false);
                setGlobalUserName('Guest');
                setGlobalUserId(null);
            }
        }, [location.key]);

        const menuItems = [
            { id: 'summary', label: '영상 요약', path: '/', icon: FileText },
            { id: 'library', label: '요약 저장소', path: '/summary-archives', icon: Archive },
            { id: 'reminders', label: '리마인더', path: '/reminders', icon: Bell },
            { id: 'recommendation', label: '추천', path: '/recommendations', icon: Lightbulb },
            { id: 'mypage', label: '마이페이지', path: '/mypage', icon: User },
        ];

        return (
            <div className="flex min-h-screen w-full bg-gray-50 font-inter">
                <nav className="w-20 md:w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="hidden md:block text-2xl font-extrabold text-gray-800">YouSum</h1>
                        </Link>
                    </div>
                    <div className="flex-grow">
                        {menuItems.map(item => (
                            <Link key={item.id} to={item.path} className={`flex items-center space-x-3 p-4 ${location.pathname === item.path ? 'bg-red-100 text-red-700 font-semibold' : 'text-gray-700 hover:bg-red-50'}`}>
                                <item.icon className="h-5 w-5" />
                                <span className="hidden md:block">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="p-4">
                        {isLoggedIn ? (
                            <button onClick={() => setShowLogoutConfirmModal(true)} className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                                <LogOut className="h-5 w-5" />
                                <span className="hidden md:block font-medium">로그아웃</span>
                            </button>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg">
                                <User className="h-5 w-5" />
                                <span className="hidden md:block font-medium">로그인/회원가입</span>
                            </button>
                        )}
                    </div>

                </nav>

                <main className="flex-1 overflow-y-scroll">
                    <Routes>
                        <Route path="/" element={<SummaryPage onShowAuthModal={() => setShowAuthModal(true)} isLoggedIn={isLoggedIn} />} />
                        <Route path="/summary-archives" element={isLoggedIn ? <SummaryArchivePage /> : <AuthRedirect onShowAuthModal={() => setShowAuthModal(true)} />} />
                        <Route path="/reminders" element={isLoggedIn ? <ReminderPage userId={globalUserId} /> : <AuthRedirect onShowAuthModal={() => setShowAuthModal(true)} />} />
                        <Route path="/recommendations" element={isLoggedIn ? <RecommendationPage /> : <AuthRedirect onShowAuthModal={() => setShowAuthModal(true)} />} />
                        <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <AuthRedirect onShowAuthModal={() => setShowAuthModal(true)} />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                    </Routes>
                </main>

                {showAuthModal && (
                    <AuthModal
                        onLogin={handleLoginSubmit}
                        onSignup={handleSignupSubmit}
                        onMessage={handleAppShowMessage}
                        onClose={() => setShowAuthModal(false)}
                    />
                )}
                {showLogoutConfirmModal && (
                    <LogoutConfirmModal
                        onConfirm={() => { handleLogout(); setShowLogoutConfirmModal(false); }}
                        onCancel={() => setShowLogoutConfirmModal(false)}
                    />
                )}
                {showMessageModal && (
                    <MessageModal message={messageModalContent} onClose={() => setShowMessageModal(false)} />
                )}
            </div>
        );
    }

    function AuthRedirect({ onShowAuthModal }) {
        useEffect(() => {
            onShowAuthModal();
        }, [onShowAuthModal]);
        return null;
    }

    function LogoutConfirmModal({ onConfirm, onCancel }) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">로그아웃</h3>
                    <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    function App() {
        return (
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        );
    }

    export default App;
