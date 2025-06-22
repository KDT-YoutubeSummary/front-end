import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [message, setMessage] = useState('로그인 처리 중입니다...');

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const userId = searchParams.get('userId');
        const userName = searchParams.get('userName');
        const error = searchParams.get('error');

        console.log('OAuth2 리다이렉트 처리:', { accessToken: !!accessToken, userId, userName, error });

        if (error) {
            // 로그인 실패
            setStatus('error');
            setMessage(`로그인에 실패했습니다: ${error}`);
            
            setTimeout(() => {
                navigate('/', { 
                    state: { 
                        error: "소셜 로그인에 실패했습니다. 다시 시도해주세요."
                    } 
                });
            }, 3000);
            return;
        }

        if (accessToken && userId) {
            // 로그인 성공
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('userId', userId);
            if (userName) localStorage.setItem('userName', userName);

            setStatus('success');
            setMessage('로그인에 성공했습니다! 요약 페이지로 이동합니다...');

            console.log('✅ 로그인 성공, 토큰 저장 완료');
            
            // 이전에 접근하려던 페이지가 있으면 그곳으로, 없으면 요약 페이지로
            const redirectTo = location.state?.from || '/';
            
            setTimeout(() => {
                navigate(redirectTo, { 
                    state: { loginSuccess: true },
                    replace: true 
                });
            }, 2000);
        } else {
            // 토큰이나 사용자 정보가 없음
            setStatus('error');
            setMessage('로그인 정보를 받지 못했습니다.');
            
            console.error('❌ 소셜 로그인 중 토큰 또는 사용자 정보를 받지 못했습니다.');
            
            setTimeout(() => {
                navigate('/', { 
                    state: { 
                        error: "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요."
                    } 
                });
            }, 3000);
        }
    }, [navigate, searchParams, location]);

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'text-green-700';
            case 'error':
                return 'text-red-700';
            default:
                return 'text-gray-700';
        }
    };

    const getSpinnerColor = () => {
        switch (status) {
            case 'success':
                return 'border-green-500';
            case 'error':
                return 'border-red-500';
            default:
                return 'border-blue-500';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
                <div className="mb-6">
                    {status === 'processing' && (
                        <div className={`animate-spin rounded-full h-12 w-12 border-b-4 ${getSpinnerColor()} mx-auto`}></div>
                    )}
                    {status !== 'processing' && (
                        <div className="text-6xl mb-4">{getStatusIcon()}</div>
                    )}
                </div>
                
                <h2 className={`text-xl font-semibold ${getStatusColor()} mb-4`}>
                    {status === 'success' && '로그인 성공!'}
                    {status === 'error' && '로그인 실패'}
                    {status === 'processing' && '로그인 처리 중...'}
                </h2>
                
                <p className="text-gray-600 mb-4">{message}</p>
                
                {status === 'processing' && (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="text-sm text-green-600">
                        잠시 후 자동으로 이동됩니다...
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="text-sm text-red-600">
                        잠시 후 로그인 페이지로 이동됩니다...
                    </div>
                )}
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler; 