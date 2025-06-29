// src/App.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// CSS 및 아이콘 임포트
import './App.css';
import { Home, Archive, Bell, User, Play, LogOut, Lightbulb, FileText, Sparkles, Clock, TrendingUp, Settings, Menu, X, HelpCircle, Star } from 'lucide-react';

// 페이지 및 모달 컴포넌트 임포트
import SummaryArchivePage from './pages/SummaryArchivePage.jsx';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage.jsx';
import AuthModal from './components/AuthModal.jsx';
import SummaryPage from "./pages/SummaryPage.jsx";
import LandingPage from './pages/LandingPage.jsx';
import { MessageModal, ReauthModal } from './components/MyPageModals.jsx';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import { ReminderPage } from './pages/ReminderPage.jsx';
import RecommendationPage from './pages/RecommendationPage.jsx';

// ⭐️⭐️⭐️ API 베이스 URL을 환경변수에서 가져오도록 수정 ⭐️⭐️⭐️
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    console.log('AppContent 렌더링 시작', { location: location.pathname });

    // --- 상태(State) 관리 ---
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
    const [globalUserName, setGlobalUserName] = useState(localStorage.getItem('username') || 'Guest');
    const [globalUserId, setGlobalUserId] = useState(localStorage.getItem('userId') || null);

    // 모달 상태
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState('');
    const [messageModalConfirm, setMessageModalConfirm] = useState(null);
    const [showReauthModal, setShowReauthModal] = useState(false);
    const [reauthCallback, setReauthCallback] = useState(null);
    const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMyPageModals, setShowMyPageModals] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // useRef를 사용해서 한 번만 실행되도록 제한
    const hasProcessedStateRef = useRef(false);

    // --- 핸들러 함수들 ---
    const handleLoginSubmit = async (userName, password) => {
        try {
            // ⭐️⭐️⭐️ 수정한 API 주소 사용 ⭐️⭐️⭐️
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`,  { userName: userName, password: password });
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
                navigate('/summary', { replace: true });
            }
        } catch (error) {
            let errorMessage = '';
            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    if (data.message && data.message.includes('존재하지 않는')) {
                        errorMessage = '존재하지 않는 사용자입니다. 회원가입을 먼저 진행해주세요.';
                    } else if (data.message && data.message.includes('비밀번호')) {
                        errorMessage = '비밀번호가 올바르지 않습니다.';
                    } else {
                        errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
                    }
                } else if (status === 400) {
                    errorMessage = data.message || '로그인 정보를 확인해주세요.';
                } else {
                    errorMessage = data.message || '로그인 중 오류가 발생했습니다.';
                }
            } else {
                errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            }
            throw new Error(errorMessage);
        }
    };

    const handleSignupSubmit = async (userName, password, email) => {
        try {
            // ⭐️⭐️⭐️ 수정한 API 주소 사용 ⭐️⭐️⭐️
            await axios.post(`${API_BASE_URL}/api/auth/register`, { userName, email, password });
            handleAppShowMessage('회원가입 성공! 이제 로그인해주세요.');
        } catch (error) {
            console.error('회원가입 오류:', error);

            let errorMessage = '';
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 || status === 409) {
                    errorMessage = data.message || data.error || '회원가입 중 오류가 발생했습니다.';
                } else if (status === 500) {
                    errorMessage = data.message || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else {
                    errorMessage = data.message || `회원가입 중 오류가 발생했습니다. (상태: ${status})`;
                }
            } else if (error.request) {
                errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            } else {
                errorMessage = '회원가입 중 예상치 못한 오류가 발생했습니다.';
            }

            handleAppShowMessage(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleLogout = (message = '로그아웃 되었습니다.') => {
        console.log('로그아웃 시작');

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');

        setIsLoggedIn(false);
        setGlobalUserName('Guest');
        setGlobalUserId(null);

        console.log('로그아웃 완료, 상태:', { isLoggedIn: false, userName: 'Guest' });

        handleAppShowMessage(message);

        navigate('/', { replace: true });
    };

    const handleAppShowMessage = (message, onConfirm = null) => {
        setMessageModalContent(message);
        setMessageModalConfirm(() => onConfirm);
        setShowMessageModal(true);
    };

    const handleShowAuthModal = () => {
        setShowAuthModal(true);
    };

    const handleCloseAuthModal = () => {
        setShowAuthModal(false);
        if (location.pathname !== '/') {
            navigate('/', { replace: true });
        }
    };

    const setupAxiosInterceptors = () => {
        axios.interceptors.request.clear();
        axios.interceptors.response.clear();

        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                
                // ⭐️⭐️⭐️ URL을 절대 경로로 생성하여 public path 여부 확인 ⭐️⭐️⭐️
                const absoluteUrl = new URL(config.url, config.baseURL || API_BASE_URL).pathname;

                const publicPaths = [
                    '/api/auth/login', 
                    '/api/auth/register',
                    '/swagger-ui',
                    '/v3/api-docs'
                ];
                
                const isPublicPath = publicPaths.some(path => absoluteUrl.startsWith(path));

                if (token && !isPublicPath) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const { response: errorResponse, config } = error;
                if (errorResponse) {
                    const isAuthRequest = config.url.includes('/api/auth/login') || config.url.includes('/api/auth/register');
                    
                    if (errorResponse.status === 401 && !isAuthRequest) {
                        handleLogout('인증이 만료되었습니다. 다시 로그인해주세요.');
                    } else if (errorResponse.status === 403) {
                        handleAppShowMessage('접근 권한이 없습니다.');
                    }
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
        const storedUserId = localStorage.getItem('userId');
        const storedUserName = localStorage.getItem('username');

        console.log('로그인 상태 확인:', {
            hasToken: !!token,
            storedUserId,
            storedUserName,
            pathname: location.pathname
        });

        if (token && storedUserId && storedUserName) {
            console.log('✅ 로그인 상태로 설정');
            setIsLoggedIn(true);
            setGlobalUserName(storedUserName);
            setGlobalUserId(storedUserId);
        } else {
            console.log('❌ 로그아웃 상태로 설정:', { token: !!token, storedUserId, storedUserName });
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
            setGlobalUserId(null);
            if (token && (!storedUserId || !storedUserName)) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
            }
        }

        if (location.state?.loginSuccess && !hasProcessedStateRef.current) {
            hasProcessedStateRef.current = true;
            const message = location.state?.socialLogin
                ? "구글 로그인이 완료되었습니다!"
                : "로그인이 완료되었습니다!";
            handleAppShowMessage(message);
            setTimeout(() => {
                navigate(location.pathname, { replace: true, state: {} });
            }, 100);
        }

        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get('error');
        const errorMessage = urlParams.get('message');
        if (error === 'oauth_failed' && !hasProcessedStateRef.current) {
            hasProcessedStateRef.current = true;
            handleAppShowMessage(`소셜 로그인 실패: ${decodeURIComponent(errorMessage || '알 수 없는 오류')}`);
            setTimeout(() => {
                navigate(location.pathname, { replace: true });
            }, 100);
        }
    }, [location.pathname]);

    useEffect(() => {
        hasProcessedStateRef.current = false;
    }, [location.state, location.search]);

    const menuItems = [
        { id: 'summary', label: '영상 요약', path: '/summary', icon: FileText },
        { id: 'library', label: '요약 저장소', path: '/summary-archives', icon: Archive },
        { id: 'reminders', label: '리마인더', path: '/reminders', icon: Bell },
        { id: 'recommendation', label: '추천', path: '/recommendations', icon: Lightbulb },
        { id: 'mypage', label: '마이페이지', path: '/mypage', icon: User },
    ];

    const getCurrentPageLabel = () => {
        if (location.pathname === '/login') return '로그인 / 회원가입';
        if (location.pathname === '/') return 'YouSum';
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.label : 'YouSum';
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-50 font-inter">
            {location.pathname !== '/' && (
                <nav className="w-20 md:w-64 flex-none bg-white shadow-lg border-r border-gray-200 flex flex-col">
                    <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2 justify-center md:justify-start">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
                            </div>
                            <h1 className="hidden md:block text-xl md:text-2xl font-extrabold text-gray-800">YouSum</h1>
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
                            <button
                                onClick={() => setShowLogoutConfirmModal(true)}
                                className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-red-500 hover:bg-red-50 rounded-lg font-medium"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden md:block">로그아웃</span>
                            </button>
                        ) : (
                            <button onClick={handleShowAuthModal} className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-red-500 hover:bg-red-50 rounded-lg">
                                <User className="h-5 w-5" />
                                <span className="hidden md:block font-medium">로그인/회원가입</span>
                            </button>
                        )}
                    </div>
                </nav>
            )}

            <div className="flex-1 flex flex-col w-full">
                {location.pathname !== '/' && (
                    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {location.pathname === '/summary' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {location.pathname === '/summary-archives' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                                        <Archive className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {location.pathname === '/reminders' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {location.pathname === '/recommendations' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <Lightbulb className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                {location.pathname === '/mypage' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                )}

                                <div className="flex items-center space-x-4">
                                    <h2 className="text-2xl font-bold text-gray-800">{getCurrentPageLabel()}</h2>

                                    <div className="flex items-center space-x-2">
                                        {location.pathname === '/summary' && (
                                            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full mt-1">
                                                <Sparkles className="h-4 w-4" />
                                                <span>AI 요약</span>
                                            </div>
                                        )}
                                        {location.pathname === '/summary-archives' && (
                                            <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full mt-1">
                                                <Archive className="h-4 w-4" />
                                                <span>저장소 관리</span>
                                            </div>
                                        )}
                                        {location.pathname === '/reminders' && (
                                            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-1">
                                                <Clock className="h-4 w-4" />
                                                <span>스마트 알림</span>
                                            </div>
                                        )}
                                        {location.pathname === '/recommendations' && (
                                            <div className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full mt-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>추천</span>
                                            </div>
                                        )}
                                        {location.pathname === '/mypage' && (
                                            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full mt-1">
                                                <Settings className="h-4 w-4" />
                                                <span>계정 설정</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    {location.pathname === '/summary' && (
                                        <p className="text-gray-600 text-sm">AI가 분석한 영상 요약 생성</p>
                                    )}
                                    {location.pathname === '/summary-archives' && (
                                        <p className="text-gray-600 text-sm">저장된 요약본 관리 및 통계</p>
                                    )}
                                    {location.pathname === '/reminders' && (
                                        <p className="text-gray-600 text-sm">복습 알림 설정 및 관리</p>
                                    )}
                                    {location.pathname === '/recommendations' && (
                                        <p className="text-gray-600 text-sm">AI 기반 맞춤형 영상 추천</p>
                                    )}
                                    {location.pathname === '/mypage' && (
                                        <p className="text-gray-600 text-sm">개인 정보 및 계정 관리</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={() => setShowHelpModal(true)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="도움말"
                                        >
                                            <HelpCircle className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => navigate('/mypage')}
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>{globalUserName}님</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500">로그인되지 않음</div>
                                )}
                            </div>
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-y-scroll bg-gray-100">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/summary" element={
                            <div>
                                {console.log('SummaryPage 렌더링 시작')}
                                <SummaryPage onShowAuthModal={handleShowAuthModal} isLoggedIn={isLoggedIn} />
                            </div>
                        } />
                        <Route path="/summary-archives" element={isLoggedIn ? <SummaryArchivePage /> : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />
                        <Route path="/reminders"
                               element={isLoggedIn ? (
                                   <ReminderPage
                                       userId={globalUserId}
                                       isLoggedIn={isLoggedIn}
                                       setMessageModalContent={setMessageModalContent}
                                       setShowMessageModal={setShowMessageModal}
                                   />
                               ) : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />}
                        />
                        <Route path="/recommendations" element={isLoggedIn ? <RecommendationPage /> : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />
                        <Route path="/mypage" element={isLoggedIn ? (
                            <MyPage
                                isLoggedIn={isLoggedIn}
                                onUpdateGlobalUserDisplay={(userName, email) => {
                                    setGlobalUserName(userName);
                                    localStorage.setItem('username', userName);
                                    if (email) localStorage.setItem('email', email);
                                }}
                                onShowMessage={handleAppShowMessage}
                                onShowReauthModal={setShowReauthModal}
                                onSetReauthCallback={setReauthCallback}
                                onUserLoggedOut={(message) => handleLogout(message || '로그아웃 되었습니다.')}
                                onShowHelpModal={() => setShowHelpModal(true)}
                            />
                        ) : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                    </Routes>
                </main>
            </div>

            {showMessageModal && (
                <MessageModal
                    message={messageModalContent}
                    onClose={() => {
                        setShowMessageModal(false);
                        setMessageModalConfirm(null);
                    }}
                    onConfirm={messageModalConfirm ? () => {
                        setShowMessageModal(false);
                        messageModalConfirm();
                        setMessageModalConfirm(null);
                    } : null}
                    isConfirm={!!messageModalConfirm}
                />
            )}
            {showReauthModal && (
                <ReauthModal
                    onClose={() => setShowReauthModal(false)}
                    onReauthenticate={reauthCallback}
                />
            )}
            {showLogoutConfirmModal && (
                <LogoutConfirmModal
                    onConfirm={() => {
                        handleLogout();
                        setShowLogoutConfirmModal(false);
                    }}
                    onCancel={() => setShowLogoutConfirmModal(false)}
                />
            )}
            {showAuthModal && (
                <AuthModal
                    onLogin={handleLoginSubmit}
                    onSignup={handleSignupSubmit}
                    onMessage={handleAppShowMessage}
                    onClose={handleCloseAuthModal}
                />
            )}

            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />

            {showMyPageModals && (
                <MyPageModals
                    onClose={() => setShowMyPageModals(false)}
                    onLogout={handleLogout}
                    globalUserName={globalUserName}
                    onUpdateGlobalUserDisplay={(userName, email) => {
                        setGlobalUserName(userName);
                        localStorage.setItem('username', userName);
                        if (email) localStorage.setItem('email', email);
                    }}
                    onShowMessage={handleAppShowMessage}
                />
            )}
        </div>
    );
}

function AuthRedirect({ onShowMessage, onShowAuthModal }) {
    const navigate = useNavigate();
    const [hasShownModal, setHasShownModal] = useState(false);

    useEffect(() => {
        if (!hasShownModal) {
            setHasShownModal(true);
            onShowMessage('로그인이 필요합니다.', () => {
                onShowAuthModal();
            });
        }
    }, [hasShownModal, onShowMessage, onShowAuthModal]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
                <p className="text-gray-600 mb-6">이 페이지를 이용하려면 로그인해주세요.</p>
                <button
                    onClick={onShowAuthModal}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                    로그인하기
                </button>
            </div>
        </div>
    );
}

const LoadingModal = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
                <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요...</p>
            </div>
        </div>
    );
};

const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
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
};

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const helpContent = {
        summary: {
            title: "AI 자동 요약",
            description: "Whisper와 GPT-4를 활용해\n유튜브 영상의 핵심 내용을\n4가지 스타일로 요약합니다.",
            features: [
                "기본 요약: 전반적인 내용을 간결하게 정리",
                "3줄 요약: 핵심 내용을 3줄로 압축",
                "키워드 요약: 주요 키워드 중심으로 정리",
                "타임라인 요약: 시간순으로 구성된 상세 요약"
            ]
        },
        archives: {
            title: "요약 저장소",
            description: "요약한 모든 영상을\n체계적으로 저장하고 관리하여\n나만의 지식 창고를 구축하세요.",
            features: [
                "카테고리별 분류 저장",
                "검색 및 필터링 기능",
                "개인 메모 추가 및 편집",
                "태그별 통계 및 차트 제공"
            ]
        },
        reminders: {
            title: "스마트 알림",
            description: "개인 학습 일정에 맞춰\n복습 시기를 알려주는\n지능형 리마인더를 설정하세요.",
            features: [
                "일회성 또는 반복 알림 설정",
                "개인 메모와 함께 알림",
                "이메일로 자동 발송",
                "알림 시간 및 주기 조정"
            ]
        },
        recommendations: {
            title: "AI 맞춤 추천",
            description: "학습 패턴을 분석하여\n개인에게 최적화된\n유튜브 영상을 추천해드립니다.",
            features: [
                "개인화된 영상 추천",
                "추천 이유 상세 설명",
                "관심 분야별 분류",
                "학습 기록 기반 추천"
            ]
        },
        mypage: {
            title: "마이페이지",
            description: "개인 정보와 계정 설정을 관리, \n학습 통계를 확인할 수 있습니다.",
            features: [
                "프로필 정보 수정",
                "계정 설정 변경",
                "사용 통계 확인",
                "계정 보안 관리"
            ]
        },
        quiz: {
            title: "AI 퀴즈 생성 (준비중)",
            description: "요약본을 기반으로\n맞춤형 퀴즈를 생성하고\n학습 효과를 극대화하세요.",
            features: [
                "요약 내용 기반 퀴즈 자동 생성",
                "객관식, 주관식 다양한 문제 유형",
                "실시간 채점 및 상세 해설 제공",
                "학습 성과 추적 및 분석"
            ]
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-6000"></div>
            </div>

            <div className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 backdrop-blur-sm">
                <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Play className="h-6 w-6 text-white fill-current" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                                    <span>YouSum 사용 가이드</span>
                                    <span className="text-red-600 font-medium text-lg">AI가 만드는 스마트한 학습</span>
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white/50 rounded-full transition-colors"
                        >
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.entries(helpContent).map(([key, content]) => (
                            <div key={key} className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                        key === 'summary' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                            key === 'archives' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                                key === 'quiz' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                                    key === 'reminders' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                                        key === 'recommendations' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                                            'bg-gradient-to-br from-red-500 to-red-600'
                                    }`}>
                                        {key === 'summary' && <Sparkles className="h-6 w-6 text-white" />}
                                        {key === 'archives' && <Archive className="h-6 w-6 text-white" />}
                                        {key === 'quiz' && <Lightbulb className="h-6 w-6 text-white" />}
                                        {key === 'reminders' && <Bell className="h-6 w-6 text-white" />}
                                        {key === 'recommendations' && <TrendingUp className="h-6 w-6 text-white" />}
                                        {key === 'mypage' && <User className="h-6 w-6 text-white" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{content.title}</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-4">{content.description}</p>
                                <div className="space-y-3">
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        {content.features.map((feature, index) => (
                                            <li key={index} className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="leading-relaxed">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-red-900">사용 팁</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                            <div className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>자막이 있는 영상에서 더 정확한 요약을 얻을 수 있습니다</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>사용자 목적을 구체적으로 작성하면 맞춤형 요약을 생성합니다</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>긴 영상일수록 타임라인 요약을 추천합니다</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>리마인더를 설정하면 복습 효과를 높일 수 있습니다</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-3xl">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <p className="text-gray-600 text-sm">
                                문의사항이 있으시면 <span className="font-semibold text-red-600">support@yousum.com</span>으로 연락주세요.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">YouSum에서 더 스마트한 학습을 경험하세요!</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-red-200"
                        >
                            시작하기
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
