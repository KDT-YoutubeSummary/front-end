// src/pages/AuthPage.jsx
import React, { useState } from 'react';

// AuthPage는 이제 독립적인 페이지 컴포넌트이므로,
// fixed inset-0와 같은 모달 스타일은 App.jsx에서 관리하거나 제거해야 합니다.
// 여기서는 해당 스타일을 제거하여 일반 페이지처럼 작동하도록 합니다.
const AuthPage = ({ onLogin, onSignup, onMessage }) => { // onMessage prop 유지
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [username, setUsername] = useState(''); // 로그인 시 사용할 아이디 (유저네임)
    const [email, setEmail] = useState(''); // 회원가입 시 이메일
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 회원가입 시 비밀번호 확인
    const [localMessage, setLocalMessage] = useState(''); // AuthPage 내부 메시지

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalMessage(''); // 이전 메시지 초기화

        if (mode === 'signup' && password !== confirmPassword) {
            setLocalMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            if (mode === 'login') {
                // 로그인 시에는 username과 password만 전달
                await onLogin(username, password);
                // 로그인 성공 시 App.jsx에서 페이지 전환 처리
            } else { // signup
                // 회원가입 시에는 username, password, email 모두 전달
                await onSignup(username, password, email);
                // 회원가입 성공 후 메시지를 띄우고 로그인 모드로 전환
                setLocalMessage('회원가입 성공! 로그인해주세요.');
                setMode('login');
                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword(''); // 필드 초기화
            }
        } catch (error) {
            // App.jsx의 onLogin/onSignup에서 이미 에러 메시지를 처리하고 있으므로
            // 여기서는 onMessage(error.message) 등을 호출하여 App.jsx의 메시지 모달을 사용.
            onMessage(error.message); // 전역 메시지 모달 사용
        }
    };

    return (
        // 모달처럼 고정되는 스타일 대신, 일반 페이지 콘텐츠 영역에 맞춰 정렬되도록 변경
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-6"> {/* 헤더 높이만큼 min-h 조정 */}
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {mode === 'login' ? '로그인' : '회원가입'}
                </h2>
                {localMessage && (
                    <p className="text-red-500 text-sm text-center mb-4">{localMessage}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 로그인/회원가입 공통: 아이디 (유저네임) */}
                    <div>
                        <label htmlFor="auth-username" className="block text-gray-700 mb-1">아이디</label>
                        <input
                            id="auth-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    {/* 회원가입 시에만 이메일 필드 */}
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="auth-email" className="block text-gray-700 mb-1">이메일</label>
                            <input
                                id="auth-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                    )}
                    {/* 로그인/회원가입 공통: 비밀번호 */}
                    <div>
                        <label htmlFor="auth-password" className="block text-gray-700 mb-1">비밀번호</label>
                        <input
                            id="auth-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    {/* 회원가입 시에만 비밀번호 확인 필드 */}
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="auth-confirm-password" className="block text-gray-700 mb-1">비밀번호 확인</label>
                            <input
                                id="auth-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                    >
                        {mode === 'login' ? '로그인' : '회원가입'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600 space-y-3">
                    {mode === 'login' ? (
                        <p>
                            아직 계정이 없으신가요?{' '}
                            <button
                                type="button"
                                className="text-red-500 hover:underline font-semibold"
                                onClick={() => {
                                    setMode('signup');
                                    setLocalMessage('');
                                    setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                }}
                            >
                                회원가입하기
                            </button>
                        </p>
                    ) : (
                        <p>
                            이미 계정이 있으신가요?{' '}
                            <button
                                type="button"
                                className="text-red-500 hover:underline font-semibold"
                                onClick={() => {
                                    setMode('login');
                                    setLocalMessage('');
                                    setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                }}
                            >
                                로그인하기
                            </button>
                        </p>
                    )}
                    {/* 소셜 로그인 버튼 추가 (현재는 더미) */}
                    <div className="relative flex items-center justify-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500">또는</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onMessage('구글 로그인 기능은 현재 준비 중입니다.')}
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 transform hover:scale-105 shadow-md"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.0003 4.40273C14.1207 4.40273 15.8385 5.18457 17.0766 6.42266L20.0607 3.43852C17.9102 1.28796 15.1221 0 12.0003 0C7.2753 0 3.19799 2.76673 1.15942 6.80436L4.85646 9.60037C5.74837 7.95473 7.84275 6.80436 12.0003 6.80436C12.0003 6.80436 12.0003 4.40273 12.0003 4.40273Z" fill="#EA4335"/><path d="M23.9996 12.164C23.9996 11.3283 23.9312 10.6022 23.8277 9.87786H12.2402V14.1951H18.9958C18.8471 15.0211 18.2321 16.2778 17.0543 17.0272L20.7303 19.8601C22.9555 17.8465 24.0003 14.8878 24.0003 12.164H23.9996V12.164Z" fill="#4285F4"/><path d="M12.2402 24.0004C15.3259 24.0004 17.9405 22.9234 19.8166 21.0544L16.1406 18.2215C15.1118 18.8687 13.8236 19.2825 12.2402 19.2825C8.80998 19.2825 5.96109 17.1641 4.88569 13.8437L1.17383 16.6491C3.12328 20.6559 7.37559 24.0004 12.2402 24.0004Z" fill="#34A853"/><path d="M1.17383 6.80436L4.88569 9.60037C4.69343 10.2372 4.58611 10.9065 4.58611 11.5973C4.58611 12.2882 4.69343 12.9575 4.88569 13.5944L1.15942 16.8044C0.419139 15.3524 0 13.8058 0 12.164C0 10.5222 0.419139 8.97559 1.15942 7.52358L1.17383 6.80436Z" fill="#FBBC04"/></svg>
                        <span>Google로 로그인</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMessage('카카오 로그인 기능은 현재 준비 중입니다.')}
                        className="w-full bg-yellow-400 text-gray-800 py-3 px-6 rounded-lg font-bold
             hover:bg-yellow-500 transition-colors flex items-center justify-center
             space-x-2 transform hover:scale-105 shadow-md"
                    >
                        <img
                            src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                            alt="Kakao Icon"
                            className="h-5 w-5"
                        />
                        <span>카카오로 로그인</span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default AuthPage;