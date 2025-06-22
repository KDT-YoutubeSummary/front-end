// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// CSS 및 아이콘 임포트
import './App.css';
import { Home, Archive, Bell, User, Play, LogOut, Lightbulb, FileText, Sparkles, Clock, TrendingUp, Settings, Menu, X } from 'lucide-react';

// 페이지 및 모달 컴포넌트 임포트
import LibraryPage from './pages/LibraryPage.jsx';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage.jsx';
import AuthModal from './components/AuthModal.jsx';
import SummaryPage from "./pages/SummaryPage.jsx"; // SummaryPage 임포트 확인
import { MessageModal, ReauthModal } from './components/MyPageModals.jsx';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import { ReminderPage } from './pages/ReminderPage.jsx'; // 리마인더 페이지 임포트 수정
import RecommendationPage from './pages/RecommendationPage.jsx'; // 추천 페이지 임포트

// 앱의 핵심 로직을 담는 내부 컴포넌트
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

    // --- 핸들러 함수들 ---
    const handleLoginSubmit = async (userName, password) => {
        try {
            // 인증 API 사용
            const response = await axios.post('http://localhost:8080/api/auth/login',  { userName: userName, password: password });
            if (response.data && response.data.accessToken) {
                const { accessToken, userId, username } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userId', userId);
                localStorage.setItem('username', username);

                setIsLoggedIn(true);
                setGlobalUserName(username);
                setGlobalUserId(userId);
                setShowAuthModal(false); // 모달 닫기
                handleAppShowMessage('로그인 성공!');
                // 요약 페이지로 이동
                navigate('/', { replace: true });
            }
        } catch (error) {
            // 서버 응답에 따른 구체적인 오류 메시지 처리
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
            
            // 에러를 throw하여 AuthPage에서 로컬 메시지로 표시
            throw new Error(errorMessage);
        }
    };

    const handleSignupSubmit = async (userName, password, email) => {
        try {
            // 회원가입 API 사용
            await axios.post('http://localhost:8080/api/auth/register', { userName, email, password });
            handleAppShowMessage('회원가입 성공! 이제 로그인해주세요.');
            // 회원가입 성공 시 모달은 유지하고 로그인 모드로 전환 (AuthPage에서 처리됨)
        } catch (error) {
            console.error('회원가입 오류:', error);
            
            // 서버 응답에 따른 구체적인 오류 메시지 처리
            let errorMessage = '';
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 || status === 409) {
                    // 백엔드에서 UserAlreadyExistsException을 던지는 경우
                    // 백엔드에서 보내는 구체적인 메시지 우선 사용
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
            
            // 오류 메시지를 표시하고 에러를 다시 던져서 AuthPage에서 성공 처리를 하지 않도록 함
            handleAppShowMessage(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleLogout = (message = '로그아웃 되었습니다.') => {
        console.log('로그아웃 시작');
        
        // localStorage 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        
        // 상태 업데이트
        setIsLoggedIn(false);
        setGlobalUserName('Guest');
        setGlobalUserId(null);
        
        console.log('로그아웃 완료, 상태:', { isLoggedIn: false, userName: 'Guest' });
        
        // 메시지 표시
        handleAppShowMessage(message);
        
        // 요약 홈페이지로 이동
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
        // 로그인 모달을 닫을 때 홈으로 이동
        if (location.pathname !== '/') {
            navigate('/', { replace: true });
        }
    };

    // ✅ 모든 axios 요청에 공통 인증 헤더를 추가하는 인터셉터 설정
    const setupAxiosInterceptors = () => {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // ✅ 응답 인터셉터: 401/403 에러 발생 시 자동 처리
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const { response: errorResponse } = error;
                if (errorResponse) {
                    if (errorResponse.status === 401) {
                        // 401 Unauthorized: 인증 토큰이 없거나 만료되었을 때
                        // 로그인 페이지로 리다이렉트하거나 재인증 모달을 띄울 수 있습니다.
                        handleLogout('인증이 만료되었습니다. 다시 로그인해주세요.');
                        // 또는: setShowReauthModal(true);
                    } else if (errorResponse.status === 403) {
                        // 403 Forbidden: 권한이 없을 때
                        handleAppShowMessage('접근 권한이 없습니다.');
                        // 필요한 경우 홈으로 리다이렉트: navigate('/');
                    }
                }
                return Promise.reject(error);
            }
        );
    };

    // --- useEffects ---
    // 컴포넌트 마운트 시 한 번만 axios 인터셉터 설정
    useEffect(() => {
        setupAxiosInterceptors();
    }, []); // 빈 배열은 마운트 시 한 번만 실행됨을 의미


    // --- useEffects ---
    // 페이지 이동 시마다 로그인 상태를 다시 확인 (소셜 로그인 리다이렉트 포함)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUserId = localStorage.getItem('userId');
        const storedUserName = localStorage.getItem('username');
        
        // 토큰이 있고 유효해 보이는 경우에만 로그인 상태로 설정
        if (token && storedUserId && storedUserName) {
            setIsLoggedIn(true);
            setGlobalUserName(storedUserName);
            setGlobalUserId(storedUserId);
        } else {
            // 토큰이 없거나 불완전한 경우 로그아웃 상태로 설정
            setIsLoggedIn(false);
            setGlobalUserName('Guest');
            setGlobalUserId(null);
            // 불완전한 로그인 데이터 정리
            if (token && (!storedUserId || !storedUserName)) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
            }
        }

        // 소셜 로그인 성공 메시지 처리
        if (location.state?.loginSuccess) {
            handleAppShowMessage("로그인이 완료되었습니다!");
            // 메시지를 표시한 후에는, 페이지를 새로고침해도 메시지가 다시 뜨지 않도록 state를 초기화합니다.
            navigate(location.pathname, { replace: true, state: {} });
        }

        // URL에 오류 파라미터가 있는 경우 처리
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get('error');
        const errorMessage = urlParams.get('message');
        if (error === 'oauth_failed') {
            handleAppShowMessage(`소셜 로그인 실패: ${decodeURIComponent(errorMessage || '알 수 없는 오류')}`);
            // 오류 파라미터 제거
            navigate(location.pathname, { replace: true });
        }
    }, [location.key, location.state, location.search, navigate]); // location.search 추가

    const menuItems = [
        { id: 'summary', label: '영상 요약', path: '/', icon: FileText },
                    { id: 'library', label: '요약 저장소', path: '/library', icon: Archive },
        { id: 'reminders', label: '리마인더', path: '/reminders', icon: Bell },
        { id: 'recommendation', label: '추천', path: '/recommendation', icon: Lightbulb },
        { id: 'mypage', label: '마이페이지', path: '/mypage', icon: User },
    ];

    const getCurrentPageLabel = () => {
        if (location.pathname === '/login') return '로그인 / 회원가입';
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.label : 'YouSum';
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
                        <button onClick={() => setShowLogoutConfirmModal(true)} className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                            <LogOut className="h-5 w-5" />
                            <span className="hidden md:block font-medium">로그아웃</span>
                        </button>
                    ) : (
                        <button onClick={handleShowAuthModal} className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 text-left text-red-500 hover:bg-red-50 rounded-lg">
                            <User className="h-5 w-5" />
                            <span className="hidden md:block font-medium">로그인/회원가입</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full">
                {/* 기존 헤더 (페이지명 + 로그인된 유저 표시) */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* 페이지별 아이콘 */}
                            {location.pathname === '/' && (
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                            )}
                            {location.pathname === '/library' && (
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                                    <Archive className="h-5 w-5 text-white" />
                                </div>
                            )}
                            {location.pathname === '/reminders' && (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-white" />
                                </div>
                            )}
                            {location.pathname === '/recommendation' && (
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
                                
                                {/* 페이지별 설명과 기능 태그 */}
                                {location.pathname === '/' && (
                                    <div className="flex items-end space-x-3">
                                        <span className="text-sm text-gray-600">AI가 분석한 영상 요약 생성</span>
                                        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full mt-1">
                                            <Sparkles className="h-4 w-4" />
                                            <span>AI 요약</span>
                                        </div>
                                    </div>
                                )}
                                {location.pathname === '/library' && (
                                    <div className="flex items-end space-x-3">
                                        <span className="text-sm text-gray-600">저장된 영상 요약 관리</span>
                                        <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full mt-1">
                                            <Play className="h-4 w-4" />
                                            <span>내 요약 저장소</span>
                                        </div>
                                    </div>
                                )}
                                {location.pathname === '/reminders' && (
                                    <div className="flex items-end space-x-3">
                                        <span className="text-sm text-gray-600">영상 복습 알림 관리</span>
                                        <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-1">
                                            <Clock className="h-4 w-4" />
                                            <span>스마트 알림</span>
                                        </div>
                                    </div>
                                )}
                                {location.pathname === '/recommendation' && (
                                    <div className="flex items-end space-x-3">
                                        <span className="text-sm text-gray-600">AI 기반 맞춤형 영상 추천</span>
                                        <div className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full mt-1">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>개인화 추천</span>
                                        </div>
                                    </div>
                                )}
                                {location.pathname === '/mypage' && (
                                    <div className="flex items-end space-x-3">
                                        <span className="text-sm text-gray-600">개인 정보 및 계정 관리</span>
                                        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full mt-1">
                                            <Settings className="h-4 w-4" />
                                            <span>계정 설정</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <button 
                                    onClick={() => navigate('/mypage')}
                                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    <span>{globalUserName}님</span>
                                </button>
                            ) : (
                                <div className="text-sm text-gray-500">로그인되지 않음</div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-scroll bg-gray-100">
                    <Routes>
                        {/* ✅ SummaryPage 컴포넌트를 직접 라우팅하여 백엔드 통신 로직이 실행되도록 합니다. */}
                        <Route path="/" element={
                            <div>
                                {console.log('SummaryPage 렌더링 시작')}
                                <SummaryPage onShowAuthModal={handleShowAuthModal} isLoggedIn={isLoggedIn} />
                            </div>
                        } />

                        <Route path="/library" element={isLoggedIn ? <LibraryPage /> : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />
                        <Route path="/reminders"
                               element={isLoggedIn ? (
                                   <ReminderPage
                                       userId={globalUserId} // userId prop 전달
                                       isLoggedIn={isLoggedIn} // isLoggedIn prop 전달
                                       setMessageModalContent={setMessageModalContent} // 메시지 모달 관련 props 전달
                                       setShowMessageModal={setShowMessageModal} // 메시지 모달 관련 props 전달
                                   />
                               ) : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />}
                        />
                        <Route path="/recommendation" element={isLoggedIn ? <RecommendationPage /> : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />

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
                            />
                        ) : <AuthRedirect onShowMessage={handleAppShowMessage} onShowAuthModal={handleShowAuthModal} />} />

                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
                    </Routes>
                </main>
            </div>

            {/* 전역 모달들 */}
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
        </div>
    );
}

function AuthRedirect({ onShowMessage, onShowAuthModal }) {
    useEffect(() => {
        // 메시지를 표시하고 확인 버튼을 클릭하면 로그인 모달이 뜨도록 함
        onShowMessage("로그인이 필요한 서비스입니다.", onShowAuthModal);
    }, [onShowMessage, onShowAuthModal]);
    
    return null;
}

// --- 로딩 모달 컴포넌트 ---
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

// --- 로그아웃 확인 모달 컴포넌트 ---
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

// 최종 App 컴포넌트
function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;

