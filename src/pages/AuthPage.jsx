import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthPage = ({ onLogin, onSignup, onMessage }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localMessage, setLocalMessage] = useState('');
    const location = useLocation();


    const GOOGLE_LOGIN_URL = '/oauth2/authorization/google';

    // OAuth2 리다이렉트에서 온 에러 메시지 처리
    useEffect(() => {
        if (location.state?.error) {
            setLocalMessage(location.state.error);
        }
        if (location.state?.message) {
            setLocalMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalMessage('');

        // 클라이언트 사이드 유효성 검사
        if (mode === 'signup') {
            // 사용자명 검사
            if (username.length < 2 || username.length > 20) {
                setLocalMessage('사용자명은 2자 이상 20자 이하로 입력해주세요.');
                return;
            }
            
            // 이메일 검사
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setLocalMessage('유효한 이메일 형식이 아닙니다.');
                return;
            }
            
            // 비밀번호 검사
            if (password.length < 8) {
                setLocalMessage('비밀번호는 최소 8자 이상이어야 합니다.');
                return;
            }
            
            // 비밀번호 확인 검사
            if (password !== confirmPassword) {
                setLocalMessage('비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        try {
            if (mode === 'login') {
                await onLogin(username, password);
                // 로그인 성공 시에는 App.jsx에서 처리됨 (모달 닫기, 페이지 이동)
            } else {
                await onSignup(username, password, email);
                // 회원가입 성공 시에만 실행됨 (실패 시 catch 블록으로 이동)
                setLocalMessage('SUCCESS:회원가입 성공! 이제 로그인해주세요.');
                setMode('login');
                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
            }
        } catch (error) {
            // 로그인/회원가입 실패 시 에러 메시지를 로컬 메시지로 표시
            setLocalMessage(error.message);
        }
    };

    return (
        // 이 컴포넌트는 이제 AuthModal 안에서 렌더링되므로, 페이지 전체 스타일은 필요 없습니다.
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {mode === 'login' ? '로그인' : '회원가입'}
            </h2>
            {localMessage && (
                <p className={`text-sm text-center mb-4 ${
                    localMessage.startsWith('SUCCESS:') 
                        ? 'text-green-600' 
                        : 'text-red-500'
                }`}>
                    {localMessage.startsWith('SUCCESS:') 
                        ? localMessage.substring(8) 
                        : localMessage
                    }
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 아이디, 이메일, 비밀번호 입력 필드... (이전과 동일) */}
                <div>
                    <label htmlFor="auth-username" className="block text-gray-700 mb-2 font-medium">아이디</label>
                    <input 
                        id="auth-username" 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 transition-colors"
                        placeholder="아이디를 입력하세요"
                    />
                </div>
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="auth-email" className="block text-gray-700 mb-2 font-medium">이메일</label>
                        <input 
                            id="auth-email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 transition-colors"
                            placeholder="이메일을 입력하세요"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="auth-password" className="block text-gray-700 mb-2 font-medium">비밀번호</label>
                    <input 
                        id="auth-password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 transition-colors"
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="auth-confirm-password" className="block text-gray-700 mb-2 font-medium">비밀번호 확인</label>
                        <input 
                            id="auth-confirm-password" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 transition-colors"
                            placeholder="비밀번호를 다시 입력하세요"
                        />
                    </div>
                )}
                <button 
                    type="submit" 
                    className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors mt-6"
                >
                    {mode === 'login' ? '로그인' : '회원가입'}
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600 space-y-4">
                {/* 모드 전환 버튼 (이전과 동일) */}
                <p>
                    {mode === 'login' ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
                    <button 
                        type="button" 
                        className="text-red-500 hover:underline font-semibold" 
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    >
                        {mode === 'login' ? '회원가입하기' : '로그인하기'}
                    </button>
                </p>

                <div className="relative flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs">또는</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/*  구글 로그인 버튼 */}
                <a
                    href={GOOGLE_LOGIN_URL}
                    className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3 mb-3"
                >
                    <svg className="h-5 w-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.026,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span>Google 계정으로 로그인</span>
                </a>

                {/* 카카오 로그인 버튼 */}
                <button
                    type="button"
                    onClick={() => onMessage('카카오 로그인 기능은 준비 중입니다.')}
                    className="w-full bg-yellow-400 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-3"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C7.037 2 3 5.4 3 9.6c0 2.67 1.76 5.01 4.4 6.36l-.96 3.54c-.09.33.21.63.54.54L11.5 18c.17 0 .33-.01.5-.01 4.963 0 9-3.4 9-7.6S16.963 2 12 2z"/>
                    </svg>
                    <span>카카오 로그인</span>
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
